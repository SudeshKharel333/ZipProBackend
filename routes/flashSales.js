const db = require('./dbConfig'); // Adjust the path based on where dbConfig.js is located


// Create Flash Sale
app.post('/flash_sales', (req, res) => {
    const { product_name, description, price, image_url } = req.body;
    const query = 'INSERT INTO flash_sales (product_name, description, price, image_url) VALUES (?, ?, ?, ?)';
    db.query(query, [product_name, description, price, image_url], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ id: result.insertId, title, description, price, image_url });
    });
});

// Get All Flash Sales
app.get('/flash_sales', (req, res) => {
    db.query('SELECT * FROM flash_sales', (err, results) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(results);
    });
});

// Update Flash Sale
app.put('/flash_sales/:id', (req, res) => {
    const { id } = req.params;
    const { product_name, description, price, image_url } = req.body;
    const query = 'UPDATE flash_sales SET product_name = ?, description = ?, price = ?, image_url = ? WHERE id = ?';
    db.query(query, [product_name, description, price, image_url, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(200).json({ id, title, description, price, image_url });
    });
});

// Delete Flash Sale
app.delete('/flash_sales/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM flash_sales WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(204).send();
    });
});
