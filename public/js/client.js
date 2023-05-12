const wsURL = window.location.host.includes("localhost") ? `ws://${window.location.host}/` : `wss://${window.location.host}/`;
const socket = new WebSocket(wsURL);
let gameID = "";
let playerID = "";
socket.onmessage = (event) => {
    console.log(`Message received: ${event.data}`)
    let response = JSON.parse(event.data);
    if (response['gameID'] != undefined) {
        gameID = response['gameID']
    }
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
function startGame() {
    console.log(`gameID: ${gameID}`)
    socket.send(
        JSON.stringify({
            requestType: "START",
            gameID: gameID
        })
    );
}

function joinGame() {
    gameID = document.getElementById("inputbox").value;
    socket.send(JSON.stringify({
        gameID: gameID,
        requestType: "JOIN"
    }));
}

function sendAnswer() {
    answer = document.getElementById("answerbox").value;
    socket.send(JSON.stringify({
        answer: answer,
        requestType: "ANSWER",
        gameID: gameID
    }));
}