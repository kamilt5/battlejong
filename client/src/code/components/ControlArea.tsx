import React from "react";


const ControlArea = ({ state }: any) => ( 
    //React.Fragment will return list of element instead of one element
    //It's a invisible parent container, which won't be added to DOM
    <React.Fragment>  
      <div style={{ float : "left", width : "130px" }}>
        Your score:
      </div>
      <div>{ state.scores.player }</div>
      <div style={{ float : "left", width : "130px" }}>
        Oponent score:
      </div>
      <div>{ state.scores.oponent }</div>
      <br />
      <hr style={{ width : "75%", textAlign : "center"}} />
      <br />
      { state.gameState === "awaitingOpponent" &&
        <div style={{ color : "#ff0000", fontWeight : "lighter",
          textAlign : "center"}}>
          Waiting for opponent to join    
        </div>
      }
      { state.gameState === "deadEnd" &&
        <div style={{ color : "#ff0000", fontWeight : "lighter", 
          textAlign: "center" }}>
          You have no more move left.
          <br />
          Waiting for opponent to finish.   
        </div>
      }
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
      { state.gameState === "gameOver" &&
        <div style={{ color : "#ff0000", fontWeight : "lighter", 
          textAlign: "center" }}>
          Game is over.
          <br />
          { state.gameOutcome }   
        </div>
      }
      { state.moreMoves !== "" &&
        <div style={{ color : "#ff0000", fontWeight : "lighter", 
          textAlign: "center" }}>
          { state.moreMoves }
          <br />
        </div>
      }
    </React.Fragment>
);


export default ControlArea;