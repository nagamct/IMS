const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.customers = require("./customer.model.js")(sequelize, Sequelize);
db.items = require("./item.model.js")(sequelize, Sequelize);
db.invoices = require("./invoice.model.js")(sequelize, Sequelize);
db.invoiceItems = require("./invoiceItem.model.js")(sequelize, Sequelize);

// Define relationships
db.customers.hasMany(db.invoices);
db.invoices.belongsTo(db.customers);

db.items.hasMany(db.invoiceItems);
db.invoiceItems.belongsTo(db.items);

db.invoices.hasMany(db.invoiceItems);
db.invoiceItems.belongsTo(db.invoices);

module.exports = db;