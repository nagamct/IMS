// backend/controllers/item.controller.js
const db = require("../models");
const Item = db.items;

exports.create = (req, res) => {
  const item = {
    name: req.body.name,
    description: req.body.description,
    hsn_code: req.body.hsn_code,
    rate: req.body.rate
  };

  Item.create(item)
    .then(data => res.send(data))
    .catch(err => res.status(500).send({
      message: err.message || "Error creating item"
    }));
};

exports.findAll = (req, res) => {
  Item.findAll()
    .then(data => res.send(data))
    .catch(err => res.status(500).send({
      message: err.message || "Error retrieving items"
    }));
};