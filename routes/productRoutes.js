const express = require('express'); 
const router = express.Router(); 
const db = require('../config/dbConfig'); // Import the database connection configuration

// Route to get product by product_id (Commented Out)
// router.get('/product/:product_id', (req, res) => { 
//     const productId = req.params.product_id; // Get product_id from the URL parameters
//
//     const query = 'SELECT * FROM products WHERE product_id = ?'; // SQL query to fetch product details by ID
//     db.query(query, [productId], (err, results) => { 
//         if (err) { 
//             return res.status(500).json({ error: 'Database error' }); // Respond with an error if the database query fails
//         }
//         if (results.length === 0) { 
//             return res.status(404).json({ error: 'Product not found' }); // Respond if the product is not found
//         }
//         res.status(200).json(results[0]); // Return the product details if found
//     });
// });

// Route to get all products
// router.get('/products', (req, res) => {
//     const query = 'SELECT * FROM products'; // SQL query to fetch all product details (specific columns only)

//     db.query(query, (err, results) => { 
//         if (err) { 
//             return res.status(500).json({ error: 'Database error' }); // Respond with an error if the database query fails
//         }
//         if (results.length === 0) { 
//             return res.status(404).json({ error: 'No products found' }); // Respond if no products are found in the database
//         }
//         res.status(200).json(results); // Return the list of products if found
//     });
// });

// Export the router so it can be used in other parts of the application
module.exports = router;
