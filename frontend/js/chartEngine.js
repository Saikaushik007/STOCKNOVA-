const chartEngine = {
    priceChart: null,
    donutChart: null,
    sparklines: [],

    init() {
        Chart.defaults.color = '#9ca3af';
        Chart.defaults.font.family = 'Inter, sans-serif';
    },

    renderPriceChart(chartData) {
        const ctx = document.getElementById('price-chart').getContext('2d');
        if (this.priceChart) this.priceChart.destroy();

        const labels = chartData.dates;
        const actualData = chartData.actual_prices;
        const predData = chartData.test_predictions;

        // Gradients
        const actualGrad = ctx.createLinearGradient(0, 0, 0, 400);
        actualGrad.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        actualGrad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

        const predGrad = ctx.createLinearGradient(0, 0, 0, 400);
        predGrad.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
        predGrad.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

        this.priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Actual Price',
                        data: actualData,
                        borderColor: '#10b981',
                        backgroundColor: actualGrad,
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0,
                        pointHitRadius: 10
                    },
                    {
                        label: 'Forecast',
                        data: predData,
                        borderColor: '#3b82f6',
                        backgroundColor: predGrad,
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0,
                        pointHitRadius: 10
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#111827',
                        titleColor: '#9ca3af',
                        bodyColor: '#f3f4f6',
                        borderColor: '#1f2937',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                        ticks: { maxTicksLimit: 8 }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                        position: 'right'
                    }
                }
            }
        });
    },

    renderDonutChart(modelMetrics) {
        const ctx = document.getElementById('donut-chart').getContext('2d');
        if (this.donutChart) this.donutChart.destroy();

        // Convert R2 scores to a distribution showing relative confidence
        const labels = Object.keys(modelMetrics).map(m => m.toUpperCase());
        const data = Object.values(modelMetrics).map(m => Math.max(0, m.r2)); // Ensure no negative weights
        const colors = ['#3b82f6', '#8b5cf6', '#10b981'];

        this.donutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#9ca3af', usePointStyle: true, padding: 20 }
                    }
                }
            }
        });
    },

    renderSparklines(actualPrices) {
        // Clear old sparklines
        this.sparklines.forEach(chart => chart.destroy());
        this.sparklines = [];

        // Generate simple arrays for sparklines from historical data
        const prices = actualPrices.slice(-30);
        
        // We'll simulate other metrics moving alongside price for visual effect
        const maeSim = prices.map(p => p * (0.05 + Math.random() * 0.02));
        const rmseSim = maeSim.map(m => m * 1.2);
        const r2Sim = prices.map((p, i) => 0.7 + (i / 100) + (Math.random() * 0.1));

        const datasets = [
            { id: 'sparkline-1', data: prices, color: '#10b981' },
            { id: 'sparkline-2', data: maeSim, color: '#ef4444' },
            { id: 'sparkline-3', data: rmseSim, color: '#3b82f6' },
            { id: 'sparkline-4', data: r2Sim, color: '#f59e0b' }
        ];

        datasets.forEach(item => {
            const ctx = document.getElementById(item.id).getContext('2d');
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: new Array(item.data.length).fill(''),
                    datasets: [{
                        data: item.data,
                        borderColor: item.color,
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    scales: {
                        x: { display: false },
                        y: { display: false, min: Math.min(...item.data) * 0.9, max: Math.max(...item.data) * 1.1 }
                    },
                    layout: { padding: 0 }
                }
            });
            this.sparklines.push(chart);
        });
    },

    renderRSIChart(dates, rsiData) {
        const ctx = document.getElementById('rsi-chart')?.getContext('2d');
        if (!ctx) return;
        if (this.rsiChart) this.rsiChart.destroy();

        this.rsiChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'RSI',
                    data: rsiData,
                    borderColor: '#8b5cf6',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } }
                },
                plugins: {
                    annotation: {
                        annotations: {
                            line1: { type: 'line', yMin: 70, yMax: 70, borderColor: '#ef4444', borderWidth: 1, borderDash: [5, 5] },
                            line2: { type: 'line', yMin: 30, yMax: 30, borderColor: '#10b981', borderWidth: 1, borderDash: [5, 5] }
                        }
                    }
                }
            }
        });
    },

    renderMACDChart(dates, macdLine, signalLine, macdHist) {
        const ctx = document.getElementById('macd-chart')?.getContext('2d');
        if (!ctx) return;
        if (this.macdChart) this.macdChart.destroy();

        this.macdChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'MACD',
                        data: macdLine,
                        borderColor: '#06b6d4',
                        borderWidth: 1.5,
                        tension: 0.3,
                        pointRadius: 0
                    },
                    {
                        label: 'Signal',
                        data: signalLine,
                        borderColor: '#f59e0b',
                        borderWidth: 1.5,
                        tension: 0.3,
                        pointRadius: 0
                    },
                    {
                        type: 'bar',
                        label: 'Histogram',
                        data: macdHist,
                        backgroundColor: macdHist.map(v => v >= 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'),
                        borderWidth: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });
    }
};
