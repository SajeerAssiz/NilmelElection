const { db, initializeDatabase } = require('./database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seedDatabase() {
    try {
        console.log('Initializing database...');
        initializeDatabase();

        // Check if data already exists
        const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
        if (userCount > 0) {
            console.log('Database already has data. Skipping seed.');
            process.exit(0);
        }

        console.log('Seeding database with sample data...');

        // Create Users
        const adminPassword = await bcrypt.hash('admin123', 10);
        const managerPassword = await bcrypt.hash('manager123', 10);
        const staffPassword = await bcrypt.hash('staff123', 10);
        const driverPassword = await bcrypt.hash('driver123', 10);

        console.log('Creating users...');
        const insertUser = db.prepare(`
            INSERT INTO users (uuid, username, email, password_hash, full_name, role, department, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertUser.run(uuidv4(), 'admin', 'admin@lpgworkflow.com', adminPassword, 'System Administrator', 'admin', 'IT', '+971-50-1234567');
        insertUser.run(uuidv4(), 'manager', 'manager@lpgworkflow.com', managerPassword, 'Sales Manager', 'manager', 'Sales', '+971-50-2345678');
        insertUser.run(uuidv4(), 'staff', 'staff@lpgworkflow.com', staffPassword, 'Sales Representative', 'staff', 'Sales', '+971-50-3456789');
        insertUser.run(uuidv4(), 'driver1', 'driver1@lpgworkflow.com', driverPassword, 'Ahmed Hassan', 'driver', 'Delivery', '+971-50-4567890');

        console.log('Users created successfully');

        // Create Customers
        console.log('Creating customers...');
        const insertCustomer = db.prepare(`
            INSERT INTO customers (uuid, customer_code, company_name, contact_person, email, phone, customer_type, emirate, credit_limit, payment_terms, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const customers = [
            { code: 'CUS000001', name: 'Al Noor Restaurant LLC', contact: 'Mohammed Ali', email: 'info@alnoor.ae', phone: '+971-4-1234567', type: 'commercial', emirate: 'Dubai' },
            { code: 'CUS000002', name: 'Dubai Grand Hotel', contact: 'Sarah Khan', email: 'purchase@dubaigrand.ae', phone: '+971-4-2345678', type: 'commercial', emirate: 'Dubai' },
            { code: 'CUS000003', name: 'Emirates Steel Industries', contact: 'Raj Patel', email: 'procurement@emiratessteel.ae', phone: '+971-6-3456789', type: 'industrial', emirate: 'Sharjah' },
            { code: 'CUS000004', name: 'City Gas Retail Store', contact: 'Ahmad Hassan', email: 'orders@citygas.ae', phone: '+971-4-4567890', type: 'retail', emirate: 'Dubai' },
            { code: 'CUS000005', name: 'Gulf Construction Co', contact: 'Omar Sheikh', email: 'supply@gulfconst.ae', phone: '+971-2-5678901', type: 'industrial', emirate: 'Abu Dhabi' }
        ];

        customers.forEach(cust => {
            insertCustomer.run(uuidv4(), cust.code, cust.name, cust.contact, cust.email, cust.phone, cust.type, cust.emirate, 50000, 30, 1);
        });

        console.log('Customers created successfully');

        // Create Products
        console.log('Creating products...');
        const insertProduct = db.prepare(`
            INSERT INTO products (uuid, product_code, product_name, description, category, unit, unit_price, current_stock, min_stock_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const products = [
            { code: 'PRD000001', name: 'LPG Cylinder 12.5kg', category: 'cylinder', unit: 'piece', price: 75.00, desc: 'Standard 12.5kg LPG cylinder for domestic use' },
            { code: 'PRD000002', name: 'LPG Cylinder 25kg', category: 'cylinder', unit: 'piece', price: 140.00, desc: 'Large 25kg LPG cylinder for commercial use' },
            { code: 'PRD000003', name: 'LPG Cylinder 50kg', category: 'cylinder', unit: 'piece', price: 265.00, desc: 'Industrial 50kg LPG cylinder' },
            { code: 'PRD000004', name: 'Bulk LPG', category: 'bulk', unit: 'kg', price: 3.50, desc: 'Bulk LPG supply per kilogram' },
            { code: 'PRD000005', name: 'Gas Regulator', category: 'accessory', unit: 'piece', price: 45.00, desc: 'Standard gas regulator with safety features' },
            { code: 'PRD000006', name: 'Gas Hose Pipe 2m', category: 'accessory', unit: 'piece', price: 25.00, desc: '2 meter high-quality gas hose pipe' },
            { code: 'PRD000007', name: 'Installation Service', category: 'service', unit: 'piece', price: 150.00, desc: 'Professional gas installation service' },
            { code: 'PRD000008', name: 'Safety Inspection', category: 'service', unit: 'piece', price: 100.00, desc: 'Annual gas safety inspection' }
        ];

        products.forEach(prod => {
            insertProduct.run(uuidv4(), prod.code, prod.name, prod.desc, prod.category, prod.unit, prod.price, 100, 10);
        });

        console.log('Products created successfully');

        // Create Approval Workflows
        console.log('Creating approval workflows...');
        const insertWorkflow = db.prepare(`
            INSERT INTO approval_workflows (uuid, workflow_name, workflow_type, description)
            VALUES (?, ?, ?, ?)
        `);

        const insertStage = db.prepare(`
            INSERT INTO approval_stages (workflow_id, stage_order, stage_name, approver_role, min_amount, max_amount)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        // Order Approval Workflow
        const orderWorkflowResult = insertWorkflow.run(uuidv4(), 'Order Approval', 'order', 'Workflow for approving sales orders based on amount');
        const orderWorkflowId = orderWorkflowResult.lastInsertRowid;

        insertStage.run(orderWorkflowId, 1, 'Manager Review', 'manager', 0, 10000);
        insertStage.run(orderWorkflowId, 2, 'Admin Approval', 'admin', 10000, null);

        // Credit Limit Approval Workflow
        const creditWorkflowResult = insertWorkflow.run(uuidv4(), 'Credit Limit Approval', 'credit', 'Workflow for approving customer credit limit changes');
        const creditWorkflowId = creditWorkflowResult.lastInsertRowid;

        insertStage.run(creditWorkflowId, 1, 'Finance Review', 'manager', 0, null);
        insertStage.run(creditWorkflowId, 2, 'Final Approval', 'admin', 0, null);

        console.log('Approval workflows created successfully');

        // Create Sample Orders
        console.log('Creating sample orders...');
        const insertOrder = db.prepare(`
            INSERT INTO orders (uuid, order_number, customer_id, total_amount, tax_amount, net_amount, order_status, payment_status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const orders = [
            { num: 'ORD000001', custId: 1, total: 750, tax: 37.5, status: 'delivered', payment: 'paid' },
            { num: 'ORD000002', custId: 2, total: 2800, tax: 140, status: 'processing', payment: 'partial' },
            { num: 'ORD000003', custId: 3, total: 5300, tax: 265, status: 'pending', payment: 'pending' },
            { num: 'ORD000004', custId: 1, total: 450, tax: 22.5, status: 'approved', payment: 'pending' },
            { num: 'ORD000005', custId: 4, total: 1500, tax: 75, status: 'draft', payment: 'pending' }
        ];

        orders.forEach(order => {
            const net = order.total + order.tax;
            insertOrder.run(uuidv4(), order.num, order.custId, order.total, order.tax, net, order.status, order.payment, 3);
        });

        console.log('Sample orders created successfully');

        // Create Sample Cylinders
        console.log('Creating sample cylinders...');
        const insertCylinder = db.prepare(`
            INSERT INTO cylinder_tracking (uuid, cylinder_serial, cylinder_type, capacity, status, customer_id, location)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const cylinders = [
            { serial: 'CYL-2024-0001', type: 'Standard 12.5kg', capacity: 12.5, status: 'available', custId: null },
            { serial: 'CYL-2024-0002', type: 'Standard 12.5kg', capacity: 12.5, status: 'with_customer', custId: 1 },
            { serial: 'CYL-2024-0003', type: 'Commercial 25kg', capacity: 25, status: 'available', custId: null },
            { serial: 'CYL-2024-0004', type: 'Commercial 25kg', capacity: 25, status: 'with_customer', custId: 2 },
            { serial: 'CYL-2024-0005', type: 'Industrial 50kg', capacity: 50, status: 'available', custId: null }
        ];

        cylinders.forEach(cyl => {
            insertCylinder.run(uuidv4(), cyl.serial, cyl.type, cyl.capacity, cyl.status, cyl.custId, 'Warehouse');
        });

        console.log('Sample cylinders created successfully');

        console.log('\n========================================');
        console.log('Database seeding completed successfully!');
        console.log('========================================');
        console.log('\nDefault login credentials:');
        console.log('  Admin:   admin / admin123');
        console.log('  Manager: manager / manager123');
        console.log('  Staff:   staff / staff123');
        console.log('  Driver:  driver1 / driver123');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seedDatabase();
