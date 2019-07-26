import React, { Component } from "react";
import Square from "./Square";

class Board extends Component {
  state = {
    ships: [
      {
        name: "carrier",
        length: 5,
        squares: [34, 44, 54, 64, 74],
        hitSquares: [false, false, false, false, false],
        selected: false,
        sunk: false,
        vertical: true
      },
      {
        name: "battleship",
        length: 4,
        squares: [96, 97, 98, 99],
        hitSquares: [false, false, false, false],
        selected: false,
        sunk: false,
        vertical: false
      },
      {
        name: "destroyer",
        length: 3,
        squares: [5, 6, 7],
        hitSquares: [false, false, false],
        selected: false,
        sunk: false,
        vertical: false
      },
      {
        name: "submarine",
        length: 3,
        squares: [10, 20, 30],
        hitSquares: [false, false, false],
        selected: false,
        sunk: false,
        vertical: true
      },
      {
        name: "patrol",
        length: 2,
        squares: [49, 59],
        hitSquares: [false, false],
        selected: false,
        sunk: false,
        vertical: true
      }
    ],
    pickedSquares: [-1, -1, -1, -1],
    isCpu: false,
    allShipSquares: [],
    targetingShip: false,
    shipHitOrigin: null,
    currentShipShots: 0,
    currentDirection: null,
    targettedShipSunk: false,
    lastShipSunkName: null,
    currentTargettedShip: "none",
    sunkenShipCount: 0,
  };

  componentDidMount() {
    if (!this.props.attack) {
      document.addEventListener("keydown", key => {
        if (key.code === "ArrowLeft" && this.props.gamePhase === "prep") {
          this.moveShip("left");
          key.preventDefault();
        } else if (key.code === "ArrowUp" && this.props.gamePhase === "prep") {
          this.moveShip("up");
          key.preventDefault();
        } else if (key.code === "ArrowRight" && this.props.gamePhase === "prep") {
          this.moveShip("right");
          key.preventDefault();
        } else if (key.code === "ArrowDown" && this.props.gamePhase === "prep") {
          this.moveShip("down");
          key.preventDefault();
        } else if (key.code === "KeyR" && this.props.gamePhase === "prep") {
          this.moveShip("rotate");
        } else if (key.code === "KeyG" && this.props.gamePhase === "prep") {
          key.preventDefault();
          this.randomizeShips();
        }
      });
    }
  }

  generateSequence(shipSize) {
    let rnd = Math.floor(Math.random() * 100);
    let temp = Array(shipSize).fill(0);

    if (rnd % 2 === 0) {
      //horizontal
      let rndSpot = Math.floor(Math.random() * (11 - shipSize)) + 10 * Math.floor(Math.random() * 10);
      for (let i = 0; i < temp.length; i++) temp[i] = rndSpot + i;
    } else {
      //vertical
      let rndSpot = Math.floor(Math.random() * (100 - 10 * shipSize));
      for (let i = 0; i < temp.length; i++) temp[i] = rndSpot + 10 * i;
    }

    return temp;
  }

  randomizeShips = () => {
    let occupiedSpots = [-1];
    let copyShips = this.state.ships;

    for (let ship of copyShips) {
      let spotsThatFit;
      let shipFits = false;
      do {
        spotsThatFit = 0;
        let temp = this.generateSequence(ship.length);
        for (let num of temp) spotsThatFit += occupiedSpots.includes(num) ? 0 : 1;

        if (spotsThatFit === ship.length) {
          ship.squares = temp;
          occupiedSpots = occupiedSpots.concat(temp);
          this.setState({ ships: copyShips });
          shipFits = true;
        }
      } while (!shipFits);
    }
  };

