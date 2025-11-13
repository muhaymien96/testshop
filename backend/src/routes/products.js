const express = require("express");
const router = express.Router();
const { getAll, getById, getCategories } = require("../models/Product");

// GET /api/products
router.get("/", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const { category, search, minPrice, maxPrice, sortBy } = req.query;
  let products = await getAll();

  // Transform for frontend compatibility (name -> title)
  products = products.map((p) => ({
    ...p,
    title: p.name,
  }));

  let filtered = [...products];

  if (category) filtered = filtered.filter((p) => p.category === category);
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }
  if (minPrice) filtered = filtered.filter((p) => p.price >= parseFloat(minPrice));
  if (maxPrice) filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice));

  if (sortBy === "price_asc") filtered.sort((a, b) => a.price - b.price);
  if (sortBy === "price_desc") filtered.sort((a, b) => b.price - a.price);

  res.json({
    success: true,
    data: filtered,
    count: filtered.length,
  });
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const product = await getById(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      error: "Product not found",
      code: 404,
    });
  }

  res.json({
    success: true,
    data: { ...product, title: product.name },
  });
});

// GET /api/products/meta/categories
router.get("/meta/categories", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const cats = await getCategories();
  res.json({
    success: true,
    data: cats,
  });
});

module.exports = router;
