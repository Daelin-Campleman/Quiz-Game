import { Connection, Request } from "tedious";
import { config } from "dotenv";

config();

const dbConfig = JSON.parse(process.env.DATABASE_CONFIG);

let connection = new Connection(dbConfig);

function checkConnection() {
  if (connection.state.name == 'Final') {
    connection = new Connection(dbConfig);
  }
}

export function createRequestT(sql) {
  const request = new Request(sql, (err, rowCount) => {
    if (err) {
      console.log(err);
    } else {
      if (result == "" || result == null || result == "null") result = "[]";
      resolve(result);
    }
    connection.close();
  });

  connection.on("connect", (err) => {
    console.log("Connected to the database");
    connection.execSql(request);
    connection.close();
  });

  connection.on("error", (err) => {
    console.error("Database connection error:", err);
  });

  connection.connect();
}

export const execSQLRequest = (sql) =>  
  new Promise((resolve, reject) => {
    checkConnection();

    let result = [];

    const request = new Request(sql, (err, rowCount) => {
      if (err) {
        console.log(err);
      } else {
        //console.log("rowCount:",rowCount);
        //if (result == "" || result == null || result == "null") result = "[]";
        //console.log("result:",result);
        resolve(result);
      }
      connection.close();
    });

    request.on('row', columns => {

      let record = new Map();

      columns.forEach(column => {
        record.set(column.metadata.colName, column.value);
    });

    result.push(record);

  });
  
    connection.on("connect", (err) => {
      if (err) {
        reject(err);
      } else {
        connection.execSql(request);
      }
    });

    connection.connect();
  });
  