module.exports = (sequelize, Sequelize) => {
  const Customer = sequelize.define("customer", {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address: {
      type: Sequelize.TEXT
    },
    email: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    gstin: {
      type: Sequelize.STRING
    }
  });
  return Customer;
};