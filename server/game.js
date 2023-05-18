import { getQuestions, getAPIQuestions } from "./questions.js";
import {saveGameLeaderBoard} from "../db/leaderboardRepository.js"

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
export function createGame(startingPlayer, gameOptions) {
  const getRandomCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();

  getQuestions(gameOptions).then(async (quesitions) => {
    let gameID = getRandomCode();
    let game = {
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
      game.players.push(new Player(socket, "test name", 0, ""));

      game.players[0].ws.send(JSON.stringify({...game, success: true, message: "New Player Joined Game"}));

      //socket.send(JSON.stringify({...game, success: true, message: "Successfully Joined Game"}));

      // for(let i = 0; i < game.players.length-1; i++) {
      //   console.log("Sending new player message");
      //   game.players[0].ws.send(JSON.stringify({...game, success: true, message: "New Player Joined Game"}));
      // }

      //game.players[0].ws.send(JSON.stringify({...game, success: true, message: "New Player Joined Game"}));
      
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
function sendQuestions(question, gameID, quesitonNumber, roundNumber, roundTime) {
  const game = liveGames.get(gameID);
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
export function startGame(gameID) {
  const game = liveGames.get(gameID);
  sendQuestions(game.questions[calculateQuestionNumber(gameID)], gameID, game.currentQuestion, game.currentRound, game.roundTime);
  game.intervalID = setInterval(() => {
    questionOver(gameID);
  }, game.roundTime);
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
    sendQuestions(game.questions[calculateQuestionNumber(gameID)], gameID, game.currentQuestion, game.currentRound, game.roundTime);
  }
}

function roundOver(gameID) {
  //TODO: maybe send something saying that the round is over?
  //TODO: Fetch new questions for next round, otherwise questions repeat
  const game = liveGames.get(gameID);
  clearInterval(game.intervalID);
  game.currentQuestion = 1;
  game.currentRound += 1;
  if (game.currentRound > game.numberOfRounds) {
    endGame(gameID);
  } else {
    //Delay each round by 5s
    setTimeout(() => {
      sendQuestions(game.questions[calculateQuestionNumber(gameID)], gameID, game.currentQuestion, game.currentRound, game.roundTime);
      game.intervalID = setInterval(() => {
        questionOver(gameID);
      }, game.roundTime);
    }, 5000);
  }
}

function endGame(gameID) {
  const game = liveGames.get(gameID);
  clearInterval(game.intervalID);
  console.log(`Game ended: ${gameID}`)
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
  sendToDB(gameID);
  liveGames.delete(gameID);
}

function calculateQuestionNumber(gameID) { //might be better to randomly sample list of questions and just make sure it can't repeat
  const game = liveGames.get(gameID);
  return (game.currentRound - 1) * game.questionsPerRound + game.currentQuestion - 1;
}

async function sendToDB(gameID) {
  const game = liveGames.get(gameID);
  const players = game.players;
  let playersSql = "";
  players.forEach(p => {
    playersSql += `(\'${gameID}\', \'${p.ws.id}\', ${p.score}),`
  });
  playersSql = playersSql.slice(0, -1);
  saveGameLeaderBoard(playersSql).catch((err) => console.log(err));
}