  moveShip = direction => {
    let movingShip = null;
    let occupiedSpots = [];
    let newShips = this.state.ships;

    for (let ship of newShips) {
      if (ship.selected) movingShip = ship;
      else occupiedSpots = occupiedSpots.concat(ship.squares);
    }

    if (movingShip === null) {
      console.log("no ship selected");
    } else if (direction === "left") {
      //console.log(movingShip.name + " moved left");
      let canMoveLeft = true;
      let newSpots = movingShip.squares.map(number => number - 1);

      if (movingShip.squares[0] % 10 === 0 || movingShip.squares[movingShip.length - 1] % 10 === 0) canMoveLeft = false; //checking if on edge of board

      for (let spot of occupiedSpots) if (newSpots.includes(spot)) canMoveLeft = false; //checks for overlapping ships

      if (canMoveLeft) {
        movingShip.squares = newSpots;
        this.setState({ ships: newShips });
      }
    } else if (direction === "right") {
      let canMoveRight = true;
      let newSpots = movingShip.squares.map(number => number + 1);

      if (movingShip.squares[0] % 10 === 9 || movingShip.squares[movingShip.length - 1] % 10 === 9) canMoveRight = false; //checking if on edge of board

      for (let spot of occupiedSpots) if (newSpots.includes(spot)) canMoveRight = false; //checks for overlapping ships

      if (canMoveRight) {
        movingShip.squares = newSpots;
        this.setState({ ships: newShips });
      }
    } else if (direction === "up") {
      let canMoveUp = true;
      let newSpots = movingShip.squares.map(number => number - 10);

      if (movingShip.squares[0] - 10 < 0 || movingShip.squares[movingShip.length - 1] - 10 < 0) canMoveUp = false; //checking if on edge of board

      for (let spot of occupiedSpots) if (newSpots.includes(spot)) canMoveUp = false; //checks for overlapping ships

      if (canMoveUp) {
        movingShip.squares = newSpots;
        this.setState({ ships: newShips });
      }
    } else if (direction === "down") {
      let canMoveDown = true;
      let newSpots = movingShip.squares.map(number => number + 10);

      if (movingShip.squares[0] + 10 > 99 || movingShip.squares[movingShip.length - 1] + 10 > 99) canMoveDown = false; //checking if on edge of board

      for (let spot of occupiedSpots) if (newSpots.includes(spot)) canMoveDown = false; //checks for overlapping ships

      if (canMoveDown) {
        movingShip.squares = newSpots;
        this.setState({ ships: newShips });
      }
    } else if (direction === "rotate") {
      if (movingShip.vertical) {
        let canRotateRight = true;
        let canRotateLeft = true;
        let newSpotsRight = movingShip.squares.map((_, index) => movingShip.squares[0] + index);
        let newSpotsLeft = movingShip.squares.map((_, index) => movingShip.squares[0] - index);

        if (newSpotsRight[0] % 10 > newSpotsRight[movingShip.length - 1] % 10) canRotateRight = false;
        if (newSpotsLeft[0] % 10 < newSpotsLeft[movingShip.length - 1] % 10) canRotateLeft = false;
        if (
          newSpotsLeft[0] < 0 ||
          newSpotsLeft[movingShip.length - 1] < 0 ||
          newSpotsLeft[0] > 99 ||
          newSpotsLeft[movingShip.length - 1] > 99
        )
          canRotateLeft = false;
        if (
          newSpotsRight[0] < 0 ||
          newSpotsRight[movingShip.length - 1] < 0 ||
          newSpotsRight[0] > 99 ||
          newSpotsRight[movingShip.length - 1] > 99
        )
          canRotateRight = false;

        for (let spot of occupiedSpots) {
          if (newSpotsRight.includes(spot)) canRotateRight = false;
          if (newSpotsLeft.includes(spot)) canRotateLeft = false;
        }

        if (canRotateRight) {
          movingShip.vertical = false;
          movingShip.squares = newSpotsRight;
          this.setState({ ships: newShips });
        } else if (canRotateLeft) {
          movingShip.vertical = false;
          movingShip.squares = newSpotsLeft;
          this.setState({ ships: newShips });
        }
      } else {
        let canRotateUp = true;
        let canRotateDown = true;
        let newSpotsUp = movingShip.squares.map((_, index) => movingShip.squares[0] - 10 * index);
        let newSpotsDown = movingShip.squares.map((_, index) => movingShip.squares[0] + 10 * index);

        if (newSpotsUp[0] < 0 || newSpotsUp[movingShip.length - 1] < 0) canRotateUp = false;
        if (newSpotsDown[0] > 99 || newSpotsDown[movingShip.length - 1] > 99) canRotateDown = false;

        for (let spot of occupiedSpots) {
          if (newSpotsUp.includes(spot)) canRotateUp = false;
          if (newSpotsDown.includes(spot)) canRotateDown = false;
        }

        if (canRotateDown) {
          movingShip.vertical = true;
          movingShip.squares = newSpotsDown;
          this.setState({ ships: newShips });
        } else if (canRotateUp) {
          movingShip.vertical = true;
          movingShip.squares = newSpotsUp;
          this.setState({ ships: newShips });
        }
      }
    } else console.log("move ship error");
  };

