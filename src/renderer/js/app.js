// Retail Cashing Up Program - Main Application JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Global state
let currentStoreId = null;
let currentCashUpData = null;

// Initialize Application
async function initApp() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.value = today;
    });

    // Setup navigation
    setupNavigation();

    // Setup event listeners
    setupEventListeners();

    // Test database connection
    await testConnection();

    // Load stores
    await loadStores();

    // Load settings
    await loadSettings();
}

// Navigation Setup
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // Update pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.id === `page-${page}`);
    });
}

// Event Listeners Setup
function setupEventListeners() {
    // Dashboard
    document.getElementById('btnRefreshDashboard').addEventListener('click', loadDashboard);
    document.getElementById('dashboardStore').addEventListener('change', onStoreChange);
    document.getElementById('dashboardTerminal').addEventListener('change', loadDashboard);
    document.getElementById('dashboardDate').addEventListener('change', loadDashboard);

    // Cashing Up
    document.getElementById('btnLoadCashUp').addEventListener('click', loadCashUpData);
    document.getElementById('btnGenerateCashUpPDF').addEventListener('click', generateCashUpPDF);
    document.getElementById('btnClearCashUp').addEventListener('click', clearCashUp);
    document.getElementById('cashUpStore').addEventListener('change', onCashUpStoreChange);

    // Denomination inputs
    document.querySelectorAll('.denom-input').forEach(input => {
        input.addEventListener('input', updateCashCount);
    });
    document.getElementById('coinsTotal').addEventListener('input', updateCashCount);

    // Transactions
    document.getElementById('btnSearchTransactions').addEventListener('click', loadTransactions);
    document.getElementById('btnExportTransactions').addEventListener('click', exportTransactionsPDF);
    document.getElementById('transStore').addEventListener('change', onTransStoreChange);

    // Reports
    document.querySelectorAll('.report-card').forEach(card => {
        card.querySelector('button').addEventListener('click', () => {
            generateReport(card.dataset.report);
        });
    });

    // Settings
    document.getElementById('btnTestConnection').addEventListener('click', testConnection);
}

// Database Connection Test
async function testConnection() {
    showLoading();
    try {
        const result = await window.api.testConnection();
        const statusEl = document.getElementById('connectionStatus');
        const dotEl = statusEl.querySelector('.status-dot');
        const textEl = statusEl.querySelector('span:last-child');

        if (result.success) {
            dotEl.classList.remove('disconnected');
            dotEl.classList.add('connected');
            textEl.textContent = 'Connected';
            showToast('Connected to D365 database', 'success');
        } else {
            dotEl.classList.remove('connected');
            dotEl.classList.add('disconnected');
            textEl.textContent = 'Disconnected';
            showToast('Connection failed: ' + result.message, 'error');
        }
    } catch (err) {
        showToast('Connection error: ' + err.message, 'error');
    }
    hideLoading();
}

// Load Stores
async function loadStores() {
    try {
        const stores = await window.api.getStores();
        if (stores.error) {
            console.error('Error loading stores:', stores.error);
            return;
        }

        const storeSelects = ['dashboardStore', 'cashUpStore', 'transStore'];
        storeSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select Store</option>';
            stores.forEach(store => {
                const option = document.createElement('option');
                option.value = store.storeId;
                option.textContent = `${store.storeName} (${store.storeId})`;
                select.appendChild(option);
            });
        });
    } catch (err) {
        console.error('Error loading stores:', err);
    }
}

// Store Change Handlers
async function onStoreChange() {
    const storeId = document.getElementById('dashboardStore').value;
    await loadTerminals(storeId, 'dashboardTerminal');
    loadDashboard();
}

async function onCashUpStoreChange() {
    const storeId = document.getElementById('cashUpStore').value;
    await loadTerminals(storeId, 'cashUpTerminal');
}

async function onTransStoreChange() {
    const storeId = document.getElementById('transStore').value;
    await loadTerminals(storeId, 'transTerminal');
}

