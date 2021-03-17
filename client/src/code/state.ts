import React from "react";
import { createSocketCommunication } from "./socketComm";


interface ISelectedTile {
    layer: number,
    row: number,
    column: number,
    type: number,
    name?: string
}

interface IScores {
    player: number,
    opponent: number
}


function createState(inParentElement: React.Component) {
    return {
        scores : { player : 0, opponent : 0} as IScores,

        /* 5 states available:
            - awaitingOpponent
            - playing
            - deadEnd
            - cleared
            - gameOver 
        */
        gameState : "awaitingOpponent" as string,
        layout : [] as number[][][],
        selectedTiles : [] as ISelectedTile[],
        gameOutcome : "" as string,
        pid : "" as string,
        socketComm : createSocketCommunication(inParentElement) as Function, //WebSocket
        timeSinceLastMatch : 0 as number,
        moreMoves : "" as string,
        helpLeft : 0 as number,
        
        handleMessage_connected : function(inPID: string) {
            this.setState({pid : inPID });
        }.bind(inParentElement),

        // updating opponent score; if inPID is your pid, then do nothing
        handleMessage_update : function(inPID: string, inScore: string) {
            if (inPID !== this.state.pid) {
                const scores: IScores = { ...this.state.scores }
                scores.opponent = parseInt(inScore);
                this.setState({ scores : scores });
            }
        }.bind(inParentElement),

        // receive winner pid
        handleMessage_gameOver : function(inPID: string) {
            if (inPID === this.state.pid) {
                this.setState({ gameState : "gameOver", gameOutcome : `You won.`})
            }
            else {
                this.setState({ gameState : "gameOver", gameOutcome : `You lost.`})
            }
        }.bind(inParentElement),

        handleMessage_start : function(inLayout: number[][][]) {
            this.setState({
                timeSinceLastMatch : new Date().getTime(),
                gameState : "playing",
                layout : inLayout,
                helpLeft : 3
            });
        }.bind(inParentElement),

        tileClick : function(inLayer: number, inRow: number, inColumn: number) {
            if (this.state.gameState !== "playing") 
                return;
            if (!this.state.canTileBeSelected(inLayer, inRow, inColumn))
                return;
            if (this.state.layout[inLayer][inRow][inColumn] <= 0)
                return;
            
            const scoresCopy: IScores = { ...this.state.scores };
            let gameStateCopy: string = this.state.gameState;
            let timeSinceLastMatchCopy: number = this.state.timeSinceLastMatch;
            let selectedTilesCopy: ISelectedTile[] = this.state.selectedTiles.slice(0);
            const currentTileValue: number = this.state.layout[inLayer][inRow][inColumn];
            const layoutCopy: number[][][] = this.state.layout.slice(0);

            if (currentTileValue > 1000) {
                layoutCopy[inLayer][inRow][inColumn] -= 1000;
                for (let x: number = 0; x < selectedTilesCopy.length; x++)
                    if (selectedTilesCopy[x].name === `${inLayer}${inRow}${inColumn}`) {
                        selectedTilesCopy.splice(x, 1);
                        break;
                    }
            }
            else if (currentTileValue > 600 && currentTileValue < 700) {
                layoutCopy[inLayer][inRow][inColumn] += 1000;
                selectedTilesCopy.push({layer : inLayer, row : inRow, column : inColumn, 
                    type : currentTileValue - 500, name : `${inLayer}${inRow}${inColumn}`});
            }
            else {
                layoutCopy[inLayer][inRow][inColumn] += 1000;
                selectedTilesCopy.push({layer : inLayer, row : inRow, column : inColumn, 
                    type : currentTileValue, name : `${inLayer}${inRow}${inColumn}`});
            }

            if (selectedTilesCopy.length === 2) {
                if (selectedTilesCopy[0].type === selectedTilesCopy[1].type ||
                    selectedTilesCopy[0].type === 101 ||
                    selectedTilesCopy[1].type === 101) 
                    {
                        layoutCopy[selectedTilesCopy[0].layer][selectedTilesCopy[0].row][selectedTilesCopy[0].column] = -1;
                        layoutCopy[selectedTilesCopy[1].layer][selectedTilesCopy[1].row][selectedTilesCopy[1].column] = -1;

                        let points: number = 10;
                        const nowTime: number = new Date().getTime();
                        const timeTaken: number = nowTime - timeSinceLastMatchCopy;
                        points -= Math.trunc(timeTaken / 500);
                        if (points <= 0)
                            points = 1;
                        scoresCopy.player += points;
                        timeSinceLastMatchCopy = new Date().getTime();
            
                        this.state.socketComm.send(
                            `match_${this.state.pid}_${points}`
                        );

                        const anyMovesLeft: string = this.state.anyMovesLeft(layoutCopy);

                        switch (anyMovesLeft) {
                            case "no":
                                gameStateCopy = "deadEnd";
                                this.state.socketComm.send(`done_${this.state.pid}`);
                                break;

                            case "cleared":
                                scoresCopy.player += 100;
                                gameStateCopy = "cleared";
                                this.state.socketComm.send(`match_${this.state.pid}_100`);
                                this.state.socketComm.send(`done_${this.state.pid}`);
                            break;
                        }

                    } else {
                        layoutCopy[selectedTilesCopy[0].layer][selectedTilesCopy[0].row][selectedTilesCopy[0].column] -= 1000;
                        layoutCopy[selectedTilesCopy[1].layer][selectedTilesCopy[1].row][selectedTilesCopy[1].column] -= 1000;
                    }

                selectedTilesCopy = [ ]; 
    }
            this.setState({
                scores : scoresCopy,
                gameState : gameStateCopy,
                timeSinceLastMatch : timeSinceLastMatchCopy,
                layout : layoutCopy,
                selectedTiles : selectedTilesCopy
            });
        }.bind(inParentElement),

        // tile can be selected, when there is nothing above it and nothing on it left or right side
        canTileBeSelected : function(inLayer: number, inRow:number, inColumn: number ): boolean {
            return (inLayer == 4 ||
              this.state.layout[inLayer + 1][inRow][inColumn] <= 0) &&
            (inColumn === 0 || inColumn === 14 || this.state.layout[inLayer][inRow][inColumn - 1] <= 0 ||
              this.state.layout[inLayer][inRow][inColumn + 1] <= 0);
            // TODO
        }.bind(inParentElement),

        /**
         * brute-force approach
         * if tile can be selected, then it is added to list
         * if any recond in list have two or more elements, then there are more moves
         */
        anyMovesLeft : function(inLayout: number[][][]): string {
            let numTiles: number = 0;
            const selectedTiles: number[] = [ ];

            for (let x: number = 0; x < inLayout.length; x++)
                for (let y: number = 0; y < inLayout[x].length; y++)
                    for (let z: number = 0; z < inLayout[x][y].length; z++) {
                        const tileVal: number = inLayout[x][y][z];  
                        if (tileVal > 0) {
                            numTiles += 1;
                            if (this.state.canTileBeSelected(x, y, z)) {
                                if (tileVal === 101)
                                    return "yes";
                                selectedTiles.push(tileVal);
                            }
                        }
                    }
            
            if (numTiles === 0)
                return "cleared";

            const counts: number[] = [];
            for (let i: number = 0; i < selectedTiles.length; i++)
                if (counts[selectedTiles[i]] === undefined)
                    counts[selectedTiles[i]] = 1;
                else {
                    counts[selectedTiles[i]]++;
                }

                for (let i: number = 0; i < counts.length; i++) {
                    if (counts[i] >= 2) {
                      return "yes";
                    }
                  }
            return "no";
        }.bind(inParentElement),

        /**
         * similar to anyMovesLeft, also brute-force approach
         * if there are two the same tiles which can be selected, then they will be higlighted
         */
        moveHelp : async function(): Promise<void> {
            if (this.state.gameState !== "playing") 
                return;
            if (this.state.helpLeft <= 0) {
                this.setState({moreMoves : "No more elp."});
                return;
            }

            let leftMoves: any = { }; 

            for (let x: number = 0; x < this.state.layout.length; x++)
                for (let y: number = 0; y < this.state.layout[x].length; y++)
                    for (let z: number = 0; z < this.state.layout[x][y].length; z++) {
                        const tileVal = this.state.layout[x][y][z];

                        if (tileVal > 0) {
                            const position: string = `${x}_${y}_${z}`;
                            if (this.state.canTileBeSelected(x,y,z)) {
                                if (tileVal === 101) {
                                    for (const move in leftMoves)
                                        if(leftMoves.hasOwnProperty(move))
                                            leftMoves[move].push(position);
                                }
                                else if (leftMoves[tileVal] === undefined) {
                                    leftMoves[tileVal] = [];
                                    leftMoves[tileVal].push(position);
                                }
                                /**
                                 * highlight messages
                                 * it adds 500 value to tiles, then setTimeout for 1,5 sec and then
                                 * substract 500 value */ 
                                else {
                                    const layoutCopy: number[][][] = this.state.layout.slice(0);
                                    const scoresCopy: IScores = { ...this.state.scores };

                                    const firstPos: string[] = leftMoves[tileVal][0].split('_');
                                    const secondPos: string[] = position.split('_');
                                    
                                    // points substracting is: 5 -> 10 -> 15
                                    const minusPoints: number = 15 * ((4 - this.state.helpLeft) / 3 );
                                    scoresCopy.player -= minusPoints;
                                    const helpMovesLeft: number = this.state.helpLeft - 1
                                
                                    layoutCopy[parseInt(firstPos[0])][parseInt(firstPos[1])][parseInt(firstPos[2])] += 500;
                                    layoutCopy[parseInt(secondPos[0])][parseInt(secondPos[1])][parseInt(secondPos[2])] += 500;
            
                                    this.setState({layout : layoutCopy, scores : scoresCopy, helpLeft : helpMovesLeft});
            
                                    await new Promise(r => setTimeout(r, 1500));
            
                                    layoutCopy[parseInt(firstPos[0])][parseInt(firstPos[1])][parseInt(firstPos[2])] -= 500;
                                    layoutCopy[parseInt(secondPos[0])][parseInt(secondPos[1])][parseInt(secondPos[2])] -= 500;
            
                                    this.setState({layout : layoutCopy});
                                    return; 
                                }
                            }// if (tileCanBeSelected)
                        }// if (tileVar > 0)
                    }
            
            this.setState({moreMoves : "No more moves"});
        }.bind(inParentElement),
    }// return
}// function createState()


export default createState;