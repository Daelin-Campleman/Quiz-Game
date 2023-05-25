import { Connection, Request } from "tedious";
import { config } from "dotenv";

config();

const dbConfig = JSON.parse(process.env.DATABASE_CONFIG);

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

export const execSQLRequest = (sql, params) =>  
  new Promise((resolve, reject) => {
    const connection = new Connection(dbConfig);

    let result = [];
    console.log(sql);

    const request = new Request(sql, (err, rowCount) => {
      if (err) {
        console.log(err);
      } else {
        resolve(result);
      }
      connection.close();
    });

    params?.forEach(p => {
      request.addParameter(p.name, p.type, p.value);
    });;

    request.on('row', columns => {

      let record = new Map();

      columns.forEach(column => {
        record.set(column.metadata.colName, column.value);
    });

    if (record.size > 0) result.push(record);

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
  