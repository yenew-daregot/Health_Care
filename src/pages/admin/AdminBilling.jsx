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
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Shield,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Info,
  Users,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import billingApi from '../../api/billingApi';
import { useAuth } from '../../context/AuthContext';
import './AdminBilling.css';

const AdminBilling = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);

  // Utility functions
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
      rejected: 'danger',
      draft: 'secondary'
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
      rejected: AlertCircle,
      draft: Edit
    };
    return icons[status] || Clock;
  };
  
  const [billingData, setBillingData] = useState({
    dashboard: {
      totalRevenue: 0,
      outstandingAmount: 0,
      totalInvoices: 0,
      totalPayments: 0,
      recentActivity: []
    },
    invoices: [],
    payments: [],
    debts: [],
    waivers: [],
    serviceCategories: [],
    universityPrograms: []
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        invoicesResponse,
        paymentsResponse,
        debtsResponse,
        waiversResponse,
        serviceCategoriesResponse,
        universityProgramsResponse,
        revenueReportResponse,
        outstandingDebtsResponse
      ] = await Promise.allSettled([
        billingApi.getInvoices(),
        billingApi.getPayments(),
        billingApi.getStudentDebts(),
        billingApi.getFeeWaivers(),
        billingApi.getServiceCategories(),
        billingApi.getUniversityPrograms(),
        billingApi.getRevenueReport(),
        billingApi.getOutstandingDebts()
      ]);

      const invoices = invoicesResponse.status === 'fulfilled' ? invoicesResponse.value.data.results || invoicesResponse.value.data || [] : [];
      const payments = paymentsResponse.status === 'fulfilled' ? paymentsResponse.value.data.results || paymentsResponse.value.data || [] : [];
      const debts = debtsResponse.status === 'fulfilled' ? debtsResponse.value.data.results || debtsResponse.value.data || [] : [];
      const waivers = waiversResponse.status === 'fulfilled' ? waiversResponse.value.data.results || waiversResponse.value.data || [] : [];
      
      // Calculate dashboard metrics
      const totalRevenue = revenueReportResponse.status === 'fulfilled' ? revenueReportResponse.value.data.total_revenue || 0 : 0;
      const outstandingAmount = outstandingDebtsResponse.status === 'fulfilled' ? outstandingDebtsResponse.value.data.total_outstanding || 0 : 0;

      setBillingData({
        dashboard: {
          totalRevenue,
          outstandingAmount,
          totalInvoices: invoices.length,
          totalPayments: payments.length,
          recentActivity: [
            ...invoices.slice(0, 3).map(inv => ({
              id: inv.id,
              type: 'invoice',
              title: `Invoice #${inv.invoice_number}`,
              description: inv.service_description,
              amount: inv.total_amount,
              status: inv.status,
              timestamp: inv.created_at
            })),
            ...payments.slice(0, 3).map(pay => ({
              id: pay.id,
              type: 'payment',
              title: `Payment Received`,
              description: `${pay.payment_method} - ${pay.receipt_number || 'N/A'}`,
              amount: pay.amount,
              status: pay.status,
              timestamp: pay.payment_date
            }))
          ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5)
        },
        invoices,
        payments,
        debts,
        waivers,
        serviceCategories: serviceCategoriesResponse.status === 'fulfilled' ? serviceCategoriesResponse.value.data.results || serviceCategoriesResponse.value.data || [] : [],
        universityPrograms: universityProgramsResponse.status === 'fulfilled' ? universityProgramsResponse.value.data.results || universityProgramsResponse.value.data || [] : []
      });

    } catch (err) {
      console.error('Error fetching billing data:', err);
      setError(err.message || 'Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (invoiceData) => {
    try {
      await billingApi.createInvoiceWithItems(invoiceData);
      setShowCreateModal(false);
      fetchBillingData(); // Refresh data
      alert('Invoice created successfully!');
    } catch (err) {
      console.error('Failed to create invoice:', err);
      alert('Failed to create invoice. Please try again.');
    }
  };

  const handleApproveWaiver = async (waiverId, approvedAmount) => {
    try {
      // This would need a specific API endpoint for waiver approval
      // For now, we'll use a generic update
      alert('Waiver approval functionality would be implemented here');
      fetchBillingData();
    } catch (err) {
      console.error('Failed to approve waiver:', err);
      alert('Failed to approve waiver. Please try again.');
    }
  };

  const handleConvertToDebt = async (invoiceId) => {
    try {
      await billingApi.convertToDebt(invoiceId);
      fetchBillingData();
      alert('Invoice converted to debt successfully!');
    } catch (err) {
      console.error('Failed to convert to debt:', err);
      alert('Failed to convert invoice to debt. Please try again.');
    }
  };

  const filteredInvoices = billingData.invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.service_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.student?.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.student?.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="admin-billing-loading">
        <div className="loading-spinner"></div>
        <h3>Loading billing management...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-billing-error">
        <AlertCircle size={48} />
        <h3>Unable to load billing management</h3>
        <p>{error}</p>
        <button onClick={fetchBillingData} className="btn btn-primary">
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="admin-billing">
      <div className="billing-header">
        <div className="header-content">
          <h1>Billing Management</h1>
          <p>Comprehensive billing, invoicing, and financial management system</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowReportsModal(true)}
            className="btn btn-secondary"
          >
            <BarChart3 size={16} />
            Reports
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Create Invoice
          </button>
          <button onClick={fetchBillingData} className="btn btn-secondary">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-overview">
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card revenue">
              <div className="metric-icon">
                <TrendingUp size={24} />
              </div>
              <div className="metric-content">
                <h3>{formatCurrency(billingData.dashboard.totalRevenue)}</h3>
                <p>Total Revenue</p>
                <span className="metric-change">+12% from last month</span>
              </div>
            </div>
            
            <div className="metric-card outstanding">
              <div className="metric-icon">
                <AlertTriangle size={24} />
              </div>
              <div className="metric-content">
                <h3>{formatCurrency(billingData.dashboard.outstandingAmount)}</h3>
                <p>Outstanding Amount</p>
                <span className="metric-change">-5% from last month</span>
              </div>
            </div>
            
            <div className="metric-card invoices">
              <div className="metric-icon">
                <FileText size={24} />
              </div>
              <div className="metric-content">
                <h3>{billingData.dashboard.totalInvoices}</h3>
                <p>Total Invoices</p>
                <span className="metric-change">+8% from last month</span>
              </div>
            </div>
            
            <div className="metric-card payments">
              <div className="metric-icon">
                <CreditCard size={24} />
              </div>
              <div className="metric-content">
                <h3>{billingData.dashboard.totalPayments}</h3>
                <p>Total Payments</p>
                <span className="metric-change">+15% from last month</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <button 
                onClick={() => setActiveTab('invoices')}
                className="action-card"
              >
                <FileText size={20} />
                <span>Manage Invoices</span>
              </button>
              <button 
                onClick={() => setActiveTab('payments')}
                className="action-card"
              >
                <CreditCard size={20} />
                <span>Process Payments</span>
              </button>
              <button 
                onClick={() => setActiveTab('waivers')}
                className="action-card"
              >
                <Shield size={20} />
                <span>Review Waivers</span>
              </button>
              <button 
                onClick={() => setActiveTab('debts')}
                className="action-card"
              >
                <AlertTriangle size={20} />
                <span>Manage Debts</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {billingData.dashboard.recentActivity.map(activity => {
                const StatusIcon = getStatusIcon(activity.status);
                return (
                  <div key={`${activity.type}-${activity.id}`} className="activity-item">
                    <div className="activity-icon">
                      <StatusIcon size={16} />
                    </div>
                    <div className="activity-content">
                      <h4>{activity.title}</h4>
                      <p>{activity.description}</p>
                      <span className="activity-time">{formatDate(activity.timestamp)}</span>
                    </div>
                    <div className="activity-amount">
                      {formatCurrency(activity.amount)}
                    </div>
                    <div className={`activity-status status-${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </div>
                  </div>
                );
              })}
              {billingData.dashboard.recentActivity.length === 0 && (
                <div className="empty-activity">
                  <Activity size={32} />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="billing-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart3 size={16} />
          Dashboard
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
          className={`tab ${activeTab === 'debts' ? 'active' : ''}`}
          onClick={() => setActiveTab('debts')}
        >
          <AlertTriangle size={16} />
          Debts ({billingData.debts.length})
        </button>
        <button 
          className={`tab ${activeTab === 'waivers' ? 'active' : ''}`}
          onClick={() => setActiveTab('waivers')}
        >
          <Shield size={16} />
          Waivers ({billingData.waivers.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="billing-content">
        {activeTab === 'invoices' && (
          <div className="invoices-tab">
            <div className="tab-header">
              <div className="search-filters">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                <Plus size={16} />
                Create Invoice
              </button>
            </div>
            
            <div className="invoices-table">
              <div className="table-header">
                <div>Invoice #</div>
                <div>Student</div>
                <div>Service</div>
                <div>Date</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              
              {filteredInvoices.map(invoice => {
                const StatusIcon = getStatusIcon(invoice.status);
                return (
                  <div key={invoice.id} className="table-row">
                    <div className="invoice-number">#{invoice.invoice_number}</div>
                    <div className="student-name">
                      {invoice.student?.user ? 
                        `${invoice.student.user.first_name} ${invoice.student.user.last_name}` : 
                        'Unknown Student'
                      }
                    </div>
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
                      <button className="btn btn-sm btn-secondary">
                        <Edit size={14} />
                        Edit
                      </button>
                      {invoice.balance_due > 0 && (
                        <button 
                          onClick={() => handleConvertToDebt(invoice.id)}
                          className="btn btn-sm btn-warning"
                        >
                          Convert to Debt
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {filteredInvoices.length === 0 && (
                <div className="empty-table">
                  <FileText size={48} />
                  <h4>No invoices found</h4>
                  <p>No invoices match your current search and filter criteria</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="payments-tab">
            <div className="tab-header">
              <h3>Payment Management</h3>
            </div>
            
            <div className="payments-table">
              <div className="table-header">
                <div>Date</div>
                <div>Student</div>
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
                    <div className="student-name">{payment.student_name || 'N/A'}</div>
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
                  <p>Payment records will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'debts' && (
          <div className="debts-tab">
            <div className="tab-header">
              <h3>Student Debt Management</h3>
            </div>
            
            <div className="debts-table">
              <div className="table-header">
                <div>Debt #</div>
                <div>Student</div>
                <div>Original Amount</div>
                <div>Outstanding</div>
                <div>Due Date</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              
              {billingData.debts.map(debt => {
                const StatusIcon = getStatusIcon(debt.status);
                const isOverdue = debt.is_overdue;
                return (
                  <div key={debt.id} className={`table-row ${isOverdue ? 'overdue-row' : ''}`}>
                    <div className="debt-number">#{debt.debt_number}</div>
                    <div className="student-name">
                      {debt.student?.user ? 
                        `${debt.student.user.first_name} ${debt.student.user.last_name}` : 
                        'Unknown Student'
                      }
                    </div>
                    <div className="original-amount">{formatCurrency(debt.original_amount)}</div>
                    <div className="outstanding-balance">{formatCurrency(debt.outstanding_balance)}</div>
                    <div className="due-date">{formatDate(debt.due_date)}</div>
                    <div className={`status status-${getStatusColor(debt.status)}`}>
                      <StatusIcon size={14} />
                      {debt.status}
                      {isOverdue && <span className="overdue-badge">OVERDUE</span>}
                    </div>
                    <div className="actions">
                      <button className="btn btn-sm btn-secondary">
                        <Eye size={14} />
                        View
                      </button>
                      <button className="btn btn-sm btn-secondary">
                        <Edit size={14} />
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {billingData.debts.length === 0 && (
                <div className="empty-table">
                  <AlertTriangle size={48} />
                  <h4>No debts found</h4>
                  <p>Student debt records will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'waivers' && (
          <div className="waivers-tab">
            <div className="tab-header">
              <h3>Fee Waiver Management</h3>
            </div>
            
            <div className="waivers-table">
              <div className="table-header">
                <div>Student</div>
                <div>Type</div>
                <div>Requested Amount</div>
                <div>Approved Amount</div>
                <div>Status</div>
                <div>Date</div>
                <div>Actions</div>
              </div>
              
              {billingData.waivers.map(waiver => {
                const StatusIcon = getStatusIcon(waiver.status);
                return (
                  <div key={waiver.id} className="table-row">
                    <div className="student-name">
                      {waiver.student?.user ? 
                        `${waiver.student.user.first_name} ${waiver.student.user.last_name}` : 
                        'Unknown Student'
                      }
                    </div>
                    <div className="waiver-type">{waiver.waiver_type}</div>
                    <div className="requested-amount">{formatCurrency(waiver.requested_amount)}</div>
                    <div className="approved-amount">{formatCurrency(waiver.approved_amount)}</div>
                    <div className={`status status-${getStatusColor(waiver.status)}`}>
                      <StatusIcon size={14} />
                      {waiver.status}
                    </div>
                    <div className="waiver-date">{formatDate(waiver.created_at)}</div>
                    <div className="actions">
                      <button className="btn btn-sm btn-secondary">
                        <Eye size={14} />
                        View
                      </button>
                      {waiver.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApproveWaiver(waiver.id, waiver.requested_amount)}
                            className="btn btn-sm btn-success"
                          >
                            <CheckCircle size={14} />
                            Approve
                          </button>
                          <button className="btn btn-sm btn-danger">
                            <AlertCircle size={14} />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {billingData.waivers.length === 0 && (
                <div className="empty-table">
                  <Shield size={48} />
                  <h4>No waivers found</h4>
                  <p>Fee waiver requests will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          serviceCategories={billingData.serviceCategories}
          onSubmit={handleCreateInvoice}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Reports Modal */}
      {showReportsModal && (
        <ReportsModal
          onClose={() => setShowReportsModal(false)}
        />
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

// Create Invoice Modal Component
const CreateInvoiceModal = ({ serviceCategories, onSubmit, onClose }) => {
  const [invoiceData, setInvoiceData] = useState({
    student_id: '',
    service_description: '',
    due_date: '',
    items: [{ service_category_id: '', description: '', quantity: 1, unit_price: 0 }]
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(invoiceData);
  };

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { service_category_id: '', description: '', quantity: 1, unit_price: 0 }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index][field] = value;
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  return (
    <div className="modal-overlay">
      <div className="modal large-modal">
        <div className="modal-header">
          <h3>Create New Invoice</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Student ID</label>
                <input
                  type="number"
                  value={invoiceData.student_id}
                  onChange={(e) => setInvoiceData({...invoiceData, student_id: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={invoiceData.due_date}
                  onChange={(e) => setInvoiceData({...invoiceData, due_date: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Service Description</label>
              <textarea
                value={invoiceData.service_description}
                onChange={(e) => setInvoiceData({...invoiceData, service_description: e.target.value})}
                rows="3"
                required
              />
            </div>
            
            <div className="invoice-items">
              <div className="items-header">
                <h4>Invoice Items</h4>
                <button type="button" onClick={addItem} className="btn btn-sm btn-secondary">
                  <Plus size={14} />
                  Add Item
                </button>
              </div>
              
              {invoiceData.items.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="form-group">
                    <label>Service Category</label>
                    <select
                      value={item.service_category_id}
                      onChange={(e) => updateItem(index, 'service_category_id', e.target.value)}
                      required
                    >
                      <option value="">Select Category</option>
                      {serviceCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} - {formatCurrency(cat.student_price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit Price</label>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Invoice
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Reports Modal Component
const ReportsModal = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Financial Reports</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <div className="modal-body">
          <div className="reports-grid">
            <div className="report-card">
              <PieChart size={24} />
              <h4>Revenue Report</h4>
              <p>Monthly and yearly revenue analysis</p>
              <button className="btn btn-primary">Generate</button>
            </div>
            <div className="report-card">
              <BarChart3 size={24} />
              <h4>Outstanding Debts</h4>
              <p>Student debt analysis and trends</p>
              <button className="btn btn-primary">Generate</button>
            </div>
            <div className="report-card">
              <Users size={24} />
              <h4>Student Billing</h4>
              <p>Per-student billing summary</p>
              <button className="btn btn-primary">Generate</button>
            </div>
            <div className="report-card">
              <Activity size={24} />
              <h4>Payment Trends</h4>
              <p>Payment method and timing analysis</p>
              <button className="btn btn-primary">Generate</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Invoice Detail Modal Component
const InvoiceDetailModal = ({ invoice, onClose }) => {
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
      rejected: 'danger',
      draft: 'secondary'
    };
    return colors[status] || 'secondary';
  };

  return (
    <div className="modal-overlay">
      <div className="modal large-modal">
        <div className="modal-header">
          <h3>Invoice Details - #{invoice.invoice_number}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <div className="modal-body">
          <div className="invoice-detail">
            <div className="detail-section">
              <h4>Invoice Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Invoice Number</label>
                  <span>#{invoice.invoice_number}</span>
                </div>
                <div className="detail-item">
                  <label>Issue Date</label>
                  <span>{formatDate(invoice.issue_date)}</span>
                </div>
                <div className="detail-item">
                  <label>Due Date</label>
                  <span>{formatDate(invoice.due_date)}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status status-${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="detail-section">
              <h4>Student Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Student Name</label>
                  <span>
                    {invoice.student?.user ? 
                      `${invoice.student.user.first_name} ${invoice.student.user.last_name}` : 
                      'Unknown Student'
                    }
                  </span>
                </div>
                <div className="detail-item">
                  <label>Student ID</label>
                  <span>{invoice.student?.id || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="detail-section">
              <h4>Service Details</h4>
              <p>{invoice.service_description}</p>
            </div>
            
            <div className="detail-section">
              <h4>Amount Breakdown</h4>
              <div className="amount-breakdown">
                <div className="amount-row">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="amount-row">
                  <span>University Subsidy:</span>
                  <span>-{formatCurrency(invoice.university_subsidy)}</span>
                </div>
                <div className="amount-row">
                  <span>Insurance Coverage:</span>
                  <span>-{formatCurrency(invoice.insurance_coverage)}</span>
                </div>
                <div className="amount-row total">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(invoice.total_amount)}</span>
                </div>
                <div className="amount-row">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(invoice.amount_paid)}</span>
                </div>
                <div className="amount-row balance">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(invoice.balance_due)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBilling;