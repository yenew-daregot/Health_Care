import React from 'react';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import './BillingSummaryCard.css';

const BillingSummaryCard = ({ 
  totalRevenue = 0, 
  outstandingAmount = 0, 
  totalInvoices = 0, 
  totalPayments = 0,
  className = '' 
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className={`billing-summary-card ${className}`}>
      <div className="billing-summary-header">
        <h3>Billing Overview</h3>
        <DollarSign size={20} />
      </div>
      
      <div className="billing-metrics">
        <div className="metric">
          <div className="metric-icon revenue">
            <TrendingUp size={16} />
          </div>
          <div className="metric-content">
            <span className="metric-value">{formatCurrency(totalRevenue)}</span>
            <span className="metric-label">Total Revenue</span>
          </div>
        </div>
        
        <div className="metric">
          <div className="metric-icon outstanding">
            <AlertTriangle size={16} />
          </div>
          <div className="metric-content">
            <span className="metric-value">{formatCurrency(outstandingAmount)}</span>
            <span className="metric-label">Outstanding</span>
          </div>
        </div>
        
        <div className="metric">
          <div className="metric-icon invoices">
            <CheckCircle size={16} />
          </div>
          <div className="metric-content">
            <span className="metric-value">{totalInvoices}</span>
            <span className="metric-label">Invoices</span>
          </div>
        </div>
        
        <div className="metric">
          <div className="metric-icon payments">
            <CheckCircle size={16} />
          </div>
          <div className="metric-content">
            <span className="metric-value">{totalPayments}</span>
            <span className="metric-label">Payments</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSummaryCard;