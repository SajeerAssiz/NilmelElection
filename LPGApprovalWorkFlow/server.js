const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, initializeDatabase } = require('./database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'lpg-workflow-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
initializeDatabase();

// ==================== Authentication Middleware ====================
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
}

// ==================== Utility Functions ====================
function generateCode(prefix, length = 6) {
    const num = Math.floor(Math.random() * Math.pow(10, length));
    return `${prefix}${num.toString().padStart(length, '0')}`;
}

function logActivity(userId, action, entityType, entityId, oldValues = null, newValues = null) {
    const stmt = db.prepare(`
        INSERT INTO activity_logs (user_id, action, entity_type, entity_id, old_values, new_values)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(userId, action, entityType, entityId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null
    );
}

function createNotification(userId, title, message, type = 'info', refType = null, refId = null) {
    const stmt = db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(userId, title, message, type, refType, refId);
}

// ==================== Auth Routes ====================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, full_name, role, department, phone } = req.body;

        if (!username || !email || !password || !full_name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const uuid = uuidv4();

        const stmt = db.prepare(`
            INSERT INTO users (uuid, username, email, password_hash, full_name, role, department, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(uuid, username, email, passwordHash, full_name, role || 'staff', department, phone);

        res.status(201).json({
            message: 'User registered successfully',
            userId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, uuid: user.uuid, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                uuid: user.uuid,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                department: user.department
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// ==================== Customer Routes ====================
app.get('/api/customers', authenticateToken, (req, res) => {
    try {
        const { search, status, type, page = 1, limit = 20 } = req.query;
        let query = 'SELECT * FROM customers WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (company_name LIKE ? OR customer_code LIKE ? OR contact_person LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        if (type) {
            query += ' AND customer_type = ?';
            params.push(type);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        const customers = db.prepare(query).all(...params);
        const total = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;

        res.json({ customers, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

app.get('/api/customers/:id', authenticateToken, (req, res) => {
    try {
        const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
});

app.post('/api/customers', authenticateToken, (req, res) => {
    try {
        const {
            company_name, contact_person, email, phone, mobile, address, city, emirate,
            trade_license_no, tax_registration_no, customer_type, credit_limit, payment_terms, notes
        } = req.body;

        if (!company_name) {
            return res.status(400).json({ error: 'Company name is required' });
        }

        const uuid = uuidv4();
        const customerCode = generateCode('CUS');

        const stmt = db.prepare(`
            INSERT INTO customers (
                uuid, customer_code, company_name, contact_person, email, phone, mobile,
                address, city, emirate, trade_license_no, tax_registration_no, customer_type,
                credit_limit, payment_terms, notes, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            uuid, customerCode, company_name, contact_person, email, phone, mobile,
            address, city, emirate, trade_license_no, tax_registration_no,
            customer_type || 'retail', credit_limit || 0, payment_terms || 30, notes, req.user.id
        );

        logActivity(req.user.id, 'CREATE', 'customer', result.lastInsertRowid, null, { company_name, customerCode });

        res.status(201).json({
            message: 'Customer created successfully',
            customerId: result.lastInsertRowid,
            customerCode
        });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Failed to create customer' });
    }
});

app.put('/api/customers/:id', authenticateToken, (req, res) => {
    try {
        const {
            company_name, contact_person, email, phone, mobile, address, city, emirate,
            trade_license_no, tax_registration_no, customer_type, credit_limit, payment_terms, status, notes
        } = req.body;

        const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const stmt = db.prepare(`
            UPDATE customers SET
                company_name = ?, contact_person = ?, email = ?, phone = ?, mobile = ?,
                address = ?, city = ?, emirate = ?, trade_license_no = ?, tax_registration_no = ?,
                customer_type = ?, credit_limit = ?, payment_terms = ?, status = ?, notes = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        stmt.run(
            company_name, contact_person, email, phone, mobile, address, city, emirate,
            trade_license_no, tax_registration_no, customer_type, credit_limit, payment_terms,
            status, notes, req.params.id
        );

        logActivity(req.user.id, 'UPDATE', 'customer', req.params.id, existing, req.body);

        res.json({ message: 'Customer updated successfully' });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Failed to update customer' });
    }
});

// ==================== Product Routes ====================
app.get('/api/products', authenticateToken, (req, res) => {
    try {
        const { search, category, active } = req.query;
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (product_name LIKE ? OR product_code LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        if (active !== undefined) {
            query += ' AND is_active = ?';
            params.push(active === 'true' ? 1 : 0);
        }

        query += ' ORDER BY product_name';
        const products = db.prepare(query).all(...params);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/api/products', authenticateToken, requireRole('admin', 'manager'), (req, res) => {
    try {
        const { product_name, description, category, unit, unit_price, cost_price, min_stock_level } = req.body;

        if (!product_name || !category || !unit || !unit_price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const uuid = uuidv4();
        const productCode = generateCode('PRD');

        const stmt = db.prepare(`
            INSERT INTO products (uuid, product_code, product_name, description, category, unit, unit_price, cost_price, min_stock_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(uuid, productCode, product_name, description, category, unit, unit_price, cost_price, min_stock_level || 0);

        res.status(201).json({
            message: 'Product created successfully',
            productId: result.lastInsertRowid,
            productCode
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// ==================== Order Routes ====================
app.get('/api/orders', authenticateToken, (req, res) => {
    try {
        const { search, status, customer_id, from_date, to_date, page = 1, limit = 20 } = req.query;
        let query = `
            SELECT o.*, c.company_name as customer_name, c.customer_code
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            query += ' AND (o.order_number LIKE ? OR c.company_name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (status) {
            query += ' AND o.order_status = ?';
            params.push(status);
        }
        if (customer_id) {
            query += ' AND o.customer_id = ?';
            params.push(customer_id);
        }
        if (from_date) {
            query += ' AND DATE(o.order_date) >= ?';
            params.push(from_date);
        }
        if (to_date) {
            query += ' AND DATE(o.order_date) <= ?';
            params.push(to_date);
        }

        query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        const orders = db.prepare(query).all(...params);
        const total = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;

        res.json({ orders, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.get('/api/orders/:id', authenticateToken, (req, res) => {
    try {
        const order = db.prepare(`
            SELECT o.*, c.company_name as customer_name, c.customer_code, c.address as customer_address
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE o.id = ?
        `).get(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const items = db.prepare(`
            SELECT oi.*, p.product_name, p.product_code
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `).all(req.params.id);

        res.json({ ...order, items });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

app.post('/api/orders', authenticateToken, (req, res) => {
    try {
        const { customer_id, delivery_date, delivery_address, items, notes, priority } = req.body;

        if (!customer_id || !items || items.length === 0) {
            return res.status(400).json({ error: 'Customer and items are required' });
        }

        const uuid = uuidv4();
        const orderNumber = generateCode('ORD');

        // Calculate totals
        let totalAmount = 0;
        let taxAmount = 0;

        items.forEach(item => {
            const lineTotal = item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);
            const lineTax = lineTotal * (item.tax_percent || 5) / 100;
            totalAmount += lineTotal;
            taxAmount += lineTax;
        });

        const netAmount = totalAmount + taxAmount;

        // Insert order
        const orderStmt = db.prepare(`
            INSERT INTO orders (
                uuid, order_number, customer_id, delivery_date, delivery_address,
                total_amount, tax_amount, net_amount, notes, priority, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const orderResult = orderStmt.run(
            uuid, orderNumber, customer_id, delivery_date, delivery_address,
            totalAmount, taxAmount, netAmount, notes, priority || 'normal', req.user.id
        );

        const orderId = orderResult.lastInsertRowid;

        // Insert order items
        const itemStmt = db.prepare(`
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, discount_percent, tax_percent, line_total)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        items.forEach(item => {
            const lineTotal = item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);
            itemStmt.run(orderId, item.product_id, item.quantity, item.unit_price, item.discount_percent || 0, item.tax_percent || 5, lineTotal);
        });

        logActivity(req.user.id, 'CREATE', 'order', orderId, null, { orderNumber, customer_id, netAmount });

        res.status(201).json({
            message: 'Order created successfully',
            orderId,
            orderNumber
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

app.put('/api/orders/:id/status', authenticateToken, (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['draft', 'pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Order not found' });
        }

        db.prepare('UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run(status, req.params.id);

        logActivity(req.user.id, 'UPDATE_STATUS', 'order', req.params.id, { status: existing.order_status }, { status });

        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// ==================== Approval Workflow Routes ====================
app.get('/api/workflows', authenticateToken, (req, res) => {
    try {
        const workflows = db.prepare('SELECT * FROM approval_workflows WHERE is_active = 1').all();
        res.json(workflows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch workflows' });
    }
});

app.get('/api/workflows/:id', authenticateToken, (req, res) => {
    try {
        const workflow = db.prepare('SELECT * FROM approval_workflows WHERE id = ?').get(req.params.id);
        if (!workflow) {
            return res.status(404).json({ error: 'Workflow not found' });
        }

        const stages = db.prepare(`
            SELECT s.*, u.full_name as approver_name
            FROM approval_stages s
            LEFT JOIN users u ON s.approver_id = u.id
            WHERE s.workflow_id = ?
            ORDER BY s.stage_order
        `).all(req.params.id);

        res.json({ ...workflow, stages });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch workflow' });
    }
});

app.post('/api/workflows', authenticateToken, requireRole('admin'), (req, res) => {
    try {
        const { workflow_name, workflow_type, description, stages } = req.body;

        if (!workflow_name || !workflow_type) {
            return res.status(400).json({ error: 'Workflow name and type are required' });
        }

        const uuid = uuidv4();

        const workflowStmt = db.prepare(`
            INSERT INTO approval_workflows (uuid, workflow_name, workflow_type, description)
            VALUES (?, ?, ?, ?)
        `);
        const workflowResult = workflowStmt.run(uuid, workflow_name, workflow_type, description);
        const workflowId = workflowResult.lastInsertRowid;

        if (stages && stages.length > 0) {
            const stageStmt = db.prepare(`
                INSERT INTO approval_stages (workflow_id, stage_order, stage_name, approver_role, approver_id, min_amount, max_amount, is_mandatory)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            stages.forEach((stage, index) => {
                stageStmt.run(
                    workflowId, index + 1, stage.stage_name, stage.approver_role,
                    stage.approver_id, stage.min_amount || 0, stage.max_amount, stage.is_mandatory !== false ? 1 : 0
                );
            });
        }

        res.status(201).json({
            message: 'Workflow created successfully',
            workflowId
        });
    } catch (error) {
        console.error('Error creating workflow:', error);
        res.status(500).json({ error: 'Failed to create workflow' });
    }
});

// ==================== Approval Request Routes ====================
app.get('/api/approvals', authenticateToken, (req, res) => {
    try {
        const { status, my_approvals } = req.query;
        let query = `
            SELECT ar.*, aw.workflow_name, u.full_name as requester_name
            FROM approval_requests ar
            JOIN approval_workflows aw ON ar.workflow_id = aw.id
            JOIN users u ON ar.requested_by = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND ar.status = ?';
            params.push(status);
        }

        if (my_approvals === 'true') {
            query += ` AND EXISTS (
                SELECT 1 FROM approval_stages s
                WHERE s.workflow_id = ar.workflow_id
                AND s.stage_order = ar.current_stage
                AND (s.approver_id = ? OR s.approver_role = ?)
            )`;
            params.push(req.user.id, req.user.role);
        }

        query += ' ORDER BY ar.requested_at DESC';
        const requests = db.prepare(query).all(...params);
        res.json(requests);
    } catch (error) {
        console.error('Error fetching approvals:', error);
        res.status(500).json({ error: 'Failed to fetch approval requests' });
    }
});

app.post('/api/approvals', authenticateToken, (req, res) => {
    try {
        const { workflow_id, reference_type, reference_id, notes } = req.body;

        if (!workflow_id || !reference_type || !reference_id) {
            return res.status(400).json({ error: 'Workflow, reference type and ID are required' });
        }

        const uuid = uuidv4();
        const requestNumber = generateCode('APR');

        const stmt = db.prepare(`
            INSERT INTO approval_requests (uuid, request_number, workflow_id, reference_type, reference_id, requested_by, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(uuid, requestNumber, workflow_id, reference_type, reference_id, req.user.id, notes);

        // Notify approvers of first stage
        const firstStage = db.prepare(`
            SELECT * FROM approval_stages WHERE workflow_id = ? AND stage_order = 1
        `).get(workflow_id);

        if (firstStage && firstStage.approver_id) {
            createNotification(firstStage.approver_id, 'New Approval Request',
                `Request ${requestNumber} requires your approval`, 'approval', 'approval_request', result.lastInsertRowid);
        }

        res.status(201).json({
            message: 'Approval request created successfully',
            requestId: result.lastInsertRowid,
            requestNumber
        });
    } catch (error) {
        console.error('Error creating approval request:', error);
        res.status(500).json({ error: 'Failed to create approval request' });
    }
});

app.post('/api/approvals/:id/action', authenticateToken, (req, res) => {
    try {
        const { action, comments } = req.body;
        const validActions = ['approve', 'reject', 'return'];

        if (!validActions.includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        const request = db.prepare('SELECT * FROM approval_requests WHERE id = ?').get(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Approval request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ error: 'Request is not pending approval' });
        }

        const currentStage = db.prepare(`
            SELECT * FROM approval_stages WHERE workflow_id = ? AND stage_order = ?
        `).get(request.workflow_id, request.current_stage);

        // Verify user can approve this stage
        if (currentStage.approver_id && currentStage.approver_id !== req.user.id) {
            if (currentStage.approver_role !== req.user.role) {
                return res.status(403).json({ error: 'You are not authorized to approve this request' });
            }
        }

        const previousStatus = request.status;
        let newStatus = 'pending';
        let newStage = request.current_stage;

        if (action === 'approve') {
            const nextStage = db.prepare(`
                SELECT * FROM approval_stages WHERE workflow_id = ? AND stage_order = ?
            `).get(request.workflow_id, request.current_stage + 1);

            if (nextStage) {
                newStage = request.current_stage + 1;
                if (nextStage.approver_id) {
                    createNotification(nextStage.approver_id, 'Approval Request Forwarded',
                        `Request ${request.request_number} requires your approval`, 'approval', 'approval_request', request.id);
                }
            } else {
                newStatus = 'approved';
            }
        } else if (action === 'reject') {
            newStatus = 'rejected';
        } else if (action === 'return') {
            newStatus = 'returned';
        }

        // Update request
        db.prepare(`
            UPDATE approval_requests
            SET status = ?, current_stage = ?, completed_at = CASE WHEN ? IN ('approved', 'rejected') THEN CURRENT_TIMESTAMP ELSE NULL END
            WHERE id = ?
        `).run(newStatus, newStage, newStatus, req.params.id);

        // Record history
        db.prepare(`
            INSERT INTO approval_history (request_id, stage_id, action, action_by, comments, previous_status, new_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(req.params.id, currentStage.id, action, req.user.id, comments, previousStatus, newStatus);

        // Notify requester
        createNotification(request.requested_by, `Approval ${action.charAt(0).toUpperCase() + action.slice(1)}d`,
            `Your request ${request.request_number} has been ${action}d`, 'approval', 'approval_request', request.id);

        res.json({ message: `Request ${action}d successfully`, status: newStatus });
    } catch (error) {
        console.error('Error processing approval:', error);
        res.status(500).json({ error: 'Failed to process approval' });
    }
});

// ==================== Delivery Schedule Routes ====================
app.get('/api/deliveries', authenticateToken, (req, res) => {
    try {
        const { date, status, driver_id } = req.query;
        let query = `
            SELECT ds.*, o.order_number, c.company_name as customer_name, u.full_name as driver_name
            FROM delivery_schedules ds
            JOIN orders o ON ds.order_id = o.id
            JOIN customers c ON o.customer_id = c.id
            LEFT JOIN users u ON ds.driver_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (date) {
            query += ' AND ds.scheduled_date = ?';
            params.push(date);
        }
        if (status) {
            query += ' AND ds.status = ?';
            params.push(status);
        }
        if (driver_id) {
            query += ' AND ds.driver_id = ?';
            params.push(driver_id);
        }

        query += ' ORDER BY ds.scheduled_date, ds.scheduled_time_slot';
        const deliveries = db.prepare(query).all(...params);
        res.json(deliveries);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
});

app.post('/api/deliveries', authenticateToken, (req, res) => {
    try {
        const { order_id, scheduled_date, scheduled_time_slot, driver_id, vehicle_number, route, notes } = req.body;

        if (!order_id || !scheduled_date) {
            return res.status(400).json({ error: 'Order ID and scheduled date are required' });
        }

        const uuid = uuidv4();

        const stmt = db.prepare(`
            INSERT INTO delivery_schedules (uuid, order_id, scheduled_date, scheduled_time_slot, driver_id, vehicle_number, route, delivery_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(uuid, order_id, scheduled_date, scheduled_time_slot, driver_id, vehicle_number, route, notes);

        res.status(201).json({
            message: 'Delivery scheduled successfully',
            deliveryId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Error scheduling delivery:', error);
        res.status(500).json({ error: 'Failed to schedule delivery' });
    }
});

app.put('/api/deliveries/:id/status', authenticateToken, (req, res) => {
    try {
        const { status, notes, signature } = req.body;
        const validStatuses = ['scheduled', 'in_transit', 'delivered', 'failed', 'rescheduled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        let query = 'UPDATE delivery_schedules SET status = ?, updated_at = CURRENT_TIMESTAMP';
        const params = [status];

        if (status === 'delivered') {
            query += ', actual_delivery_time = CURRENT_TIMESTAMP';
            if (signature) {
                query += ', customer_signature = ?';
                params.push(signature);
            }
        }

        if (notes) {
            query += ', delivery_notes = ?';
            params.push(notes);
        }

        query += ' WHERE id = ?';
        params.push(req.params.id);

        db.prepare(query).run(...params);

        res.json({ message: 'Delivery status updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update delivery status' });
    }
});

// ==================== Cylinder Tracking Routes ====================
app.get('/api/cylinders', authenticateToken, (req, res) => {
    try {
        const { search, status, customer_id } = req.query;
        let query = `
            SELECT ct.*, c.company_name as customer_name
            FROM cylinder_tracking ct
            LEFT JOIN customers c ON ct.customer_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            query += ' AND ct.cylinder_serial LIKE ?';
            params.push(`%${search}%`);
        }
        if (status) {
            query += ' AND ct.status = ?';
            params.push(status);
        }
        if (customer_id) {
            query += ' AND ct.customer_id = ?';
            params.push(customer_id);
        }

        query += ' ORDER BY ct.cylinder_serial';
        const cylinders = db.prepare(query).all(...params);
        res.json(cylinders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cylinders' });
    }
});

app.post('/api/cylinders', authenticateToken, (req, res) => {
    try {
        const { cylinder_serial, cylinder_type, capacity, customer_id, status, location, notes } = req.body;

        if (!cylinder_serial || !cylinder_type || !capacity) {
            return res.status(400).json({ error: 'Serial, type and capacity are required' });
        }

        const uuid = uuidv4();

        const stmt = db.prepare(`
            INSERT INTO cylinder_tracking (uuid, cylinder_serial, cylinder_type, capacity, customer_id, status, location, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(uuid, cylinder_serial, cylinder_type, capacity, customer_id, status || 'available', location, notes);

        res.status(201).json({
            message: 'Cylinder registered successfully',
            cylinderId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Error registering cylinder:', error);
        res.status(500).json({ error: 'Failed to register cylinder' });
    }
});

// ==================== Payment Routes ====================
app.get('/api/payments', authenticateToken, (req, res) => {
    try {
        const { customer_id, from_date, to_date } = req.query;
        let query = `
            SELECT p.*, c.company_name as customer_name, o.order_number
            FROM payments p
            JOIN customers c ON p.customer_id = c.id
            LEFT JOIN orders o ON p.order_id = o.id
            WHERE 1=1
        `;
        const params = [];

        if (customer_id) {
            query += ' AND p.customer_id = ?';
            params.push(customer_id);
        }
        if (from_date) {
            query += ' AND DATE(p.payment_date) >= ?';
            params.push(from_date);
        }
        if (to_date) {
            query += ' AND DATE(p.payment_date) <= ?';
            params.push(to_date);
        }

        query += ' ORDER BY p.payment_date DESC';
        const payments = db.prepare(query).all(...params);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

app.post('/api/payments', authenticateToken, (req, res) => {
    try {
        const { order_id, customer_id, amount, payment_method, reference_number, bank_name, cheque_number, cheque_date, notes } = req.body;

        if (!customer_id || !amount || !payment_method) {
            return res.status(400).json({ error: 'Customer, amount and payment method are required' });
        }

        const uuid = uuidv4();
        const paymentNumber = generateCode('PAY');

        const stmt = db.prepare(`
            INSERT INTO payments (uuid, payment_number, order_id, customer_id, amount, payment_method, reference_number, bank_name, cheque_number, cheque_date, notes, received_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(uuid, paymentNumber, order_id, customer_id, amount, payment_method, reference_number, bank_name, cheque_number, cheque_date, notes, req.user.id);

        // Update order payment status if linked to an order
        if (order_id) {
            const order = db.prepare('SELECT net_amount FROM orders WHERE id = ?').get(order_id);
            const totalPaid = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE order_id = ? AND status = ?').get(order_id, 'completed').total;

            let paymentStatus = 'pending';
            if (totalPaid >= order.net_amount) {
                paymentStatus = 'paid';
            } else if (totalPaid > 0) {
                paymentStatus = 'partial';
            }

            db.prepare('UPDATE orders SET payment_status = ? WHERE id = ?').run(paymentStatus, order_id);
        }

        res.status(201).json({
            message: 'Payment recorded successfully',
            paymentId: result.lastInsertRowid,
            paymentNumber
        });
    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({ error: 'Failed to record payment' });
    }
});

// ==================== Notification Routes ====================
app.get('/api/notifications', authenticateToken, (req, res) => {
    try {
        const { unread_only } = req.query;
        let query = 'SELECT * FROM notifications WHERE user_id = ?';
        const params = [req.user.id];

        if (unread_only === 'true') {
            query += ' AND is_read = 0';
        }

        query += ' ORDER BY created_at DESC LIMIT 50';
        const notifications = db.prepare(query).all(...params);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
    try {
        db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// ==================== Dashboard/Reports Routes ====================
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
    try {
        const stats = {
            totalCustomers: db.prepare('SELECT COUNT(*) as count FROM customers WHERE status = ?').get('active').count,
            totalOrders: db.prepare('SELECT COUNT(*) as count FROM orders').get().count,
            pendingOrders: db.prepare('SELECT COUNT(*) as count FROM orders WHERE order_status IN (?, ?)').get('pending', 'processing').count,
            pendingApprovals: db.prepare('SELECT COUNT(*) as count FROM approval_requests WHERE status = ?').get('pending').count,
            todayDeliveries: db.prepare('SELECT COUNT(*) as count FROM delivery_schedules WHERE scheduled_date = DATE(?)').get('now').count,
            monthlyRevenue: db.prepare(`
                SELECT COALESCE(SUM(net_amount), 0) as total
                FROM orders
                WHERE order_status = ? AND strftime('%Y-%m', order_date) = strftime('%Y-%m', 'now')
            `).get('delivered').total
        };
        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

app.get('/api/dashboard/recent-orders', authenticateToken, (req, res) => {
    try {
        const orders = db.prepare(`
            SELECT o.*, c.company_name as customer_name
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            ORDER BY o.created_at DESC
            LIMIT 10
        `).all();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recent orders' });
    }
});

app.get('/api/dashboard/pending-approvals', authenticateToken, (req, res) => {
    try {
        const approvals = db.prepare(`
            SELECT ar.*, aw.workflow_name, u.full_name as requester_name
            FROM approval_requests ar
            JOIN approval_workflows aw ON ar.workflow_id = aw.id
            JOIN users u ON ar.requested_by = u.id
            WHERE ar.status = ?
            ORDER BY ar.requested_at DESC
            LIMIT 10
        `).all('pending');
        res.json(approvals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending approvals' });
    }
});

// ==================== User Management Routes ====================
app.get('/api/users', authenticateToken, requireRole('admin'), (req, res) => {
    try {
        const users = db.prepare(`
            SELECT id, uuid, username, email, full_name, role, department, phone, is_active, created_at
            FROM users
            ORDER BY full_name
        `).all();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.put('/api/users/:id', authenticateToken, requireRole('admin'), (req, res) => {
    try {
        const { full_name, email, role, department, phone, is_active } = req.body;

        db.prepare(`
            UPDATE users SET full_name = ?, email = ?, role = ?, department = ?, phone = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(full_name, email, role, department, phone, is_active ? 1 : 0, req.params.id);

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`LPG Approval Workflow Server running on http://localhost:${PORT}`);
});

module.exports = app;
