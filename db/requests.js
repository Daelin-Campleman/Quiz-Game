import { TYPES } from "tedious";
import { execSQLRequest } from "./quizdb.js";

export function createGameRequest(joinCode) {

    const sql = `
        INSERT INTO dbo.game (join_code)
        OUTPUT INSERTED.game_id
        VALUES (@joinCode);
    `;

    const params = [
        {
            name: "joinCode",
            type: TYPES.VarChar,
            value: joinCode
        }
    ];

    return execSQLRequest(sql, params);
}

export function getGameLeaderboardRequest(gameID) {

    let sql = `
    SELECT u.name, s.score
    FROM [user] u
    INNER JOIN game_score s
    ON u.user_id = s.user_id
    WHERE s.game_id = @gameID
    ORDER BY s.score DESC
    `

    const params = [
        {
            name: "gameID",
            type: TYPES.BigInt,
            value: gameID
        }
    ];

    return  execSQLRequest(sql, params);
}

export function saveGameLeaderBoardRequest(gameId, players) {

    // let values = "";

    // players.forEach(player => {
    //     values += `(${gameId}, ${player.id}, ${player.score}),`;
    // });

    // values = values.substring(0, values.length - 1);

    let params = [{
        name: "gameId",
        type: TYPES.BigInt,
        value: gameId
    }];

    let values = '';

    for (let i=0; i<players.length; i++) {

        values += `(@gameId, @user_id${i}, @score${i}),`

        params.push(
            {
                name: `user_id${i}`,
                type: TYPES.BigInt,
                value: players[i].id
            },
            {
                name: `score${i}`,
                type: TYPES.Int,
                value: players[i].score
            }
        );
    }

    values = values.substring(0, values.length - 1);

    let sql = `
        INSERT INTO game_score(
            game_id,
            user_id,
            score
        )
        VALUES ${values};
    `;

    console.log(sql);
    console.log(params);

    return execSQLRequest(sql, params);
}

export function selectFederatedCredentialsByIdRequest(provider, subject) {

    const sql = `
        SELECT [user_id]
        FROM [dbo].[federated_credentials]
        WHERE [provider] = @provider and [subject] = @subject;
    `;

    const params = [
        {
            name: "provider",
            type: TYPES.VarChar,
            value: provider
        },
        {
            name: "subject",
            type: TYPES.VarChar,
            value: subject
        }
    ];

    return execSQLRequest(sql, params);
}

export function insertUserRequest(name){
    const sql = `
        INSERT INTO [dbo].[user] (
            [username],
            [name]
        ) 
        OUTPUT inserted.[user_id]
        VALUES (
            'N/A',
            @name
        );
    `;

    const params = [
        {
            name: "name",
            type: TYPES.VarChar,
            value: name
        }
    ];

    return execSQLRequest(sql, params);
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
            @userId,
            @provider,
            @subject
        );
    `;

    const params = [
        {
            name: "userId",
            type: TYPES.BigInt,
            value: userId
        },
        {
            name: "provider",
            type: TYPES.VarChar,
            value: provider
        },
        {
            name: "subject",
            type: TYPES.VarChar,
            value: subject
        }
    ];

    return execSQLRequest(sql, params);
}