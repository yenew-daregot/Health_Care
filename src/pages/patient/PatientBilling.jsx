import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  FileText, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Download,
  Eye,
  Calendar,
  User,
  Shield,
  TrendingUp,
  RefreshCw,
  Plus,
  AlertTriangle,
  Info
} from 'lucide-react';
import billingApi from '../../api/billingApi';
import { useAuth } from '../../context/AuthContext';
import './PatientBilling.css';

const PatientBilling = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  
  const [billingData, setBillingData] = useState({
    summary: null,
    invoices: [],
    payments: [],
    debts: [],
    waivers: [],
    insurance: null
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get patient ID from user context or profile
      const patientId = user?.patient?.id || user?.id;
      
      if (!patientId) {
        throw new Error('Patient ID not found. Please complete your profile first.');
      }

      const [
        summaryResponse,
        invoicesResponse,
        paymentsResponse,
        debtsResponse,
        waiversResponse,
        insuranceResponse
      ] = await Promise.allSettled([
        billingApi.getBillingSummary(patientId),
        billingApi.getInvoices(),
        billingApi.getPayments(),
        billingApi.getStudentDebts(),
        billingApi.getFeeWaivers(),
        billingApi.getStudentInsurance()
      ]);

      setBillingData({
        summary: summaryResponse.status === 'fulfilled' ? summaryResponse.value.data : null,
        invoices: invoicesResponse.status === 'fulfilled' ? invoicesResponse.value.data.results || invoicesResponse.value.data || [] : [],
        payments: paymentsResponse.status === 'fulfilled' ? paymentsResponse.value.data.results || paymentsResponse.value.data || [] : [],
        debts: debtsResponse.status === 'fulfilled' ? debtsResponse.value.data.results || debtsResponse.value.data || [] : [],
        waivers: waiversResponse.status === 'fulfilled' ? waiversResponse.value.data.results || waiversResponse.value.data || [] : [],
        insurance: insuranceResponse.status === 'fulfilled' ? insuranceResponse.value.data.results?.[0] || insuranceResponse.value.data?.[0] || null : null
      });

    } catch (err) {
      console.error('Error fetching billing data:', err);
      setError(err.message || 'Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (paymentData) => {
    try {
      await billingApi.processPayment(paymentData);
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      fetchBillingData(); // Refresh data
    } catch (err) {
      console.error('Payment failed:', err);
      alert('Payment failed. Please try again.');
    }
  };

  const handleWaiverRequest = async (waiverData) => {
    try {
      await billingApi.requestFeeWaiver(waiverData);
      setShowWaiverModal(false);
      fetchBillingData(); // Refresh data
      alert('Fee waiver request submitted successfully!');
    } catch (err) {
      console.error('Waiver request failed:', err);
      alert('Failed to submit waiver request. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      paid: 'success',
      pending: 'warning',
      overdue: 'danger',
      cancelled: 'secondary',
      waived: 'info',
      completed: 'success',
      failed: 'danger',
      approved: 'success',
      rejected: 'danger'
    };
    return colors[status] || 'secondary';
  };

  const getStatusIcon = (status) => {
    const icons = {
      paid: CheckCircle,
      pending: Clock,
      overdue: AlertTriangle,
      cancelled: AlertCircle,
      waived: Shield,
      completed: CheckCircle,
      failed: AlertCircle,
      approved: CheckCircle,
      rejected: AlertCircle
    };
    return icons[status] || Clock;
  };

  if (loading) {
    return (
      <div className="billing-loading">
        <div className="loading-spinner"></div>
        <h3>Loading billing information...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="billing-error">
        <AlertCircle size={48} />
        <h3>Unable to load billing information</h3>
        <p>{error}</p>
        <button onClick={fetchBillingData} className="btn btn-primary">
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="patient-billing">
      <div className="billing-header">
        <div className="header-content">
          <h1>Billing & Payments</h1>
          <p>Manage your medical bills, payments, and insurance information</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchBillingData} className="btn btn-secondary">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Billing Summary Cards */}
      {billingData.summary && (
        <div className="billing-summary">
          <div className="summary-card">
            <div className="card-icon total">
              <DollarSign size={24} />
            </div>
            <div className="card-content">
              <h3>{formatCurrency(billingData.summary.total_amount)}</h3>
              <p>Total Billed</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon paid">
              <CheckCircle size={24} />
            </div>
            <div className="card-content">
              <h3>{formatCurrency(billingData.summary.total_paid)}</h3>
              <p>Total Paid</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon outstanding">
              <Clock size={24} />
            </div>
            <div className="card-content">
              <h3>{formatCurrency(billingData.summary.outstanding_balance)}</h3>
              <p>Outstanding Balance</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon overdue">
              <AlertTriangle size={24} />
            </div>
            <div className="card-content">
              <h3>{formatCurrency(billingData.summary.overdue_amount)}</h3>
              <p>Overdue Amount</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="billing-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <TrendingUp size={16} />
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          <FileText size={16} />
          Invoices ({billingData.invoices.length})
        </button>
        <button 
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <CreditCard size={16} />
          Payments ({billingData.payments.length})
        </button>
        <button 
          className={`tab ${activeTab === 'insurance' ? 'active' : ''}`}
          onClick={() => setActiveTab('insurance')}
        >
          <Shield size={16} />
          Insurance
        </button>
      </div>

      {/* Tab Content */}
      <div className="billing-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              {/* Recent Invoices */}
              <div className="overview-section">
                <div className="section-header">
                  <h3>Recent Invoices</h3>
                  <button 
                    onClick={() => setActiveTab('invoices')}
                    className="view-all-btn"
                  >
                    View All
                  </button>
                </div>
                <div className="invoice-list">
                  {billingData.invoices.slice(0, 3).map(invoice => {
                    const StatusIcon = getStatusIcon(invoice.status);
                    return (
                      <div key={invoice.id} className="invoice-item">
                        <div className="invoice-info">
                          <div className="invoice-number">#{invoice.invoice_number}</div>
                          <div className="invoice-description">{invoice.service_description}</div>
                          <div className="invoice-date">{formatDate(invoice.issue_date)}</div>
                        </div>
                        <div className="invoice-amount">
                          {formatCurrency(invoice.total_amount)}
                        </div>
                        <div className={`invoice-status status-${getStatusColor(invoice.status)}`}>
                          <StatusIcon size={14} />
                          {invoice.status}
                        </div>
                      </div>
                    );
                  })}
                  {billingData.invoices.length === 0 && (
                    <div className="empty-state">
                      <FileText size={32} />
                      <p>No invoices found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment History */}
              <div className="overview-section">
                <div className="section-header">
                  <h3>Recent Payments</h3>
                  <button 
                    onClick={() => setActiveTab('payments')}
                    className="view-all-btn"
                  >
                    View All
                  </button>
                </div>
                <div className="payment-list">
                  {billingData.payments.slice(0, 3).map(payment => {
                    const StatusIcon = getStatusIcon(payment.status);
                    return (
                      <div key={payment.id} className="payment-item">
                        <div className="payment-info">
                          <div className="payment-method">{payment.payment_method}</div>
                          <div className="payment-date">{formatDate(payment.payment_date)}</div>
                          {payment.receipt_number && (
                            <div className="receipt-number">Receipt: {payment.receipt_number}</div>
                          )}
                        </div>
                        <div className="payment-amount">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className={`payment-status status-${getStatusColor(payment.status)}`}>
                          <StatusIcon size={14} />
                          {payment.status}
                        </div>
                      </div>
                    );
                  })}
                  {billingData.payments.length === 0 && (
                    <div className="empty-state">
                      <CreditCard size={32} />
                      <p>No payments found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Outstanding Debts Alert */}
            {billingData.debts.length > 0 && (
              <div className="debt-alert">
                <AlertTriangle size={20} />
                <div className="alert-content">
                  <h4>Outstanding Debts</h4>
                  <p>You have {billingData.debts.length} outstanding debt(s) requiring attention.</p>
                </div>
                <button className="btn btn-warning">
                  View Debts
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="invoices-tab">
            <div className="invoices-header">
              <h3>All Invoices</h3>
              <div className="invoices-actions">
                <button 
                  onClick={() => setShowWaiverModal(true)}
                  className="btn btn-secondary"
                >
                  <Plus size={16} />
                  Request Fee Waiver
                </button>
              </div>
            </div>
            
            <div className="invoices-table">
              <div className="table-header">
                <div>Invoice #</div>
                <div>Service</div>
                <div>Date</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              
              {billingData.invoices.map(invoice => {
                const StatusIcon = getStatusIcon(invoice.status);
                return (
                  <div key={invoice.id} className="table-row">
                    <div className="invoice-number">#{invoice.invoice_number}</div>
                    <div className="service-description">{invoice.service_description}</div>
                    <div className="invoice-date">{formatDate(invoice.issue_date)}</div>
                    <div className="invoice-amount">{formatCurrency(invoice.total_amount)}</div>
                    <div className={`status status-${getStatusColor(invoice.status)}`}>
                      <StatusIcon size={14} />
                      {invoice.status}
                    </div>
                    <div className="actions">
                      <button 
                        onClick={() => setSelectedInvoice(invoice)}
                        className="btn btn-sm btn-secondary"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      {invoice.balance_due > 0 && (
                        <button 
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowPaymentModal(true);
                          }}
                          className="btn btn-sm btn-primary"
                        >
                          <CreditCard size={14} />
                          Pay
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {billingData.invoices.length === 0 && (
                <div className="empty-table">
                  <FileText size={48} />
                  <h4>No invoices found</h4>
                  <p>Your medical service invoices will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="payments-tab">
            <div className="payments-header">
              <h3>Payment History</h3>
            </div>
            
            <div className="payments-table">
              <div className="table-header">
                <div>Date</div>
                <div>Method</div>
                <div>Amount</div>
                <div>Invoice</div>
                <div>Status</div>
                <div>Receipt</div>
              </div>
              
              {billingData.payments.map(payment => {
                const StatusIcon = getStatusIcon(payment.status);
                return (
                  <div key={payment.id} className="table-row">
                    <div className="payment-date">{formatDate(payment.payment_date)}</div>
                    <div className="payment-method">{payment.payment_method}</div>
                    <div className="payment-amount">{formatCurrency(payment.amount)}</div>
                    <div className="invoice-ref">
                      {payment.invoice_number ? `#${payment.invoice_number}` : 'N/A'}
                    </div>
                    <div className={`status status-${getStatusColor(payment.status)}`}>
                      <StatusIcon size={14} />
                      {payment.status}
                    </div>
                    <div className="receipt">
                      {payment.receipt_number ? (
                        <button className="btn btn-sm btn-secondary">
                          <Download size={14} />
                          {payment.receipt_number}
                        </button>
                      ) : 'N/A'}
                    </div>
                  </div>
                );
              })}
              
              {billingData.payments.length === 0 && (
                <div className="empty-table">
                  <CreditCard size={48} />
                  <h4>No payments found</h4>
                  <p>Your payment history will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'insurance' && (
          <div className="insurance-tab">
            <div className="insurance-header">
              <h3>Insurance Information</h3>
              {!billingData.insurance && (
                <button className="btn btn-primary">
                  <Plus size={16} />
                  Add Insurance
                </button>
              )}
            </div>
            
            {billingData.insurance ? (
              <div className="insurance-card">
                <div className="insurance-header-info">
                  <Shield size={24} />
                  <div>
                    <h4>{billingData.insurance.insurance_type}</h4>
                    <p>{billingData.insurance.insurance_provider}</p>
                  </div>
                  <div className={`verification-status ${billingData.insurance.is_verified ? 'verified' : 'pending'}`}>
                    {billingData.insurance.is_verified ? (
                      <>
                        <CheckCircle size={16} />
                        Verified
                      </>
                    ) : (
                      <>
                        <Clock size={16} />
                        Pending Verification
                      </>
                    )}
                  </div>
                </div>
                
                <div className="insurance-details">
                  <div className="detail-item">
                    <label>Policy Number</label>
                    <span>{billingData.insurance.policy_number || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Coverage Percentage</label>
                    <span>{billingData.insurance.coverage_percentage}%</span>
                  </div>
                  <div className="detail-item">
                    <label>Deductible Remaining</label>
                    <span>{formatCurrency(billingData.insurance.deductible_remaining)}</span>
                  </div>
                  {billingData.insurance.verified_until && (
                    <div className="detail-item">
                      <label>Verified Until</label>
                      <span>{formatDate(billingData.insurance.verified_until)}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-insurance">
                <Shield size={48} />
                <h4>No Insurance Information</h4>
                <p>Add your insurance information to help with billing and coverage</p>
                <button className="btn btn-primary">
                  <Plus size={16} />
                  Add Insurance Information
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <PaymentModal
          invoice={selectedInvoice}
          onPayment={handlePayment}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedInvoice(null);
          }}
        />
      )}

      {/* Fee Waiver Modal */}
      {showWaiverModal && (
        <FeeWaiverModal
          invoices={billingData.invoices.filter(inv => inv.balance_due > 0)}
          onSubmit={handleWaiverRequest}
          onClose={() => setShowWaiverModal(false)}
        />
      )}
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ invoice, onPayment, onClose }) => {
  const [paymentData, setPaymentData] = useState({
    amount: invoice.balance_due,
    payment_method: 'card',
    transaction_id: ''
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPayment({
      ...paymentData,
      invoice: invoice.id
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Make Payment</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <div className="modal-body">
          <div className="invoice-summary">
            <h4>Invoice #{invoice.invoice_number}</h4>
            <p>{invoice.service_description}</p>
            <div className="amount-due">
              <strong>Amount Due: {formatCurrency(invoice.balance_due)}</strong>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Payment Amount</label>
              <input
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                max={invoice.balance_due}
                min="0.01"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Payment Method</label>
              <select
                value={paymentData.payment_method}
                onChange={(e) => setPaymentData({...paymentData, payment_method: e.target.value})}
                required
              >
                <option value="card">Credit/Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="student_account">Student Account</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Transaction ID (Optional)</label>
              <input
                type="text"
                value={paymentData.transaction_id}
                onChange={(e) => setPaymentData({...paymentData, transaction_id: e.target.value})}
                placeholder="Enter transaction reference"
              />
            </div>
            
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Process Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Fee Waiver Modal Component
const FeeWaiverModal = ({ invoices, onSubmit, onClose }) => {
  const [waiverData, setWaiverData] = useState({
    invoice: '',
    waiver_type: 'financial_hardship',
    reason: '',
    requested_amount: ''
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(waiverData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Request Fee Waiver</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Invoice</label>
              <select
                value={waiverData.invoice}
                onChange={(e) => setWaiverData({...waiverData, invoice: e.target.value})}
                required
              >
                <option value="">Select an invoice</option>
                {invoices.map(invoice => (
                  <option key={invoice.id} value={invoice.id}>
                    #{invoice.invoice_number} - {formatCurrency(invoice.balance_due)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Waiver Type</label>
              <select
                value={waiverData.waiver_type}
                onChange={(e) => setWaiverData({...waiverData, waiver_type: e.target.value})}
                required
              >
                <option value="financial_hardship">Financial Hardship</option>
                <option value="academic_scholarship">Academic Scholarship</option>
                <option value="emergency">Emergency Situation</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Requested Amount</label>
              <input
                type="number"
                value={waiverData.requested_amount}
                onChange={(e) => setWaiverData({...waiverData, requested_amount: e.target.value})}
                min="0.01"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Reason for Waiver</label>
              <textarea
                value={waiverData.reason}
                onChange={(e) => setWaiverData({...waiverData, reason: e.target.value})}
                rows="4"
                placeholder="Please explain why you are requesting this fee waiver..."
                required
              />
            </div>
            
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientBilling;