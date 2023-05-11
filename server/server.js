import { WebSocketServer } from "ws"; 
import { createGame, joinGame, startGame, clientAnswer } from "./game.js";

// import express
import express, { response } from "express";
const app = express();

const port = process.env.PORT || 8090;

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

app.use(express.static("public"));

const wss = new WebSocketServer({ server: server });

wss.getUniqueID = function () {
  // https://stackoverflow.com/questions/13364243/websocketserver-node-js-how-to-differentiate-clients
  function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};

/**
 * 
 * @param {String} msg 
 * @param {Websocket} ws 
 * 
 * *
 * See MessagingFormat.md for a breakdown of messaging types
 */
function parseMessage(msg, ws) {
  console.log(`Received Message: ${JSON.stringify(msg)}`);
  switch(msg['requestType']) {
    case "CREATE":
      createGame(ws, msg);
      break;
    case "JOIN":
      joinGame(ws, msg['gameID']);
      break;
    case "ANSWER":
      clientAnswer(ws, msg['gameID'], msg['answer']);
      break;
    case "START":
      startGame(msg['gameID']);
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

/*

  game = {
    players = [players],
    maxQuestions = int,
    currentQuestion = int,
    numAnswers = int,
    questions = [question objects]
    intervalID: number
  }

  player = {
    socket,
    uuid,
    score
  }
*/