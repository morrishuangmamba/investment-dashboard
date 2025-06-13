// 投資組合追蹤系統 - 主要應用程式
class PortfolioTracker {
    constructor() {
        // 初始化數據結構
        this.data = {
            accounts: [],
            stocks: [],
            transactions: [],
            dividends: [],
            historicalPrices: {},
        };

        this.charts = {};
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.loadSampleData();
        this.setupEventListeners();
        this.setupNavigation();
        this.refreshUI();
    }

    // 載入範例數據
    loadSampleData() {
        this.data = {
            accounts: [
                {id: "acc1", name: "主要證券戶", type: "證券戶", created: "2024-01-01"},
                {id: "acc2", name: "退休帳戶", type: "退休帳戶", created: "2024-01-15"}
            ],
            stocks: [
                {symbol: "2330.TW", name: "台積電", currentPrice: 950, currency: "TWD", category: "股票"},
                {symbol: "AAPL", name: "蘋果公司", currentPrice: 210.5, currency: "USD", category: "股票"},
                {symbol: "00878.TW", name: "國泰永續高股息", currentPrice: 23.5, currency: "TWD", category: "股票"},
                {symbol: "BND", name: "Vanguard總體債券市場ETF", currentPrice: 72.8, currency: "USD", category: "債券"}
            ],
            transactions: [
                {id: "t1", date: "2024-01-02", accountId: "acc1", symbol: "2330.TW", type: "buy", quantity: 1000, price: 570},
                {id: "t2", date: "2024-01-15", accountId: "acc1", symbol: "AAPL", type: "buy", quantity: 50, price: 185},
                {id: "t3", date: "2024-02-01", accountId: "acc2", symbol: "00878.TW", type: "buy", quantity: 2000, price: 21},
                {id: "t4", date: "2024-02-15", accountId: "acc1", symbol: "2330.TW", type: "sell", quantity: 500, price: 590},
                {id: "t5", date: "2024-03-20", accountId: "acc2", symbol: "BND", type: "buy", quantity: 100, price: 75},
            ],
            dividends: [
                {id: "d1", date: "2024-03-01", accountId: "acc1", symbol: "2330.TW", amount: 3500, type: "cash"},
                {id: "d2", date: "2024-03-15", accountId: "acc1", symbol: "AAPL", amount: 125, type: "cash"},
                {id: "d3", date: "2024-04-10", accountId: "acc2", symbol: "00878.TW", amount: 800, type: "cash"}
            ],
             historicalPrices: {}
        };
        this.saveData();
    }

    saveData() {
        console.log('數據已模擬保存', this.data);
    }

    // 重新整理所有UI元件
    refreshUI() {
        const activeTab = document.querySelector('.nav-link.active')?.dataset.tab || 'dashboard';
        this.renderAllTables();
        this.showTab(activeTab, true);
    }
    
    // 設置事件監聽器（使用事件委派）
    setupEventListeners() {
        const mainContent = document.querySelector('.main-content');
        const modal = document.getElementById('modal');

        mainContent.addEventListener('click', (e) => {
            const actionTarget = e.target.closest('[data-action]');
            if (!actionTarget) return;
            
            const { action, id } = actionTarget.dataset;
            
            const actions = {
                'add-account': () => this.showAccountModal(),
                'add-stock': () => this.showStockModal(),
                'add-transaction': () => this.showTransactionModal(),
                'add-dividend': () => this.showDividendModal(),
                'import-account-csv': () => document.getElementById('accountCsvFile').click(),
                'export-account-csv': () => this.exportAccountsCSV(),
                'clear-accounts': () => this.clearDataSection('accounts', '帳戶'),
                'import-stock-csv': () => document.getElementById('stockCsvFile').click(),
                'export-stock-csv': () => this.exportStocksCSV(),
                'clear-stocks': () => this.clearDataSection('stocks', '股票'),
                'import-transaction-csv': () => document.getElementById('transactionCsvFile').click(),
                'export-transaction-csv': () => this.exportTransactionsCSV(),
                'clear-transactions': () => this.clearDataSection('transactions', '交易記錄'),
                'import-dividend-csv': () => document.getElementById('dividendCsvFile').click(),
                'export-dividend-csv': () => this.exportDividendsCSV(),
                'clear-dividends': () => this.clearDataSection('dividends', '股利記錄'),
                'import-historical-csv': () => document.getElementById('historicalCsvFile').click(),
                'export-historical-csv': () => this.exportHistoricalCSV(),
                'export-data': () => this.exportAllData(),
                'import-data': () => document.getElementById('importDataFile').click(),
                'clear-data': () => this.clearAllData(),
                'edit-account': () => this.showAccountModal(id),
                'delete-account': () => this.deleteItem('accounts', id, '帳戶'),
                'edit-stock': () => this.showStockModal(id),
                'delete-stock': () => this.deleteItem('stocks', id, '股票', 'symbol'),
                'edit-transaction': () => this.showTransactionModal(id),
                'delete-transaction': () => this.deleteItem('transactions', id, '交易'),
                'edit-dividend': () => this.showDividendModal(id),
                'delete-dividend': () => this.deleteItem('dividends', id, '股利'),
            };

            if (actions[action]) {
                e.preventDefault();
                actions[action]();
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target.id === 'modal' || e.target.closest('[data-action="close-modal"]')) {
                this.hideModal();
            }
        });
        
        document.getElementById('accountCsvFile').addEventListener('change', (e) => this.importAccountsCSV(e));
        document.getElementById('stockCsvFile').addEventListener('change', (e) => this.importStocksCSV(e));
        document.getElementById('transactionCsvFile').addEventListener('change', (e) => this.importTransactionsCSV(e));
        document.getElementById('dividendCsvFile').addEventListener('change', (e) => this.importDividendsCSV(e));
        document.getElementById('historicalCsvFile').addEventListener('change', (e) => this.importHistoricalCSV(e));
        document.getElementById('importDataFile').addEventListener('change', (e) => this.importAllData(e));
    }
    
