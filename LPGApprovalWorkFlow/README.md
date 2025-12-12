# LPG Approval Workflow - CRM System

A comprehensive CRM and Approval Workflow Management System for LPG (Liquefied Petroleum Gas) distribution businesses in Dubai/UAE.

## Features

### Core CRM Features
- **Customer Management**: Manage customer profiles, credit limits, and payment terms
- **Product Catalog**: LPG cylinders, bulk LPG, accessories, and services
- **Order Management**: Create, track, and manage sales orders
- **Payment Tracking**: Record and track customer payments

### Approval Workflow
- **Configurable Workflows**: Create multi-stage approval workflows
- **Role-based Approvals**: Assign approvers by role or specific user
- **Amount-based Routing**: Route approvals based on transaction amounts
- **Notification System**: Real-time notifications for pending approvals

### Delivery & Operations
- **Delivery Scheduling**: Schedule and track deliveries
- **Driver Assignment**: Assign drivers and vehicles to deliveries
- **Cylinder Tracking**: Track LPG cylinders with serial numbers

### Dashboard & Reports
- **Real-time Statistics**: Overview of business metrics
- **Recent Orders**: Quick view of latest orders
- **Pending Approvals**: Track items awaiting approval

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: Microsoft SQL Server
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: HTML5, CSS3, Bootstrap 5, Vanilla JavaScript
- **Security**: bcrypt for password hashing

## Prerequisites

- Node.js 16.x or higher
- Microsoft SQL Server 2019 or higher
- npm (Node Package Manager)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LPGApprovalWorkFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your SQL Server credentials:
   ```env
   DB_SERVER=localhost
   DB_PORT=1433
   DB_USER=sa
   DB_PASSWORD=YourPassword123
   DB_NAME=LPGWorkflowDB
   DB_ENCRYPT=false
   DB_TRUST_SERVER_CERTIFICATE=true

   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Seed sample data (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   npm start
   ```

7. **Access the application**

   Open your browser and navigate to: `http://localhost:3000`

## Default Login Credentials

After running the seed script, you can login with:

| Role    | Username | Password    |
|---------|----------|-------------|
| Admin   | admin    | admin123    |
| Manager | manager  | manager123  |
| Staff   | staff    | staff123    |
| Driver  | driver1  | driver123   |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Customers
- `GET /api/customers` - List customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product (Manager/Admin)

### Orders
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status

### Approval Workflows
- `GET /api/workflows` - List workflows
- `GET /api/workflows/:id` - Get workflow details
- `POST /api/workflows` - Create workflow (Admin only)

### Approval Requests
- `GET /api/approvals` - List approval requests
- `POST /api/approvals` - Create approval request
- `POST /api/approvals/:id/action` - Approve/Reject/Return

### Deliveries
- `GET /api/deliveries` - List deliveries
- `POST /api/deliveries` - Schedule delivery
- `PUT /api/deliveries/:id/status` - Update delivery status

### Cylinders
- `GET /api/cylinders` - List cylinders
- `POST /api/cylinders` - Register cylinder

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Record payment

### Dashboard
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/recent-orders` - Get recent orders
- `GET /api/dashboard/pending-approvals` - Get pending approvals

### Users
- `GET /api/users` - List users (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)

## Project Structure

```
LPGApprovalWorkFlow/
├── public/
│   ├── index.html      # Main HTML file
│   └── app.js          # Frontend JavaScript
├── database.js         # Database configuration and schema
├── server.js           # Express server and API routes
├── seed-data.js        # Sample data seeding script
├── package.json        # Node.js dependencies
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- SQL injection prevention with parameterized queries
- Input validation

## Database Schema

The system includes the following main tables:
- Users
- Customers
- Products
- Orders & OrderItems
- ApprovalWorkflows & ApprovalStages
- ApprovalRequests & ApprovalHistory
- DeliverySchedules
- CylinderTracking
- Payments
- ActivityLogs
- Notifications

## License

ISC

## Support

For support and queries, please contact the system administrator.
