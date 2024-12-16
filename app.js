const express = require('express'); // Import Express for creating the web server
const multer = require('multer'); // Import Multer for file uploads
const path = require('path'); // Import Path for handling file and directory paths
//const argon2 = require('argon2'); // Import Argon2 for password hashing (not used here)
const cors = require('cors'); // Import CORS to allow cross-origin requests
const db = require('./config/dbConfig'); // Import database configuration file
const productRoutes = require('./routes/productRoutes'); // Import product-specific routes

const app = express(); // Create an Express application
const port = 4000; // Set the server's port to 4000

// Enable Cross-Origin Resource Sharing (CORS) to allow requests from other origins
app.use(cors());

// Configure Multer to handle file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Save uploaded files to the 'uploads/' directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Use a unique filename with timestamp
    }
});

const upload = multer({ storage: storage }); // Set up the Multer instance

// Serve static files from the 'images' directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// Middleware to parse incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Login API to authenticate users
app.post('/login', async (req, res) => {
    const { email, password } = req.body; // Get email and password from the request
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' }); // Check for missing data
    }

    const query = 'SELECT * FROM users WHERE email = ?'; // SQL query to find user by email
    db.query(query, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' }); // Handle database errors
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' }); // Handle invalid credentials
        }

        const user = results[0]; // Get the user data
        try {
            const passwordMatch = user['password'] === password; // Check if the password matches
            if (passwordMatch) {
                res.status(200).json({ message: 'Login successful', user }); // Login successful
            } else {
                res.status(401).json({ message: 'Invalid email or password' }); // Wrong password
            }
        } catch (error) {
            res.status(500).json({ error: 'Error verifying password' }); // Handle hashing errors
        }
    });
});

// Search API to find products based on a query
app.get('/api/products/search', (req, res) => {
    // Extract the search term from the query parameters, default to an empty string if not provided
    const searchTerm = req.query.query || '';

    // Add wildcards to the search term for partial matching in SQL
    const searchQuery = `%${searchTerm}%`;

    // SQL query to find products where the name or description matches the search term (case-insensitive)
    const sql = 'SELECT * FROM products WHERE LOWER(product_name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?)';

    // Execute the SQL query with the search query as parameters for name and description
    db.query(sql, [searchQuery, searchQuery], (err, results) => {
        if (err) {
            console.error('Error executing database query:', err); // Log the error for debugging
            return res.status(500).json({ message: 'Failed to retrieve products from the database' }); // Send a detailed error response
        }

        // Respond with the matching products in JSON format
        res.status(200).json(results);
        console.log(results);
    });
});


// Register API to create a new user
app.post('/register', upload.single('imageFile'), (req, res) => {
    const { email, password, fullName, phone } = req.body; // Get user details from the request
    const imageFile = req.file; // Get the uploaded file

    const query = 'INSERT INTO users (email, password, fullName, phone, imageFile) VALUES (?, ?, ?, ?, ?)'; // SQL query to add a user
    db.query(query, [email, password, fullName, phone, ''], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Registration failed', error: err.message }); // Handle errors
        }
        res.status(200).json({ message: 'User registered successfully' }); // Success
    });
});

// Fetch all categories from the database
app.get('/api/categories', (req, res) => {
    const query = 'SELECT category_id, category_name FROM categories'; // SQL query for categories
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch categories' }); // Handle errors
        }
        res.json(results); // Send the categories
    });
});

//Fetch all products from the database
app.get('/api/products', (req, res) => {
    const query = 'SELECT product_id, product_name, price, image FROM products'; // SQL query for products
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch products' }); // Handle errors
        }
        res.json(results); // Send the products
    });
});

// Fetch a single product by its ID
app.get('/product/:id', (req, res) => {
    const productId = req.params.id; // Get the product ID from the URL
    const sql = 'SELECT product_id, product_name, price, image, description FROM products WHERE product_id = ?'; // SQL query for a specific product
    db.query(sql, [productId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' }); // Handle errors
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Product not found' }); // Handle missing product
        }
        res.status(200).json(result[0]); // Return the product
    });
});

// Update user profile
app.post('/api/updateProfile', (req, res) => {
    const { id, email, password, fullName, phone } = req.body; // Get user data
    const query = `
        UPDATE users 
        SET email = ?, password = ?, fullName = ?, phone = ? 
        WHERE id = ?`; // SQL query to update user
    db.query(query, [email, password, fullName, phone, id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' }); // Handle errors
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' }); // Handle missing user
        }
        res.status(200).json({ message: 'Profile updated successfully' }); // Success
    });
});

// Search products by name
app.get('/search', (req, res) => {
    const query = req.query.query; // Get the search query
    const sqlQuery = 'SELECT * FROM products WHERE product_name LIKE ?'; // SQL for product search
    db.query(sqlQuery, [`%${query}%`], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' }); // Handle errors
        }
        res.json(results); // Return matching products
    });
});

// Start the server
app.listen(port, () => {
    console.log(`NodeJs Project has started on port ${port}`); // Confirm server start
});
