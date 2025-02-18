const axios = require('axios');

class PriceService {
    constructor() {
        this.baseURL = 'https://api.coingecko.com/api/v3';
        this.cache = new Map();
        this.cacheTime = 60000; // 1 minute cache
    }

    async getCurrentPrice(symbol) {
        const cacheKey = symbol.toLowerCase();
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.cacheTime) {
            return cached.price;
        }

        try {
            const symbolMap = {
                'btc': 'bitcoin',
                'eth': 'ethereum',
                'ada': 'cardano',
                'dot': 'polkadot',
                'link': 'chainlink',
                'ltc': 'litecoin',
                'xrp': 'ripple',
                'bnb': 'binancecoin',
                'sol': 'solana',
                'matic': 'polygon'
            };

            const coinId = symbolMap[symbol.toLowerCase()] || symbol.toLowerCase();

            const response = await axios.get(
                `${this.baseURL}/simple/price?ids=${coinId}&vs_currencies=usd`,
                { timeout: 5000 }
            );

            const price = response.data[coinId]?.usd;

            if (price !== undefined) {
                this.cache.set(cacheKey, {
                    price,
                    timestamp: Date.now()
                });
                return price;
            }

            return null;
        } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error.message);
            return null;
        }
    }

    async getMultiplePrices(symbols) {
        const promises = symbols.map(symbol => this.getCurrentPrice(symbol));
        const results = await Promise.allSettled(promises);

        const prices = {};
        symbols.forEach((symbol, index) => {
            const result = results[index];
            if (result.status === 'fulfilled' && result.value !== null) {
                prices[symbol.toLowerCase()] = result.value;
            }
        });

        return prices;
    }

    clearCache() {
        this.cache.clear();
    }
}

module.exports = PriceService;