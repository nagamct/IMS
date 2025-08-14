module.exports = (sequelize, Sequelize) => {
  const InvoiceItem = sequelize.define("invoiceItem", {
    quantity: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: "Quantity must be at least 0.01"
        }
      }
    },
    rate: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: "Rate must be at least 0.01"
        }
      }
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: "Amount must be at least 0.01"
        }
      }
    }
  }, {
    hooks: {
      beforeValidate: (invoiceItem) => {
        // Auto-calculate amount if not provided
        if (invoiceItem.rate && invoiceItem.quantity && !invoiceItem.amount) {
          invoiceItem.amount = parseFloat(
            (invoiceItem.rate * invoiceItem.quantity).toFixed(2)
          );
        }
      },
      beforeCreate: (invoiceItem) => {
        // Final validation
        invoiceItem.amount = parseFloat(
          (invoiceItem.rate * invoiceItem.quantity).toFixed(2)
        );
      }
    },
    indexes: [
      {
        fields: ['invoiceId']
      },
      {
        fields: ['itemId']
      }
    ]
  });

  return InvoiceItem;
};