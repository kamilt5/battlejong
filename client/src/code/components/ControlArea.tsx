import React from "react";


const ControlArea = ({ state }: any) => ( 
    //React.Fragment will return list of element instead of one element
    //It's a invisible parent container, which won't be added to DOM

    <React.Fragment>  
      <div style={{ float : "left", width : "130px" }}>
        You:
      </div>
      <div>{ state.scores.player }</div>
      <br />
      <div style={{ float : "left", width : "130px" }}>
        Opponent:
      </div>
      <div>{ state.scores.opponent }</div>
      <hr style={{ width : "75%", textAlign : "center"}} />
      <br />
      {/* awaitingOpponent informations */}
      { state.gameState === "awaitingOpponent" &&
        <div style={{ color : "#ff0000", fontWeight : "lighter",
          textAlign : "center"}}>
          Waiting for opponent to join    
        </div>
      }
      {/* deadEnd informations */}
      { state.gameState === "deadEnd" &&
        <div style={{ color : "#ff0000", fontWeight : "lighter", 
          textAlign: "center" }}>
          You have no more move left.
          <br />
          Waiting for opponent to finish.   
        </div>
      }
      {/* gameCleared informations */}
      { state.gameState === "gameCleared" &&
        <div style={{ color : "#ff0000", fontWeight : "lighter", 
          textAlign: "center" }}>
          Congratulations!
          <br />
          You've cleared the board.
          <br />
          Waiting for opponent to finish.  
        </div>
      }
      {/* gameOutcome informations */}
      { state.gameState === "gameOver" &&
        <div style={{ color : "#ff0000", fontWeight : "lighter", 
          textAlign: "center" }}>
          Game is over.
          <br />
          { state.gameOutcome }   
        </div>
      }
      {/* moreMoves informations */}
      { state.moreMoves !== "" &&
        <div style={{ color : "#ff0000", fontWeight : "lighter", 
          textAlign: "center" }}>
          { state.moreMoves }
          <br />
        </div>
      }
      {/* Help left number */}
      <div style={{ position : "absolute", top : "14em", right : "2em"}}>
        Help left - <span style={{color : "red" }}>{ state.helpLeft }</span>
      </div> 
    </React.Fragment>
);


export default ControlArea;