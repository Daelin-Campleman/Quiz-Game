const socket = new WebSocket("ws://localhost:8080")
let gameID = "";
socket.onmessage = (event) => {
    gameID = JSON.parse(event.data)['gameID'];
    console.log(`Registered to game ${gameID}`);
};

function createGame() {
    socket.send(JSON.stringify({
        numberOfQuestions: 1,
        requestType: "CREATE"
    }));
}

function joinGame() {
}