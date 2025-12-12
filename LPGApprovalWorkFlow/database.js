const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'lpg_workflow.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
function initializeDatabase() {
    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'staff',
            department TEXT,
            phone TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Customers table
    db.exec(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            customer_code TEXT UNIQUE NOT NULL,
            company_name TEXT NOT NULL,
            contact_person TEXT,
            email TEXT,
            phone TEXT,
            mobile TEXT,
            address TEXT,
            city TEXT,
            emirate TEXT,
            country TEXT DEFAULT 'UAE',
            trade_license_no TEXT,
            tax_registration_no TEXT,
            customer_type TEXT DEFAULT 'retail',
            credit_limit REAL DEFAULT 0,
            payment_terms INTEGER DEFAULT 30,
            status TEXT DEFAULT 'active',
            notes TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // Products table
    db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            product_code TEXT UNIQUE NOT NULL,
            product_name TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL,
            unit TEXT NOT NULL,
            unit_price REAL NOT NULL,
            cost_price REAL,
            min_stock_level INTEGER DEFAULT 0,
            current_stock INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Orders table
    db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            order_number TEXT UNIQUE NOT NULL,
            customer_id INTEGER NOT NULL,
            order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            delivery_date DATETIME,
            delivery_address TEXT,
            total_amount REAL NOT NULL,
            discount_amount REAL DEFAULT 0,
            tax_amount REAL DEFAULT 0,
            net_amount REAL NOT NULL,
            payment_status TEXT DEFAULT 'pending',
            order_status TEXT DEFAULT 'draft',
            priority TEXT DEFAULT 'normal',
            notes TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // Order items table
    db.exec(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            discount_percent REAL DEFAULT 0,
            tax_percent REAL DEFAULT 5,
            line_total REAL NOT NULL,
            notes TEXT,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `);

    // Approval workflows table
    db.exec(`
        CREATE TABLE IF NOT EXISTS approval_workflows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            workflow_name TEXT NOT NULL,
            workflow_type TEXT NOT NULL,
            description TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Approval stages table
    db.exec(`
        CREATE TABLE IF NOT EXISTS approval_stages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workflow_id INTEGER NOT NULL,
            stage_order INTEGER NOT NULL,
            stage_name TEXT NOT NULL,
            approver_role TEXT NOT NULL,
            approver_id INTEGER,
            min_amount REAL DEFAULT 0,
            max_amount REAL,
            is_mandatory INTEGER DEFAULT 1,
            auto_approve_days INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (workflow_id) REFERENCES approval_workflows(id) ON DELETE CASCADE,
            FOREIGN KEY (approver_id) REFERENCES users(id)
        )
    `);

    // Approval requests table
    db.exec(`
        CREATE TABLE IF NOT EXISTS approval_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            request_number TEXT UNIQUE NOT NULL,
            workflow_id INTEGER NOT NULL,
            reference_type TEXT NOT NULL,
            reference_id INTEGER NOT NULL,
            current_stage INTEGER DEFAULT 1,
            status TEXT DEFAULT 'pending',
            requested_by INTEGER NOT NULL,
            requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME,
            notes TEXT,
            FOREIGN KEY (workflow_id) REFERENCES approval_workflows(id),
            FOREIGN KEY (requested_by) REFERENCES users(id)
        )
    `);

    // Approval history table
    db.exec(`
        CREATE TABLE IF NOT EXISTS approval_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_id INTEGER NOT NULL,
            stage_id INTEGER NOT NULL,
            action TEXT NOT NULL,
            action_by INTEGER NOT NULL,
            action_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            comments TEXT,
            previous_status TEXT,
            new_status TEXT,
            FOREIGN KEY (request_id) REFERENCES approval_requests(id) ON DELETE CASCADE,
            FOREIGN KEY (stage_id) REFERENCES approval_stages(id),
            FOREIGN KEY (action_by) REFERENCES users(id)
        )
    `);

    // Delivery schedules table
    db.exec(`
        CREATE TABLE IF NOT EXISTS delivery_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            order_id INTEGER NOT NULL,
            scheduled_date DATE NOT NULL,
            scheduled_time_slot TEXT,
            driver_id INTEGER,
            vehicle_number TEXT,
            route TEXT,
            status TEXT DEFAULT 'scheduled',
            actual_delivery_time DATETIME,
            delivery_notes TEXT,
            customer_signature TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (driver_id) REFERENCES users(id)
        )
    `);

    // Cylinder tracking table
    db.exec(`
        CREATE TABLE IF NOT EXISTS cylinder_tracking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            cylinder_serial TEXT UNIQUE NOT NULL,
            cylinder_type TEXT NOT NULL,
            capacity REAL NOT NULL,
            customer_id INTEGER,
            status TEXT DEFAULT 'available',
            last_fill_date DATE,
            next_test_date DATE,
            location TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        )
    `);

    // Payments table
    db.exec(`
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            payment_number TEXT UNIQUE NOT NULL,
            order_id INTEGER,
            customer_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            payment_method TEXT NOT NULL,
            payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            reference_number TEXT,
            bank_name TEXT,
            cheque_number TEXT,
            cheque_date DATE,
            status TEXT DEFAULT 'completed',
            notes TEXT,
            received_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            FOREIGN KEY (received_by) REFERENCES users(id)
        )
    `);

    // Activity log table
    db.exec(`
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id INTEGER,
            old_values TEXT,
            new_values TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Notifications table
    db.exec(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            reference_type TEXT,
            reference_id INTEGER,
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Create indexes
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(customer_code);
        CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
        CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
        CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
        CREATE INDEX IF NOT EXISTS idx_delivery_schedules_date ON delivery_schedules(scheduled_date);
        CREATE INDEX IF NOT EXISTS idx_cylinder_tracking_serial ON cylinder_tracking(cylinder_serial);
        CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
    `);

    console.log('Database initialized successfully!');
}

// Run initialization if this file is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = { db, initializeDatabase };
