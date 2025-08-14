const db = require('../models');

exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.items || req.body.items.length === 0) {
      return res.status(400).json({ error: "At least one item is required" });
    }

    // Calculate amounts for items
    const itemsWithAmounts = req.body.items.map(item => ({
      ...item,
      amount: parseFloat((item.rate * item.quantity).toFixed(2))
    }));

    // Create transaction for atomic operations
    const result = await db.sequelize.transaction(async (t) => {
      const invoice = await db.invoices.create({
        invoice_number: req.body.invoice_number,
        date: req.body.date,
        customer_id: req.body.customer_id,
        subtotal: req.body.subtotal,
        discount: req.body.discount,
        cgst_percentage: req.body.cgst_percentage,
        sgst_percentage: req.body.sgst_percentage,
        total: req.body.total
      }, { transaction: t });

      await db.invoiceItems.bulkCreate(
        itemsWithAmounts.map(item => ({ ...item, invoiceId: invoice.id })),
        { transaction: t }
      );

      return invoice;
    });

    // Fetch complete invoice with relationships
    const fullInvoice = await db.invoices.findByPk(result.id, {
      include: [
        { model: db.customers },
        { model: db.invoiceItems, include: [db.items] }
      ]
    });

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice: fullInvoice
    });

  } catch (error) {
    console.error('Invoice creation error:', error);
    res.status(500).json({
      error: 'Failed to create invoice',
      details: error.errors?.map(e => e.message) || error.message
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const invoices = await db.invoices.findAll({
      include: [
        { model: db.customers },
        { 
          model: db.invoiceItems,
          include: [db.items]
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch invoices',
      details: error.message
    });
  }
};