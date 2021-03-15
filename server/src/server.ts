import path from "path";
import express, { Express } from "express";
import WebSocket from "ws";

import { shuffle } from "./board";  

const players: any = {};

const app: Express = express();
app.use("/", express.static(path.join(__dirname, "../../client/dist")));
app.listen(3000, () => console.log("BattleJong server ready, listening at port 3000"));

const wsServer = new WebSocket.Server({port : 8080}, () => console.log("BattleJong WebSocket server ready"));

wsServer.on("connection", (socket: WebSocket) => {
    socket.on("message", (inMsg: string) => {

        const msgParts: string[] = inMsg.toString().split("_");
        const message: string = msgParts[0];
        const pid: string = msgParts[1];

        switch(message) {
            case "match":
                players[pid].score += parseInt(msgParts[2]);
                wsServer.clients.forEach((inClient: WebSocket) => {
                    inClient.send(`update_${pid}_${players[pid].score}`);
                });
                break;
                
            case "done":
                players[pid].stillPlaying = false;
                let playersDone: number = 0;

                for (const player in players) {
                    if (players.hasOwnProperty(player)) {
                        if(!players[player].stillPlaying) {
                            playersDone++;
                        }
                    }
                }

                if (playersDone == 2) {   // 2 for production; 1 for debuging
                    let winningPID: string;
                    const playerKeys: string[] = Object.keys(players);
                    if (players[playerKeys[0]].score < players[playerKeys[1]].score )
                        winningPID = playerKeys[1];
                    else 
                        winningPID = playerKeys[0];

                    wsServer.clients.forEach((inClient: WebSocket) => {
                    inClient.send(`gameOver_${winningPID}`);
                    });
                }
        }
    });

    const pid: string = `pid${new Date().getTime()}`;
    players[pid] = { score : 0, stillPlaying : true};
    socket.send(`connected_${pid}`);

    if (Object.keys(players).length === 2) {
        const shuffledLayout: number[][][] = shuffle();
        wsServer.clients.forEach((inClient: WebSocket) => {
            inClient.send(`start_${JSON.stringify(shuffledLayout)}`);
        });
    }
});
