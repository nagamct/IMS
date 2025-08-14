module.exports = (sequelize, Sequelize) => {
  const Item = sequelize.define("item", {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    hsn_code: {
      type: Sequelize.STRING,
      allowNull: false
    },
    rate: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    }
  });
  return Item;
};