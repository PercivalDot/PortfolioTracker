class Portfolio {
    constructor() {
        this.holdings = [];
        this.totalValue = 0;
        this.lastUpdated = null;
    }

    addHolding(symbol, amount, purchasePrice) {
        const holding = {
            symbol: symbol.toLowerCase(),
            amount: parseFloat(amount),
            purchasePrice: parseFloat(purchasePrice),
            currentPrice: 0,
            value: 0,
            profitLoss: 0
        };
        this.holdings.push(holding);
    }

    removeHolding(symbol) {
        this.holdings = this.holdings.filter(h => h.symbol !== symbol.toLowerCase());
    }

    updatePrice(symbol, currentPrice) {
        const holding = this.holdings.find(h => h.symbol === symbol.toLowerCase());
        if (holding) {
            holding.currentPrice = parseFloat(currentPrice);
            holding.value = holding.amount * holding.currentPrice;
            holding.profitLoss = holding.value - (holding.amount * holding.purchasePrice);
        }
    }

    calculateTotalValue() {
        this.totalValue = this.holdings.reduce((sum, holding) => sum + holding.value, 0);
        this.lastUpdated = new Date();
        return this.totalValue;
    }

    getHoldings() {
        return this.holdings;
    }
}

module.exports = Portfolio;