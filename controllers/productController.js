const db = require('../config/dbConfig'); // Correct path to dbConfig.js

// Function to get product by ID
exports.getProductById = (req, res) => {
    const productId = req.params.id;

    const query = 'SELECT * FROM products WHERE product_id = ?';
    db.query(query, [productId], (error, results) => {
        if (error) {
            console.error('Error fetching product:', error);
            return res.status(500).json({ message: 'Database error', error });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(results[0]);
    });
};
