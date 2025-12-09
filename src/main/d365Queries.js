const db = require('../../config/database');

class D365Queries {
    // Get all retail stores
    static async getStores() {
        const query = `
            SELECT
                STORENUMBER as storeId,
                NAME as storeName,
                STREET as address,
                CITY as city
            FROM RETAILSTORETABLE
            WHERE STORENUMBER IS NOT NULL
            ORDER BY NAME
        `;
        return await db.query(query);
    }

    // Get terminals/registers for a store
    static async getTerminals(storeId) {
        const query = `
            SELECT
                TERMINALID as terminalId,
                NAME as terminalName,
                ACTIVATIONSTSTATUS as status
            FROM RETAILTERMINALTABLE
            WHERE STORERECID = (
                SELECT RECID FROM RETAILSTORETABLE WHERE STORENUMBER = @storeId
            )
            ORDER BY TERMINALID
        `;
        return await db.query(query, { storeId });
    }

    // Get daily summary for cashing up
    static async getDailySummary(storeId, terminalId, date) {
        const query = `
            SELECT
                COUNT(DISTINCT t.TRANSACTIONID) as totalTransactions,
                SUM(t.GROSSAMOUNT) as grossSales,
                SUM(t.NETAMOUNT) as netSales,
                SUM(t.DISCOUNTAMOUNT) as totalDiscounts,
                SUM(t.TAXAMOUNT) as totalTax,
                COUNT(CASE WHEN t.TYPE = 2 THEN 1 END) as voidCount,
                SUM(CASE WHEN t.TYPE = 2 THEN t.GROSSAMOUNT ELSE 0 END) as voidAmount
            FROM RETAILTRANSACTIONTABLE t
            WHERE t.STORE = @storeId
            AND (@terminalId IS NULL OR t.TERMINAL = @terminalId)
            AND CAST(t.TRANSDATE AS DATE) = @date
            AND t.ENTRYSTATUS = 0
        `;
        const result = await db.query(query, { storeId, terminalId, date });
        return result[0] || {};
    }

    // Get payment methods breakdown
    static async getPaymentBreakdown(storeId, terminalId, date) {
        const query = `
            SELECT
                p.TENDERTYPE as paymentMethod,
                CASE p.TENDERTYPE
                    WHEN 1 THEN 'Cash'
                    WHEN 2 THEN 'Card'
                    WHEN 3 THEN 'Cheque'
                    WHEN 4 THEN 'Gift Card'
                    WHEN 5 THEN 'Voucher'
                    ELSE 'Other'
                END as paymentName,
                COUNT(*) as transactionCount,
                SUM(p.AMOUNTTENDERED) as totalAmount,
                SUM(p.AMOUNTCUR) as currencyAmount
            FROM RETAILTRANSACTIONPAYMENTTRANS p
            INNER JOIN RETAILTRANSACTIONTABLE t
                ON p.TRANSACTIONID = t.TRANSACTIONID
                AND p.STORE = t.STORE
                AND p.TERMINAL = t.TERMINAL
            WHERE t.STORE = @storeId
            AND (@terminalId IS NULL OR t.TERMINAL = @terminalId)
            AND CAST(t.TRANSDATE AS DATE) = @date
            AND t.ENTRYSTATUS = 0
            GROUP BY p.TENDERTYPE
            ORDER BY p.TENDERTYPE
        `;
        return await db.query(query, { storeId, terminalId, date });
    }

    // Get transactions list
    static async getTransactions(storeId, terminalId, startDate, endDate) {
        const query = `
            SELECT TOP 500
                t.TRANSACTIONID as transactionId,
                t.RECEIPTID as receiptId,
                t.TRANSDATE as transDate,
                t.TRANSTIME as transTime,
                t.STORE as store,
                t.TERMINAL as terminal,
                t.STAFF as staffId,
                t.GROSSAMOUNT as grossAmount,
                t.NETAMOUNT as netAmount,
                t.DISCOUNTAMOUNT as discountAmount,
                t.TAXAMOUNT as taxAmount,
                CASE t.TYPE
                    WHEN 0 THEN 'Sale'
                    WHEN 1 THEN 'Return'
                    WHEN 2 THEN 'Void'
                    ELSE 'Other'
                END as transactionType,
                t.ENTRYSTATUS as status
            FROM RETAILTRANSACTIONTABLE t
            WHERE t.STORE = @storeId
            AND (@terminalId IS NULL OR t.TERMINAL = @terminalId)
            AND CAST(t.TRANSDATE AS DATE) >= @startDate
            AND CAST(t.TRANSDATE AS DATE) <= @endDate
            ORDER BY t.TRANSDATE DESC, t.TRANSTIME DESC
        `;
        return await db.query(query, { storeId, terminalId, startDate, endDate });
    }

    // Get complete cashing up report data
    static async getCashingUpReport(storeId, terminalId, date) {
        const summary = await this.getDailySummary(storeId, terminalId, date);
        const payments = await this.getPaymentBreakdown(storeId, terminalId, date);

        // Get hourly breakdown
        const hourlyQuery = `
            SELECT
                DATEPART(HOUR, t.TRANSTIME) as hour,
                COUNT(*) as transactionCount,
                SUM(t.GROSSAMOUNT) as totalSales
            FROM RETAILTRANSACTIONTABLE t
            WHERE t.STORE = @storeId
            AND (@terminalId IS NULL OR t.TERMINAL = @terminalId)
            AND CAST(t.TRANSDATE AS DATE) = @date
            AND t.ENTRYSTATUS = 0
            GROUP BY DATEPART(HOUR, t.TRANSTIME)
            ORDER BY hour
        `;
        const hourlyBreakdown = await db.query(hourlyQuery, { storeId, terminalId, date });

        // Get staff breakdown
        const staffQuery = `
            SELECT
                t.STAFF as staffId,
                COUNT(*) as transactionCount,
                SUM(t.GROSSAMOUNT) as totalSales
            FROM RETAILTRANSACTIONTABLE t
            WHERE t.STORE = @storeId
            AND (@terminalId IS NULL OR t.TERMINAL = @terminalId)
            AND CAST(t.TRANSDATE AS DATE) = @date
            AND t.ENTRYSTATUS = 0
            GROUP BY t.STAFF
            ORDER BY totalSales DESC
        `;
        const staffBreakdown = await db.query(staffQuery, { storeId, terminalId, date });

        return {
            summary,
            payments,
            hourlyBreakdown,
            staffBreakdown,
            reportDate: date,
            storeId,
            terminalId
        };
    }
}

module.exports = D365Queries;
