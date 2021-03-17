import React from "react";

import ControlArea from "./ControlArea";
import PlayerBoard from "./PlayerBoard";
import createState from "../state";


class BaseLayout extends React.Component {
    state = createState(this);

    render() {
        return (
            <div className="appContainer">
              <div className="playerBoard">
                <PlayerBoard state={this.state} />
              </div>
              <div className="controlArea">
                <ControlArea state={this.state} />
              </div>
              <div>
                <button className="helpButton" onClick={() => this.state.moveHelp()}>
                  Help
                </button>
              </div>
            </div>
        );
    }
}


export default BaseLayout;