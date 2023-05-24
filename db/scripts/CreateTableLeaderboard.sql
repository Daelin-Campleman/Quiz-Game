CREATE TABLE [dbo].[game_score] (
    [game_score_id] BIGINT IDENTITY(1,1) PRIMARY KEY,
	[game_id] BIGINT,
    [user_id] BIGINT NOT NULL,
    [score] INT NOT NULL,
	FOREIGN KEY ([game_id]) REFERENCES [dbo].[game] ([game_id])
)