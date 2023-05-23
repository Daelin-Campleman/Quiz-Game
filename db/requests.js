import { Request } from "tedious";
import { execSQLRequest } from "./quizdb.js";

export function createGameRequest(joinCode, callback) {

    let sql = `
        INSERT INTO dbo.game (join_code)
        OUTPUT INSERTED.game_id
        VALUES ('${joinCode}');
    `;

    return execSQLRequest(sql);
}

export function getGameLeaderboardRequest(gameID) {

    // let sql = `
    //     SELECT u.username, g.score
    //     FROM dbo.users u
    //     INNER JOIN dbo.game_score g
    //     ON u.users_id = g.users_id
    //     WHERE g.game_id = ${gameID}
    // `;

    let sql = `
    SELECT users_id, score
    FROM dbo.game_score
    WHERE game_id = ${gameID}
    ORDER BY score DESC
    `

    // createRequest(buildRequest(sqlGetGame, callback));
    return  execSQLRequest(sql);
}

export async function saveGameLeaderBoardRequest(players, callback) {
    let sql = `INSERT INTO game_score(game_id, users_id, score) VALUES ${players}`;
    // createRequest(buildRequest(sql, callback));
    console.log(sql);
    return await execSQLRequest(sql);
    
}

export function getTableRequest() {
    let sql = `SELECT * FROM game_score`;
    // createRequest(buildRequest(sql));
    return execSQLRequest(sql);
}

function buildRequest(query, callback) {
    return new Request(query, callback);
}