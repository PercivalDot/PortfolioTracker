class PortfolioApp {
    constructor() {
        this.portfolioData = {
            holdings: [],
            totalValue: 0
        };
        this.priceUpdateInterval = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadPortfolio();
        this.startPriceUpdates();
    }

    bindEvents() {
        const form = document.getElementById('addHoldingForm');
        form.addEventListener('submit', (e) => this.addHolding(e));

        const updateBtn = document.getElementById('updatePrices');
        updateBtn.addEventListener('click', () => this.updatePrices());
    }

    async addHolding(e) {
        e.preventDefault();

        const symbol = document.getElementById('symbol').value.trim().toUpperCase();
        const amount = parseFloat(document.getElementById('amount').value);
        const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);

        if (!symbol || !amount || !purchasePrice) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch('/api/portfolio/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    symbol,
                    amount,
                    purchasePrice
                }),
            });

            if (response.ok) {
                document.getElementById('addHoldingForm').reset();
                this.loadPortfolio();
            } else {
                alert('Error adding holding');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding holding');
        }
    }

    async loadPortfolio() {
        try {
            const response = await fetch('/api/portfolio');
            this.portfolioData = await response.json();
            this.updateUI();
        } catch (error) {
            console.error('Error loading portfolio:', error);
        }
    }

    updateUI() {
        this.updateTotalValue();
        this.updateHoldingsList();
        this.updateLastUpdate();
    }

    updateTotalValue() {
        const totalValueElement = document.getElementById('totalValue');
        totalValueElement.textContent = `$${this.portfolioData.totalValue.toFixed(2)}`;
    }

    updateHoldingsList() {
        const holdingsList = document.getElementById('holdingsList');

        if (this.portfolioData.holdings.length === 0) {
            holdingsList.innerHTML = '<p class="empty-state">No holdings yet. Add your first cryptocurrency above!</p>';
            return;
        }

        holdingsList.innerHTML = this.portfolioData.holdings.map(holding => {
            const profitLoss = holding.profitLoss || 0;
            const profitLossClass = profitLoss >= 0 ? 'positive' : 'negative';
            const profitLossSign = profitLoss >= 0 ? '+' : '';

            return `
                <div class="holding-item">
                    <div class="holding-info">
                        <div class="holding-symbol">${holding.symbol.toUpperCase()}</div>
                        <div class="holding-amount">${holding.amount} @ $${holding.purchasePrice.toFixed(2)}</div>
                    </div>
                    <div class="holding-value">
                        <div class="current-value">$${holding.value.toFixed(2)}</div>
                        <div class="profit-loss ${profitLossClass}">
                            ${profitLossSign}$${Math.abs(profitLoss).toFixed(2)}
                        </div>
                        <div class="current-price">@ $${holding.currentPrice.toFixed(2)}</div>
                    </div>
                    <button class="remove-btn" onclick="app.removeHolding('${holding.symbol}')">Remove</button>
                </div>
            `;
        }).join('');
    }

    async removeHolding(symbol) {
        if (!confirm(`Remove ${symbol.toUpperCase()} from portfolio?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/portfolio/${symbol}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                this.loadPortfolio();
            } else {
                alert('Error removing holding');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error removing holding');
        }
    }

    updateLastUpdate() {
        const lastUpdateElement = document.getElementById('lastUpdate');
        if (this.portfolioData.lastUpdated) {
            const date = new Date(this.portfolioData.lastUpdated);
            lastUpdateElement.textContent = `Last updated: ${date.toLocaleTimeString()}`;
        } else {
            lastUpdateElement.textContent = '';
        }
    }
}

    startPriceUpdates() {
        this.updatePrices();
        this.priceUpdateInterval = setInterval(() => {
            this.updatePrices();
        }, 30000); // Update every 30 seconds
    }

    async updatePrices() {
        if (this.portfolioData.holdings.length === 0) {
            return;
        }

        try {
            const response = await fetch('/api/portfolio/update-prices', {
                method: 'POST',
            });

            if (response.ok) {
                this.loadPortfolio();
            }
        } catch (error) {
            console.error('Error updating prices:', error);
        }
    }

    stopPriceUpdates() {
        if (this.priceUpdateInterval) {
            clearInterval(this.priceUpdateInterval);
            this.priceUpdateInterval = null;
        }
    }
}

const app = new PortfolioApp();