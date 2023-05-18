import sqlite3 from 'sqlite3';
import mkdirp from "mkdirp";

mkdirp.sync('./var/db');

const db = new sqlite3.Database('./var/db/todos.db');
const leaderBoardDB = new sqlite3.Database(':memory:');

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS users ( \
    id INTEGER PRIMARY KEY, \
    username TEXT UNIQUE, \
    hashed_password BLOB, \
    salt BLOB, \
    name TEXT \
  )");
  
  db.run("CREATE TABLE IF NOT EXISTS federated_credentials ( \
    id INTEGER PRIMARY KEY, \
    user_id INTEGER NOT NULL, \
    provider TEXT NOT NULL, \
    subject TEXT NOT NULL, \
    UNIQUE (provider, subject) \
  )");
});

leaderBoardDB.serialize(() => {
  leaderBoardDB.run(`CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY,
    game_id varchar NOT NULL,
    player_id INTEGER NOT NULL,
    score INTEGER NOT NULL
    )`, (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Created table');
    });
    leaderBoardDB.run(`INSERT INTO LEADERBOARD(game_id, player_id, score) VALUES ('game1', 1, 1);`);
    leaderBoardDB.run(`INSERT INTO LEADERBOARD(game_id, player_id, score) VALUES ('game1', 2, 1);`);
    leaderBoardDB.run(`INSERT INTO LEADERBOARD(game_id, player_id, score) VALUES ('game1', 3, 2);`);
});

export {db, leaderBoardDB};
