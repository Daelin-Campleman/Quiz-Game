const socket = new WebSocket("ws://localhost:8080")

function createGame() {
    socket.send(JSON.stringify({
        numberOfQuestions: 1,
        requestType: "CREATE"
    }));
}

function joinGame() {
}