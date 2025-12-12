// LPG Approval Workflow - Frontend Application
const API_BASE = '/api';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// Utility Functions
function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toastNotification');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');

    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toast.classList.remove('bg-success', 'bg-danger', 'bg-warning');
    if (type === 'error') toast.classList.add('bg-danger', 'text-white');
    else if (type === 'warning') toast.classList.add('bg-warning');

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

async function apiRequest(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                logout();
            }
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED'
    }).format(amount || 0);
}

function getStatusBadge(status) {
    const badges = {
        'pending': 'badge-pending',
        'approved': 'badge-approved',
        'rejected': 'badge-rejected',
        'processing': 'badge-processing',
        'delivered': 'badge-delivered',
        'active': 'badge-approved',
        'inactive': 'badge-rejected',
        'draft': 'badge-pending',
        'paid': 'badge-approved',
        'partial': 'badge-pending',
        'scheduled': 'badge-pending',
        'in_transit': 'badge-processing',
        'available': 'badge-approved',
        'with_customer': 'badge-processing',
        'returned': 'badge-pending'
    };
    return badges[status] || 'badge-pending';
}

// Authentication Functions
function checkAuth() {
    if (authToken && currentUser) {
        showMainApp();
        loadDashboard();
    } else {
        showLoginPage();
    }
}

function showLoginPage() {
    document.getElementById('loginPage').classList.remove('d-none');
    document.getElementById('mainApp').classList.add('d-none');
}

function showMainApp() {
    document.getElementById('loginPage').classList.add('d-none');
    document.getElementById('mainApp').classList.remove('d-none');
    document.getElementById('currentUserName').textContent = currentUser?.full_name || 'User';
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showLoginPage();
}

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        errorDiv.classList.add('d-none');
        showMainApp();
        loadDashboard();
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('d-none');
    }
});

// Navigation
function showPage(pageName) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    document.getElementById(`${pageName}Section`).classList.add('active');
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

    const titles = {
        'dashboard': 'Dashboard',
        'customers': 'Customers',
        'products': 'Products',
        'orders': 'Orders',
        'approvals': 'Approvals',
        'workflows': 'Workflows',
        'deliveries': 'Deliveries',
        'cylinders': 'Cylinders',
        'payments': 'Payments',
        'users': 'Users'
    };
    document.getElementById('pageTitle').textContent = titles[pageName] || 'Dashboard';

    // Load data for the page
    switch (pageName) {
        case 'dashboard': loadDashboard(); break;
        case 'customers': loadCustomers(); break;
        case 'products': loadProducts(); break;
        case 'orders': loadOrders(); break;
        case 'approvals': loadApprovals(); break;
        case 'workflows': loadWorkflows(); break;
        case 'deliveries': loadDeliveries(); break;
        case 'cylinders': loadCylinders(); break;
        case 'payments': loadPayments(); break;
        case 'users': loadUsers(); break;
    }
}

document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        const page = item.getAttribute('data-page');
        showPage(page);
    });
});

