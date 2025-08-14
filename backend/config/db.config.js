module.exports = {
  HOST: "localhost",
  USER: "invoice_user",
  PASSWORD: "invoice",
  DB: "invoice_db",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};