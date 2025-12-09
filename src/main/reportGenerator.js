const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

// Define fonts
const fonts = {
    Roboto: {
        normal: path.join(__dirname, '../../assets/fonts/Roboto-Regular.ttf'),
        bold: path.join(__dirname, '../../assets/fonts/Roboto-Bold.ttf'),
        italics: path.join(__dirname, '../../assets/fonts/Roboto-Italic.ttf'),
        bolditalics: path.join(__dirname, '../../assets/fonts/Roboto-BoldItalic.ttf')
    }
};

class ReportGenerator {
    static async generatePDF(reportType, data, filePath) {
        let docDefinition;

        switch (reportType) {
            case 'daily-cashing-up':
                docDefinition = this.createDailyCashingUpReport(data);
                break;
            case 'payment-breakdown':
                docDefinition = this.createPaymentBreakdownReport(data);
                break;
            case 'transactions':
                docDefinition = this.createTransactionsReport(data);
                break;
            case 'variance':
                docDefinition = this.createVarianceReport(data);
                break;
            default:
                docDefinition = this.createDailyCashingUpReport(data);
        }

        return new Promise((resolve, reject) => {
            try {
                const printer = new PdfPrinter(fonts);
                const pdfDoc = printer.createPdfKitDocument(docDefinition);
                const writeStream = fs.createWriteStream(filePath);

                pdfDoc.pipe(writeStream);
                pdfDoc.end();

                writeStream.on('finish', () => resolve(filePath));
                writeStream.on('error', reject);
            } catch (err) {
                reject(err);
            }
        });
    }

