import { getQuestions } from "./questions.js";
import { WebSocketServer } from "ws"; 
import { v4 as uuidv4 } from "uuid";

const wss = new WebSocketServer({ port: 8080 });

// Games should probably be stored using some kind of hash map so we can perform O(1) checks to see if code already exists.
// Currently ignoring the problem by using a long code
// Maybe use a UUID as the key? 
const liveGames = [];

function createGame(msg, ws) {
  const getRandomCode = () => Math.random().toString(36).slice(2, 25).toUpperCase();
  let gameID = getRandomCode();
  let gameObject = {
    playerProfile: {
      socket: ws,
      uuid: uuidv4(),
      score: 0,
      answered: false
    },
    gameID: gameID,
    numberOfQuestions: msg['numberOfQuestions'],
    currentQuestion: 0,
    numAnswers: 0,
    started: false,
    questions: getQuestions()
  };

  liveGames.push(gameObject);
  ws.send(JSON.stringify({
    // This can be done better with spreading, not sure how though
    gameID: gameObject.gameID,
    playerID: gameObject.playerProfile.uuid
  }));
  return gameID;
}

function broadcast() {
  liveGames.map( (value, index) => {
    value.playerProfile.socket.send("Message");
  });
}

function parseMessage(msg, ws) {
  switch(msg['requestType']) {
    case "CREATE":
      let gameID = createGame(msg, ws);
      console.log(`Created new game with code: ${gameID}`);
      break;
    case "BROADCAST":
      broadcast();
      break;
    default:
      return;
  }

}

wss.on("connection", (ws) => {
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

*/

// Creating rooms //

function receiveAnswers() {
  /*

  Once all answers recieved for a room in session, send answer then new question to all clients

  */
}
