const socket = new WebSocket("ws://localhost:8080")
let gameID = "";
let playerID = "";
socket.onmessage = (event) => {
    console.log(`Message received: ${event.data}`)
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
    let gameID = document.getElementById("inputbox").value;
    socket.send(JSON.stringify({
        gameID: gameID,
        requestType: "JOIN"
    }));
}