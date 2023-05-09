const socket = new WebSocket("ws://localhost:8080")
let gameID = "";
socket.onmessage = (event) => {
    console.log(`Message received: ${event.data}`)
};

function createGame() {
    socket.send(JSON.stringify({
        numberOfQuestions: 1,
        requestType: "CREATE"
    }));
}

function joinGame() {
    let gameID = document.getElementById("inputbox").value;
    socket.send(JSON.stringify({
        gameID: gameID,
        requestType: "JOIN"
    }));
}