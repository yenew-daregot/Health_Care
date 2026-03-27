import api from './axiosClient';

const billingApi = {
  // University Programs
  getUniversityPrograms: () => api.get('/billing/university-programs/'),

  // Student Insurance
  getStudentInsurance: () => api.get('/billing/insurance/'),
  createStudentInsurance: (data) => api.post('/billing/insurance/', data),
  updateStudentInsurance: (id, data) => api.put(`/billing/insurance/${id}/`, data),
  deleteStudentInsurance: (id) => api.delete(`/billing/insurance/${id}/`),

  // Service Categories
  getServiceCategories: () => api.get('/billing/service-categories/'),

  // Student Debts
  getStudentDebts: () => api.get('/billing/debts/'),
  getStudentDebt: (id) => api.get(`/billing/debts/${id}/`),
  updateStudentDebt: (id, data) => api.put(`/billing/debts/${id}/`, data),

  // Invoices
  getInvoices: () => api.get('/billing/invoices/'),
  getInvoice: (id) => api.get(`/billing/invoices/${id}/`),
  createInvoice: (data) => api.post('/billing/invoices/', data),
  createInvoiceWithItems: (data) => api.post('/billing/invoices/create-with-items/', data),
  updateInvoice: (id, data) => api.put(`/billing/invoices/${id}/`, data),
  deleteInvoice: (id) => api.delete(`/billing/invoices/${id}/`),

  // Payments
  getPayments: () => api.get('/billing/payments/'),
  createPayment: (data) => api.post('/billing/payments/', data),
  processPayment: (data) => api.post('/billing/process-payment/', data),

  // Fee Waivers
  getFeeWaivers: () => api.get('/billing/fee-waivers/'),
  createFeeWaiver: (data) => api.post('/billing/fee-waivers/', data),
  requestFeeWaiver: (data) => api.post('/billing/request-waiver/', data),

  // Reports and Actions
  getBillingSummary: (studentId) => api.get(`/billing/summary/${studentId}/`),
  getRevenueReport: (params) => api.get('/billing/revenue-report/', { params }),
  getOutstandingDebts: () => api.get('/billing/outstanding-debts/'),
  convertToDebt: (invoiceId) => api.post(`/billing/convert-to-debt/${invoiceId}/`),
  
  // Waiver Actions
  approveWaiver: (waiverId, approvedAmount) => api.post(`/billing/approve-waiver/${waiverId}/`, { approved_amount: approvedAmount }),
  rejectWaiver: (waiverId, reason) => api.post(`/billing/reject-waiver/${waiverId}/`, { reason }),
  
  // Integration Endpoints
  createInvoiceFromAppointment: (appointmentId) => api.post(`/billing/create-invoice-from-appointment/${appointmentId}/`),
  createInvoiceFromLab: (labRequestId) => api.post(`/billing/create-invoice-from-lab/${labRequestId}/`),
  
  // Bulk Actions
  bulkInvoiceActions: (action, invoiceIds) => api.post('/billing/bulk-invoice-actions/', { action, invoice_ids: invoiceIds }),
  
  // Payment Plans
  createPaymentPlan: (data) => api.post('/billing/payment-plans/', data),
  
  // Dashboard
  getFinancialDashboard: () => api.get('/billing/dashboard/'),
};

export default billingApi;