  handleSquareClick = id => {
    let tempShips = this.state.ships;
    if (this.props.gamePhase === "prep" && !this.props.attack) {
      for (let ship of tempShips) {
        if (ship.squares.includes(id)) {
          ship.selected = !ship.selected;
        } else {
          ship.selected = false;
        }
      }
      this.setState({ ships: tempShips });
    } else if (this.props.gamePhase === "game") {
      if (this.props.turn) {
        let tempSquares = this.state.pickedSquares;
        let hit = false;
        let name;
        for (let ship of tempShips)
          if (ship.squares.includes(id)) {
            hit = true;
            name = ship.name;
          }

        if (this.state.pickedSquares.includes(id)) console.log("already picked");
        else {
          tempSquares.push(id);
          this.props.afterTurn();
          this.props.sendTurnInfo(hit, name, false, this.props.attack);
        }
        
        this.setState({ pickedSquares: tempSquares });
      }
    }
  };

  componentDidUpdate(oldProps, oldState) {
    const newProps = this.props;
    const newState = this.state;

    if (oldProps.gamePhase !== newProps.gamePhase && newProps.gamePhase === "game") {
      const newShips = this.state.ships.map(ship => ({
        ...ship,
        selected: false
      }));
      let allShips = [];
      for (let ship of this.state.ships) allShips = allShips.concat(ship.squares);

      this.setState({ ships: newShips, allShipSquares: allShips });
    }

    //if (oldProps.isCpu !== newProps.isCpu) this.randomizeShips();

    if (oldProps.turn !== newProps.turn && !this.props.attack && this.props.turn) {
      this.cpuTurn();
    }
    if (!oldProps.turn && newProps.turn) {
      this.seeIfSunk();
      //this.checkIfWon()
    }
    if (oldState.lastShipSunkName !== newState.lastShipSunkName && newState.targettedShipSunk !== null) {
      let hit = this.state.allShipSquares.includes(this.state.pickedSquares[this.state.pickedSquares.length - 1]);

      this.props.sendTurnInfo(
        hit,
        this.state.lastShipSunkName,
        this.state.targettedShipSunk,
        this.props.attack ? true : false
      );
    }
    if (oldState.targettedShipSunk && !newState.targettedShipSunk) {
      this.setState({ lastShipSunkName: null });
    }
    if (oldProps.gamePhase === "end" && newProps.gamePhase === "start") {
      this.setState({
          ships: [
            {
              name: "carrier",
              length: 5,
              squares: [34, 44, 54, 64, 74],
              hitSquares: [false, false, false, false, false],
              selected: false,
              sunk: false,
              vertical: true
            },
            {
              name: "battleship",
              length: 4,
              squares: [96, 97, 98, 99],
              hitSquares: [false, false, false, false],
              selected: false,
              sunk: false,
              vertical: false
            },
            {
              name: "destroyer",
              length: 3,
              squares: [5, 6, 7],
              hitSquares: [false, false, false],
              selected: false,
              sunk: false,
              vertical: false
            },
            {
              name: "submarine",
              length: 3,
              squares: [10, 20, 30],
              hitSquares: [false, false, false],
              selected: false,
              sunk: false,
              vertical: true
            },
            {
              name: "patrol",
              length: 2,
              squares: [49, 59],
              hitSquares: [false, false],
              selected: false,
              sunk: false,
              vertical: true
            }
          ],
          pickedSquares: [-1, -1, -1, -1],
          isCpu: false,
          allShipSquares: [],
          targetingShip: false,
          shipHitOrigin: null,
          currentShipShots: 0,
          currentDirection: null,
          targettedShipSunk: false,
          lastShipSunkName: null,
          currentTargettedShip: "none",
          sunkenShipCount: 0,
      })
    }

    if (oldProps.gamePhase === "start" && newProps.gamePhase === "prep" && this.props.attack) {
      this.randomizeShips();
    }
  }

  

