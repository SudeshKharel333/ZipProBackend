const express = require('express');
const multer = require('multer');
const path = require('path');
const argon2 = require('argon2');
const cors = require('cors');
const db = require('./config/dbConfig'); // Correct database configuration path
const productRoutes = require('./routes/productRoutes'); // Product routes

const app = express();
const port = 3000; // Set the port to 3000

// Enable CORS
app.use(cors());

// Set up storage for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Folder for uploaded images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Login API
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    //console.log(`${email} ${password}---------------------->Login `)

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    console.log(email + "   " + password);
    db.query(query, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const user = results[0];
        console.log(user['password']);
        try {
            const passwordMatch = user['password'] === password;
            if (passwordMatch) {
                res.status(200).json({ message: 'Login successful', user });
            } else {
                res.status(401).json({ message: 'Invalid email or password' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error verifying password' });
        }
    });
});

// Product routes
app.use('/api', productRoutes);

// Bulk deals, flash sales, and featured products routes
app.get('/featured-products', (req, res) => {
    const query = 'SELECT * FROM products WHERE featuredProductPrice IS NOT NULL';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving featured products:', err);
            return res.status(500).send('Error retrieving featured products');
        }
        res.json(results);
    });
});

// Register API
const fs = require('fs');

app.post('/register', upload.single('imageFile'), (req, res) => {
    const { email, password, fullName, phone } = req.body;
    const imageFile = req.file;

    // if (!imageFile) {
    //     return res.status(400).json({ message: 'No image file uploaded' });
    // }
    imageData = "";
    //const imageData = fs.readFileSync(imageFile.path);
    const query = 'INSERT INTO users (email, password, fullName, phone, imageFile) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [email, password, fullName, phone, imageData], (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({ message: 'Registration failed', error: err.message });
        }
        res.status(200).json({ message: 'User registered successfully' });
    });
});



// Products API
app.get('/products', (req, res) => {
    const query = 'SELECT * FROM products';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).send('Error fetching products');
        }
        res.json(results);
    });
});




app.get('/api/productsinfo', (req, res) => {
    const query = 'SELECT product_name, price, image FROM products'; // Adjust column names as necessary
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});




// Start the server
app.listen(port, () => {
    console.log(`NodeJs Project has started on port ${port}`);
});
