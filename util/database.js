const Sequelize = require("sequelize");
const sequelize = new Sequelize("test", "root", "farmerfarmer", {
    dialect: "mysql",
    host: "localhost",
    logging: false,
});
module.exports = sequelize;

// const mysql = require("mysql2");

// const pool = mysql.createPool({
//     host: "localhost",
//     user: "root",
//     database: "test",
//     password: "farmerfarmer",
// });

// module.exports = pool.promise();
