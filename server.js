import { getQuestions } from "./questions.js";
import { WebSocketServer } from "ws"; 

const wss = new WebSocketServer({ port: 8080 });

const liveGames = [];

function parseMessage(msg, ws) {
  const getRandomCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();
  console.log(`Received Message: ${JSON.stringify(msg)}`);
  switch(msg['requestType']) {
    case "CREATE":
      let gameID = getRandomCode();
      liveGames.push({
        playerProfile: {},
        gameID: gameID,
        numberOfQuestions: msg['numberOfQuestions'],
        currentQuestion: 0,
        numAnswers: 0,
        started: false,
        questions: getQuestions()
      });
      ws.send(`gameID: ${gameID}`);
      console.log(liveGames);
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