  seeIfSunk = () => {
    const pickedSquares = this.state.pickedSquares;
    const allShipSquares = this.state.allShipSquares;

    const lastShot = pickedSquares[pickedSquares.length - 1];

    let allHitShots = [];
    let tempShips = this.state.ships;
    let targetSunk = false;
    let name = null;
    let newPickedSquares = pickedSquares.concat([-1, -1, -1, -1, -1]);
    let sunkShipCount = this.state.sunkenShipCount;
    for (let spot of pickedSquares) if (allShipSquares.includes(spot)) allHitShots.push(spot);

    for (let ship of tempShips) {
      let count = 0;
      for (let square of ship.squares) count += allHitShots.includes(square) ? 1 : 0;
      if (count === ship.length) {
        ship.sunk = true;
        
        
        if (ship.squares.includes(lastShot)) {
          targetSunk = true;
          name = ship.name;
          sunkShipCount++;
          if (sunkShipCount === 5)
            this.props.handleWin();
        }
      }

      this.setState({
        ships: tempShips,
        targettedShipSunk: targetSunk,
        pickedSquares: targetSunk ? newPickedSquares : pickedSquares,
        sunkenShipCount: sunkShipCount 
      });
      if (targetSunk) {
        this.setState({ targetingShip: false, currentShipShots: 0, lastShipSunkName: name});
      }
    }
  };

