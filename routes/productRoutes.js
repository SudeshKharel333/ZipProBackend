const express = require('express');
const router = express.Router();
const db = require('../config/dbConfig'); // Import your database connection

// Get product by product_id
router.get('/product/:product_id', (req, res) => {
    const productId = req.params.product_id;

    const query = 'SELECT * FROM products WHERE product_id = ?'; // Adjust table and column names as needed
    db.query(query, [productId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(results[0]);
    });
});


router.get('/products', (req, res) => {
    const query = 'SELECT product_name, price, image FROM products'; // Selecting all products

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No products found' });
        }
        res.status(200).json(results);
    });
});



module.exports = router;