    // 設置導航
    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.target.dataset.tab;
                this.showTab(tab, true);
            });
        });
    }

    showTab(tabName, forceRender = false) {
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        const tabElement = document.getElementById(tabName);
        if (tabElement) {
            tabElement.classList.add('active');
        }

        if (forceRender) {
             const renderActions = {
                'dashboard': () => this.renderDashboard(),
                'analysis': () => this.setupAnalysisFilters(),
                'data': () => this.updateDataStats(),
                'historical': () => this.renderHistoricalSummary()
            };
            if(renderActions[tabName]) renderActions[tabName]();
        }
    }
    
    // ======================== 計算邏輯 ========================
    calculateDetailedPortfolioStats() {
        const stats = {};
        this.data.stocks.forEach(stock => {
            stats[stock.symbol] = {
                name: stock.name,
                category: stock.category,
                currentPrice: stock.currentPrice,
                currency: stock.currency,
                holding: { quantity: 0, cost: 0, marketValue: 0 },
                realizedPnl: 0,
                unrealizedPnl: 0,
                dividends: 0,
            };
        });

        const fifoQueues = {};

        const sortedTransactions = [...this.data.transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
        sortedTransactions.forEach(tx => {
            if (!stats[tx.symbol]) return;
            if (!fifoQueues[tx.symbol]) fifoQueues[tx.symbol] = [];

            if (tx.type === 'buy') {
                fifoQueues[tx.symbol].push({ quantity: tx.quantity, price: tx.price });
            } else {
                let sellQty = tx.quantity;
                let sellPrice = tx.price;
                while (sellQty > 0 && fifoQueues[tx.symbol].length > 0) {
                    const buyLot = fifoQueues[tx.symbol][0];
                    const sellFromLot = Math.min(sellQty, buyLot.quantity);
                    stats[tx.symbol].realizedPnl += sellFromLot * (sellPrice - buyLot.price);
                    buyLot.quantity -= sellFromLot;
                    sellQty -= sellFromLot;
                    if (buyLot.quantity === 0) {
                        fifoQueues[tx.symbol].shift();
                    }
                }
            }
        });

        Object.keys(fifoQueues).forEach(symbol => {
            let totalCost = 0;
            let totalQuantity = 0;
            fifoQueues[symbol].forEach(lot => {
                totalQuantity += lot.quantity;
                totalCost += lot.quantity * lot.price;
            });

            if (totalQuantity > 0) {
                stats[symbol].holding.quantity = totalQuantity;
                stats[symbol].holding.cost = totalCost;
                stats[symbol].holding.marketValue = totalQuantity * stats[symbol].currentPrice;
                stats[symbol].unrealizedPnl = stats[symbol].holding.marketValue - totalCost;
            }
        });
        
        this.data.dividends.forEach(div => {
            if (stats[div.symbol]) {
                stats[div.symbol].dividends += div.amount;
            }
        });

        return stats;
    }

    // ======================== 渲染邏輯 ========================

    renderDashboard() {
        const detailedStats = this.calculateDetailedPortfolioStats();
        let totalMarketValue = 0, totalUnrealizedPnl = 0, totalRealizedPnl = 0, totalDividends = 0;

        Object.values(detailedStats).forEach(stat => {
            totalMarketValue += stat.holding.marketValue;
            totalUnrealizedPnl += stat.unrealizedPnl;
            totalRealizedPnl += stat.realizedPnl;
            totalDividends += stat.dividends;
        });
        
        const totalPnLOverall = totalUnrealizedPnl + totalRealizedPnl + totalDividends;

        document.getElementById('totalMarketValue').textContent = this.formatCurrency(totalMarketValue);
        document.getElementById('totalUnrealizedPnL').textContent = this.formatCurrency(totalUnrealizedPnl);
        document.getElementById('totalRealizedPnL').textContent = this.formatCurrency(totalRealizedPnl);
        document.getElementById('totalDividends').textContent = this.formatCurrency(totalDividends);
        document.getElementById('totalPnLOverall').textContent = this.formatCurrency(totalPnLOverall);
        
        document.getElementById('totalUnrealizedPnL').className = `metric-value ${totalUnrealizedPnl >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('totalRealizedPnL').className = `metric-value ${totalRealizedPnl >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('totalPnLOverall').className = `metric-value ${totalPnLOverall >= 0 ? 'positive' : 'negative'}`;
        
        this.renderPortfolioChart(detailedStats);
        this.renderStockBondRatioChart(detailedStats);
        this.renderIndividualStockStatsTable(detailedStats);
    }
    
    renderAllTables() {
        this.renderAccountsTable();
        this.renderStocksTable();
        this.renderTransactionsTable();
        this.renderDividendsTable();
    }

    renderPortfolioChart(stats) {
        const ctx = document.getElementById('portfolioChart').getContext('2d');
        if (this.charts.portfolio) this.charts.portfolio.destroy();
        
        const labels = Object.values(stats).filter(s => s.holding.marketValue > 0).map(s => s.name);
        const values = Object.values(stats).filter(s => s.holding.marketValue > 0).map(s => s.holding.marketValue);
        
        this.charts.portfolio = new Chart(ctx, {
            type: 'doughnut',
            data: { labels, datasets: [{ data: values, borderWidth: 1 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
    }

    renderStockBondRatioChart(stats) {
        const ctx = document.getElementById('stockBondRatioChart').getContext('2d');
        if (this.charts.stockBondRatio) this.charts.stockBondRatio.destroy();

        const ratio = { '股票': 0, '債券': 0 };
        Object.values(stats).forEach(s => {
            if (s.holding.marketValue > 0) {
                ratio[s.category] += s.holding.marketValue;
            }
        });

        this.charts.stockBondRatio = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(ratio),
                datasets: [{ data: Object.values(ratio), backgroundColor: ['#36A2EB', '#FF6384'] }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
    }

    renderIndividualStockStatsTable(stats) {
        const tbody = document.querySelector('#individualStockStatsTable tbody');
        tbody.innerHTML = Object.entries(stats).map(([symbol, stat]) => {
            if (stat.holding.quantity <= 0 && stat.realizedPnl === 0 && stat.dividends === 0) return '';
            const totalPnl = stat.unrealizedPnl + stat.realizedPnl + stat.dividends;
            return `
                <tr>
                    <td>${stat.name} (${symbol})</td>
                    <td class="${stat.holding.marketValue > 0 ? '' : 'text-secondary'}">${this.formatCurrency(stat.holding.marketValue, stat.currency)}</td>
                    <td class="${stat.unrealizedPnl > 0 ? 'positive' : stat.unrealizedPnl < 0 ? 'negative' : ''}">${this.formatCurrency(stat.unrealizedPnl, stat.currency)}</td>
                    <td class="${stat.realizedPnl > 0 ? 'positive' : stat.realizedPnl < 0 ? 'negative' : ''}">${this.formatCurrency(stat.realizedPnl, stat.currency)}</td>
                    <td>${this.formatCurrency(stat.dividends, stat.currency)}</td>
                    <td class="${totalPnl > 0 ? 'positive' : totalPnl < 0 ? 'negative' : ''}">${this.formatCurrency(totalPnl, stat.currency)}</td>
                </tr>
            `;
        }).join('');
    }

    renderAccountsTable() {
        const tbody = document.querySelector('#accountsTable tbody');
        tbody.innerHTML = this.data.accounts.map(account => `
            <tr>
                <td>${account.name}</td>
                <td>${account.type}</td>
                <td>${account.created}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn--sm btn--secondary" data-action="edit-account" data-id="${account.id}">編輯</button>
                        <button class="btn btn--sm btn--outline" data-action="delete-account" data-id="${account.id}">刪除</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderStocksTable() {
        const tbody = document.querySelector('#stocksTable tbody');
        tbody.innerHTML = this.data.stocks.map(stock => `
            <tr>
                <td>${stock.symbol}</td>
                <td>${stock.name}</td>
                <td>${stock.category}</td>
                <td>${this.formatCurrency(stock.currentPrice, stock.currency)}</td>
                <td>${stock.currency}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn--sm btn--secondary" data-action="edit-stock" data-id="${stock.symbol}">編輯</button>
                        <button class="btn btn--sm btn--outline" data-action="delete-stock" data-id="${stock.symbol}">刪除</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderTransactionsTable() {
        const tbody = document.querySelector('#transactionsTable tbody');
        tbody.innerHTML = this.data.transactions.map(tx => {
            const account = this.data.accounts.find(a => a.id === tx.accountId);
            const stock = this.data.stocks.find(s => s.symbol === tx.symbol);
            return `
                <tr>
                    <td>${tx.date}</td>
                    <td>${account ? account.name : tx.accountId}</td>
                    <td>${tx.symbol}</td>
                    <td><span class="${tx.type === 'buy' ? 'trade-buy' : 'trade-sell'}">${tx.type === 'buy' ? '買入' : '賣出'}</span></td>
                    <td>${tx.quantity.toLocaleString()}</td>
                    <td>${this.formatCurrency(tx.price, stock?.currency)}</td>
                    <td>${this.formatCurrency(tx.quantity * tx.price, stock?.currency)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn--sm btn--secondary" data-action="edit-transaction" data-id="${tx.id}">編輯</button>
                            <button class="btn btn--sm btn--outline" data-action="delete-transaction" data-id="${tx.id}">刪除</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderDividendsTable() {
        const tbody = document.querySelector('#dividendsTable tbody');
        tbody.innerHTML = this.data.dividends.map(div => {
            const account = this.data.accounts.find(a => a.id === div.accountId);
            const stock = this.data.stocks.find(s => s.symbol === div.symbol);
            return `
                <tr>
                    <td>${div.date}</td>
                    <td>${account ? account.name : div.accountId}</td>
                    <td>${div.symbol}</td>
                    <td>${this.formatCurrency(div.amount, stock?.currency)}</td>
                    <td>${div.type === 'cash' ? '現金股利' : '股票股利'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn--sm btn--secondary" data-action="edit-dividend" data-id="${div.id}">編輯</button>
                            <button class="btn btn--sm btn--outline" data-action="delete-dividend" data-id="${div.id}">刪除</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // ======================== MODAL & CRUD LOGIC ========================

    showModal(title, content) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modal').classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('modal').classList.add('hidden');
        this.currentEditId = null;
    }

    showAccountModal(id = null) {
        this.currentEditId = id;
        const item = id ? this.data.accounts.find(i => i.id === id) : {};
        const content = `
            <form id="modalForm">
                <div class="form-group">
                    <label class="form-label">帳戶名稱</label>
                    <input type="text" class="form-control" id="accountName" value="${item.name || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">帳戶類型</label>
                    <select class="form-control" id="accountType" required>
                        <option value="證券戶" ${item.type === '證券戶' ? 'selected' : ''}>證券戶</option>
                        <option value="退休帳戶" ${item.type === '退休帳戶' ? 'selected' : ''}>退休帳戶</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">創建日期</label>
                    <input type="date" class="form-control" id="accountCreated" value="${item.created || new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="btn-group">
                    <button type="button" class="btn btn--outline" data-action="close-modal">取消</button>
                    <button type="submit" class="btn btn--primary">${id ? '儲存變更' : '新增'}</button>
                </div>
            </form>
        `;
        this.showModal(id ? '編輯帳戶' : '新增帳戶', content);
        document.getElementById('modalForm').onsubmit = (e) => { e.preventDefault(); this.saveAccount(); };
    }

    saveAccount() {
        const name = document.getElementById('accountName').value;
        const type = document.getElementById('accountType').value;
        const created = document.getElementById('accountCreated').value;
        
        if (this.currentEditId) {
            const item = this.data.accounts.find(i => i.id === this.currentEditId);
            if (item) Object.assign(item, { name, type, created });
        } else {
            this.data.accounts.push({ id: 'acc' + Date.now(), name, type, created });
        }
        this.showMessage(`${this.currentEditId ? '更新' : '新增'}成功`, 'success');
        this.hideModal();
        this.refreshUI();
    }

    showStockModal(symbol = null) {
        this.currentEditId = symbol;
        const item = symbol ? this.data.stocks.find(i => i.symbol === symbol) : {};
        const content = `
            <form id="modalForm">
                <div class="form-group">
                    <label class="form-label">股票代號</label>
                    <input type="text" class="form-control" id="stockSymbol" value="${item.symbol || ''}" ${symbol ? 'disabled' : ''} required>
                </div>
                <div class="form-group">
                    <label class="form-label">股票名稱</label>
                    <input type="text" class="form-control" id="stockName" value="${item.name || ''}" required>
                </div>
                 <div class="form-group">
                    <label class="form-label">分類</label>
                    <select class="form-control" id="stockCategory" required>
                        <option value="股票" ${item.category === '股票' ? 'selected' : ''}>股票</option>
                        <option value="債券" ${item.category === '債券' ? 'selected' : ''}>債券</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">目前價格</label>
                    <input type="number" step="0.01" class="form-control" id="stockPrice" value="${item.currentPrice || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">貨幣</label>
                    <select class="form-control" id="stockCurrency" required>
                         <option value="TWD" ${item.currency === 'TWD' ? 'selected' : ''}>TWD</option>
                         <option value="USD" ${item.currency === 'USD' ? 'selected' : ''}>USD</option>
                    </select>
                </div>
                <div class="btn-group">
                    <button type="button" class="btn btn--outline" data-action="close-modal">取消</button>
                    <button type="submit" class="btn btn--primary">${symbol ? '儲存變更' : '新增'}</button>
                </div>
            </form>
        `;
        this.showModal(symbol ? '編輯股票' : '新增股票', content);
        document.getElementById('modalForm').onsubmit = (e) => { e.preventDefault(); this.saveStock(); };
    }
    
    saveStock() {
        const symbol = document.getElementById('stockSymbol').value.toUpperCase();
        const data = {
            name: document.getElementById('stockName').value,
            category: document.getElementById('stockCategory').value,
            currentPrice: parseFloat(document.getElementById('stockPrice').value),
            currency: document.getElementById('stockCurrency').value
        };

        if (this.currentEditId) {
            const item = this.data.stocks.find(i => i.symbol === this.currentEditId);
            if (item) Object.assign(item, data);
        } else {
            if (this.data.stocks.some(s => s.symbol === symbol)) {
                this.showMessage('股票代號已存在', 'error'); return;
            }
            this.data.stocks.push({ symbol, ...data });
        }
        this.showMessage(`${this.currentEditId ? '更新' : '新增'}成功`, 'success');
        this.hideModal();
        this.refreshUI();
    }
    
    showTransactionModal(id = null) {
        this.currentEditId = id;
        const item = id ? this.data.transactions.find(i => i.id === id) : {};
        const accountOptions = this.data.accounts.map(acc => `<option value="${acc.id}" ${item.accountId === acc.id ? 'selected': ''}>${acc.name}</option>`).join('');
        const stockOptions = this.data.stocks.map(s => `<option value="${s.symbol}" ${item.symbol === s.symbol ? 'selected': ''}>${s.name} (${s.symbol})</option>`).join('');
        
        const content = `
            <form id="modalForm">
                <div class="form-group">
                    <label class="form-label">日期</label>
                    <input type="date" class="form-control" id="transactionDate" value="${item.date || new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">帳戶</label>
                    <select class="form-control" id="transactionAccount" required>${accountOptions}</select>
                </div>
                <div class="form-group">
                    <label class="form-label">股票</label>
                    <select class="form-control" id="transactionStock" required>${stockOptions}</select>
                </div>
                <div class="form-group">
                    <label class="form-label">交易類型</label>
                    <select class="form-control" id="transactionType" required>
                        <option value="buy" ${item.type === 'buy' ? 'selected' : ''}>買入</option>
                        <option value="sell" ${item.type === 'sell' ? 'selected' : ''}>賣出</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">數量</label>
                    <input type="number" min="1" class="form-control" id="transactionQuantity" value="${item.quantity || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">價格</label>
                    <input type="number" step="0.01" min="0" class="form-control" id="transactionPrice" value="${item.price || ''}" required>
                </div>
                <div class="btn-group">
                    <button type="button" class="btn btn--outline" data-action="close-modal">取消</button>
                    <button type="submit" class="btn btn--primary">${id ? '儲存變更' : '新增'}</button>
                </div>
            </form>
        `;
        this.showModal(id ? '編輯交易' : '新增交易', content);
        document.getElementById('modalForm').onsubmit = (e) => { e.preventDefault(); this.saveTransaction(); };
    }

    saveTransaction() {
        const data = {
            date: document.getElementById('transactionDate').value,
            accountId: document.getElementById('transactionAccount').value,
            symbol: document.getElementById('transactionStock').value,
            type: document.getElementById('transactionType').value,
            quantity: parseInt(document.getElementById('transactionQuantity').value),
            price: parseFloat(document.getElementById('transactionPrice').value),
        };

        if (this.currentEditId) {
            const item = this.data.transactions.find(i => i.id === this.currentEditId);
            if (item) Object.assign(item, data);
        } else {
            this.data.transactions.push({ id: 't' + Date.now(), ...data });
        }
        this.showMessage(`${this.currentEditId ? '更新' : '新增'}成功`, 'success');
        this.hideModal();
        this.refreshUI();
    }
    
    showDividendModal(id = null) {
        this.currentEditId = id;
        const item = id ? this.data.dividends.find(i => i.id === id) : {};
        const accountOptions = this.data.accounts.map(acc => `<option value="${acc.id}" ${item.accountId === acc.id ? 'selected':''}>${acc.name}</option>`).join('');
        const stockOptions = this.data.stocks.map(s => `<option value="${s.symbol}" ${item.symbol === s.symbol ? 'selected':''}>${s.name} (${s.symbol})</option>`).join('');

        const content = `
             <form id="modalForm">
                <div class="form-group">
                    <label class="form-label">日期</label>
                    <input type="date" class="form-control" id="dividendDate" value="${item.date || new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">帳戶</label>
                    <select class="form-control" id="dividendAccount" required>${accountOptions}</select>
                </div>
                <div class="form-group">
                    <label class="form-label">股票</label>
                    <select class="form-control" id="dividendStock" required>${stockOptions}</select>
                </div>
                <div class="form-group">
                    <label class="form-label">股利金額</label>
                    <input type="number" step="0.01" min="0" class="form-control" id="dividendAmount" value="${item.amount || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">股利類型</label>
                    <select class="form-control" id="dividendType" required>
                        <option value="cash" ${item.type === 'cash' ? 'selected' : ''}>現金股利</option>
                    </select>
                </div>
                <div class="btn-group">
                    <button type="button" class="btn btn--outline" data-action="close-modal">取消</button>
                    <button type="submit" class="btn btn--primary">${id ? '儲存變更' : '新增'}</button>
                </div>
            </form>
        `;
        this.showModal(id ? '編輯股利' : '新增股利', content);
        document.getElementById('modalForm').onsubmit = (e) => { e.preventDefault(); this.saveDividend(); };
    }

    saveDividend() {
        const data = {
            date: document.getElementById('dividendDate').value,
            accountId: document.getElementById('dividendAccount').value,
            symbol: document.getElementById('dividendStock').value,
            amount: parseFloat(document.getElementById('dividendAmount').value),
            type: document.getElementById('dividendType').value,
        };
        
        if (this.currentEditId) {
            const item = this.data.dividends.find(i => i.id === this.currentEditId);
            if (item) Object.assign(item, data);
        } else {
            this.data.dividends.push({ id: 'd' + Date.now(), ...data });
        }
        this.showMessage(`${this.currentEditId ? '更新' : '新增'}成功`, 'success');
        this.hideModal();
        this.refreshUI();
    }

    deleteItem(itemType, id, name, key = 'id') {
        if (confirm(`確定要刪除此${name}嗎？此操作不可復原。`)) {
            this.data[itemType] = this.data[itemType].filter(item => item[key] !== id);
            this.saveData();
            this.refreshUI();
            this.showMessage(`${name}已刪除`, 'success');
        }
    }
    
    // ======================== CSV & DATA MANAGEMENT ========================

    async _parseCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const lines = text.trim().split(/\r\n|\n/);
                    if (lines.length < 2) return reject(new Error('CSV 檔案至少需要包含標頭和一行數據。'));
                    
                    const headers = lines.shift().trim().split(',').map(h => h.trim());
                    const data = lines.map(line => {
                        const values = line.trim().split(',');
                        const obj = {};
                        headers.forEach((header, index) => {
                            obj[header] = values[index] ? values[index].trim() : '';
                        });
                        return obj;
                    });
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error("檔案讀取失敗"));
            reader.readAsText(file, 'UTF-8');
        });
    }

    async importAccountsCSV(event) {
        const file = event.target.files[0];
        if (!file) return;
        try {
            const data = await this._parseCSV(file);
            let count = 0;
            data.forEach(item => {
                const { id, ...rest } = item;
                if (rest.name && rest.type && rest.created) {
                    if (this.data.accounts.some(acc => acc.name === rest.name)) return;
                    this.data.accounts.push({ id: 'acc' + Date.now() + Math.random(), ...rest });
                    count++;
                }
            });
            this.refreshUI();
            this.showMessage(`成功匯入 ${count} 筆新帳戶資料。`, 'success');
        } catch (error) { this.showMessage(`匯入失敗: ${error.message}`, 'error'); } 
        finally { event.target.value = ''; }
    }
    
    async importStocksCSV(event) {
        const file = event.target.files[0];
        if (!file) return;
        try {
            const data = await this._parseCSV(file);
            let added = 0, updated = 0;
            data.forEach(item => {
                if (item.symbol && item.name && item.category && item.currentPrice && item.currency) {
                    const existing = this.data.stocks.find(s => s.symbol === item.symbol);
                    const stockData = {
                        name: item.name,
                        category: item.category,
                        currentPrice: parseFloat(item.currentPrice),
                        currency: item.currency
                    };
                    if (existing) {
                        Object.assign(existing, stockData);
                        updated++;
                    } else {
                        this.data.stocks.push({ symbol: item.symbol, ...stockData });
                        added++;
                    }
                }
            });
            this.refreshUI();
            this.showMessage(`匯入完成！新增 ${added} 筆，更新 ${updated} 筆股票。`, 'success');
        } catch (error) { this.showMessage(`匯入失敗: ${error.message}`, 'error'); }
        finally { event.target.value = ''; }
    }

    async importTransactionsCSV(event) {
        const file = event.target.files[0];
        if (!file) return;
        try {
            const data = await this._parseCSV(file);
            let count = 0;
            data.forEach(item => {
                if (item.date && item.accountId && item.symbol && item.type && item.quantity && item.price) {
                    const {id, ...rest} = item;
                    this.data.transactions.push({
                        id: 't' + Date.now() + Math.random(),
                        ...rest,
                        quantity: parseInt(item.quantity),
                        price: parseFloat(item.price),
                    });
                    count++;
                }
            });
            this.refreshUI();
            this.showMessage(`成功匯入 ${count} 筆交易資料。`, 'success');
        } catch (error) { this.showMessage(`匯入失敗: ${error.message}`, 'error'); }
        finally { event.target.value = ''; }
    }

    async importDividendsCSV(event) {
        const file = event.target.files[0];
        if (!file) return;
        try {
            const data = await this._parseCSV(file);
            let count = 0;
            data.forEach(item => {
                if (item.date && item.accountId && item.symbol && item.amount && item.type) {
                    const {id, ...rest} = item;
                    this.data.dividends.push({
                        id: 'd' + Date.now() + Math.random(),
                        ...rest,
                        amount: parseFloat(item.amount),
                    });
                    count++;
                }
            });
            this.refreshUI();
            this.showMessage(`成功匯入 ${count} 筆股利資料。`, 'success');
        } catch (error) { this.showMessage(`匯入失敗: ${error.message}`, 'error'); }
        finally { event.target.value = ''; }
    }
    
    async importHistoricalCSV(event) {
        const file = event.target.files[0];
        if (!file) return;
        try {
            const data = await this._parseCSV(file);
            let count = 0;
            data.forEach(item => {
                if (item.date && item.symbol && item.price) {
                    if (!this.data.historicalPrices[item.symbol]) {
                        this.data.historicalPrices[item.symbol] = {};
                    }
                    this.data.historicalPrices[item.symbol][item.date] = parseFloat(item.price);
                    count++;
                }
            });
            this.refreshUI();
            this.showMessage(`成功匯入 ${count} 筆歷史股價。`, 'success');
        } catch (error) { this.showMessage(`匯入失敗: ${error.message}`, 'error'); }
        finally { event.target.value = ''; }
    }

    downloadCSV(filename, data) {
        if (data.length === 0) {
            this.showMessage('沒有資料可匯出', 'info');
            return;
        }
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');
        
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    exportAccountsCSV() { this.downloadCSV('accounts.csv', this.data.accounts); }
    exportStocksCSV() { this.downloadCSV('stocks.csv', this.data.stocks); }
    exportTransactionsCSV() { this.downloadCSV('transactions.csv', this.data.transactions); }
    exportDividendsCSV() { this.downloadCSV('dividends.csv', this.data.dividends); }
    exportHistoricalCSV() {
        const flatData = [];
        Object.entries(this.data.historicalPrices).forEach(([symbol, prices]) => {
            Object.entries(prices).forEach(([date, price]) => {
                flatData.push({ date, symbol, price });
            });
        });
        this.downloadCSV('historical_prices.csv', flatData);
    }
    
    exportAllData() {
        const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    importAllData(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData.accounts && importedData.stocks) {
                    this.data = importedData;
                    this.saveData();
                    this.refreshUI();
                    this.showMessage('數據還原成功', 'success');
                } else {
                    this.showMessage('數據格式錯誤', 'error');
                }
            } catch (error) {
                this.showMessage('檔案讀取失敗', 'error');
            }
        };
        reader.readAsText(file);
    }

    clearDataSection(sectionName, displayName) {
        if (confirm(`確定要清除所有${displayName}資料嗎？此操作無法復原。`)) {
            this.data[sectionName] = [];
            this.saveData();
            this.refreshUI();
            this.showMessage(`所有${displayName}資料已清除`, 'success');
        }
    }

    clearAllData() {
        if (confirm('確定要清除所有數據嗎？此操作不可復原。')) {
            this.data = { accounts: [], stocks: [], transactions: [], dividends: [], historicalPrices: {} };
            this.saveData();
            this.refreshUI();
        }
    }


    // ======================== ANALYSIS (FIXED) ========================
    setupAnalysisFilters() {
        const accountFilter = document.getElementById('accountFilter');
        if (!accountFilter) return;

        const currentSelection = Array.from(accountFilter.selectedOptions).map(opt => opt.value);
        accountFilter.innerHTML = this.data.accounts.map(account => 
            `<option value="${account.id}" ${currentSelection.includes(account.id) || currentSelection.length === 0 ? 'selected' : ''}>${account.name}</option>`
        ).join('');
        
        const endDateInput = document.getElementById('endDate');
        const startDateInput = document.getElementById('startDate');
        
        if (!startDateInput.value || !endDateInput.value) {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 1);
            endDateInput.valueAsDate = endDate;
            startDateInput.valueAsDate = startDate;
        }
        
        const setupListener = (elementId, eventName, listener) => {
            const element = document.getElementById(elementId);
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            newElement.addEventListener(eventName, listener);
        };
        
        setupListener('endDate', 'change', () => this.updateAnalysis());
        setupListener('startDate', 'change', () => this.updateAnalysis());
        setupListener('accountFilter', 'change', () => this.updateAnalysis());

        this.updateAnalysis();
    }

    updateAnalysis() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const selectedAccounts = Array.from(document.getElementById('accountFilter').selectedOptions).map(opt => opt.value);

        const unrealizedPnLDisplay = document.getElementById('unrealizedPnL');
        const realizedPnLDisplay = document.getElementById('realizedPnL');
        const dividendIncomeDisplay = document.getElementById('totalDividendIncome');
        const totalPnLDisplay = document.getElementById('totalPnL');
        
        if (!startDate || !endDate || selectedAccounts.length === 0 || new Date(startDate) > new Date(endDate)) {
            const ctx = document.getElementById('pnlChart').getContext('2d');
            if (this.charts.pnl) {
                 this.charts.pnl.destroy();
                 delete this.charts.pnl;
            }
            realizedPnLDisplay.textContent = this.formatCurrency(0);
            unrealizedPnLDisplay.textContent = this.formatCurrency(0);
            dividendIncomeDisplay.textContent = this.formatCurrency(0);
            totalPnLDisplay.textContent = this.formatCurrency(0);
            return;
        }
        
        const allTransactionsForAccounts = this.data.transactions.filter(tx => selectedAccounts.includes(tx.accountId));
        const allDividendsForAccounts = this.data.dividends.filter(div => selectedAccounts.includes(div.accountId));

        const realizedPnL = this._calculateFilteredRealizedPnL(allTransactionsForAccounts.filter(tx => tx.date >= startDate && tx.date <= endDate));
        const dividendIncome = allDividendsForAccounts.filter(div => div.date >= startDate && div.date <= endDate).reduce((sum, div) => sum + div.amount, 0);
        const { unrealizedPnL } = this._calculateFilteredUnrealizedPnL(selectedAccounts);
        const totalPnL = realizedPnL + unrealizedPnL + dividendIncome;

        realizedPnLDisplay.textContent = this.formatCurrency(realizedPnL);
        unrealizedPnLDisplay.textContent = this.formatCurrency(unrealizedPnL);
        dividendIncomeDisplay.textContent = this.formatCurrency(dividendIncome);
        totalPnLDisplay.textContent = this.formatCurrency(totalPnL);

        this.renderPnLChart(startDate, endDate, allTransactionsForAccounts, allDividendsForAccounts);
    }
    
    _calculateFilteredRealizedPnL(transactions) {
        let realizedPnL = 0;
        const fifoQueues = {};
        const sortedTransactions = [...transactions].sort((a,b) => new Date(a.date) - new Date(b.date));
        
        sortedTransactions.forEach(tx => {
            if (!fifoQueues[tx.symbol]) fifoQueues[tx.symbol] = [];
            if (tx.type === 'buy') {
                fifoQueues[tx.symbol].push({ quantity: tx.quantity, price: tx.price });
            } else if (tx.type === 'sell') {
                let sellQty = tx.quantity;
                while(sellQty > 0 && fifoQueues[tx.symbol].length > 0) {
                    const buyLot = fifoQueues[tx.symbol][0];
                    const sellFromLot = Math.min(sellQty, buyLot.quantity);
                    realizedPnL += sellFromLot * (tx.price - buyLot.price);
                    buyLot.quantity -= sellFromLot;
                    if(buyLot.quantity === 0) fifoQueues[tx.symbol].shift();
                    sellQty -= sellFromLot;
                }
            }
        });
        return realizedPnL;
    }

    _calculateFilteredUnrealizedPnL(accountIds) {
        const fifoQueues = {};
        const transactions = this.data.transactions
            .filter(tx => accountIds.includes(tx.accountId))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        transactions.forEach(tx => {
            if (!fifoQueues[tx.symbol]) fifoQueues[tx.symbol] = [];
            if (tx.type === 'buy') {
                fifoQueues[tx.symbol].push({ quantity: tx.quantity, price: tx.price });
            } else {
                let sellQty = tx.quantity;
                while (sellQty > 0 && fifoQueues[tx.symbol].length > 0) {
                    const buyLot = fifoQueues[tx.symbol][0];
                    const sellFromLot = Math.min(sellQty, buyLot.quantity);
                    buyLot.quantity -= sellFromLot;
                    sellQty -= sellFromLot;
                    if (buyLot.quantity === 0) fifoQueues[tx.symbol].shift();
                }
            }
        });

        let unrealizedPnL = 0;
        Object.keys(fifoQueues).forEach(symbol => {
            const stock = this.data.stocks.find(s => s.symbol === symbol);
            if (!stock) return;

            const remainingLots = fifoQueues[symbol];
            if (remainingLots.length > 0) {
                const totalCost = remainingLots.reduce((sum, lot) => sum + (lot.quantity * lot.price), 0);
                const totalQuantity = remainingLots.reduce((sum, lot) => sum + lot.quantity, 0);
                const marketValue = totalQuantity * stock.currentPrice;
                unrealizedPnL += marketValue - totalCost;
            }
        });
        return { unrealizedPnL };
    }
    
    generateDateRange(startDateStr, endDateStr) {
        const dates = [];
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        
        let currentDate = new Date(start);
        while (currentDate <= end) {
            dates.push(currentDate.toISOString().slice(0, 10));
            currentDate.setDate(currentDate.getDate() + 7);
        }

        if (!dates.includes(endDateStr)) {
            dates.push(endDateStr);
        }
        return dates.sort((a,b) => new Date(a) - new Date(b));
    }

    renderPnLChart(startDate, endDate, filteredTransactions, filteredDividends) {
        const ctx = document.getElementById('pnlChart').getContext('2d');
        if (this.charts.pnl) {
            this.charts.pnl.destroy();
        }
        
        // 1. Pre-calculate daily changes within the date range
        const dailyChanges = {};
        const fifoQueues = {};

        const sortedTx = [...filteredTransactions].sort((a,b) => new Date(a.date) - new Date(b.date));
        
        sortedTx.forEach(tx => {
            if (tx.date < startDate || tx.date > endDate) return;

            if (tx.type === 'sell') {
                if (!dailyChanges[tx.date]) dailyChanges[tx.date] = { realizedPnl: 0, dividends: 0 };
                if (!fifoQueues[tx.symbol]) fifoQueues[tx.symbol] = [];
                
                let sellQty = tx.quantity;
                let pnlForThisTx = 0;
                while(sellQty > 0 && fifoQueues[tx.symbol].length > 0) {
                    const buyLot = fifoQueues[tx.symbol][0];
                    const sellFromLot = Math.min(sellQty, buyLot.quantity);
                    pnlForThisTx += sellFromLot * (tx.price - buyLot.price);
                    buyLot.quantity -= sellFromLot;
                    if(buyLot.quantity === 0) fifoQueues[tx.symbol].shift();
                    sellQty -= sellFromLot;
                }
                dailyChanges[tx.date].realizedPnl += pnlForThisTx;
            } else { // tx.type === 'buy'
                if (!fifoQueues[tx.symbol]) fifoQueues[tx.symbol] = [];
                fifoQueues[tx.symbol].push({ quantity: tx.quantity, price: tx.price });
            }
        });

        filteredDividends.forEach(div => {
            if (div.date < startDate || div.date > endDate) return;
            if (!dailyChanges[div.date]) dailyChanges[div.date] = { realizedPnl: 0, dividends: 0 };
            dailyChanges[div.date].dividends += div.amount;
        });

        // 2. Create cumulative data map from daily changes
        const sortedDatesWithChanges = Object.keys(dailyChanges).sort();
        const cumulativeData = {};
        let cumulativePnl = 0;
        let cumulativeDividends = 0;
        
        sortedDatesWithChanges.forEach(date => {
            cumulativePnl += dailyChanges[date].realizedPnl;
            cumulativeDividends += dailyChanges[date].dividends;
            cumulativeData[date] = { realizedPnl: cumulativePnl, dividends: cumulativeDividends };
        });

        // 3. Map cumulative data to chart labels
        const labels = this.generateDateRange(startDate, endDate);
        const realizedData = [];
        const dividendData = [];
        let lastPnl = 0;
        let lastDividend = 0;

        labels.forEach(labelDate => {
            const relevantDates = sortedDatesWithChanges.filter(d => d <= labelDate);
            if (relevantDates.length > 0) {
                const latestDateWithChange = relevantDates[relevantDates.length - 1];
                lastPnl = cumulativeData[latestDateWithChange].realizedPnl;
                lastDividend = cumulativeData[latestDateWithChange].dividends;
            }
            realizedData.push(lastPnl);
            dividendData.push(lastDividend);
        });
        
        this.charts.pnl = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: '已實現損益 (累計)',
                    data: realizedData,
                    borderColor: '#1FB8CD',
                    tension: 0.1,
                    fill: false,
                }, {
                    label: '股利收入 (累計)',
                    data: dividendData,
                    borderColor: '#FFC185',
                    tension: 0.1,
                    fill: false,
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                scales: { x: { ticks: { maxRotation: 45, minRotation: 45 } } }
            }
        });
    }

    // ======================== UTILITY & OTHER ========================
    formatCurrency(amount, currency = 'TWD') {
        return (amount || 0).toLocaleString('zh-TW', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
    }

    showMessage(message, type = 'info') {
        const container = document.querySelector('.main-content');
        const oldMessage = container.querySelector('.status-message');
        if(oldMessage) oldMessage.remove();
        
        const messageEl = document.createElement('div');
        messageEl.className = `status-message ${type}`;
        messageEl.textContent = message;
        container.insertBefore(messageEl, container.firstChild);
        setTimeout(() => messageEl.remove(), 3000);
    }
    
    updateDataStats() {}
    renderHistoricalSummary() {}
}

// 初始化應用程式
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PortfolioTracker();
});