const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 4000;
const db = require('./config/dbConfig');

// Set up storage for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Folder to store uploaded images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
    }
});

// Multer configuration to handle image uploads
const upload = multer({ storage: storage });

// Middleware to parse incoming requests
app.use(express.json());

// Create a connection to the MySQL database
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '', // Replace with your MySQL password
//     database: 'zippro'         // Ensure your database name is correct
// });

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
    // console.log('Request body:', req.body);
    // console.log('Uploaded file:', req.file);

});


// Login API
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

    db.query(query, [email, password], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
        } else if (results.length > 0) {
            res.status(200).json({ message: 'Login successful', user: results[0] });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });
});

//argon2 for hashing
const argon2 = require('argon2');

async function hashPassword(password) {
    try {
        const hash = await argon2.hash(password);
        return hash;
    } catch (err) {
        console.error(err);
    }
}

async function verifyPassword(hash, password) {
    try {
        if (await argon2.verify(hash, password)) {
            console.log("Password match");
        } else {
            console.log("Password does not match");
        }
    } catch (err) {
        console.error(err);
    }
}






// Register API to insert data into 'users' table
app.post('/register', upload.single('imageFile'), async (req, res) => {
    console.log("I am in Register........");
    const { email, password, fullName, phone } = req.body;
    const imageFile = req.file;
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);

    if (!imageFile) {
        return res.status(400).json({ message: 'No image file uploaded' });
    }

    // SQL query to insert data into 'users' table without bcrypt
    const query = 'INSERT INTO users (email, name, PhoneNumber) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [email, fullName, phone], (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({ message: 'Registration failed' });
        }
        res.status(200).json({ message: 'User registered successfully' });
    });
});

// Start the server on port 3000
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
