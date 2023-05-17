# Messaging Format Between Client and Server

## Message Types
### Client
The client can send the following message types: `JOIN, CREATE, ANSWER, START`.
- `JOIN`
    - Join sends a request to the server to add the player to a specific game instance
    - Full JSON request:
        ```JSON
        {
            requestType: "JOIN",
            gameID:"<GAME CODE>",
        }
    - There is no response
        - This will likely change to respond with the game information to be displayed to the user.
        - The response will likely be of the following format:
            ```JSON
            {
                "success": bool
                "message": string (can be used to let FE know maxPlayers has been reached)
            }
        
- `CREATE`
    - Create creates a new game instance and returns a game ID
    - Full JSON request:
        ```JSON
        {
            requestType: "CREATE",
            limit: <number>,
            categories: <string>,
            difficulties: <string>
        }
    - Response:
        ```JSON
        {
            gameID: "<GAME CODE>"
        }
- `ANSWER`
    - 
- `START`
    - Starts the game
    - Full JSON request
        ```JSON
        {
            requestType: "START",
            gameID: "GAME CODE"
        }
### Server
- The server will send the following types of messages: TODO

