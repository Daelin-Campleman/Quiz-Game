import { getQuestions } from "./questions.js";
import {saveGameLeaderBoard} from "../db/leaderboardRepository.js"
import { createGameRequest } from "../db/requests.js";

function Player(ws, name, score, currentAnswer) {
  this.ws = ws;
  this.name = name;
  this.score = score;
  this.currentAnswer = currentAnswer;
  this.answerHistory = []
}

async function fetchName() {
  let response = await fetch("/auth/user");
  let data = await response.json();
  return data.user.name;
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
export async function createGame(startingPlayer, gameOptions) {
  const getRandomCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();
  let joinCode = getRandomCode();
  var gameID;

  const data = await createGameRequest(joinCode);

  getQuestions(gameOptions).then(async (quesitions) => {
    let game = {
      gameId: data[0],
      players: [new Player(startingPlayer, "test name", 0, "")],
      questionsPerRound: gameOptions.questionsPerRound || 5,
      numberOfRounds: gameOptions.numberOfRounds || 3,
      currentRound: 1,
      currentQuestion: 1,
      started: false,
      questions: quesitions,
      intervalID: 0,
      roundTime: gameOptions.roundLength || 5000
    };
    liveGames.set(joinCode, game);
    // We might want to send PlayerID here for further communication
    startingPlayer.send(JSON.stringify({
      joinCode: joinCode
    }));
  });
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
export function clientAnswer(client, joinCode, answer) {
  const game = liveGames.get(joinCode);
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

export function joinGame(socket, joinCode) {
  const game = liveGames.get(joinCode);
  if (game === undefined) {
    socket.send("Game does not exist."); // should probably be a JSON object but works for now
  } else if (game.started) {
    socket.send("Game has already started.");
  } else {
    const player = game.players.find(p => p.ws.id === socket.id)
    if (player !== undefined) {
      socket.send("Player already in game"); 
    } else {
      game.players.push(new Player(socket, "test name", 0, ""));

      game.players[0].ws.send(JSON.stringify({...game, success: true, message: "New Player Joined Game"}));
      
      socket.send(JSON.stringify({success: true, message: "Successfully Joined Game"}));
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
function sendQuestions(question, joinCode) {
  const game = liveGames.get(joinCode);
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
export function startGame(joinCode) {
  const game = liveGames.get(joinCode);
  sendQuestions(game.questions[calculateQuestionNumber(joinCode)], joinCode);
  game.intervalID = setInterval(() => {
    questionOver(joinCode);
  }, 10000);
}

//Triggers every question interval
export function questionOver(joinCode) {
  const game = liveGames.get(joinCode);
  console.log(`round: ${game.currentRound}, question: ${game.currentQuestion}`)
  const players = game.players;
  let correctAnswer = game.questions[calculateQuestionNumber(joinCode)].correctAnswer.trim().toUpperCase();
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
    roundOver(joinCode);
  } else {
    sendQuestions(game.questions[calculateQuestionNumber(joinCode)], joinCode);
  }
}

function roundOver(joinCode) {
  //TODO: maybe send something saying that the round is over?
  //TODO: Fetch new questions for next round, otherwise questions repeat
  const game = liveGames.get(joinCode);
  clearInterval(game.intervalID);
  game.currentQuestion = 1;
  game.currentRound += 1;
  if (game.currentRound > game.numberOfRounds) {
    endGame(joinCode);
  } else {
    //Delay each round by 5s
    setTimeout(() => {
      sendQuestions(game.questions[calculateQuestionNumber(joinCode)], joinCode);
      game.intervalID = setInterval(() => {
        questionOver(joinCode);
      }, 2000);
    }, 5000);
  }
}

function endGame(joinCode) {
  const game = liveGames.get(joinCode);
  clearInterval(game.intervalID);
  console.log(`Game ended: ${joinCode}`)
  const players = game.players;
  players.forEach(p => {
    p.ws.send(JSON.stringify({
      "message": "GAME OVER",
      "score": p.score
    }))
  });
  sendToDB(joinCode);
  liveGames.delete(joinCode);
}

function calculateQuestionNumber(joinCode) { //might be better to randomly sample list of questions and just make sure it can't repeat
  const game = liveGames.get(joinCode);
  return (game.currentRound - 1) * game.questionsPerRound + game.currentQuestion - 1;
}

async function sendToDB(joinCode) {
  const game = liveGames.get(joinCode);
  const players = game.players;
  let playersSql = "";
  players.forEach(p => {
    playersSql += `(\'${joinCode}\', \'${p.ws.id}\', ${p.score}),`
  });
  playersSql = playersSql.slice(0, -1);
  saveGameLeaderBoard(playersSql).catch((err) => console.log(err));
}