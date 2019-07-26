import React, { Component } from "react";

class EventDisplay extends Component {
  state = {};

  renderFormat() {
    if (this.props.phase !== "game")
      return (
        <div className="eventDisplay">
          <h3 id="eventDisplayText">{this.props.message}</h3>
        </div>
      );
    else if (this.props.startOfTurns)
      return (
        <div className="eventDisplay">
          <h3 id="eventDisplayText">{this.props.message}</h3>
        </div>
      );
    else
      return (
        <div id="dual-event">
          <h3 id={"eventDisplayText"}>{this.props.leftText}</h3>
          <h3 id={"eventDisplayText"}>{this.props.rightText}</h3>
        </div>
      );
  }

  render() {
    return this.renderFormat();
  }
}

export default EventDisplay;
