CREATE TABLE game_score (
    game_score_id INT IDENTITY(1,1) PRIMARY KEY,
	game_id BIGINT,
    users_id INT NOT NULL,
    score INT NOT NULL,
	FOREIGN KEY (game_id) REFERENCES dbo.game(game_id)
)