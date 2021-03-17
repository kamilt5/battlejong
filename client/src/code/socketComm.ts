import React from "react";


export function createSocketCommunication(
    inParentComponent: React.Component
) {
    const connection: WebSocket = new WebSocket("ws://localhost:8080");

    connection.onopen = () => console.log("Connection opened to server");
    connection.onerror = (error) => console.log(`WebSocket error ${error}`);

    /**
     * WebSocket can procces messages:
     * - update = changing game state
     * - gameOver = game ended, closing everything and showing result
     * - connected = message with player id
     * - start = message with shuffled player board
     */
    connection.onmessage = function(inMessage: any) {
        console.log(`WS received ${inMessage.data}`);
        const msgParts: string[] = inMessage.data.split("_");
        const message: string = msgParts[0];

        switch (message) {

            // message in format update_pid_score
            case "update":
                this.state.handleMessage_update(msgParts[1], msgParts[2]);
                break;
            
            // message in format gameOver_pid
            case "gameOver":
                this.state.handleMessage_gameOver(msgParts[1]);
                break;

            // message in format connected_pid
            case "connected":
                this.state.handleMessage_connected(msgParts[1]);
                break;

            //message in format start_layout
            case "start":
                this.state.handleMessage_start(JSON.parse(msgParts[1]));
                break;
        }
    }.bind(inParentComponent);


    /**
     * function to send messages to connected WebSocket
     * 
     * @param inMessage message to send, always in string
     */
    this.send = function(inMessage: string) {
        console.log(`WS sending ${inMessage}`);
        connection.send(inMessage);
    }


    return this;
}   