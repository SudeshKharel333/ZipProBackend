const db = require('./dbConfig'); // Adjust the path based on where dbConfig.js is located



// Create Flash Sale
app.post('/featured_products', (req, res) => {
    const { product_name, description, price, image_url } = req.body;
    const query = 'INSERT INTO featured_products (product_name, description, price, image_url) VALUES (?, ?, ?, ?)';
    db.query(query, [product_name, description, price, image_url], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ id: result.insertId, title, description, price, image_url });
    });
});

// Get All Flash Sales
app.get('/featured_products', (req, res) => {
    db.query('SELECT * FROM featured_products', (err, results) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(results);
    });
});

// Update Flash Sale
app.put('/featured_products/:id', (req, res) => {
    const { id } = req.params;
    const { product_name, description, price, image_url } = req.body;
    const query = 'UPDATE featured_products SET product_name = ?, description = ?, price = ?, image_url = ? WHERE id = ?';
    db.query(query, [product_name, description, price, image_url, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(200).json({ id, title, description, price, image_url });
    });
});

// Delete Featured Products
app.delete('/featured_products/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM featured_products WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(204).send();
    });
});