  cpuTurn = () => {
    const pickedSquares = this.state.pickedSquares;
    const allShipSquares = this.state.allShipSquares;
    if (!this.state.targetingShip) {
      let occupied;
      let rnd;
      do {
        occupied = true;
        rnd = Math.floor(Math.random() * 100);
        occupied = pickedSquares.includes(rnd);
      } while (occupied);

      this.handleSquareClick(rnd);
      if (allShipSquares.includes(rnd)) {
        this.setState({ targetingShip: true, shipHitOrigin: rnd, currentShipShots: 1 });
        //console.log("hit!");
      }
    } else if (this.state.targetingShip) {
      let currentShipShots = this.state.currentShipShots;
      let origin = this.state.shipHitOrigin;
      let nextUp = origin - 10 * currentShipShots;
      let nextDown = origin + 10 * currentShipShots;
      let nextLeft = origin - 1 * currentShipShots;
      let nextRight = origin + 1 * currentShipShots;
      let spaceUp = nextUp >= 0 && !pickedSquares.includes(nextUp);
      let spaceDown = nextDown <= 99 && !pickedSquares.includes(nextDown);
      let spaceLeft = nextLeft % 10 < 9 && nextLeft >= 0 && !pickedSquares.includes(nextLeft);
      let spaceRight = nextRight % 10 > 0 && nextRight <= 99 && !pickedSquares.includes(nextRight);
      let lastShotHit = allShipSquares.includes(pickedSquares[pickedSquares.length - 1]);
      let currentDirection = this.state.currentDirection;
      //console.log(spaceUp + " " + spaceDown + " " + spaceLeft + " " + spaceRight);
      //console.log(nextUp + " " + nextDown + " " + nextLeft + " " + nextRight);
      //console.log("origin hit: " + origin);
      //console.log("ship shots attempted: " + currentShipShots);
      if (currentShipShots === 1) {
        let rnd = Math.floor(Math.random() * 4);
        //console.log("last shot hit");
        if (rnd === 0 && spaceUp /*|| (spaceUp && !spaceDown && !spaceLeft && !spaceRight)*/) {
          //console.log("1");
          this.handleSquareClick(nextUp);
          this.setState({ currentDirection: "up" });
        } else if (rnd === 1 && spaceDown /*|| (spaceDown && !spaceUp && !spaceLeft && !spaceRight)*/) {
          //console.log("2");
          this.handleSquareClick(nextDown);
          this.setState({ currentDirection: "down" });
        } else if (rnd === 2 && spaceLeft /*|| (spaceLeft && !spaceUp && !spaceDown && !spaceRight)*/) {
          //console.log("3");
          this.handleSquareClick(nextLeft);
          this.setState({ currentDirection: "left" });
        } else if (rnd === 3 && spaceRight /*|| (spaceRight && !spaceUp && !spaceDown && !spaceLeft)*/) {
          //console.log("4");
          this.handleSquareClick(nextRight);
          this.setState({ currentDirection: "right" });
        } else if (spaceUp) {
          //console.log("5");
          this.handleSquareClick(nextUp);
          this.setState({ currentDirection: "up" });
        } else if (spaceLeft) {
          //console.log("6");
          this.handleSquareClick(nextLeft);
          this.setState({ currentDirection: "left" });
        } else if (spaceDown) {
          //console.log("7");
          this.handleSquareClick(nextDown);
          this.setState({ currentDirection: "down" });
        } else if (spaceRight) {
          //console.log("8");
          this.handleSquareClick(nextRight);
          this.setState({ currentDirection: "right" });
        } else {
          let occupied;
          let rnd;
          do {
            occupied = true;
            rnd = Math.floor(Math.random() * 100);
            occupied = pickedSquares.includes(rnd);
          } while (occupied);

          this.handleSquareClick(rnd);
          if (allShipSquares.includes(rnd)) this.setState({ targetingShip: true, shipHitOrigin: rnd, currentShipShots: 1 });
          else this.setState({ targetingShip: false });
        }
      } else if (currentShipShots > 1) {
        if (lastShotHit) {
          //console.log("last shot hit");
          let newNextUp = origin - 10;
          let newNextDown = origin + 10;
          let newNextLeft = origin - 1;
          let newNextRight = origin + 1;
          let newSpaceUp = newNextUp >= 0 && !pickedSquares.includes(newNextUp);
          let newSpaceDown = newNextDown <= 99 && !pickedSquares.includes(newNextDown);
          let newSpaceLeft = newNextLeft % 10 < 9 && newNextLeft >= 0 && !pickedSquares.includes(newNextLeft);
          let newSpaceRight = newNextRight % 10 > 0 && newNextRight <= 99 && !pickedSquares.includes(newNextRight);
          if (!spaceUp && !spaceDown && !spaceLeft && !spaceRight) {
            let occupied;
            let rnd;
            do {
              occupied = true;
              rnd = Math.floor(Math.random() * 100);
              occupied = pickedSquares.includes(rnd);
            } while (occupied);

            this.handleSquareClick(rnd);
            if (allShipSquares.includes(rnd))
              this.setState({ targetingShip: true, shipHitOrigin: rnd, currentShipShots: 1 });
            else this.setState({ targetingShip: false });
          } else if (currentDirection === "up" && spaceUp) {
            //console.log("9");
            this.handleSquareClick(nextUp);
            this.setState({ currentDirection: "up" });
          } else if (currentDirection === "down" && spaceDown) {
            //console.log("10");
            this.handleSquareClick(nextDown);
            this.setState({ currentDirection: "down" });
          } else if (currentDirection === "left" && spaceLeft) {
            //console.log("11");
            this.handleSquareClick(nextLeft);
            this.setState({ currentDirection: "left" });
          } else if (currentDirection === "right" && spaceRight) {
            //console.log("12");
            this.handleSquareClick(nextRight);
            this.setState({ currentDirection: "right" });
          } else if (newSpaceUp && !newSpaceDown && !newSpaceLeft && !newSpaceRight) {
            //console.log("13");
            this.handleSquareClick(newNextUp);
            this.setState({ currentDirection: "up" });
          } else if (newSpaceDown && !newSpaceUp && !newSpaceLeft && !newSpaceRight) {
            //console.log("14");
            this.handleSquareClick(newNextDown);
            this.setState({ currentDirection: "down" });
          } else if (newSpaceLeft && !newSpaceUp && !newSpaceDown && !newSpaceRight) {
            //console.log("15");
            this.handleSquareClick(newNextLeft);
            this.setState({ currentDirection: "left" });
          } else if (newSpaceRight && !newSpaceUp && !newSpaceDown && !newSpaceRight) {
            //console.log("16");
            this.handleSquareClick(newNextRight);
            this.setState({ currentDirection: "right" });
          } else if (!spaceLeft && !spaceRight && spaceUp) {
            //console.log("35");
            this.handleSquareClick(nextUp);
            this.setState({ currentDirection: "up" });
          } else if (!spaceLeft && !spaceRight && spaceDown) {
            //console.log("36");
            this.handleSquareClick(nextDown);
            this.setState({ currentDirection: "Down" });
          } else if (!spaceDown && !spaceUp && spaceLeft) {
            //console.log("37");
            this.handleSquareClick(nextLeft);
            this.setState({ currentDirection: "left" });
          } else if (!spaceUp && !spaceDown && spaceRight) {
            //console.log("38");
            this.handleSquareClick(nextRight);
            this.setState({ currentDirection: "right" });
          } else {
            //console.log("cpu doesnt know what to do");
            let occupied;
            let rnd;
            do {
              occupied = true;
              rnd = Math.floor(Math.random() * 100);
              occupied = pickedSquares.includes(rnd);
            } while (occupied);

            this.handleSquareClick(rnd);
            if (allShipSquares.includes(rnd)) {
              this.setState({ targetingShip: true, shipHitOrigin: rnd, currentShipShots: 1 });
              //console.log("hit!");
            } else this.setState({ targetingShip: false, currentShipShots: 0 });
          }
        } else if (!lastShotHit) {
          //console.log("last shot missed");
          nextUp = origin - 10;
          nextDown = origin + 10;
          nextLeft = origin - 1;
          nextRight = origin + 1;
          spaceUp = nextUp >= 0 && !pickedSquares.includes(nextUp);
          spaceDown = nextDown <= 99 && !pickedSquares.includes(nextDown);
          spaceLeft = nextLeft % 10 !== 9 && nextLeft >= 0 && !pickedSquares.includes(nextLeft);
          spaceRight = nextRight % 10 !== 0 && nextRight <= 99 && !pickedSquares.includes(nextRight);
          //console.log("newNextUp: " + nextUp);
          //console.log("newNextDown: " + nextDown);
          //console.log("newNextLeft: " + nextLeft);
          //console.log("newNextRight: " + nextRight);

          if (currentDirection === "up" && spaceDown) {
            //console.log("17");
            this.handleSquareClick(nextDown);
            this.setState({ currentDirection: "down" });
          } else if (currentDirection === "down" && spaceUp) {
            //console.log("18");
            this.handleSquareClick(nextUp);
            this.setState({ currentDirection: "up" });
          } else if (currentDirection === "left" && spaceRight) {
            //console.log("19");
            this.handleSquareClick(nextRight);
            this.setState({ currentDirection: "right" });
          } else if (currentDirection === "right" && spaceLeft) {
            //console.log("20");
            this.handleSquareClick(nextLeft);
            this.setState({ currentDirection: "left" });
          } else if (!spaceLeft && !spaceRight && spaceUp) {
            //console.log("21");
            this.handleSquareClick(nextUp);
            this.setState({ currentDirection: "up" });
          } else if (!spaceLeft && !spaceRight && spaceDown) {
            //console.log("22");
            this.handleSquareClick(nextDown);
            this.setState({ currentDirection: "Down" });
          } else if (!spaceDown && !spaceUp && spaceLeft) {
            //console.log("23");
            this.handleSquareClick(nextLeft);
            this.setState({ currentDirection: "left" });
          } else if (!spaceUp && !spaceDown && spaceRight) {
            //console.log("24");
            this.handleSquareClick(nextRight);
            this.setState({ currentDirection: "right" });
          } else {
            //console.log("cpu really doesnt know what to do");
            let occupied;
            let rnd;
            do {
              occupied = true;
              rnd = Math.floor(Math.random() * 100);
              occupied = pickedSquares.includes(rnd);
            } while (occupied);

            this.handleSquareClick(rnd);
            if (allShipSquares.includes(rnd)) {
              this.setState({ targetingShip: true, shipHitOrigin: rnd, currentShipShots: 1 });
              //console.log("hit!");
            } else this.setState({ targetingShip: false, currentShipShots: 0 });
          }
          currentShipShots = 1;
        }
      }

      currentShipShots++;
      this.setState({ currentShipShots: currentShipShots });
    }
    //this.seeIfSunk();
  };

