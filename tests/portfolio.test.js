const Portfolio = require('../models/Portfolio');

describe('Portfolio', () => {
    let portfolio;

    beforeEach(() => {
        portfolio = new Portfolio();
    });

    test('should initialize with empty holdings', () => {
        expect(portfolio.getHoldings()).toEqual([]);
        expect(portfolio.totalValue).toBe(0);
    });

    test('should add holding correctly', () => {
        portfolio.addHolding('btc', 1, 50000);
        const holdings = portfolio.getHoldings();

        expect(holdings).toHaveLength(1);
        expect(holdings[0].symbol).toBe('btc');
        expect(holdings[0].amount).toBe(1);
        expect(holdings[0].purchasePrice).toBe(50000);
    });

    test('should remove holding correctly', () => {
        portfolio.addHolding('btc', 1, 50000);
        portfolio.addHolding('eth', 2, 3000);

        portfolio.removeHolding('btc');
        const holdings = portfolio.getHoldings();

        expect(holdings).toHaveLength(1);
        expect(holdings[0].symbol).toBe('eth');
    });

    test('should update price and calculate value', () => {
        portfolio.addHolding('btc', 1, 50000);
        portfolio.updatePrice('btc', 55000);

        const holdings = portfolio.getHoldings();
        expect(holdings[0].currentPrice).toBe(55000);
        expect(holdings[0].value).toBe(55000);
        expect(holdings[0].profitLoss).toBe(5000);
    });

    test('should calculate total portfolio value', () => {
        portfolio.addHolding('btc', 1, 50000);
        portfolio.addHolding('eth', 2, 3000);

        portfolio.updatePrice('btc', 55000);
        portfolio.updatePrice('eth', 3500);

        const totalValue = portfolio.calculateTotalValue();
        expect(totalValue).toBe(62000); // 55000 + (2 * 3500)
    });
});