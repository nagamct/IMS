const db = require("../models");
const Customer = db.customers;

exports.create = (req, res) => {
  const customer = {
    name: req.body.name,
    address: req.body.address,
    email: req.body.email,
    phone: req.body.phone,
    gstin: req.body.gstin
  };

  Customer.create(customer)
    .then(data => res.send(data))
    .catch(err => res.status(500).send({
      message: err.message || "Error creating customer"
    }));
};

exports.findAll = (req, res) => {
  Customer.findAll()
    .then(data => res.send(data))
    .catch(err => res.status(500).send({
      message: err.message || "Error retrieving customers"
    }));
};