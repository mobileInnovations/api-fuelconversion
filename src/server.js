require("dotenv").config();

const app = require("./app");

const { PORT, DB_DATABASE } = process.env;

const mysqlConfig = require("./config/mysqlConfig");

let dbStatus = "disconnected";
// connect main DB
async function startServer() {
  try {
    await mysqlConfig.connectMySQL();
    dbStatus = `Connected to MySQL (${DB_DATABASE}) ✅`;

    app.listen(PORT, () => {
      console.log(`Server running on port localhost:${PORT} 🚀`);
    });
  } catch (error) {
    console.error("Error connecting to MySQL:", error);
    dbStatus = `Error connecting to MySQL (${DB_DATABASE}) ❌`;
  }

  console.log(dbStatus);
}

startServer();
