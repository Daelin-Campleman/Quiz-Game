import { Request } from "tedious";
import { execSQLRequest } from "./quizdb.js";

export async function createGameRequest(joinCode, callback) {

    let sql = `
        INSERT INTO dbo.game (join_code)
        VALUES ('${joinCode}');
    `;

    return await execSQLRequest(sql);
}

export function getGameLeaderboardRequest(gameID, callback) {

    let sqlGetGame = `
        SELECT u.username, g.score
        FROM dbo.users u
        INNER JOIN dbo.game_score g
        ON u.users_id = g.users_id
        WHERE g.game_id = ${gameID}
    `;

    createRequest(buildRequest(sqlGetGame, callback));
}

export function saveGameLeaderBoardRequest(players, callback) {
    let sql = `INSERT INTO LEADERBOARD(game_id, player_id, score) VALUES ${players}`;
    
}

export function getTableRequest() {
    let sqlGetGame = `SELECT * FROM leaderboard`;
}

function buildRequest(query, callback) {
    return new Request(query, callback);
}