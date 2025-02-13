const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const Portfolio = require('./models/Portfolio');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const portfolio = new Portfolio();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/portfolio', (req, res) => {
    res.json({
        holdings: portfolio.getHoldings(),
        totalValue: portfolio.totalValue,
        lastUpdated: portfolio.lastUpdated
    });
});

app.post('/api/portfolio/add', (req, res) => {
    const { symbol, amount, purchasePrice } = req.body;

    if (!symbol || !amount || !purchasePrice) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    portfolio.addHolding(symbol, amount, purchasePrice);
    res.json({ message: 'Holding added successfully' });
});

app.delete('/api/portfolio/:symbol', (req, res) => {
    const { symbol } = req.params;
    portfolio.removeHolding(symbol);
    res.json({ message: 'Holding removed successfully' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});