const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Database operations
    testConnection: () => ipcRenderer.invoke('db:test-connection'),
    getStores: () => ipcRenderer.invoke('db:get-stores'),
    getTerminals: (storeId) => ipcRenderer.invoke('db:get-terminals', storeId),
    getDailySummary: (params) => ipcRenderer.invoke('db:get-daily-summary', params),
    getPaymentBreakdown: (params) => ipcRenderer.invoke('db:get-payment-breakdown', params),
    getTransactions: (params) => ipcRenderer.invoke('db:get-transactions', params),
    getCashingUpReport: (params) => ipcRenderer.invoke('db:get-cashing-up-report', params),
    getDbConfig: () => ipcRenderer.invoke('db:get-config'),

    // Report generation
    generatePDF: (params) => ipcRenderer.invoke('report:generate-pdf', params)
});
