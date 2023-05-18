import {leaderBoardDB} from "./db.js";

export function getGameLeaderboard(gameID) {
    let sqlGetGame = `SELECT player_id, score FROM leaderboard
        WHERE game_id = ?
        ORDER BY score DESC;`;
    return new Promise((resolve, reject) => {
        leaderBoardDB.all(sqlGetGame, gameID, (err, rows) => {
            if (err) {
                console.log('whoops, something went wrong. Better luck next time');
                reject(err)
            } else {
                resolve(rows);
            }
        });
    });   
}

export function saveGameLeaderBoard(players) {
    let sql = `INSERT INTO LEADERBOARD(game_id, player_id, score) VALUES ${players}`;
    return new Promise((resolve, reject) => {
        leaderBoardDB.run(sql, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    });
}

export function getTable() {
    let sqlGetGame = `SELECT * FROM leaderboard`;
    return new Promise((resolve, reject) => {
        leaderBoardDB.all(sqlGetGame, (err, rows) => {
            if (err) {
                console.log('whoops, something went wrong. Better luck next time');
                reject(err)
            } else {
                resolve(rows);
            }
        });
    });   
}