// Load Terminals for a Store
async function loadTerminals(storeId, selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">All Terminals</option>';

    if (!storeId) return;

    try {
        const terminals = await window.api.getTerminals(storeId);
        if (terminals.error) return;

        terminals.forEach(terminal => {
            const option = document.createElement('option');
            option.value = terminal.terminalId;
            option.textContent = terminal.terminalName || terminal.terminalId;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Error loading terminals:', err);
    }
}

// Load Dashboard Data
async function loadDashboard() {
    const storeId = document.getElementById('dashboardStore').value;
    const terminalId = document.getElementById('dashboardTerminal').value;
    const date = document.getElementById('dashboardDate').value;

    if (!storeId || !date) return;

    showLoading();
    try {
        // Load summary
        const summary = await window.api.getDailySummary({ storeId, terminalId, date });
        if (!summary.error) {
            document.getElementById('statTransactions').textContent = summary.totalTransactions || 0;
            document.getElementById('statGrossSales').textContent = formatCurrency(summary.grossSales);
            document.getElementById('statDiscounts').textContent = formatCurrency(summary.totalDiscounts);
            document.getElementById('statVoids').textContent = summary.voidCount || 0;
        }

        // Load payment breakdown
        const payments = await window.api.getPaymentBreakdown({ storeId, terminalId, date });
        const paymentGrid = document.getElementById('paymentBreakdown');
        paymentGrid.innerHTML = '';

        if (!payments.error && payments.length > 0) {
            payments.forEach(payment => {
                const item = document.createElement('div');
                item.className = 'payment-item';
                item.innerHTML = `
                    <div class="amount">${formatCurrency(payment.totalAmount)}</div>
                    <div class="label">${payment.paymentName} (${payment.transactionCount})</div>
                `;
                paymentGrid.appendChild(item);
            });
        } else {
            paymentGrid.innerHTML = '<p class="text-center">No payment data available</p>';
        }
    } catch (err) {
        showToast('Error loading dashboard: ' + err.message, 'error');
    }
    hideLoading();
}

// Load Cashing Up Data
async function loadCashUpData() {
    const storeId = document.getElementById('cashUpStore').value;
    const terminalId = document.getElementById('cashUpTerminal').value;
    const date = document.getElementById('cashUpDate').value;

    if (!storeId || !date) {
        showToast('Please select store and date', 'error');
        return;
    }

    showLoading();
    try {
        currentCashUpData = await window.api.getCashingUpReport({ storeId, terminalId, date });

        if (currentCashUpData.error) {
            showToast('Error: ' + currentCashUpData.error, 'error');
            return;
        }

        // Update system totals
        const summary = currentCashUpData.summary || {};
        document.getElementById('sysGrossSales').textContent = formatCurrency(summary.grossSales);
        document.getElementById('sysNetSales').textContent = formatCurrency(summary.netSales);

        // Calculate payment totals
        const payments = currentCashUpData.payments || [];
        let cashTotal = 0, cardTotal = 0, otherTotal = 0;

        payments.forEach(p => {
            if (p.paymentMethod === 1) cashTotal = p.totalAmount || 0;
            else if (p.paymentMethod === 2) cardTotal = p.totalAmount || 0;
            else otherTotal += p.totalAmount || 0;
        });

        document.getElementById('sysCashPayments').textContent = formatCurrency(cashTotal);
        document.getElementById('sysCardPayments').textContent = formatCurrency(cardTotal);
        document.getElementById('sysOtherPayments').textContent = formatCurrency(otherTotal);
        document.getElementById('expectedCash').textContent = formatCurrency(cashTotal);

        // Update variance
        updateCashCount();

        showToast('Data loaded successfully', 'success');
    } catch (err) {
        showToast('Error loading data: ' + err.message, 'error');
    }
    hideLoading();
}

// Update Cash Count and Variance
function updateCashCount() {
    let total = 0;

    // Calculate denomination totals
    document.querySelectorAll('.denom-input').forEach(input => {
        const value = parseFloat(input.dataset.value) || 0;
        const count = parseInt(input.value) || 0;
        const subtotal = value * count;
        total += subtotal;

        const totalEl = input.parentElement.querySelector('.denom-total');
        if (totalEl) {
            totalEl.textContent = formatCurrency(subtotal);
        }
    });

    // Add coins
    const coins = parseFloat(document.getElementById('coinsTotal').value) || 0;
    total += coins;
    document.getElementById('coinsTotalDisplay').textContent = formatCurrency(coins);

    // Update totals
    document.getElementById('totalCashCounted').textContent = formatCurrency(total);
    document.getElementById('actualCash').textContent = formatCurrency(total);

    // Calculate variance
    const expectedText = document.getElementById('expectedCash').textContent;
    const expected = parseFloat(expectedText.replace(/[$,]/g, '')) || 0;
    const variance = total - expected;

    const varianceEl = document.getElementById('cashVariance');
    varianceEl.textContent = formatCurrency(variance);
    varianceEl.classList.remove('positive', 'negative');
    varianceEl.classList.add(variance >= 0 ? 'positive' : 'negative');
}

// Clear Cashing Up Form
function clearCashUp() {
    document.querySelectorAll('.denom-input').forEach(input => {
        input.value = 0;
    });
    document.getElementById('coinsTotal').value = 0;
    updateCashCount();
}

// Load Transactions
async function loadTransactions() {
    const storeId = document.getElementById('transStore').value;
    const terminalId = document.getElementById('transTerminal').value;
    const startDate = document.getElementById('transStartDate').value;
    const endDate = document.getElementById('transEndDate').value;

    if (!storeId || !startDate || !endDate) {
        showToast('Please select store and date range', 'error');
        return;
    }

    showLoading();
    try {
        const transactions = await window.api.getTransactions({ storeId, terminalId, startDate, endDate });
        const tbody = document.getElementById('transactionsBody');

        if (transactions.error) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center">Error: ${transactions.error}</td></tr>`;
            return;
        }

        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No transactions found</td></tr>';
            return;
        }

        tbody.innerHTML = transactions.map(t => `
            <tr>
                <td>${t.receiptId || t.transactionId}</td>
                <td>${formatDate(t.transDate)}</td>
                <td>${t.terminal}</td>
                <td>${t.staffId || '-'}</td>
                <td>${t.transactionType}</td>
                <td class="text-right">${formatCurrency(t.grossAmount)}</td>
                <td class="text-right">${formatCurrency(t.netAmount)}</td>
            </tr>
        `).join('');

    } catch (err) {
        showToast('Error loading transactions: ' + err.message, 'error');
    }
    hideLoading();
}

