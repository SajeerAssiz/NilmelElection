# Retail Cashing Up Program

A desktop application for retail cash reconciliation, connecting to Microsoft Dynamics 365 Retail Commerce database with PDF report generation.

## Features

- **Dashboard**: Real-time overview of daily sales, transactions, and payment methods
- **Cashing Up**: Count cash denominations, compare with D365 system totals, calculate variance
- **Transactions**: View and search transaction history
- **Reports**: Generate professional PDF reports
  - Daily Cashing Up Report
  - Payment Methods Breakdown
  - Transactions Report
  - Variance Report

## Tech Stack

- **Electron**: Cross-platform desktop application
- **Node.js**: Backend runtime
- **MSSQL**: SQL Server connection for D365
- **PDFMake**: PDF report generation

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Download Roboto fonts and place in `assets/fonts/`:
   - Roboto-Regular.ttf
   - Roboto-Bold.ttf
   - Roboto-Italic.ttf
   - Roboto-BoldItalic.ttf

4. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

5. Configure database connection in `.env`:
   ```
   DB_SERVER=your_server
   DB_DATABASE=your_d365_database
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_PORT=1433
   ```

## Usage

### Development
```bash
npm start
```

### Build for Production
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## D365 Tables Used

The application queries the following D365 Retail tables:
- `RETAILSTORETABLE` - Store information
- `RETAILTERMINALTABLE` - POS terminals
- `RETAILTRANSACTIONTABLE` - Transaction headers
- `RETAILTRANSACTIONPAYMENTTRANS` - Payment transactions
- `RETAILTRANSACTIONSALESTRANS` - Sales lines

## Configuration

### Database Connection

Edit the `.env` file to configure your SQL Server connection:

```env
DB_SERVER=localhost
DB_DATABASE=AxDB
DB_USER=your_username
DB_PASSWORD=your_password
DB_PORT=1433
DB_TRUSTED_CONNECTION=false
```

For Windows Authentication, set:
```env
DB_TRUSTED_CONNECTION=true
DB_DOMAIN=your_domain
```

## License

MIT
