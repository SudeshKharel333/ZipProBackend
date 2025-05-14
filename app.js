const express = require('express'); // Import Express for creating the web server
const multer = require('multer'); // Import Multer for file uploads
const path = require('path'); // Import Path for handling file and directory paths

//const argon2 = require('argon2'); // Import Argon2 for password hashing (not used here)
const cors = require('cors'); // Import CORS to allow cross-origin requests
const db = require('./config/dbConfig'); // Import database configuration file
const productRoutes = require('./routes/productRoutes'); // Import product-specific routes

const app = express(); // Create an Express application
const port = 3500; // Set the server's port to 4000

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
app.use('/images', express.static('C:/Users/sudes/Desktop/Project/ZipProBackend/images'));

// Middleware to parse incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Login API to authenticate users
app.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
  
    const query = 'SELECT user_id, password FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error' });
  
      if (results.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid email' });
      }
  
      const user = results[0];
  
      // Plain password check (not secure, use bcrypt in real apps)
      if (user.password !== password) {
        return res.status(401).json({ success: false, message: 'Incorrect password' });
      }
  
      return res.status(200).json({ success: true, userId: user.user_id });
    });
  });
  
  app.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const sql = 'SELECT user_id, email, fullName, phone FROM users WHERE user_id = ?';
  
    db.query(sql, [userId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
  
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    });
  });
  



// Route: POST /recent-products
app.post('/recent-products', (req, res) => {
  const ids = req.body.ids; // Example: ['3', '5', '10']
  
  if (!Array.isArray(ids)) return res.status(400).send('Invalid input');

  const placeholders = ids.map(() => '?').join(','); // '?,?,?'
  const query = `SELECT product_id, product_name, image, price FROM products WHERE product_id IN (${placeholders})`;

  db.query(query, ids, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Server error');
    }

    console.log(rows);
    res.json(rows);
  });
});







    
  app.delete('/api/deleteUser/:id', (req, res) => {
    const userId = req.params.id;
  
    // Delete from cart first to maintain referential integrity
    const deleteCartSql = 'DELETE FROM cart WHERE user_id = ?';
    db.query(deleteCartSql, [userId], (err, cartResults) => {
      if (err) {
        console.error('Error deleting from cart:', err);
        return res.status(500).json({ error: 'Database error during cart deletion' });
      }
  
      // Then delete from users
      const deleteUserSql = 'DELETE FROM users WHERE user_id = ?';
      db.query(deleteUserSql, [userId], (err, userResults) => {
        if (err) {
          console.error('Error deleting user:', err);
          return res.status(500).json({ error: 'Database error during user deletion' });
        }
  
        if (userResults.affectedRows > 0) {
          res.status(200).json({ message: 'User deleted successfully' });
        } else {
          res.status(404).json({ error: 'User not found' });
        }
      });
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
  const { email, password, fullName, phone } = req.body;
  const imageFile = req.file;

  if (!imageFile) {
      return res.status(400).json({ message: 'Image file is required' });
  }

  const query = 'INSERT INTO users (email, password, fullName, phone, imageFile) VALUES (?, ?, ?, ?, ?)';

  db.query(query, [email, password, fullName, phone, imageFile.buffer], (err, result) => {
      if (err) {
          return res.status(500).json({ message: 'Registration failed', error: err.message });
      }
      res.status(200).json({ message: 'User registered successfully' });
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
app.post('/api/updateProfile',upload.none(), (req, res) => {
    const { user_id, email, password, fullName, phone, imageFile } = req.body; // Get user data
    // Ensure the user_id is an integer (if necessary)

  console.log('Received user_id:', user_id);  // Debugging: Log the user_id
  console.log('Received email:', email);  // Debugging: Log the user_id

    // Base query for updating profile data without image
    let query = `UPDATE users SET email = ?, password = ?, fullName = ?, phone = ? WHERE user_id = ?`;
    let values = [email, password, fullName, phone, user_id];
  
    // If image is provided, modify the query to update the image as well
    if (imageFile) {
      const matches = imageFile.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      let imageBuffer = null;
      if (matches && matches.length === 3) {
        imageBuffer = Buffer.from(matches[2], 'base64');
      }
      // Modify the query to include imageFile
      query = `UPDATE users SET email = ?, password = ?, fullName = ?, phone = ?, imageFile = ? WHERE user_id = ?`;
      values = [email, password, fullName, phone, imageBuffer, user_id];
    }
  
    // Execute the query
    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({ message: 'Profile updated successfully' });
    });
}
)
  

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


app.post("/addToCart", (req, res) => {
    const { user_id, product_id, quantity, price, product_name, image, date } = req.body;
    
    const sql = "INSERT INTO cart (user_id,product_id,quantity,price, product_name,image, date) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [user_id,product_id,quantity,price, product_name,image, date], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error inserting data", error: err });
        }
        res.json({ message: "Data inserted successfully", result });
    });
});



// Start the server
app.listen(port, '0.0.0.0',() => {
    console.log(`NodeJs Project has started on port ${port}`); // Confirm server start
});
