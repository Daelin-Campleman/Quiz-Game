CREATE TABLE [dbo].[game] (
    [game_id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [join_code] CHAR(5) NOT NULL,
    [date_created] DATETIME DEFAULT GETDATE() NOT NULL
)