// Generate Cash Up PDF
async function generateCashUpPDF() {
    if (!currentCashUpData) {
        showToast('Please load data first', 'error');
        return;
    }

    showLoading();
    try {
        const date = document.getElementById('cashUpDate').value;
        const result = await window.api.generatePDF({
            reportType: 'daily-cashing-up',
            data: currentCashUpData,
            fileName: `CashingUp_${date}.pdf`
        });

        if (result.success) {
            showToast('PDF saved successfully', 'success');
        } else {
            showToast(result.message || 'Failed to generate PDF', 'error');
        }
    } catch (err) {
        showToast('Error generating PDF: ' + err.message, 'error');
    }
    hideLoading();
}

// Export Transactions PDF
async function exportTransactionsPDF() {
    const storeId = document.getElementById('transStore').value;
    const startDate = document.getElementById('transStartDate').value;
    const endDate = document.getElementById('transEndDate').value;

    if (!storeId) {
        showToast('Please select a store first', 'error');
        return;
    }

    showLoading();
    try {
        const terminalId = document.getElementById('transTerminal').value;
        const transactions = await window.api.getTransactions({ storeId, terminalId, startDate, endDate });

        const result = await window.api.generatePDF({
            reportType: 'transactions',
            data: { transactions, storeId, startDate, endDate },
            fileName: `Transactions_${storeId}_${startDate}.pdf`
        });

        if (result.success) {
            showToast('PDF saved successfully', 'success');
        } else {
            showToast(result.message || 'Failed to generate PDF', 'error');
        }
    } catch (err) {
        showToast('Error generating PDF: ' + err.message, 'error');
    }
    hideLoading();
}

// Generate Report
async function generateReport(reportType) {
    // For now, prompt for store/date selection
    const storeId = document.getElementById('dashboardStore').value ||
                    document.getElementById('cashUpStore').value;
    const date = document.getElementById('dashboardDate').value ||
                 document.getElementById('cashUpDate').value;

    if (!storeId) {
        showToast('Please select a store from Dashboard or Cashing Up page', 'error');
        return;
    }

    showLoading();
    try {
        let data;
        let fileName;

        switch (reportType) {
            case 'daily-cashing-up':
                data = await window.api.getCashingUpReport({ storeId, date });
                fileName = `DailyCashingUp_${date}.pdf`;
                break;
            case 'payment-breakdown':
                const payments = await window.api.getPaymentBreakdown({ storeId, date });
                data = { payments, storeId, reportDate: date };
                fileName = `PaymentBreakdown_${date}.pdf`;
                break;
            case 'transactions':
                const transactions = await window.api.getTransactions({
                    storeId,
                    startDate: date,
                    endDate: date
                });
                data = { transactions, storeId, startDate: date, endDate: date };
                fileName = `Transactions_${date}.pdf`;
                break;
            case 'variance':
                // For variance report, we need actual counted values
                if (currentCashUpData) {
                    const expected = {
                        cash: parseFloat(document.getElementById('sysCashPayments').textContent.replace(/[$,]/g, '')),
                        card: parseFloat(document.getElementById('sysCardPayments').textContent.replace(/[$,]/g, '')),
                        total: parseFloat(document.getElementById('sysGrossSales').textContent.replace(/[$,]/g, ''))
                    };
                    const actualCash = parseFloat(document.getElementById('totalCashCounted').textContent.replace(/[$,]/g, ''));
                    const actual = {
                        cash: actualCash,
                        card: expected.card,
                        total: actualCash + expected.card
                    };
                    const variance = {
                        cash: actual.cash - expected.cash,
                        card: 0,
                        total: actual.total - expected.total
                    };
                    data = { expected, actual, variance, storeId, reportDate: date };
                } else {
                    showToast('Please load cashing up data first', 'error');
                    hideLoading();
                    return;
                }
                fileName = `Variance_${date}.pdf`;
                break;
        }

        const result = await window.api.generatePDF({ reportType, data, fileName });

        if (result.success) {
            showToast('Report generated successfully', 'success');
        } else {
            showToast(result.message || 'Failed to generate report', 'error');
        }
    } catch (err) {
        showToast('Error generating report: ' + err.message, 'error');
    }
    hideLoading();
}

// Load Settings
async function loadSettings() {
    try {
        const config = await window.api.getDbConfig();
        document.getElementById('settingServer').value = config.server;
        document.getElementById('settingDatabase').value = config.database;
        document.getElementById('settingPort').value = config.port;
    } catch (err) {
        console.error('Error loading settings:', err);
    }
}

// Utility Functions
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '$0.00';
    return '$' + parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + type;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
