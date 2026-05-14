const app = {
    state: {
        currentTicker: null,
        currentModel: 'linear',
        currentPeriod: '1y',
        currentFeatureSet: 'technical'
    },

    init() {
        searchUI.init();
        chartEngine.init();
        this.bindSelectors();
        
        // Initial load
        setTimeout(() => this.runAnalysis('AAPL'), 1000);
    },

    bindSelectors() {
        document.querySelectorAll('#model-selector .sidebar-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#model-selector .sidebar-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.currentModel = btn.dataset.model;
                if (this.state.currentTicker) this.runAnalysis(this.state.currentTicker);
            });
        });

        document.querySelectorAll('#period-selector .sidebar-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#period-selector .sidebar-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.currentPeriod = btn.dataset.period;
                if (this.state.currentTicker) this.runAnalysis(this.state.currentTicker);
            });
        });
        
        document.querySelectorAll('#watchlist-selector .sidebar-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                const ticker = btn.dataset.ticker;
                document.getElementById('ticker-input').value = ticker;
                this.runAnalysis(ticker);
            });
        });
    },

    async runAnalysis(ticker) {
        this.state.currentTicker = ticker.toUpperCase();
        dashboardUI.showLoading(`Connecting to API for ${ticker}...`);
        
        try {
            // 1. Get info
            const info = await api.fetchStockInfo(ticker);
            if (info.error) throw new Error(info.error);
            
            // Show synthetic data warning if yfinance failed
            if (info.isSynthetic) {
                console.warn("Using Synthetic Data Fallback");
                document.getElementById('greeting').innerHTML = `${info.name} <span style="font-size: 12px; color: var(--accent-orange); background: rgba(245,158,11,0.1); padding: 4px 8px; border-radius: 4px; margin-left: 10px;">⚡ SYNTHETIC FALLBACK MODE</span>`;
            } else {
                document.getElementById('greeting').innerHTML = `${info.name} <span style="font-size: 14px; color: var(--text-muted);">(${info.symbol})</span>`;
            }
            
            dashboardUI.renderTickerHero(info);
            
            // 2. Get prediction
            dashboardUI.showLoading(`Training ${this.state.currentModel.toUpperCase()} AI Engine...`);
            const predData = await api.fetchPrediction(ticker, this.state.currentModel, this.state.currentPeriod);
            if (predData.error) throw new Error(predData.error);
            
            // 3. Render Metrics & Table
            dashboardUI.showLoading(`Calculating Confidence Bands...`);
            dashboardUI.renderMetrics(predData.metrics);
            dashboardUI.renderPredictionTable(predData.future_predictions);
            
            // 4. Render Charts
            dashboardUI.showLoading(`Rendering Visualization Matrix...`);
            chartEngine.renderPriceChart(predData.chart_data);
            chartEngine.renderSparklines(predData.chart_data.actual_prices);
            
            // 5. Fetch & Render Technical Analysis
            dashboardUI.showLoading(`Processing RSI & MACD Momentum...`);
            const analysisData = await api.fetchAnalysis(ticker, this.state.currentPeriod);
            if (!analysisData.error && analysisData.indicators) {
                const ind = analysisData.indicators;
                chartEngine.renderRSIChart(ind.dates, ind.rsi);
                chartEngine.renderMACDChart(ind.dates, ind.macd, ind.macd_signal, ind.macd_histogram);
            }
            
            // 6. Compare models & Render Donut
            const compareData = await api.fetchCompare(ticker, this.state.currentPeriod);
            if (compareData.error) throw new Error(compareData.error);
            dashboardUI.renderComparison(compareData);
            chartEngine.renderDonutChart(compareData.metrics);
            
            dashboardUI.hideLoading();
        } catch (e) {
            console.error(e);
            dashboardUI.showLoading(`SYSTEM ERROR: ${e.message}`);
            // Don't auto-hide loading on error so user can read it
        }
    }
};

window.addEventListener('DOMContentLoaded', () => app.init());