  renderBoard = () => {
    const board = Array(100).fill(0);
    let list;
    if (!this.props.attack && this.props.showShips) {
      list = board.map((_, index) => {
        const isPicked = this.state.pickedSquares.includes(index);

        for (const ship of this.state.ships)
          if (ship.squares.includes(index))
            return (
              <Square
                key={index}
                id={index}
                attack={this.props.attack}
                hasShip={true}
                shipName={ship.name}
                isPicked={isPicked}
                isSelected={ship.selected}
                isSunk={ship.sunk}
                ifClicked={id => this.handleSquareClick(id)}
              />
            );

        return (
          <Square
            key={index}
            id={index}
            attack={this.props.attack}
            hasShip={false}
            isPicked={isPicked}
            ifClicked={id => this.handleSquareClick(id)}
            gamePhase={this.props.gamePhase}
          />
        );
      });
    } else {
      /*list = board.map((_, index) => (
        <Square
          key={index}
          id={index}
          attack={this.props.attack}
          hasShip={false}
          isPicked={false}
          gamePhase={this.props.gamePhase}
          ifClicked={id => this.handleSquareClick(id)}
        />
      ));*/

      list = board.map((_, index) => {
        const isPicked = this.state.pickedSquares.includes(index);

        for (const ship of this.state.ships)
          if (ship.squares.includes(index))
            return (
              <Square
                key={index}
                id={index}
                attack={this.props.attack}
                hasShip={true}
                shipName={ship.name}
                isPicked={isPicked}
                isSelected={ship.selected}
                isSunk={ship.sunk}
                ifClicked={id => this.handleSquareClick(id)}
              />
            );

        return (
          <Square
            key={index}
            id={index}
            attack={this.props.attack}
            hasShip={false}
            isPicked={isPicked}
            ifClicked={id => this.handleSquareClick(id)}
            gamePhase={this.props.gamePhase}
          />
        );
      });
    }
    if (this.props.attack === true) return <div className="attackBoard">{list}</div>;
    else return <div className="board">{list}</div>;
  };

  render() {
    //if (this.state.targettedShipSunk) console.log(this.props.attack ? "user sunk a ship" : "cpu sunk a ship");
    return <div>{this.renderBoard()}</div>;
  }
}

export default Board;
