class PortfolioChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.data = [];
        this.colors = [
            '#667eea', '#764ba2', '#f093fb', '#f5576c',
            '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
            '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
        ];
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = 300;
    }

    drawPieChart(holdings) {
        if (!holdings || holdings.length === 0) {
            this.drawEmptyState();
            return;
        }

        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);

        if (totalValue <= 0) {
            this.drawEmptyState();
            return;
        }

        let currentAngle = -Math.PI / 2;

        holdings.forEach((holding, index) => {
            const percentage = holding.value / totalValue;
            const sliceAngle = percentage * 2 * Math.PI;
            const color = this.colors[index % this.colors.length];

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fillStyle = color;
            ctx.fill();

            if (percentage > 0.05) { // Only show label if slice is > 5%
                const labelAngle = currentAngle + sliceAngle / 2;
                const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
                const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(holding.symbol.toUpperCase(), labelX, labelY);
                ctx.fillText(`${(percentage * 100).toFixed(1)}%`, labelX, labelY + 15);
            }

            currentAngle += sliceAngle;
        });

        this.drawLegend(holdings);
    }

    drawLegend(holdings) {
        const ctx = this.ctx;
        const legendX = 20;
        let legendY = 20;

        ctx.font = '12px Arial';
        ctx.textAlign = 'left';

        holdings.forEach((holding, index) => {
            const color = this.colors[index % this.colors.length];

            ctx.fillStyle = color;
            ctx.fillRect(legendX, legendY, 15, 15);

            ctx.fillStyle = '#333';
            ctx.fillText(
                `${holding.symbol.toUpperCase()}: $${holding.value.toFixed(2)}`,
                legendX + 20,
                legendY + 12
            );

            legendY += 20;
        });
    }

    drawEmptyState() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = '#a0aec0';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            'Add some holdings to see the portfolio chart',
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    }
}