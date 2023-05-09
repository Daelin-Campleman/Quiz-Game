const socket = new WebSocket("ws://localhost:8080")
let gameID = "";
let playerID = "";
socket.onmessage = (event) => {
    console.log(event.data);
    eventJSON = JSON.parse(event.data);
    gameID = eventJSON["gameID"];
    playerID = eventJSON["playerID"];
    console.log(`Registered to game ${gameID}\nPlayerID: ${playerID}`);
};

function createGame() {
    socket.send(JSON.stringify({
        numberOfQuestions: 1,
        requestType: "CREATE"
    }));
}

/**
 * Simple POC of broadcasting messages to stored live games
 * Can be used to send new questions etc.
 */
function broadcast() {
    socket.send(
        JSON.stringify({
            requestType: "BROADCAST"
        })
    );
}

function joinGame() {
}