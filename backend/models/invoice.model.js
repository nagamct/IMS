module.exports = (sequelize, Sequelize) => {
  const Invoice = sequelize.define("invoice", {
    invoice_number: {
      type: Sequelize.STRING,
      allowNull: false
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    po_number: {
      type: Sequelize.STRING
    },
    po_date: {
      type: Sequelize.DATEONLY
    },
    transport: {
      type: Sequelize.STRING
    },
    vehicle_no: {
      type: Sequelize.STRING
    },
    subtotal: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    discount: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    },
    cgst_percentage: {
      type: Sequelize.DECIMAL(5, 2)
    },
    sgst_percentage: {
      type: Sequelize.DECIMAL(5, 2)
    },
    cgst_amount: {
      type: Sequelize.DECIMAL(10, 2)
    },
    sgst_amount: {
      type: Sequelize.DECIMAL(10, 2)
    },
    total: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    }
  });
  return Invoice;
};