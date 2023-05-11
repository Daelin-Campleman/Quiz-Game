
import { getQuestions, getAPIQuestions } from "./questions.js";

// let questionsList = await getAPIQuestions();
let questionsList = getQuestions()

function Player(ws, score, currentAnswer) {
  this.ws = ws;
  this.score = score;
  this.currentAnswer = currentAnswer;
  this.answerHistory = []
}

// Stores current games in memory
const liveGames = new Map();

/**
 * 
 * @param {Websocket} startingPlayer 
 * @param {Object} gameOptions
 * 
 * *
 * Creates a new game and stores it in liveGames. 
 */
export function createGame(startingPlayer, gameOptions) {
  const getRandomCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();
  let gameID = getRandomCode();
  let game = {
    players: [new Player(startingPlayer, 0, "")],
    // numberOfQuestions: gameOptions['numberOfQuestions'],
    numberOfQuestions: 2,
    currentQuestion: 0,
    started: false,
    questions: getQuestions(),
    intervalID: 0
  };
  liveGames.set(gameID, game);
  // We might want to send PlayerID here for further communucation
  startingPlayer.send(JSON.stringify({
    gameID: gameID
  }));
}

/**
 * 
 * @param {String} clientID 
 * @param {String} gameID 
 * @param {String} answer 
 * 
 * *
 * Receives answer for player and stores in player object in game object in liveGames
 */
export function clientAnswer(client, gameID, answer) {
  const game = liveGames.get(gameID);
  const player = game.players.find(p => p.ws.id === client.id)
  if (player != undefined) {
    player.currentAnswer = answer;
  }
  client.send(JSON.stringify({
    "message": "Answer received"
  })); 
}

/**
 * 
 * @param {Websocket} socket 
 * @param {String} gameID 
 * 
 * *
 * Adds new player to game
 */

export function joinGame(socket, gameID) {
  const game = liveGames.get(gameID);
  if (game === undefined) {
    socket.send("Game does not exist."); // should probably be a JSON object but works for now
  } else if (game.started) {
    socket.send("Game has already started.");
  } else {
    const player = game.players.find(p => p.ws.id === socket.id)
    if (player !== undefined) {
      socket.send("Player already in game"); 
    } else {
      game.players.push(new Player(socket, 0, ""));
      socket.send(JSON.stringify({...game, success: true, message: "Successfuly Joined Game"}));
      console.log(liveGames);
    }
  }
}

/**
 * 
 * @param {Object} question 
 * @param {Websocket} socket 
 * 
 * *
 * Sends a question to a websocket connection
 */
function sendQuestions(question, gameID) {
  const game = liveGames.get(gameID);
  if (game != undefined) {
    const players = game.players;
    players.forEach(p => {
      p.ws.send(JSON.stringify({
        "text": question.question,
        "options": [...question.incorrectAnswers, question.correctAnswer]
      }));
    })
  }
}

/**
 * 
 * @param {String} gameID
 * 
 * *
 * Starts gameloop
 * TODO: This currently does not work 
 */
export function startGame(gameID) {
  const game = liveGames.get(gameID);
  sendQuestions(questionsList[game.currentQuestion], gameID);
  game.intervalID = setInterval(() => {
    roundOver(gameID);
  }, 5000)
  
}

export function roundOver(gameID) {
  const game = liveGames.get(gameID);
  const players = game.players;
  let correctAnswer = game.questions[game.currentQuestion].correctAnswer.trim().toUpperCase();
  game.currentQuestion++;
  players.forEach(p => {
    if (p.currentAnswer.trim().toUpperCase() === correctAnswer) {
      p.score++;
      p.answerHistory.push(true);
    } else {
      p.answerHistory.push(false);
    }
  });
  
  if (game.currentQuestion >= game.numberOfQuestions) {
    endGame(gameID);
  } else {
    sendQuestions(questionsList[game.currentQuestion], gameID);
  }
}

function endGame(gameID) {
  const game = liveGames.get(gameID);
  clearInterval(game.intervalID);
  console.log(`Game ended: ${gameID}`)
  const players = game.players;
  players.forEach(p => {
    p.ws.send(JSON.stringify({
      "score": p.score
    }))
  });
}