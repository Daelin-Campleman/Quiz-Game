IF NOT EXISTS(
	SELECT [name]
    FROM sys.tables
    WHERE [name] = 'federated_credentials'
)
CREATE TABLE federated_credentials (
    federated_credentials_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    provider VARCHAR(255) UNIQUE NOT NULL,
    subject VARCHAR(255) UNIQUE NOT NULL
)