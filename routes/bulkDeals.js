const db = require('./dbConfig'); // Adjust the path based on where dbConfig.js is located



// Create Flash Sale
app.post('/bulk_deals', (req, res) => {
    const { product_name, bulk_price, minimum_order_quantity, image_url } = req.body;
    const query = 'INSERT INTO bulk_deals (product_name, bulk_price,minimum_order_quantity, image_url) VALUES (?, ?, ?, ?)';
    db.query(query, [product_name, bulk_price, minimum_order_quantity, image_url], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ id: result.insertId, title, description, price, image_url });
    });
});

// Get All Flash Sales
app.get('/bulk_deals', (req, res) => {
    db.query('SELECT * FROM bulk_deals', (err, results) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(results);
    });
});

// Update Flash Sale
app.put('/bulk_deals/:id', (req, res) => {
    const { id } = req.params;
    const { product_name, description, price, image_url } = req.body;
    const query = 'UPDATE bulk_deals SET product_name = ?, bulk_price = ?, image_url = ?,minimum_order_quantity=?  WHERE id = ?';
    db.query(query, [product_name, description, price, image_url, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(200).json({ id, title, description, price, image_url });
    });
});

// Delete Featured Products
app.delete('/bulk_deals/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM bulk_deals WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(204).send();
    });
});