// Dashboard Functions
async function loadDashboard() {
    try {
        const stats = await apiRequest('/dashboard/stats');
        document.getElementById('statCustomers').textContent = stats.totalCustomers;
        document.getElementById('statOrders').textContent = stats.totalOrders;
        document.getElementById('statPending').textContent = stats.pendingOrders;
        document.getElementById('statApprovals').textContent = stats.pendingApprovals;
        document.getElementById('statDeliveries').textContent = stats.todayDeliveries;
        document.getElementById('statRevenue').textContent = formatCurrency(stats.monthlyRevenue).replace('AED', '');

        // Load recent orders
        const recentOrders = await apiRequest('/dashboard/recent-orders');
        const ordersTable = document.getElementById('recentOrdersTable');
        ordersTable.innerHTML = recentOrders.map(order => `
            <tr>
                <td><strong>${order.OrderNumber}</strong></td>
                <td>${order.CustomerName}</td>
                <td>${formatCurrency(order.NetAmount)}</td>
                <td><span class="badge-status ${getStatusBadge(order.OrderStatus)}">${order.OrderStatus}</span></td>
                <td>${formatDate(order.OrderDate)}</td>
            </tr>
        `).join('') || '<tr><td colspan="5" class="text-center text-muted">No orders yet</td></tr>';

        // Load pending approvals
        const pendingApprovals = await apiRequest('/dashboard/pending-approvals');
        const approvalsList = document.getElementById('pendingApprovalsList');
        approvalsList.innerHTML = pendingApprovals.map(approval => `
            <a href="#" class="list-group-item list-group-item-action">
                <div class="d-flex justify-content-between">
                    <strong>${approval.RequestNumber}</strong>
                    <small class="text-muted">${formatDate(approval.RequestedAt)}</small>
                </div>
                <small class="text-muted">${approval.WorkflowName} - ${approval.RequesterName}</small>
            </a>
        `).join('') || '<div class="p-3 text-center text-muted">No pending approvals</div>';

    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

// Customers Functions
async function loadCustomers() {
    try {
        const data = await apiRequest('/customers');
        const table = document.getElementById('customersTable');
        table.innerHTML = data.customers.map(customer => `
            <tr>
                <td><strong>${customer.CustomerCode}</strong></td>
                <td>${customer.CompanyName}</td>
                <td>${customer.ContactPerson || '-'}</td>
                <td>${customer.Phone || '-'}</td>
                <td><span class="badge bg-secondary">${customer.CustomerType}</span></td>
                <td><span class="badge-status ${getStatusBadge(customer.Status)}">${customer.Status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewCustomer(${customer.Id})">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="editCustomer(${customer.Id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="7" class="text-center text-muted">No customers found</td></tr>';
    } catch (error) {
        showToast('Error', 'Failed to load customers', 'error');
    }
}

document.getElementById('customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        await apiRequest('/customers', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        bootstrap.Modal.getInstance(document.getElementById('customerModal')).hide();
        e.target.reset();
        showToast('Success', 'Customer created successfully');
        loadCustomers();
    } catch (error) {
        showToast('Error', error.message, 'error');
    }
});

// Products Functions
async function loadProducts() {
    try {
        const products = await apiRequest('/products');
        const table = document.getElementById('productsTable');
        table.innerHTML = products.map(product => `
            <tr>
                <td><strong>${product.ProductCode}</strong></td>
                <td>${product.ProductName}</td>
                <td><span class="badge bg-info">${product.Category}</span></td>
                <td>${product.Unit}</td>
                <td>${formatCurrency(product.UnitPrice)}</td>
                <td>${product.CurrentStock}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="7" class="text-center text-muted">No products found</td></tr>';
    } catch (error) {
        showToast('Error', 'Failed to load products', 'error');
    }
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        await apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
        e.target.reset();
        showToast('Success', 'Product created successfully');
        loadProducts();
    } catch (error) {
        showToast('Error', error.message, 'error');
    }
});

// Orders Functions
async function loadOrders() {
    try {
        const data = await apiRequest('/orders');
        const table = document.getElementById('ordersTable');
        table.innerHTML = data.orders.map(order => `
            <tr>
                <td><strong>${order.OrderNumber}</strong></td>
                <td>${order.CustomerName}</td>
                <td>${formatDate(order.OrderDate)}</td>
                <td>${formatCurrency(order.NetAmount)}</td>
                <td><span class="badge-status ${getStatusBadge(order.PaymentStatus)}">${order.PaymentStatus}</span></td>
                <td><span class="badge-status ${getStatusBadge(order.OrderStatus)}">${order.OrderStatus}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewOrder(${order.Id})">
                        <i class="bi bi-eye"></i>
                    </button>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                            Status
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" onclick="updateOrderStatus(${order.Id}, 'pending')">Pending</a></li>
                            <li><a class="dropdown-item" onclick="updateOrderStatus(${order.Id}, 'approved')">Approved</a></li>
                            <li><a class="dropdown-item" onclick="updateOrderStatus(${order.Id}, 'processing')">Processing</a></li>
                            <li><a class="dropdown-item" onclick="updateOrderStatus(${order.Id}, 'delivered')">Delivered</a></li>
                            <li><a class="dropdown-item" onclick="updateOrderStatus(${order.Id}, 'cancelled')">Cancelled</a></li>
                        </ul>
                    </div>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="7" class="text-center text-muted">No orders found</td></tr>';
    } catch (error) {
        showToast('Error', 'Failed to load orders', 'error');
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        await apiRequest(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        showToast('Success', 'Order status updated');
        loadOrders();
    } catch (error) {
        showToast('Error', error.message, 'error');
    }
}

// Approvals Functions
async function loadApprovals() {
    try {
        const approvals = await apiRequest('/approvals');
        const table = document.getElementById('approvalsTable');
        table.innerHTML = approvals.map(approval => `
            <tr>
                <td><strong>${approval.RequestNumber}</strong></td>
                <td>${approval.WorkflowName}</td>
                <td>${approval.ReferenceType} #${approval.ReferenceId}</td>
                <td>${approval.RequesterName}</td>
                <td>Stage ${approval.CurrentStage}</td>
                <td><span class="badge-status ${getStatusBadge(approval.Status)}">${approval.Status}</span></td>
                <td>
                    ${approval.Status === 'pending' ? `
                        <button class="btn btn-sm btn-success" onclick="approveRequest(${approval.Id})">
                            <i class="bi bi-check"></i> Approve
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="rejectRequest(${approval.Id})">
                            <i class="bi bi-x"></i> Reject
                        </button>
                    ` : '-'}
                </td>
            </tr>
        `).join('') || '<tr><td colspan="7" class="text-center text-muted">No approval requests</td></tr>';
    } catch (error) {
        showToast('Error', 'Failed to load approvals', 'error');
    }
}

async function approveRequest(id) {
    try {
        await apiRequest(`/approvals/${id}/action`, {
            method: 'POST',
            body: JSON.stringify({ action: 'approve' })
        });
        showToast('Success', 'Request approved');
        loadApprovals();
        loadDashboard();
    } catch (error) {
        showToast('Error', error.message, 'error');
    }
}

async function rejectRequest(id) {
    const comments = prompt('Enter rejection reason:');
    if (comments === null) return;

    try {
        await apiRequest(`/approvals/${id}/action`, {
            method: 'POST',
            body: JSON.stringify({ action: 'reject', comments })
        });
        showToast('Success', 'Request rejected');
        loadApprovals();
        loadDashboard();
    } catch (error) {
        showToast('Error', error.message, 'error');
    }
}

// Workflows Functions
async function loadWorkflows() {
    try {
        const workflows = await apiRequest('/workflows');
        const grid = document.getElementById('workflowsGrid');
        grid.innerHTML = workflows.map(workflow => `
            <div class="col-md-6 col-lg-4">
                <div class="card card-custom h-100">
                    <div class="card-body">
                        <h5 class="card-title">${workflow.WorkflowName}</h5>
                        <p class="text-muted">${workflow.Description || 'No description'}</p>
                        <span class="badge bg-primary">${workflow.WorkflowType}</span>
                    </div>
                    <div class="card-footer bg-white">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewWorkflow(${workflow.Id})">
                            <i class="bi bi-eye me-1"></i>View Details
                        </button>
                    </div>
                </div>
            </div>
        `).join('') || '<div class="col-12 text-center text-muted">No workflows configured</div>';
    } catch (error) {
        showToast('Error', 'Failed to load workflows', 'error');
    }
}

// Deliveries Functions
async function loadDeliveries() {
    try {
        const deliveries = await apiRequest('/deliveries');
        const table = document.getElementById('deliveriesTable');
        table.innerHTML = deliveries.map(delivery => `
            <tr>
                <td><strong>${delivery.OrderNumber}</strong></td>
                <td>${delivery.CustomerName}</td>
                <td>${formatDate(delivery.ScheduledDate)}</td>
                <td>${delivery.ScheduledTimeSlot || '-'}</td>
                <td>${delivery.DriverName || 'Not assigned'}</td>
                <td><span class="badge-status ${getStatusBadge(delivery.Status)}">${delivery.Status}</span></td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                            Update
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" onclick="updateDeliveryStatus(${delivery.Id}, 'in_transit')">In Transit</a></li>
                            <li><a class="dropdown-item" onclick="updateDeliveryStatus(${delivery.Id}, 'delivered')">Delivered</a></li>
                            <li><a class="dropdown-item" onclick="updateDeliveryStatus(${delivery.Id}, 'failed')">Failed</a></li>
                        </ul>
                    </div>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="7" class="text-center text-muted">No deliveries scheduled</td></tr>';
    } catch (error) {
        showToast('Error', 'Failed to load deliveries', 'error');
    }
}

async function updateDeliveryStatus(id, status) {
    try {
        await apiRequest(`/deliveries/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        showToast('Success', 'Delivery status updated');
        loadDeliveries();
    } catch (error) {
        showToast('Error', error.message, 'error');
    }
}

// Cylinders Functions
async function loadCylinders() {
    try {
        const cylinders = await apiRequest('/cylinders');
        const table = document.getElementById('cylindersTable');
        table.innerHTML = cylinders.map(cylinder => `
            <tr>
                <td><strong>${cylinder.CylinderSerial}</strong></td>
                <td>${cylinder.CylinderType}</td>
                <td>${cylinder.Capacity} kg</td>
                <td>${cylinder.CustomerName || '-'}</td>
                <td>${cylinder.Location || '-'}</td>
                <td><span class="badge-status ${getStatusBadge(cylinder.Status)}">${cylinder.Status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="7" class="text-center text-muted">No cylinders registered</td></tr>';
    } catch (error) {
        showToast('Error', 'Failed to load cylinders', 'error');
    }
}

// Payments Functions
async function loadPayments() {
    try {
        const payments = await apiRequest('/payments');
        const table = document.getElementById('paymentsTable');
        table.innerHTML = payments.map(payment => `
            <tr>
                <td><strong>${payment.PaymentNumber}</strong></td>
                <td>${payment.CustomerName}</td>
                <td>${payment.OrderNumber || '-'}</td>
                <td>${formatCurrency(payment.Amount)}</td>
                <td><span class="badge bg-secondary">${payment.PaymentMethod}</span></td>
                <td>${formatDate(payment.PaymentDate)}</td>
                <td><span class="badge-status ${getStatusBadge(payment.Status)}">${payment.Status}</span></td>
            </tr>
        `).join('') || '<tr><td colspan="7" class="text-center text-muted">No payments recorded</td></tr>';
    } catch (error) {
        showToast('Error', 'Failed to load payments', 'error');
    }
}

// Users Functions
async function loadUsers() {
    try {
        const users = await apiRequest('/users');
        const table = document.getElementById('usersTable');
        table.innerHTML = users.map(user => `
            <tr>
                <td><strong>${user.Username}</strong></td>
                <td>${user.FullName}</td>
                <td>${user.Email}</td>
                <td><span class="badge bg-primary">${user.Role}</span></td>
                <td>${user.Department || '-'}</td>
                <td><span class="badge-status ${user.IsActive ? 'badge-approved' : 'badge-rejected'}">${user.IsActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="7" class="text-center text-muted">No users found</td></tr>';
    } catch (error) {
        if (error.message.includes('permissions')) {
            document.getElementById('usersTable').innerHTML = '<tr><td colspan="7" class="text-center text-muted">Admin access required</td></tr>';
        } else {
            showToast('Error', 'Failed to load users', 'error');
        }
    }
}

document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
        e.target.reset();
        showToast('Success', 'User created successfully');
        loadUsers();
    } catch (error) {
        showToast('Error', error.message, 'error');
    }
});

// Event Listeners
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});

document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('show');
});

// Search handlers
document.getElementById('customerSearch')?.addEventListener('input', debounce(async (e) => {
    const search = e.target.value;
    try {
        const data = await apiRequest(`/customers?search=${encodeURIComponent(search)}`);
        // Update table...
        loadCustomers();
    } catch (error) {
        console.error(error);
    }
}, 300));

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize
checkAuth();
