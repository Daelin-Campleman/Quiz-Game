
import { getQuestions, getAPIQuestions } from "./questions.js";

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
  getQuestions().then((quesitions) => {
    let gameID = getRandomCode();
    let game = {
      players: [new Player(startingPlayer, 0, "")],
      // questionsPerRound: gameOptions['numberOfQuestionsPerRound'],
      questionsPerRound: 2,
      // numberofRounds: gameOptions['numberOfRounds'],
      numberOfRounds: 3,
      currentRound: 1,
      currentQuestion: 1,
      started: false,
      questions: quesitions,
      intervalID: 0
    };
    liveGames.set(gameID, game);
    // We might want to send PlayerID here for further communication
    startingPlayer.send(JSON.stringify({
      gameID: gameID
    }));
  })
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
 * @param {string} gameID 
 * 
 * *
 * Sends a question to a all clients in game
 */
function sendQuestions(question, gameID) {
  const game = liveGames.get(gameID);
  if (game != undefined) {
    const players = game.players;
    players.forEach(p => {
      p.ws.send(JSON.stringify({
        "text": question.question,
        "options": [...question.incorrectAnswers, question.correctAnswer] //TODO: shuffle
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
 */
export function startGame(gameID) {
  const game = liveGames.get(gameID);
  sendQuestions(game.questions[calculateQuestionNumber(gameID)], gameID);
  game.intervalID = setInterval(() => {
    questionOver(gameID);
  }, 2000);
}

//Triggers every question interval
export function questionOver(gameID) {
  const game = liveGames.get(gameID);
  console.log(`round: ${game.currentRound}, question: ${game.currentQuestion}`)
  const players = game.players;
  let correctAnswer = game.questions[calculateQuestionNumber(gameID)].correctAnswer.trim().toUpperCase();
  game.currentQuestion++;
  players.forEach(p => {
    if (p.currentAnswer.trim().toUpperCase() === correctAnswer) {
      p.score++;
      p.answerHistory.push(true);
    } else {
      p.answerHistory.push(false);
    }
  });
  
  if (game.currentQuestion > game.questionsPerRound) {
    roundOver(gameID);
  } else {
    sendQuestions(game.questions[calculateQuestionNumber(gameID)], gameID);
  }
}

function roundOver(gameID) {
  //TODO: maybe send something saying that the round is over?
  const game = liveGames.get(gameID);
  clearInterval(game.intervalID);
  game.currentQuestion = 1;
  game.currentRound += 1;
  if (game.currentRound > game.numberOfRounds) {
    endGame(gameID);
  } else {
    //Delay each round by 5s
    setTimeout(() => {
      sendQuestions(game.questions[calculateQuestionNumber(gameID)], gameID);
      game.intervalID = setInterval(() => {
        questionOver(gameID);
      }, 5000);
    }, 5000);
  }
}

function endGame(gameID) {
  const game = liveGames.get(gameID);
  clearInterval(game.intervalID);
  console.log(`Game ended: ${gameID}`)
  const players = game.players;
  players.forEach(p => {
    p.ws.send(JSON.stringify({
      "message": "GAME OVER",
      "score": p.score
    }))
  });
  //TODO: DB write
  liveGames.delete(gameID);
}

function calculateQuestionNumber(gameID) { //might be better to randomly sample list of questions and just make sure it can't repeat
  const game = liveGames.get(gameID);
  return (game.currentQuestion - 1);
}