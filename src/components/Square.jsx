import React, { Component } from "react";

class Square extends Component {
  handleClick = () => {
    if (!this.props.attack) {
      //if click is on defensive board
      if (this.props.value === 0) {
        //if empty square
        this.props.ifClicked(this.props.id, this.props.value);
        console.log("handle click called");
      } else if (this.props.value === 1) {
        console.log("handle click called");
        this.props.ifClicked(this.props.id, this.props.value);
      }
    } else if (this.props.attack) {
      //if click is on attack board 
    }
  };

  decideClass() {
    if (!this.props.attack) {
      if (this.props.hasShip && this.props.isPicked && this.props.isSunk) return "square-hit-sink";
      else if (this.props.hasShip && this.props.isPicked) return "square-hit";
      else if (this.props.hasShip && this.props.isSelected) return "square-ship-selected";
      else if (this.props.hasShip) return "square-ship";
      else if (this.props.isPicked) return "square-miss";
      else return "square-empty";
    } else {
      if (this.props.hasShip && this.props.isPicked && this.props.isSunk) return "square-hit-sink";
      else if (this.props.hasShip && this.props.isPicked) return "square-hit";
      else if (this.props.isPicked) return "square-miss";
      //else if (this.props.hasShip) return "square-ship";
      //remove // to show enemy ships
      else return "square-empty";
    }
  }

  render() {
    return <div className={this.decideClass()} onClick={() => this.props.ifClicked(this.props.id)} />;
  }
}

export default Square;
