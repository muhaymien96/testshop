const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/products.json");

function getAll() {
  const data = fs.readFileSync(dataPath, "utf8");
  return JSON.parse(data);
}

function getById(id) {
  const products = getAll();
  return products.find((p) => p.id === parseInt(id));
}

function getCategories() {
  const products = getAll();
  return [...new Set(products.map((p) => p.category))];
}

module.exports = { getAll, getById, getCategories };
