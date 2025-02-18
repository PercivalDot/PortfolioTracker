const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const Portfolio = require('./models/Portfolio');
const PriceService = require('./services/priceService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const portfolio = new Portfolio();
const priceService = new PriceService();

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

app.get('/api/price/:symbol', async (req, res) => {
    const { symbol } = req.params;
    try {
        const price = await priceService.getCurrentPrice(symbol);
        if (price !== null) {
            res.json({ symbol: symbol.toLowerCase(), price });
        } else {
            res.status(404).json({ error: 'Price not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch price' });
    }
});

app.post('/api/portfolio/update-prices', async (req, res) => {
    try {
        const holdings = portfolio.getHoldings();
        if (holdings.length === 0) {
            return res.json({ message: 'No holdings to update' });
        }

        const symbols = holdings.map(h => h.symbol);
        const prices = await priceService.getMultiplePrices(symbols);

        holdings.forEach(holding => {
            const currentPrice = prices[holding.symbol];
            if (currentPrice !== undefined) {
                portfolio.updatePrice(holding.symbol, currentPrice);
            }
        });

        portfolio.calculateTotalValue();

        res.json({
            message: 'Prices updated successfully',
            updatedCount: Object.keys(prices).length
        });
    } catch (error) {
        console.error('Error updating prices:', error);
        res.status(500).json({ error: 'Failed to update prices' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});