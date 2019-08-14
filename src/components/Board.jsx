import React, { Component } from "react";
import Square from "./Square";

class Board extends Component {
  state = {
    ships: [
      {
        name: "carrier",
        length: 5,
        squares: [34, 44, 54, 64, 74],
        possibleSquares: [],
        direction: null,
        hitOrigin: null,
        hitSquares: [false, false, false, false, false],
        selected: false,
        sunk: false,
        vertical: true
      },
      {
        name: "battleship",
        length: 4,
        squares: [96, 97, 98, 99],
        possibleSquares: [],
        direction: null,
        hitOrigin: null,
        hitSquares: [false, false, false, false],
        selected: false,
        sunk: false,
        vertical: false
      },
      {
        name: "destroyer",
        length: 3,
        squares: [5, 6, 7],
        possibleSquares: [],
        direction: null,
        hitOrigin: null,
        hitSquares: [false, false, false],
        selected: false,
        sunk: false,
        vertical: false
      },
      {
        name: "submarine",
        length: 3,
        squares: [10, 20, 30],
        possibleSquares: [],
        direction: null,
        hitSquares: [false, false, false],
        hitOrigin: null,
        selected: false,
        sunk: false,
        vertical: true
      },
      {
        name: "patrol",
        length: 2,
        squares: [49, 59],
        possibleSquares: [],
        direction: null,
        hitSquares: [false, false],
        hitOrigin: null,
        selected: false,
        sunk: false,
        vertical: true
      }
    ],
    pickedSquares: [-1, -1, -1, -1],
    isCpu: false,
    allShipSquares: [],
    
   
    hitHistory: [],
    hitNameHistory: [],
   
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
            possibleSquares: [],
            direction: null,
            hitOrigin: null,
            hitSquares: [false, false, false, false, false],
            selected: false,
            sunk: false,
            vertical: true
          },
          {
            name: "battleship",
            length: 4,
            squares: [96, 97, 98, 99],
            possibleSquares: [],
            direction: null,
            hitOrigin: null,
            hitSquares: [false, false, false, false],
            selected: false,
            sunk: false,
            vertical: false
          },
          {
            name: "destroyer",
            length: 3,
            squares: [5, 6, 7],
            possibleSquares: [],
            direction: null,
            hitOrigin: null,
            hitSquares: [false, false, false],
            selected: false,
            sunk: false,
            vertical: false
          },
          {
            name: "submarine",
            length: 3,
            squares: [10, 20, 30],
            possibleSquares: [],
            direction: null,
            hitSquares: [false, false, false],
            hitOrigin: null,
            selected: false,
            sunk: false,
            vertical: true
          },
          {
            name: "patrol",
            length: 2,
            squares: [49, 59],
            possibleSquares: [],
            direction: null,
            hitSquares: [false, false],
            hitOrigin: null,
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

  cpuRandomPick = () => {
    let pickedSquares = this.state.pickedSquares;
    let occupied;
    let rnd;
  
      do {
        occupied = true;
        rnd = Math.floor(Math.random() * 100);
        occupied = pickedSquares.includes(rnd);
      } while (occupied);

      return rnd;
  }

  setHitSquares = () => {
    let pickedSquares = this.state.pickedSquares;
    let ships = this.state.ships;

    for (let ship of ships) { //sets hitSquares before turn
      let i = 0;
      for (let square of ship.squares) {
        if (pickedSquares.includes(square))
          ship.hitSquares[i] = true;
        i++;
      }
    }
    this.setState({ships: ships})
  }

  setHitOrigins = rnd => {
    let ships = this.state.ships;
    
    for (let ship of ships) 
      for (let square of ship.squares)
        if (square === rnd && !ship.hitSquares.includes(true)) 
          ship.hitOrigin = rnd;

    
    this.setState({ships: ships})
  }

  updateHitHistory = rnd => {
    let hitHistory = this.state.hitHistory;
    let allShipSquares = this.state.allShipSquares;
    let hitNameHistory = this.state.hitNameHistory;

    if (allShipSquares.includes(rnd))
      for (const ship of this.state.ships) {
        if (ship.squares.includes(rnd)) {
          hitHistory = hitHistory.concat(true);
          hitNameHistory = hitNameHistory.concat(ship.name)
        }
      }
    else {
      hitHistory = hitHistory.concat(false);
      hitNameHistory = hitNameHistory.concat("none");
    }

    this.setState({hitHistory: hitHistory, hitNameHistory: hitNameHistory})
  }

  checkForShipsNotSunk = () => {
    let ships = this.state.ships;

    for (let ship of ships) {
      if (ship.hitSquares.includes(true) && ship.hitSquares.includes(false)) {
        console.log("test-true reached")
        return true;
      }
    }   
      console.log("test-true not reached")
      return false;
  }

  cpuGuessNextPick = name => {
  
  for (let ship of this.state.ships) {
    if (ship.name === name) {
      let spot;
      
      spot = ship.possibleSquares[ship.direction].shift();

      if (!this.state.allShipSquares.includes(spot) || ship.possibleSquares[ship.direction].length === 0) {
        ship.possibleSquares.shift();
      }

      this.setState({ships: this.state.ships})
      console.log("guess next pick result: " + spot);
      return spot;
    } 
  }
}

  cpuSwitchDirection = (lastShot, twoAgo) => {
    let nextDirection = twoAgo - lastShot;
    let ships = this.state.ships;
    let targetedShip;

    for (let ship of ships)
      if (ship.squares.includes(twoAgo))
        targetedShip = ship;
    
    return targetedShip.hitOrigin + nextDirection;
  }
  
  cpuCalculatedPick = (name) => {
    let ships = this.state.ships;
    let spot;

    for (let ship of ships) {
      if (ship.name === name) {
        do {
          if (this.state.pickedSquares.includes(ship.possibleSquares[ship.direction][0]))
          ship.possibleSquares[ship.direction].shift();
        } while (this.state.pickedSquares.includes(ship.possibleSquares[ship.direction][0]))

        spot = ship.possibleSquares[ship.direction].shift();

        if (!this.state.allShipSquares.includes(spot) || ship.possibleSquares[ship.direction].length === 0) {
          ship.possibleSquares.shift();
        }
      }
    }
    this.setState({ships: ships});
    
    return spot;
  }

  cpuGetpossibleSquares = () => {
    let ships = this.state.ships;
    let pickedSquares = this.state.pickedSquares;

    for (let ship of ships) {
      let hitCount = 0;
      for (let hit of ship.hitSquares)
        if (hit)
          hitCount++;

      if (hitCount === 1 && ship.possibleSquares.length < 1 && ship.possibleSquares) {
        let origin = ship.hitOrigin;
        let size = ship.squares.length;
        let upSquares = [];
        let downSquares = [];
        let rightSquares = [];
        let leftSquares = [];
        let upContinue = true;
        let downContinue = true;
        let rightContinue = true;
        let leftContinue = true;

        for (let i = 1; i < size; i++) {
          let up = origin - (10 * i);
          let down  = origin + (10 * i);
          let left = origin - i;
          let right = origin + i;

          if (up >= 0 && !pickedSquares.includes(up) && upContinue) upSquares.push(up);
          else upContinue = false;

          if (down <= 99 && !pickedSquares.includes(down) && downContinue) downSquares.push(down);
          else downContinue = false;

          if (origin % 10 > 0 && left % 10 < origin % 10 && !pickedSquares.includes(left) && leftContinue) leftSquares.push(left);
          else leftContinue = false;

          if (origin % 10 < 9 && right % 10 > origin % 10 && !pickedSquares.includes(right) && rightContinue) rightSquares.push(right);
          else rightContinue = false;
        }
        let rnd = Math.floor(Math.random() * 4);

        if (rnd === 0) {
          if (upSquares.length > 0) ship.possibleSquares.push(upSquares);
          if (downSquares.length > 0) ship.possibleSquares.push(downSquares);
          if (leftSquares.length > 0) ship.possibleSquares.push(leftSquares);
          if (rightSquares.length > 0) ship.possibleSquares.push(rightSquares);
        }
        else if (rnd === 1) {
          if (downSquares.length > 0) ship.possibleSquares.push(downSquares);
          if (upSquares.length > 0) ship.possibleSquares.push(upSquares);
          if (leftSquares.length > 0) ship.possibleSquares.push(leftSquares);
          if (rightSquares.length > 0) ship.possibleSquares.push(rightSquares);
        }
        else if (rnd === 2) {
          if (leftSquares.length > 0) ship.possibleSquares.push(leftSquares);
          if (rightSquares.length > 0) ship.possibleSquares.push(rightSquares);
          if (upSquares.length > 0) ship.possibleSquares.push(upSquares);
          if (downSquares.length > 0) ship.possibleSquares.push(downSquares);
        }
        else if (rnd === 3) {
          if (rightSquares.length > 0) ship.possibleSquares.push(rightSquares);
          if (leftSquares.length > 0) ship.possibleSquares.push(leftSquares);
          if (upSquares.length > 0) ship.possibleSquares.push(upSquares);
          if (downSquares.length > 0) ship.possibleSquares.push(downSquares);
        }
        
        ship.direction = 0;
      }
    }
    this.setState({ships: ships});
  }

  cpuFinishTurn = spot => {
    this.setHitOrigins(spot);
    this.updateHitHistory(spot);
    
    this.handleSquareClick(spot);
    this.setHitSquares();
    this.cpuGetpossibleSquares();
  }

  cpuGetHitCount = name => {
    let count = 0;

    for (const ship of this.state.ships)
      for (let hit of ship.hitSquares)
        count += hit ? 1 : 0;

    return count;
  }

  cpuTurn = () => {
    this.cpuGetpossibleSquares();
    let nextShot;

    if (this.checkForShipsNotSunk()) { 
      let ships = this.state.ships;
      let targetedShip;
      
      for (let ship of ships) 
        if (ship.hitSquares.includes(true) && ship.hitSquares.includes(false))
          targetedShip = ship;
      
      let hitCount = this.cpuGetHitCount(targetedShip.name);
      //console.log("hitcount: " + hitCount);

      if (hitCount === 1) {
       nextShot = this.cpuGuessNextPick(targetedShip.name);
       //console.log(nextShot);
      }

      else nextShot = this.cpuCalculatedPick(targetedShip.name);
    }

    else nextShot = this.cpuRandomPick(); 
      
    console.log("next shot from calculated function: " + nextShot);
    this.cpuFinishTurn(nextShot);
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
