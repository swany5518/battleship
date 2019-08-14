import React, { Component } from "react";
import "../index.css";
import Board from "./Board";
import EventDisplay from "./EventDisplay";

class Game extends Component {
  state = {
    gamePhase: "start",
    placingShips: true,
    singlePlayer: false,
    playersTurn: true,
    playerHitLast: false,
    cpuHitLast: false,
    startOfTurns: false,
    leftMessageSunk: false,
    rightMessageSunk: false,
    leftMessageName: null,
    rightMessageName: null,
    cpuWins: false,
    userWins: false,
  };

  componentDidUpdate(oldProps, oldState) {
    if (oldState.gamePhase === "prep" && this.state.gamePhase === "game") this.setState({ startOfTurns: true }); //left off here on friday
    if (oldState.startOfTurns && this.state.startOfTurns) this.setState({ startOfTurns: false });
    if (oldState.rightMessageSunk) this.setState({rightMessageSunk: false})
    if (oldState.gamePhase === "end" && this.state.gamePhase === "start") this.setState({cpuWins: false, userWins: false});
  }

  decideMessage = arg => {
    if (this.state.gamePhase === "start") return "Select Game Mode";
    else if (this.state.gamePhase === "prep") return "Use arrow keys, r and g to move rotate and randomise your ships";
    else if (this.state.rightMessageSunk && arg === "right") return "you sunk the " + this.state.rightMessageName;
    else if (this.state.leftMessageSunk && arg === "left") return "cpu sunk the " + this.state.leftMessageName;
    else if (this.state.startOfTurns && arg !== "left" && arg !== "right") return "The Game Has Started";
    else if (this.state.playerHitLast && arg === "right") return "you hit a ship";
    else if (this.state.cpuHitLast && arg === "left") return "cpu hit a ship";
    else if (!this.state.playerHitLast && arg === "right") return "you missed last";
    else if (!this.state.cpuHitLast && arg === "left") return "cpu missed last";
    else if (this.state.gamePhase === "end") {
      if (this.state.cpuWins && !this.state.userWins) return "you lose!"
      else if (!this.state.cpuWins && this.state.userWins) return "you win!"
    }
    else return "no condition in decideMessage met";
  };
 
  recieveTurnInfo = (hit, name, sunk, attack) => {
    if (attack) {
      if (sunk) this.setState({ rightMessageSunk: true, rightMessageName: name, playerHitLast: true });
      else if (hit) {
      this.setState({playerHitLast: true})
      }
      else {
        this.setState({rightMessageSunk: false, rightMessageName: null, playerHitLast: false})
      }
    } 
    else if (!attack) {
      if (sunk) this.setState({ leftMessageSunk: true, leftMessageName: name, cpuHitLast: true });
      else if (hit) this.setState({cpuHitLast: true})
      else {
        this.setState({leftMessageSunk: false, leftMessageName: null, cpuHitLast: false})
      }
    }
  };

  decideButton = () => {
    if (this.state.gamePhase === "start") {
      return (
        <div className="game-buttons-double">
          <button className="game-button" onClick={() => this.handleButtonClick("single")}>
            Single Player
          </button>
          <button className="game-button" onClick={this.handleButtonClick}>
            Multiplayer
          </button>
        </div>
      );
    } else if (this.state.gamePhase === "prep") {
      return (
        <div className="game-buttons-single">
          <button className="game-button" onClick={this.handleButtonClick}>
            Start
          </button>
        </div>
      );
    } else if (this.state.gamePhase === "end") {
      return (
        <div className="game-buttons-single">
          <button className="game-button" onClick={this.handleButtonClick}>
            Play Again
          </button>
        </div>
      );
    }
  };

  handleButtonClick = arg => {
    if (arg === "single") {
      this.setState({ singlePlayer: true });
      console.log("single player");
      if (this.state.gamePhase === "start") {
        this.setState({ gamePhase: "prep" });
      } else if (this.state.gamePhase === "prep") {
        this.setState({ gamePhase: "game" });
      } else if (this.state.gamePhase === "game") {
        this.setState({ gamePhase: "end" });
      } else if (this.state.gamePhase === "end") {
        this.setState({ gamePhase: "start" });
      }
    } else if (arg !== "single") {
      if (this.state.gamePhase === "start") {
        this.setState({ gamePhase: "prep" });
      } else if (this.state.gamePhase === "prep") {
        this.setState({ gamePhase: "game" });
      } else if (this.state.gamePhase === "game") {
        this.setState({ gamePhase: "end" });
      } else if (this.state.gamePhase === "end") {
        this.setState({ gamePhase: "start" });
        //window.location.reload();
      }
    }
  };

  updateAfterTurn = () => {
    this.setState({ playersTurn: !this.state.playersTurn });
  };

  handleWin = (player) => {
    if (player === "user")
      this.setState({userWins: true, gamePhase: "end"})
    else if (player === "cpu")
      this.setState({cpuWins: true, gamePhase: "end"})

  } 

  render() {
    return (
      <div className="gamebody">
        <EventDisplay
          message={this.decideMessage()}
          leftText={this.decideMessage("left")}
          rightText={this.decideMessage("right")}
          phase={this.state.gamePhase}
          cpuHitLast={this.state.cpuHitLast}
          playerHitLast={this.state.playerHitLast}
          startOfTurns={this.state.startOfTurns}
        />
        
        
        <div className="boards">
          <Board
            attack={false}
            showShips={this.state.gamePhase === "start" ? false : true}
            gamePhase={this.state.gamePhase}
            gameStarted={this.state.gamePhase === "start" || this.state.gamePhase === "prep" ? false : true}
            afterTurn={() => this.updateAfterTurn()}
            turn={!this.state.playersTurn}
            sendTurnInfo={(hit, name, sunk, attack) => this.recieveTurnInfo(hit, name, sunk, attack)} //will need more args
            handleWin={() => this.handleWin("cpu")}
           
          />
          <Board
            attack={true}
            turn={this.state.playersTurn}
            isCpu={this.state.singlePlayer}
            showShips={true}
            afterTurn={this.updateAfterTurn}
            gamePhase={this.state.gamePhase}
            sendTurnInfo={(hit, name, sunk, attack) => this.recieveTurnInfo(hit, name, sunk, attack)}
            handleWin={() => this.handleWin("user")}
            

          />
        </div>
        <div className="board-labels">
          <div className="board-label">Your Board</div>
          <div className="board-label">Enemy Board</div>
        </div>
        {this.decideButton()}
      </div>
    );
  }
}

export default Game;
