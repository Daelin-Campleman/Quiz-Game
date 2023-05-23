IF NOT EXISTS(
	SELECT [name]
    FROM sys.tables
    WHERE [name] = 'users'
)
CREATE TABLE users (
    users_id INTEGER PRIMARY KEY,
    username VARCHAR(15) NOT NULL,
    name VARCHAR(MAX) NOT NULL
);