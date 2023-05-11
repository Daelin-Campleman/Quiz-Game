
import { getQuestions } from "./questions.js";

function Player(ws, score, currentAnswer) {
  this.ws = ws;
  this.score = score;
  this.currentAnswer = currentAnswer;
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
    numberOfQuestions: gameOptions['numberOfQuestions'],
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
export function clientAnswer(clientID, gameID, answer) {
  const game = liveGames.get(gameID);
  const player = game.players.find(p => p.ws.id === clientID)
  if (player != undefined) {
    player.currentAnswer = answer;
  }
  socket.send("Received answer"); 
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
function sendQuestion(question, socket) {
  socket.send(JSON.stringify(question));
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
  game.players.forEach(p => {
    sendQuestion(game.questions[0], p.ws);
  });
  game.currentQuestion += 1;

  game.intervalID = setInterval(() => {
    roundOver(game);
  }, 1000)
  
}

/**
 * 
 * @param {Object} game 
 * 
 * *
 * Collates score, sends new question and ends game when over
 * TODO: This does not work
 */
export function roundOver(game) {
  // Need to clear setIntervale once game is over
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
  // Need to send next question here
}