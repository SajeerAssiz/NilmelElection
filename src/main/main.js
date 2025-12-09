const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('../../config/database');
const ReportGenerator = require('./reportGenerator');
const D365Queries = require('./d365Queries');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, '../../assets/icon.png'),
        title: 'Retail Cashing Up Program - D365'
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    // Open DevTools in dev mode
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', async () => {
    await db.close();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC Handlers

// Test database connection
ipcMain.handle('db:test-connection', async () => {
    try {
        await db.connect();
        return { success: true, message: 'Connected to D365 database successfully' };
    } catch (err) {
        return { success: false, message: err.message };
    }
});

// Get stores list
ipcMain.handle('db:get-stores', async () => {
    try {
        return await D365Queries.getStores();
    } catch (err) {
        return { error: err.message };
    }
});

// Get terminals/registers
ipcMain.handle('db:get-terminals', async (event, storeId) => {
    try {
        return await D365Queries.getTerminals(storeId);
    } catch (err) {
        return { error: err.message };
    }
});

// Get daily transactions summary
ipcMain.handle('db:get-daily-summary', async (event, { storeId, terminalId, date }) => {
    try {
        return await D365Queries.getDailySummary(storeId, terminalId, date);
    } catch (err) {
        return { error: err.message };
    }
});

// Get payment methods breakdown
ipcMain.handle('db:get-payment-breakdown', async (event, { storeId, terminalId, date }) => {
    try {
        return await D365Queries.getPaymentBreakdown(storeId, terminalId, date);
    } catch (err) {
        return { error: err.message };
    }
});

// Get transactions list
ipcMain.handle('db:get-transactions', async (event, { storeId, terminalId, startDate, endDate }) => {
    try {
        return await D365Queries.getTransactions(storeId, terminalId, startDate, endDate);
    } catch (err) {
        return { error: err.message };
    }
});

// Get cashing up report data
ipcMain.handle('db:get-cashing-up-report', async (event, { storeId, terminalId, date }) => {
    try {
        return await D365Queries.getCashingUpReport(storeId, terminalId, date);
    } catch (err) {
        return { error: err.message };
    }
});

// Generate PDF Report
ipcMain.handle('report:generate-pdf', async (event, { reportType, data, fileName }) => {
    try {
        const { filePath } = await dialog.showSaveDialog(mainWindow, {
            defaultPath: fileName || `Report_${new Date().toISOString().split('T')[0]}.pdf`,
            filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
        });

        if (filePath) {
            await ReportGenerator.generatePDF(reportType, data, filePath);
            return { success: true, filePath };
        }
        return { success: false, message: 'Save cancelled' };
    } catch (err) {
        return { success: false, message: err.message };
    }
});

// Get database config (for settings display)
ipcMain.handle('db:get-config', () => {
    return {
        server: process.env.DB_SERVER || 'localhost',
        database: process.env.DB_DATABASE || 'AxDB',
        port: process.env.DB_PORT || '1433'
    };
});
