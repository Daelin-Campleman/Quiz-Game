import { getQuestions } from "./questions.js";
import {saveGameLeaderBoard} from "../db/leaderboardRepository.js"
import { createGameRequest } from "../db/requests.js";

function Player(ws, name, id, score, currentAnswer) {
  this.ws = ws;
  this.name = name;
  this.id = id;
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

  const joinCode = getRandomCode();
  let result = await createGameRequest(joinCode);
  let gameId = result[0][0];

  let user = gameOptions['player'];

  getQuestions(gameOptions).then(async (quesitions) => {
    let game = {
      gameId: gameId,
      players: [new Player(startingPlayer, user['name'], user['id'], 0, "")],
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
      joinCode: joinCode,
      message: `joined game with player id: ${user['id']}`
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
export function clientAnswer(client, options) {
  const game = liveGames.get(options['joinCode']);
  const answer = options['answer'];
  const user = options['player'];
  const player = game.players.find(p => p.id === user['id'])
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

export function joinGame(socket, gameOptions) {
  let joinCode = gameOptions['joinCode'];
  let user = gameOptions['player'];
  const game = liveGames.get(joinCode);
  if (game === undefined) {
    socket.send(JSON.stringify({
      requestType: "JOIN",
      success: false,
      message: "Game does not exist.ecniweiuc"
    }))
  } else if (game.started) {
    socket.send(JSON.stringify({
      message: "Game has already started.",
      success: false,
      requestType: "JOIN"
    }));
  } else {
    const player = game.players.find(p => p.id === user['id']);
    if (player !== undefined && process.env.NODE_ENV != 'development') {
      socket.send("Player already in game"); //TODO maybe handle a rejoining player
    } else {
      game.players.push(new Player(socket, user['name'], user['id'], 0, ""));
      game.players[0].ws.send(JSON.stringify({...game, success: true, message: "New Player Joined Game"}));
      socket.send(JSON.stringify({
        success: true, 
        message: `Successfully Joined Game with player id: ${user['id']}`, 
        requestType: "JOIN"}));
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
function sendQuestions(question, joinCode, quesitonNumber, roundNumber, roundTime) {
  const game = liveGames.get(joinCode);
  if (game != undefined) {
    const players = game.players;
    players.forEach(p => {
      p.ws.send(JSON.stringify({
        "text": question.question,
        "options": shuffleArray([...question.incorrectAnswers, question.correctAnswer]),
        questionNumber: quesitonNumber,
        roundNumber: roundNumber,
        roundTime, roundTime
      }));
    })
  }
}

/**
 * 
 * @param {array} array 
 * @returns shuffled array
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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
  sendQuestions(game.questions[calculateQuestionNumber(joinCode)], joinCode, game.currentQuestion, game.currentRound, game.roundTime);
  game.intervalID = setInterval(() => {
    questionOver(joinCode);
  }, game.roundTime);
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
    sendQuestions(game.questions[calculateQuestionNumber(joinCode)], joinCode, game.currentQuestion, game.currentRound, game.roundTime);
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
      sendQuestions(game.questions[calculateQuestionNumber(joinCode)], joinCode, game.currentQuestion, game.currentRound, game.roundTime);
      game.intervalID = setInterval(() => {
        questionOver(joinCode);
      }, game.roundTime);
    }, 5000);
  }
}

function endGame(joinCode) {
  const game = liveGames.get(joinCode);
  clearInterval(game.intervalID);
  console.log(`Game ended: ${joinCode}`)
  const players = game.players;
  const playerDetails = players.map((p) => {
    return {
      name: p.name,
      score: p.score
    }
  });
  players.forEach(p => {
    p.ws.send(JSON.stringify({
      "message": "GAME OVER",
      "score": p.score,
      "playerDetails": playerDetails
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