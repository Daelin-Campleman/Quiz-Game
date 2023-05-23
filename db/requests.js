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

    let sql = `
    SELECT users_id, score
    FROM dbo.game_score
    WHERE game_id = ${gameID}
    ORDER BY score DESC
    `

    return  execSQLRequest(sql);
}

export function saveGameLeaderBoardRequest(gameId, players) {

    let values = "";

    players.forEach(player => {
        values += `(${gameId}, ${player.id}, ${player.score}),`;
    });

    value = value.substring(0, value.length - 1);

    let sql = `
        INSERT INTO game_score(
            game_id,
            users_id,
            score
        )
        VALUES (
            ${values}
        );
    `;

    return execSQLRequest(sql);
}

export function getTableRequest() {
    let sql = `SELECT * FROM game_score`;

    return execSQLRequest(sql);
}

function buildRequest(query, callback) {
    return new Request(query, callback);
}

export function selectFederatedCredentialsByIdRequest(provider, subject) {
    const sql = `
        SELECT [user_id]
        FROM [dbo].[federated_credentials]
        WHERE [provider] = '${provider}' and [subject] = '${subject}';
    `;

    return execSQLRequest(sql);
}

export function insertUserRequest(name){
    const sql = `
        INSERT INTO [dbo].[Users] (
            [username],
            [name]
        ) 
        OUTPUT inserted.[users_id]
        VALUES (
            'N/A',
            '${name}'
        );
    `;

    return execSQLRequest(sql);
}

export function insertFederatedCredentialsRequest(userId, provider, subject){
    const sql = `
        INSERT INTO [dbo].[federated_credentials] (
            [user_id],
            [provider],
            [subject]
        )
        OUTPUT inserted.[federated_credentials_id]
        VALUES (
            '${userId}',
            '${provider}',
            '${subject}'
        );
    `;

    return execSQLRequest(sql);
}
export function getUserById(userId){
    const sql = `
        SELECT
        [users_id],
        [username],
        [name]
        FROM [dbo].[Users];
    `;

    return execSQLRequest(sql);
}