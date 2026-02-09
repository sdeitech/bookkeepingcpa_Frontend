import React, { useEffect, useState } from 'react';
import {
  useGetQuickBooksInvoicesQuery,
  useGetQuickBooksCustomersQuery,
  useGetQuickBooksExpensesQuery,
  useGetQuickBooksProfitLossQuery,
  useGetQuickBooksBalanceSheetQuery,
  useSyncQuickBooksDataMutation
} from '../../features/quickbooks/quickbooksApi';
import './QuickBooksData.css';

const QuickBooksData = ({ activeTab }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  // API Queries
  const { 
    data: invoicesData, 
    isLoading: invoicesLoading, 
    error: invoicesError,
    refetch: refetchInvoices 
  } = useGetQuickBooksInvoicesQuery(
    { startDate: dateRange.startDate, endDate: dateRange.endDate },
    { skip: activeTab !== 'invoices' }
  );
  
  const { 
    data: customersData, 
    isLoading: customersLoading, 
    error: customersError,
    refetch: refetchCustomers 
  } = useGetQuickBooksCustomersQuery(
    { limit: 100 },
    { skip: activeTab !== 'customers' }
  );
  
  const { 
    data: expensesData, 
    isLoading: expensesLoading, 
    error: expensesError,
    refetch: refetchExpenses 
  } = useGetQuickBooksExpensesQuery(
    { startDate: dateRange.startDate, endDate: dateRange.endDate },
    { skip: activeTab !== 'expenses' }
  );
  
  const { 
    data: profitLossData, 
    isLoading: profitLossLoading, 
    error: profitLossError 
  } = useGetQuickBooksProfitLossQuery(
    { startDate: dateRange.startDate, endDate: dateRange.endDate },
    { skip: activeTab !== 'reports' }
  );
  
  const { 
    data: balanceSheetData, 
    isLoading: balanceSheetLoading, 
    error: balanceSheetError 
  } = useGetQuickBooksBalanceSheetQuery(
    { date: dateRange.endDate },
    { skip: activeTab !== 'reports' }
  );
  
  const [syncData, { isLoading: syncing }] = useSyncQuickBooksDataMutation();
  
  // Handle sync
  const handleSync = async () => {
    try {
      await syncData().unwrap();
      
      // Refetch data based on active tab
      switch(activeTab) {
        case 'invoices':
          refetchInvoices();
          break;
        case 'customers':
          refetchCustomers();
          break;
        case 'expenses':
          refetchExpenses();
          break;
        default:
          break;
      }
      
      alert('QuickBooks data synced successfully!');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Failed to sync QuickBooks data. Please try again.');
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Render loading state
  const renderLoading = () => (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading QuickBooks data...</p>
    </div>
  );
  
  // Render error state
  const renderError = (error) => (
    <div className="error-container">
      <span className="error-icon">⚠️</span>
      <p>Error loading data: {error?.data?.message || error?.message || 'Unknown error'}</p>
      <button onClick={handleSync} className="retry-btn">Retry</button>
    </div>
  );
  
  // Render Invoices Tab
  const renderInvoices = () => {
    if (invoicesLoading) return renderLoading();
    if (invoicesError) return renderError(invoicesError);
    
    const invoices = invoicesData?.data.invoices || [];
    
    return (
      <div className="data-content">
        <div className="data-header">
          <h3>Invoices</h3>
          <div className="header-actions">
            <input 
              type="date" 
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="date-input"
            />
            <span>to</span>
            <input 
              type="date" 
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="date-input"
            />
            <button 
              onClick={handleSync} 
              disabled={syncing}
              className="sync-btn"
            >
              {syncing ? 'Syncing...' : '🔄 Sync'}
            </button>
          </div>
        </div>
        
        {invoices.length === 0 ? (
          <div className="no-data">
            <p>No invoices found for the selected date range.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices?.map((invoice) => (
                  <tr key={invoice.Id}>
                    <td>{invoice.DocNumber || 'N/A'}</td>
                    <td>{invoice.CustomerRef.name|| 'N/A'}</td>
                    <td>{formatDate(invoice.TxnDate)}</td>
                    <td>{formatDate(invoice.DueDate)}</td>
                    <td>{formatCurrency(invoice.TotalAmt)}</td>
                    <td>{formatCurrency(invoice.Balance)}</td>
                    <td>
                      <span className={`status ${invoice.Balance > 0 ? 'unpaid' : 'paid'}`}>
                        {invoice.Balance > 0 ? 'Unpaid' : 'Paid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {invoices.length > 0 && (
          <div className="summary">
            <div className="summary-item">
              <span>Total Invoices:</span>
              <strong>{invoices.length}</strong>
            </div>
            <div className="summary-item">
              <span>Total Amount:</span>
              <strong>{formatCurrency(invoices.reduce((sum, inv) => sum + inv.TotalAmt, 0))}</strong>
            </div>
            <div className="summary-item">
              <span>Outstanding Balance:</span>
              <strong>{formatCurrency(invoices.reduce((sum, inv) => sum + inv.Balance, 0))}</strong>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render Customers Tab
  const renderCustomers = () => {
    if (customersLoading) return renderLoading();
    if (customersError) return renderError(customersError);
    
    const customers = customersData?.data.customers || [];
    
    return (
      <div className="data-content">
        <div className="data-header">
          <h3>Customers</h3>
          <div className="header-actions">
            <button 
              onClick={handleSync} 
              disabled={syncing}
              className="sync-btn"
            >
              {syncing ? 'Syncing...' : '🔄 Sync'}
            </button>
          </div>
        </div>
        
        {customers.length === 0 ? (
          <div className="no-data">
            <p>No customers found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {customers?.map((customer) => (
                  <tr key={customer.Id}>
                    <td>{customer.DisplayName || 'N/A'}</td>
                    <td>{customer.CompanyName || '-'}</td>
                    <td>{customer.PrimaryEmailAddr?.Address || '-'}</td>
                    <td>{customer.PrimaryPhone?.FreeFormNumber || '-'}</td>
                    <td>{formatCurrency(customer.Balance)}</td>
                    <td>
                      <span className={`status ${customer.Active ? 'active' : 'inactive'}`}>
                        {customer.Active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {customers.length > 0 && (
          <div className="summary">
            <div className="summary-item">
              <span>Total Customers:</span>
              <strong>{customers.length}</strong>
            </div>
            <div className="summary-item">
              <span>Active Customers:</span>
              <strong>{customers.filter(c => c.Active).length}</strong>
            </div>
            <div className="summary-item">
              <span>Total Outstanding:</span>
              <strong>{formatCurrency(customers.reduce((sum, c) => sum + (c.Balance || 0), 0))}</strong>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render Expenses Tab
  const renderExpenses = () => {
    if (expensesLoading) return renderLoading();
    if (expensesError) return renderError(expensesError);
    
    const expenses = expensesData?.data.expenses || [];
    
    return (
      <div className="data-content">
        <div className="data-header">
          <h3>Expenses</h3>
          <div className="header-actions">
            <input 
              type="date" 
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="date-input"
            />
            <span>to</span>
            <input 
              type="date" 
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="date-input"
            />
            <button 
              onClick={handleSync} 
              disabled={syncing}
              className="sync-btn"
            >
              {syncing ? 'Syncing...' : '🔄 Sync'}
            </button>
          </div>
        </div>
        
        {expenses.length === 0 ? (
          <div className="no-data">
            <p>No expenses found for the selected date range.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vendor</th>
                  <th>Account</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {expenses?.map((expense) => (
                  <tr key={expense.Id}>
                    <td>{formatDate(expense.TxnDate)}</td>
                    <td>{expense.VendorName || expense.EntityRef?.name || '-'}</td>
                    <td>{expense.AccountRef?.name || '-'}</td>
                    <td>{expense.PrivateNote || expense.Line?.[0]?.Description || '-'}</td>
                    <td>{formatCurrency(expense.TotalAmt)}</td>
                    <td>{expense.PaymentType || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {expenses.length > 0 && (
          <div className="summary">
            <div className="summary-item">
              <span>Total Expenses:</span>
              <strong>{expenses.length}</strong>
            </div>
            <div className="summary-item">
              <span>Total Amount:</span>
              <strong>{formatCurrency(expenses.reduce((sum, exp) => sum + exp.TotalAmt, 0))}</strong>
            </div>
            <div className="summary-item">
              <span>Average Expense:</span>
              <strong>{formatCurrency(expenses.reduce((sum, exp) => sum + exp.TotalAmt, 0) / expenses.length)}</strong>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render Reports Tab
  const renderReports = () => {
    const isLoading = profitLossLoading || balanceSheetLoading;
    const hasError = profitLossError || balanceSheetError;
    
    if (isLoading) return renderLoading();
    if (hasError) return renderError(profitLossError || balanceSheetError);
    
    return (
      <div className="data-content">
        <div className="data-header">
          <h3>Financial Reports</h3>
          <div className="header-actions">
            <input 
              type="date" 
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="date-input"
            />
            <span>to</span>
            <input 
              type="date" 
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="date-input"
            />
            <button 
              onClick={handleSync} 
              disabled={syncing}
              className="sync-btn"
            >
              {syncing ? 'Syncing...' : '🔄 Sync'}
            </button>
          </div>
        </div>
        
        <div className="reports-container">
          {/* Profit & Loss Report */}
          {profitLossData?.data && (
            <div className="report-section">
              <h4>📊 Profit & Loss Statement</h4>
              <div className="report-period">
                Period: {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}
              </div>
              <div className="report-table">
                <div className="report-row header">
                  <span>Item</span>
                  <span>Amount</span>
                </div>
                <div className="report-row">
                  <span>Total Income</span>
                  <span className="amount income">{formatCurrency(profitLossData.data.totalIncome)}</span>
                </div>
                <div className="report-row">
                  <span>Total Expenses</span>
                  <span className="amount expense">{formatCurrency(profitLossData.data.totalExpenses)}</span>
                </div>
                <div className="report-row divider">
                  <span>Net Income</span>
                  <span className={`amount ${profitLossData.data.netIncome >= 0 ? 'income' : 'expense'}`}>
                    {formatCurrency(profitLossData.data.netIncome)}
                  </span>
                </div>
                <div className="report-row">
                  <span>Profit Margin</span>
                  <span className="amount">
                    {profitLossData.data.totalIncome > 0 
                      ? `${((profitLossData.data.netIncome / profitLossData.data.totalIncome) * 100).toFixed(2)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Balance Sheet Report */}
          {balanceSheetData?.data && (
            <div className="report-section">
              <h4>📋 Balance Sheet</h4>
              <div className="report-period">
                As of: {formatDate(dateRange.endDate)}
              </div>
              <div className="report-table">
                <div className="report-row header">
                  <span>Category</span>
                  <span>Amount</span>
                </div>
                
                <div className="report-row section-header">
                  <span>Assets</span>
                  <span></span>
                </div>
                <div className="report-row">
                  <span className="indent">Current Assets</span>
                  <span className="amount">{formatCurrency(balanceSheetData.data.currentAssets)}</span>
                </div>
                <div className="report-row">
                  <span className="indent">Fixed Assets</span>
                  <span className="amount">{formatCurrency(balanceSheetData.data.fixedAssets)}</span>
                </div>
                <div className="report-row subtotal">
                  <span>Total Assets</span>
                  <span className="amount">{formatCurrency(balanceSheetData.data.totalAssets)}</span>
                </div>
                
                <div className="report-row section-header">
                  <span>Liabilities</span>
                  <span></span>
                </div>
                <div className="report-row">
                  <span className="indent">Current Liabilities</span>
                  <span className="amount">{formatCurrency(balanceSheetData.data.currentLiabilities)}</span>
                </div>
                <div className="report-row">
                  <span className="indent">Long-term Liabilities</span>
                  <span className="amount">{formatCurrency(balanceSheetData.data.longTermLiabilities)}</span>
                </div>
                <div className="report-row subtotal">
                  <span>Total Liabilities</span>
                  <span className="amount">{formatCurrency(balanceSheetData.data.totalLiabilities)}</span>
                </div>
                
                <div className="report-row divider">
                  <span>Equity</span>
                  <span className="amount income">{formatCurrency(balanceSheetData.data.equity)}</span>
                </div>
                
                <div className="report-row total">
                  <span>Total Liabilities & Equity</span>
                  <span className="amount">{formatCurrency(balanceSheetData.data.totalLiabilities + balanceSheetData.data.equity)}</span>
                </div>
              </div>
              
              {/* Financial Ratios */}
              <div className="financial-ratios">
                <h5>Key Financial Ratios</h5>
                <div className="ratio-grid">
                  <div className="ratio-item">
                    <span className="ratio-label">Current Ratio</span>
                    <span className="ratio-value">
                      {balanceSheetData.data.currentLiabilities > 0 
                        ? (balanceSheetData.data.currentAssets / balanceSheetData.data.currentLiabilities).toFixed(2)
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="ratio-item">
                    <span className="ratio-label">Debt to Equity</span>
                    <span className="ratio-value">
                      {balanceSheetData.data.equity > 0 
                        ? (balanceSheetData.data.totalLiabilities / balanceSheetData.data.equity).toFixed(2)
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="ratio-item">
                    <span className="ratio-label">Working Capital</span>
                    <span className="ratio-value">
                      {formatCurrency(balanceSheetData.data.currentAssets - balanceSheetData.data.currentLiabilities)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Main render based on active tab
  switch(activeTab) {
    case 'invoices':
      return renderInvoices();
    case 'customers':
      return renderCustomers();
    case 'expenses':
      return renderExpenses();
    case 'reports':
      return renderReports();
    default:
      return <div className="no-data">Please select a tab to view data.</div>;
  }
};

export default QuickBooksData;