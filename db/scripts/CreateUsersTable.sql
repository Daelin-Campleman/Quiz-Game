CREATE TABLE [dbo].[user] (
    [user_id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [username] VARCHAR(15) NOT NULL,
    [name] VARCHAR(255) NOT NULL
);