    static createDailyCashingUpReport(data) {
        const { summary, payments, hourlyBreakdown, staffBreakdown, reportDate, storeId, terminalId } = data;

        return {
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60],
            header: {
                columns: [
                    { text: 'RETAIL CASHING UP REPORT', style: 'header', margin: [40, 20, 0, 0] },
                    { text: moment().format('DD/MM/YYYY HH:mm'), style: 'headerDate', alignment: 'right', margin: [0, 20, 40, 0] }
                ]
            },
            footer: function(currentPage, pageCount) {
                return {
                    text: `Page ${currentPage} of ${pageCount}`,
                    alignment: 'center',
                    margin: [0, 20, 0, 0],
                    style: 'footer'
                };
            },
            content: [
                { text: 'Daily Cashing Up Summary', style: 'title' },
                {
                    columns: [
                        { text: `Store: ${storeId || 'All Stores'}`, style: 'subtitle' },
                        { text: `Terminal: ${terminalId || 'All Terminals'}`, style: 'subtitle' },
                        { text: `Date: ${moment(reportDate).format('DD/MM/YYYY')}`, style: 'subtitle' }
                    ],
                    margin: [0, 0, 0, 20]
                },

                // Summary Section
                { text: 'Sales Summary', style: 'sectionHeader' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto'],
                        body: [
                            [{ text: 'Description', style: 'tableHeader' }, { text: 'Amount', style: 'tableHeader' }],
                            ['Total Transactions', summary.totalTransactions || 0],
                            ['Gross Sales', this.formatCurrency(summary.grossSales)],
                            ['Net Sales', this.formatCurrency(summary.netSales)],
                            ['Total Discounts', this.formatCurrency(summary.totalDiscounts)],
                            ['Total Tax', this.formatCurrency(summary.totalTax)],
                            ['Void Count', summary.voidCount || 0],
                            ['Void Amount', this.formatCurrency(summary.voidAmount)]
                        ]
                    },
                    margin: [0, 0, 0, 20]
                },

                // Payment Breakdown
                { text: 'Payment Methods Breakdown', style: 'sectionHeader' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'Payment Method', style: 'tableHeader' },
                                { text: 'Count', style: 'tableHeader' },
                                { text: 'Amount', style: 'tableHeader' }
                            ],
                            ...(payments || []).map(p => [
                                p.paymentName,
                                p.transactionCount,
                                this.formatCurrency(p.totalAmount)
                            ])
                        ]
                    },
                    margin: [0, 0, 0, 20]
                },

                // Staff Breakdown
                { text: 'Staff Performance', style: 'sectionHeader' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'Staff ID', style: 'tableHeader' },
                                { text: 'Transactions', style: 'tableHeader' },
                                { text: 'Total Sales', style: 'tableHeader' }
                            ],
                            ...(staffBreakdown || []).map(s => [
                                s.staffId || 'Unknown',
                                s.transactionCount,
                                this.formatCurrency(s.totalSales)
                            ])
                        ]
                    },
                    margin: [0, 0, 0, 20]
                },

                // Signature Section
                { text: '', margin: [0, 30, 0, 0] },
                {
                    columns: [
                        {
                            width: '45%',
                            stack: [
                                { text: '________________________', alignment: 'center' },
                                { text: 'Cashier Signature', alignment: 'center', margin: [0, 5, 0, 0] }
                            ]
                        },
                        { width: '10%', text: '' },
                        {
                            width: '45%',
                            stack: [
                                { text: '________________________', alignment: 'center' },
                                { text: 'Manager Signature', alignment: 'center', margin: [0, 5, 0, 0] }
                            ]
                        }
                    ]
                }
            ],
            styles: {
                header: { fontSize: 10, bold: true, color: '#333' },
                headerDate: { fontSize: 9, color: '#666' },
                title: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
                subtitle: { fontSize: 10, color: '#666' },
                sectionHeader: { fontSize: 12, bold: true, margin: [0, 15, 0, 10], color: '#2c3e50' },
                tableHeader: { bold: true, fillColor: '#3498db', color: 'white', fontSize: 10 },
                footer: { fontSize: 8, color: '#999' }
            },
            defaultStyle: { fontSize: 10 }
        };
    }

    static createPaymentBreakdownReport(data) {
        const { payments, reportDate, storeId, terminalId } = data;

        return {
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60],
            content: [
                { text: 'Payment Methods Report', style: 'title' },
                {
                    columns: [
                        { text: `Store: ${storeId || 'All'}`, style: 'subtitle' },
                        { text: `Date: ${moment(reportDate).format('DD/MM/YYYY')}`, style: 'subtitle' }
                    ],
                    margin: [0, 0, 0, 20]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'Payment Method', style: 'tableHeader' },
                                { text: 'Transaction Count', style: 'tableHeader' },
                                { text: 'Total Amount', style: 'tableHeader' },
                                { text: '% of Total', style: 'tableHeader' }
                            ],
                            ...(payments || []).map(p => {
                                const total = payments.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
                                const percentage = total > 0 ? ((p.totalAmount / total) * 100).toFixed(1) : 0;
                                return [
                                    p.paymentName,
                                    p.transactionCount,
                                    this.formatCurrency(p.totalAmount),
                                    `${percentage}%`
                                ];
                            })
                        ]
                    }
                }
            ],
            styles: {
                title: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
                subtitle: { fontSize: 10, color: '#666' },
                tableHeader: { bold: true, fillColor: '#3498db', color: 'white', fontSize: 10 }
            },
            defaultStyle: { fontSize: 10 }
        };
    }

    static createTransactionsReport(data) {
        const { transactions, startDate, endDate, storeId } = data;

        return {
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [30, 50, 30, 50],
            content: [
                { text: 'Transactions Report', style: 'title' },
                {
                    text: `Store: ${storeId} | Period: ${moment(startDate).format('DD/MM/YYYY')} - ${moment(endDate).format('DD/MM/YYYY')}`,
                    style: 'subtitle',
                    margin: [0, 0, 0, 15]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'Receipt', style: 'tableHeader' },
                                { text: 'Date', style: 'tableHeader' },
                                { text: 'Terminal', style: 'tableHeader' },
                                { text: 'Staff', style: 'tableHeader' },
                                { text: 'Type', style: 'tableHeader' },
                                { text: 'Gross', style: 'tableHeader' },
                                { text: 'Net', style: 'tableHeader' }
                            ],
                            ...(transactions || []).map(t => [
                                t.receiptId || t.transactionId,
                                moment(t.transDate).format('DD/MM/YYYY'),
                                t.terminal,
                                t.staffId || '-',
                                t.transactionType,
                                this.formatCurrency(t.grossAmount),
                                this.formatCurrency(t.netAmount)
                            ])
                        ]
                    }
                }
            ],
            styles: {
                title: { fontSize: 16, bold: true },
                subtitle: { fontSize: 9, color: '#666' },
                tableHeader: { bold: true, fillColor: '#2c3e50', color: 'white', fontSize: 8 }
            },
            defaultStyle: { fontSize: 8 }
        };
    }

    static createVarianceReport(data) {
        const { expected, actual, variance, reportDate, storeId } = data;

        return {
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60],
            content: [
                { text: 'Cash Variance Report', style: 'title' },
                {
                    text: `Store: ${storeId} | Date: ${moment(reportDate).format('DD/MM/YYYY')}`,
                    style: 'subtitle',
                    margin: [0, 0, 0, 20]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'Category', style: 'tableHeader' },
                                { text: 'Expected', style: 'tableHeader' },
                                { text: 'Actual', style: 'tableHeader' },
                                { text: 'Variance', style: 'tableHeader' }
                            ],
                            [
                                'Cash',
                                this.formatCurrency(expected?.cash),
                                this.formatCurrency(actual?.cash),
                                {
                                    text: this.formatCurrency(variance?.cash),
                                    color: (variance?.cash || 0) < 0 ? 'red' : 'green'
                                }
                            ],
                            [
                                'Card',
                                this.formatCurrency(expected?.card),
                                this.formatCurrency(actual?.card),
                                {
                                    text: this.formatCurrency(variance?.card),
                                    color: (variance?.card || 0) < 0 ? 'red' : 'green'
                                }
                            ],
                            [
                                { text: 'TOTAL', bold: true },
                                { text: this.formatCurrency(expected?.total), bold: true },
                                { text: this.formatCurrency(actual?.total), bold: true },
                                {
                                    text: this.formatCurrency(variance?.total),
                                    bold: true,
                                    color: (variance?.total || 0) < 0 ? 'red' : 'green'
                                }
                            ]
                        ]
                    }
                },
                { text: '', margin: [0, 40, 0, 0] },
                {
                    columns: [
                        { text: 'Counted by: ________________', width: '50%' },
                        { text: 'Verified by: ________________', width: '50%' }
                    ]
                }
            ],
            styles: {
                title: { fontSize: 18, bold: true },
                subtitle: { fontSize: 10, color: '#666' },
                tableHeader: { bold: true, fillColor: '#e74c3c', color: 'white', fontSize: 10 }
            },
            defaultStyle: { fontSize: 10 }
        };
    }

    static formatCurrency(amount) {
        if (amount === null || amount === undefined) return '$0.00';
        return '$' + parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}

module.exports = ReportGenerator;
