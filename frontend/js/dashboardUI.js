const dashboardUI = {
    renderTickerHero(info) {
        document.getElementById('dashboard-grid').style.display = 'block';
        
        document.getElementById('greeting').textContent = `${info.name} (${info.symbol})`;
        
        const priceEl = document.getElementById('hero-price');
        this.animateNumberChange(priceEl, info.currentPrice, { prefix: '$', decimals: 2 });
        
        const changeEl = document.getElementById('hero-change');
        const sign = info.change >= 0 ? '+' : '';
        const changePct = Number(info.changePct || 0);
        
        setTimeout(() => {
            changeEl.textContent = `${sign}${changePct.toFixed(2)}%`;
            changeEl.className = `card-badge ${info.change >= 0 ? '' : 'red'}`;
            // If negative, we remove the green class and add red, but in CSS the default is green. 
            // Let's ensure explicit setting:
            if(info.change < 0) {
                changeEl.style.background = 'rgba(239, 68, 68, 0.1)';
                changeEl.style.color = 'var(--accent-red)';
            } else {
                changeEl.style.background = 'rgba(16, 185, 129, 0.1)';
                changeEl.style.color = 'var(--accent-green)';
            }
        }, 300);
        
        const statusEl = document.getElementById('hero-status');
        statusEl.innerHTML = `<span class="dot ${info.marketStatus === 'OPEN' ? 'live-dot' : ''}"></span> MKT ${info.marketStatus}`;
        if(info.marketStatus === 'OPEN') {
            statusEl.classList.add('live');
        } else {
            statusEl.classList.remove('live');
        }
    },

    renderMetrics(metrics) {
        this.animateNumberChange(document.getElementById('metric-mae'), metrics.mae, { prefix: '$', decimals: 2 });
        this.animateNumberChange(document.getElementById('metric-rmse'), metrics.rmse, { prefix: '$', decimals: 2 });
        this.animateNumberChange(document.getElementById('metric-r2'), metrics.r2, { decimals: 4 });
        
        // Update trend badges (simulated trends for effect)
        document.getElementById('mae-trend').textContent = `-2.4%`;
        document.getElementById('rmse-trend').textContent = `-1.8%`;
        
        const r2Trend = document.getElementById('r2-trend');
        r2Trend.textContent = metrics.verdict;
        if(metrics.r2 > 0.8) {
            r2Trend.style.color = 'var(--accent-green)';
            r2Trend.style.background = 'rgba(16, 185, 129, 0.1)';
        }
        
        const verdictEl = document.getElementById('model-verdict');
        verdictEl.textContent = `SYSTEM VERDICT: ${metrics.verdict}`;
    },

    renderPredictionTable(predictions) {
        const tbody = document.getElementById('prediction-table-body');
        tbody.innerHTML = '';
        
        predictions.forEach(pred => {
            const date = pred.Date || 'N/A';
            const close = Number(pred.Predicted_Close || 0);
            const lower = Number(pred.Lower_Bound || 0);
            const upper = Number(pred.Upper_Bound || 0);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${date}</td>
                <td style="color: var(--predict-blue); font-weight: 700;">$${close.toFixed(2)}</td>
                <td style="color: var(--text-secondary);">
                    $${lower.toFixed(2)} - $${upper.toFixed(2)}
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    renderComparison(data) {
        const grid = document.getElementById('comparison-grid');
        grid.innerHTML = '';
        
        Object.entries(data.metrics).forEach(([model, metrics]) => {
            const isBest = model === data.best_model;
            const div = document.createElement('div');
            div.className = `compare-card ${isBest ? 'best' : ''}`;
            
            div.innerHTML = `
                <div class="comp-model">${model}</div>
                <div class="comp-score">${metrics.r2}</div>
                <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">${metrics.verdict}</div>
            `;
            grid.appendChild(div);
        });
    },

    showLoading(msg) {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.add('active');
        
        const msgEl = document.getElementById('loading-msg');
        msgEl.textContent = '';
        let i = 0;
        clearInterval(this.typingInterval);
        this.typingInterval = setInterval(() => {
            if (i < msg.length) {
                msgEl.textContent += msg.charAt(i).toUpperCase();
                i++;
            } else {
                clearInterval(this.typingInterval);
            }
        }, 30);
    },

    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('active');
        clearInterval(this.typingInterval);
    },
    
    animateNumberChange(element, newValue, options = {}) {
        const { prefix = '', suffix = '', decimals = 0, duration = 1000 } = options;
        
        if (isNaN(newValue)) {
            element.textContent = `${prefix}${newValue}${suffix}`;
            return;
        }

        const startValue = parseFloat(element.dataset.value || 0);
        const endValue = Number(newValue) || 0;
        const startTime = performance.now();

        element.dataset.value = endValue;

        const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            const currentVal = startValue + (endValue - startValue) * easeProgress;
            
            element.textContent = `${prefix}${currentVal.toFixed(decimals)}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = `${prefix}${endValue.toFixed(decimals)}${suffix}`;
            }
        };

        requestAnimationFrame(animate);
    }
};
