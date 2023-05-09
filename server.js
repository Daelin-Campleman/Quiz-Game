import { getQuestions } from "./questions.js";
import { WebSocketServer } from "ws"; 
import { v4 as uuidv4 } from "uuid";

const wss = new WebSocketServer({ port: 8080 });

wss.getUniqueID = function () {
  // https://stackoverflow.com/questions/13364243/websocketserver-node-js-how-to-differentiate-clients
  function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};

const liveGames = new Map();

function Player(ws, score, currentAnswer) {
  this.ws = ws;
  this.score = score;
  this.currentAnswer = currentAnswer;
}

function createGame(startingPlayer, gameOptions) {
  const getRandomCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();
  let gameID = getRandomCode();
  let game = {
    players: [new Player(startingPlayer, 0, "")],
    numberOfQuestions: gameOptions['numberOfQuestions'],
    currentQuestion: 0,
    started: false,
    questions: getQuestions()
  };
  liveGames.set(gameID, game);
  startingPlayer.send(JSON.stringify({
    gameID: gameID
  }));
}

function joinGame(socket, gameID) {
  const game = liveGames.get(gameID);
  if (game == undefined) {
    socket.send("Game does not exist."); // should probably be a JSON object but works for now
  } else if (game.started) {
    socket.send("Game has already started.");
  } else {
    const player = game.players.find(p => p.ws.id === socket.id)
    if (player != undefined) {
      socket.send("Player already in game"); 
    } else {
      game.players.push(new Player(socket, 0, ""));
    }
  }
}

function clientAnswer(clientID, gameID, answer) {
  const game = liveGames.get(gameID);
  const player = game.players.find(p => p.ws.id === clientID)
  if (player != undefined) {
    player.currentAnswer = answer;
  }
  socket.send("Received answer"); 
}

/**
 * idea is that each player submits an answer and its stored within their object
 * then whenever the round is over we call this function and it
 * lets each client know if they got it right and their current score.
 */
function roundOver(gameID) {
  const game = liveGames.get(gameID);
  const players = game.players;
  players.forEach(p => {
    let result = "incorrect";
    if (p.currentAnswer === game.questions[game.currentQuestion.correctAnswer]) {
      result = "correct";
      p.score++;
    }
    p.ws.send(JSON.stringify({
      result: result,
      score: p.score
    }));
  });
}

function parseMessage(msg, ws) {
  console.log(`Received Message: ${JSON.stringify(msg)}`);
  switch(msg['requestType']) {
    case "CREATE":
      createGame(ws, msg);
      console.log(liveGames);
      break;
    case "JOIN":
      joinGame(ws, msg['gameID']);
      break;
    case "ANSWER":
      clientAnswer(ws, msg['gameID', msg['answer']]);
      break;
    default:
      return;
  }

}

wss.on("connection", (ws) => {
  ws.id = wss.getUniqueID();
  console.log(`client connected with id: ${ws.id}`)
  ws.on("message", (msg) => parseMessage(JSON.parse(msg), ws));
});

/**
 * {
 *    RequestType: "JOIN", "CREATE", "ANSWER"
 * }
 */

/*

  game = {
    players = [players],
    maxQuestions = int,
    currentQuestion = int,
    numAnswers = int,
    questions = [question objects]
  }

  player = {
    socket,
    uuid,
    score
  }

  ------------------------

  RequestType: CREATE:
  {
    "requestType": "CREATE",
    "numQuestions": number,
    "roundTime": number,
    "questionCategories": [string]
    "maxPlayers": number (optional)
  }
  Response:
  {
    "gameID": gameID
  }

  ------------------------

  RequestType: JOIN
  {
    "gameID": gameID
  }
  Response:
  {
    "success": bool
    "message": string (can be used to let FE know maxPlayers has been reached)
  }

  ------------------------
  
  RequestType: ANSWER
  {
    "gameID": gameID
    "answer": string
  }
  Response:
  No immediate response. This will be handled at the end of the round

*/