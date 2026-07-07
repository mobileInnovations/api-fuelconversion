const mysql = require("mysql2");

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT } = process.env;

const databaseConfig = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: Number(DB_PORT),
};

const pool = mysql.createPool({
  ...databaseConfig,

  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 100,

  connectTimeout: 10000,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  timezone: "+07:00",
});

const connection = mysql.createConnection(databaseConfig);

const connectMySQL = () => {
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        console.log("DB_HOST", DB_HOST ? `${DB_HOST} ✅` : "not set ❌");
        console.log("DB_USER", DB_USER ? `${DB_USER} ✅` : "not set ❌");
        console.log("DB_PASSWORD", DB_PASSWORD ? "set ✅" : "not set ❌");
        console.log(
          "DB_DATABASE",
          DB_DATABASE ? `${DB_DATABASE} ✅` : "not set ❌",
        );
        console.log("DB_PORT", DB_PORT ? `${DB_PORT} ✅` : "not set ❌");

        return reject(err);
      }

      console.log("✅ MySQL Connected");
      resolve();
    });
  });
};

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) {
        return reject(err);
      }

      resolve(results);
    });
  });
};

module.exports = {
  connection,
  pool,
  query,
  connectMySQL,
};
