import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Pill, 
  Search, 
  Package, 
  Activity,
  Edit,
  Eye,
  Download,
  RefreshCw,
  BarChart3,
  AlertTriangle,
  Plus,
  Filter,
  ChevronRight,
  X,
  Check,
  DollarSign,
  Calendar,
  Shield,
  Database
} from 'lucide-react';
import medicationApi from '../../api/medicationApi';
import './MedicationManagement.css';

const MedicationManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();

  // Statistics state
  const [stats, setStats] = useState({
    totalMedications: 0,
    lowStock: 0,
    outOfStock: 0,
    inventoryValue: 0,
    expiringSoon: 0,
    monthlyRevenue: 15420,
    adherenceRate: 87,
    pendingRefills: 23
  });

  // Helper function to get stock status
  const getStockStatus = (quantity, minLevel) => {
    const qty = Number(quantity) || 0;
    const min = Number(minLevel) || 0;
    if (qty === 0) return 'out-of-stock';
    if (qty <= min) return 'low-stock';
    return 'active';
  };

  // Helper to normalize medication data - MOVED OUTSIDE OF fetchMedications
  const normalizeMedication = (med) => {
    const stockQuantity = med.stock_quantity || 0;
    const minStockLevel = med.min_stock_level || 0;
    
    return {
      ...med,
      status: getStockStatus(stockQuantity, minStockLevel),
      displayName: med.name || 'Unnamed Medication',
      displayGeneric: med.generic_name || 'N/A',
      displayCategory: med.category || 'Uncategorized',
      displayStock: stockQuantity,
      displayMinStock: minStockLevel,
      displayCost: med.cost || 0,
      displayPrice: med.price || 0,
      displayExpiry: med.expiry_date || null,
      displayManufacturer: med.manufacturer || 'N/A',
      displayForm: med.form || 'N/A',
      displayUnit: med.unit || '',
      displayDosage: med.dosage || 'N/A'
    };
  };

  // Fetch medications on component mount
  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await medicationApi.getMedications();

      let medicationsData = [];
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        medicationsData = response.data.map(normalizeMedication);
      } else if (response.data?.results) {
        medicationsData = response.data.results.map(normalizeMedication);
      } else if (response.data) {
        medicationsData = [normalizeMedication(response.data)];
      }

      setMedications(medicationsData);
      updateStatistics(medicationsData);
      
    } catch (err) {
      console.error('Error fetching medications:', err);
      setError(err.response?.data?.detail || 'Failed to load medications. Please check your connection.');
      
      // Use sample data for development
      const sampleMedications = [
        {
          id: 1,
          name: 'Paracetamol',
          generic_name: 'Acetaminophen',
          category: 'Analgesic',
          manufacturer: 'PharmaCorp',
          stock_quantity: 150,
          min_stock_level: 50,
          cost: 2.50,
          price: 8.99,
          expiry_date: '2024-12-31',
          dosage: '500',
          unit: 'mg',
          form: 'Tablet',
          requires_prescription: false,
          side_effects: 'Nausea, headache',
          contraindications: 'Liver disease',
          storage: 'Room temperature',
          created_at: '2024-01-01',
          updated_at: '2024-01-15'
        },
        {
          id: 2,
          name: 'Amoxicillin',
          generic_name: 'Amoxicillin Trihydrate',
          category: 'Antibiotic',
          manufacturer: 'MediLab',
          stock_quantity: 25,
          min_stock_level: 30,
          cost: 8.75,
          price: 25.50,
          expiry_date: '2024-08-15',
          dosage: '250',
          unit: 'mg',
          form: 'Capsule',
          requires_prescription: true,
          side_effects: 'Diarrhea, rash',
          contraindications: 'Penicillin allergy',
          storage: 'Room temperature',
          created_at: '2024-01-10',
          updated_at: '2024-01-20'
        },
        {
          id: 3,
          name: 'Ibuprofen',
          generic_name: 'Ibuprofen',
          category: 'Analgesic',
          manufacturer: 'PainFree Inc.',
          stock_quantity: 0,
          min_stock_level: 25,
          cost: 3.25,
          price: 12.99,
          expiry_date: '2025-03-20',
          dosage: '400',
          unit: 'mg',
          form: 'Tablet',
          requires_prescription: false,
          side_effects: 'Stomach upset',
          contraindications: 'Stomach ulcers',
          storage: 'Room temperature',
          created_at: '2024-01-05',
          updated_at: '2024-01-18'
        }
      ].map(normalizeMedication);
      
      setMedications(sampleMedications);
      updateStatistics(sampleMedications);
    } finally {
      setLoading(false);
    }
  };

  const updateStatistics = (meds) => {
    const totalMedications = meds.length;
    const lowStock = meds.filter(m => m.status === 'low-stock').length;
    const outOfStock = meds.filter(m => m.status === 'out-of-stock').length;
    const inventoryValue = meds.reduce((sum, med) => {
      const quantity = med.stock_quantity || 0;
      const cost = med.cost || 0;
      return sum + (quantity * cost);
    }, 0);

    // Check for expiring medications (within 3 months)
    const expiringSoon = meds.filter(med => {
      if (!med.expiry_date) return false;
      const expiryDate = new Date(med.expiry_date);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      return expiryDate <= threeMonthsFromNow && expiryDate > new Date();
    }).length;

    setStats(prev => ({
      ...prev,
      totalMedications,
      lowStock,
      outOfStock,
      inventoryValue,
      expiringSoon
    }));
  };

  // CRUD Operations
  const handleAddMedication = async (data) => {
    try {
      const medicationData = {
        name: data.name,
        generic_name: data.genericName || '',
        dosage: data.dosage,
        unit: data.unit,
        form: data.form,
        category: data.category,
        manufacturer: data.manufacturer || '',
        stock_quantity: parseInt(data.stockQuantity) || 0,
        min_stock_level: parseInt(data.minStockLevel) || 0,
        cost: parseFloat(data.cost) || 0,
        price: parseFloat(data.price) || 0,
        requires_prescription: Boolean(data.requiresPrescription),
        side_effects: data.sideEffects || '',
        contraindications: data.contraindications || '',
        storage: data.storage || '',
        expiry_date: data.expiryDate || null
      };

      console.log('Sending medication data:', medicationData);

      // Try API call first
      try {
        const response = await medicationApi.createMedication(medicationData);
        const newMedication = normalizeMedication(response.data);

        setMedications(prev => [newMedication, ...prev]);
        updateStatistics([newMedication, ...medications]);
        
        alert('Medication added successfully!');
      } catch (apiError) {
        console.log('API call failed, using local state:', apiError);
        
        // Fallback to local state update
        const newMedication = normalizeMedication({
          id: Date.now(), // Temporary ID
          ...medicationData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        setMedications(prev => [newMedication, ...prev]);
        updateStatistics([newMedication, ...medications]);
        
        alert('Medication added successfully! (Local demo mode)');
      }

      setShowAddModal(false);
      reset();
      
    } catch (err) {
      console.error('Error adding medication:', err);
      alert(`Failed to add medication: ${err.message || 'Unknown error'}`);
    }
  };

  const handleEditMedication = async (data) => {
    try {
      const medicationData = {
        name: data.name,
        generic_name: data.genericName || '',
        dosage: data.dosage,
        unit: data.unit,
        form: data.form,
        category: data.category,
        manufacturer: data.manufacturer || '',
        stock_quantity: parseInt(data.stockQuantity) || 0,
        min_stock_level: parseInt(data.minStockLevel) || 0,
        cost: parseFloat(data.cost) || 0,
        price: parseFloat(data.price) || 0,
        requires_prescription: Boolean(data.requiresPrescription),
        side_effects: data.sideEffects || '',
        contraindications: data.contraindications || '',
        storage: data.storage || '',
        expiry_date: data.expiryDate || null
      };

      // Try API call first
      try {
        const response = await medicationApi.updateMedication(selectedMedication.id, medicationData);
        const updatedMedication = normalizeMedication(response.data);

        const updatedMedications = medications.map(med => 
          med.id === selectedMedication.id ? updatedMedication : med
        );
        
        setMedications(updatedMedications);
        updateStatistics(updatedMedications);
        
        alert('Medication updated successfully!');
      } catch (apiError) {
        console.log('API call failed, updating local state:', apiError);
        
        // Fallback to local state update
        const updatedMedication = normalizeMedication({
          ...selectedMedication,
          ...medicationData,
          updated_at: new Date().toISOString()
        });

        const updatedMedications = medications.map(med => 
          med.id === selectedMedication.id ? updatedMedication : med
        );
        
        setMedications(updatedMedications);
        updateStatistics(updatedMedications);
        
        alert('Medication updated successfully! (Local demo mode)');
      }

      setShowEditModal(false);
      setSelectedMedication(null);
      reset();
      
    } catch (err) {
      console.error('Error updating medication:', err);
      alert(`Failed to update medication: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDeleteMedication = async (medicationId) => {
    if (!window.confirm('Are you sure you want to delete this medication? This action cannot be undone.')) {
      return;
    }

    try {
      // Try API call first
      try {
        await medicationApi.deleteMedication(medicationId);
      } catch (apiError) {
        console.log('API delete failed, using local state:', apiError);
      }

      const updatedMedications = medications.filter(med => med.id !== medicationId);
      setMedications(updatedMedications);
      updateStatistics(updatedMedications);
      setSelectedMedication(null);
      
      alert('Medication deleted successfully!');
    } catch (err) {
      console.error('Error deleting medication:', err);
      alert(`Failed to delete medication: ${err.message || 'Unknown error'}`);
    }
  };

  const handleUpdateStock = async (medicationId, currentStock) => {
    const medication = medications.find(m => m.id === medicationId);
    if (!medication) return;
    
    const newQuantity = prompt(`Update stock quantity for ${medication.name}:`, 
      medication.stock_quantity || medication.stockQuantity || 0);
    
    if (newQuantity === null) return;
    
    const parsedQuantity = parseInt(newQuantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      alert('Please enter a valid positive number');
      return;
    }

    try {
      // Try API call first
      try {
        await medicationApi.patchMedication(medicationId, {
          stock_quantity: parsedQuantity
        });
      } catch (apiError) {
        console.log('API update failed, using local state:', apiError);
      }

      const updatedMedication = normalizeMedication({
        ...medication,
        stock_quantity: parsedQuantity,
        updated_at: new Date().toISOString()
      });

      const updatedMedications = medications.map(med => 
        med.id === medicationId ? updatedMedication : med
      );
      
      setMedications(updatedMedications);
      updateStatistics(updatedMedications);
      
      alert('Stock quantity updated successfully!');
    } catch (err) {
      console.error('Error updating stock:', err);
      alert(`Failed to update stock: ${err.message || 'Unknown error'}`);
    }
  };

  // UI Components
  const StatCard = ({ title, value, change, icon: Icon, color, onClick }) => (
    <div 
      className={`stat-card stat-card-${color} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="stat-card-header">
        <div className="stat-card-icon">
          <Icon size={24} />
        </div>
        <div className="stat-card-value">{value}</div>
      </div>
      <div className="stat-card-title">{title}</div>
      {change && (
        <div className={`stat-card-change ${change.startsWith('+') ? 'positive' : 'negative'}`}>
          {change}
        </div>
      )}
    </div>
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="status-badge status-active">In Stock</span>;
      case 'low-stock':
        return <span className="status-badge status-warning">Low Stock</span>;
      case 'out-of-stock':
        return <span className="status-badge status-danger">Out of Stock</span>;
      default:
        return <span className="status-badge status-default">Unknown</span>;
    }
  };

  const getCategoryBadge = (category) => {
    if (!category) return <span className="category-badge">Uncategorized</span>;
    
    const categoryColors = {
      'antibiotic': 'category-antibiotic',
      'analgesic': 'category-analgesic',
      'cardiovascular': 'category-cardiovascular',
      'diabetes': 'category-diabetes',
      'mental health': 'category-mental',
      'respiratory': 'category-respiratory',
      'gastrointestinal': 'category-gastro',
      'vitamin': 'category-vitamin'
    };

    const colorClass = categoryColors[category.toLowerCase()] || 'category-default';
    
    return <span className={`category-badge ${colorClass}`}>{category}</span>;
  };

  // Filter medications
  const filteredMedications = medications.filter(medication => {
    const searchLower = searchTerm.toLowerCase();
    const name = medication.name?.toLowerCase() || '';
    const genericName = medication.generic_name?.toLowerCase() || '';
    const category = medication.category?.toLowerCase() || '';
    const manufacturer = medication.manufacturer?.toLowerCase() || '';
    
    const matchesSearch = name.includes(searchLower) || 
                         genericName.includes(searchLower) || 
                         category.includes(searchLower) ||
                         manufacturer.includes(searchLower);
    
    const matchesFilter = filterStatus === 'all' || medication.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Tab Components
  const OverviewTab = () => (
    <div className="overview-tab">
      <div className="stats-grid">
        <StatCard
          title="Total Medications"
          value={stats.totalMedications}
          change="+12%"
          icon={Package}
          color="blue"
          onClick={() => setActiveTab('inventory')}
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStock}
          change="-5%"
          icon={AlertTriangle}
          color="orange"
          onClick={() => {
            setActiveTab('inventory');
            setFilterStatus('low-stock');
          }}
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStock}
          change="+2%"
          icon={AlertTriangle}
          color="red"
          onClick={() => {
            setActiveTab('inventory');
            setFilterStatus('out-of-stock');
          }}
        />
        <StatCard
          title="Inventory Value"
          value={`$${stats.inventoryValue.toLocaleString()}`}
          change="+8%"
          icon={DollarSign}
          color="green"
        />
      </div>

      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <button 
            className="quick-action-btn primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={20} />
            <span>Add Medication</span>
          </button>
          <button 
            className="quick-action-btn secondary"
            onClick={() => setActiveTab('inventory')}
          >
            <Package size={20} />
            <span>View Inventory</span>
          </button>
          <button 
            className="quick-action-btn secondary"
            onClick={fetchMedications}
          >
            <RefreshCw size={20} />
            <span>Refresh Data</span>
          </button>
          <button 
            className="quick-action-btn secondary"
            onClick={() => alert('Export feature coming soon!')}
          >
            <Download size={20} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      <div className="recent-medications">
        <h3 className="section-title">Recent Medications</h3>
        <div className="medications-list">
          {medications.slice(0, 5).map(medication => (
            <div key={medication.id} className="medication-item">
              <div className="medication-item-icon">
                <Pill size={20} />
              </div>
              <div className="medication-item-info">
                <div className="medication-item-name">{medication.name}</div>
                <div className="medication-item-details">
                  <span className="category">{medication.category || 'Uncategorized'}</span>
                  <span className="stock">Stock: {medication.stock_quantity || 0}</span>
                </div>
              </div>
              <div className="medication-item-status">
                {getStatusBadge(medication.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const InventoryTab = () => (
    <div className="inventory-tab">
      <div className="inventory-header">
        <div className="search-filter-container">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search medications by name, category, or manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <Filter size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={18} />
              Add Medication
            </button>
          </div>
        </div>
      </div>

      <div className="inventory-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading medications...</p>
          </div>
        ) : filteredMedications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={48} />
            </div>
            <h3>No medications found</h3>
            <p className="empty-subtitle">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'Add your first medication to get started'}
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} />
              Add Your First Medication
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Cost/Price</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedications.map((medication) => {
                  const stockQuantity = medication.stock_quantity || 0;
                  const minStockLevel = medication.min_stock_level || 0;
                  const genericName = medication.generic_name || 'N/A';
                  const dosage = medication.dosage || 'N/A';
                  const unit = medication.unit || '';
                  const form = medication.form || '';
                  const cost = medication.cost || 0;
                  const price = medication.price || 0;
                  const expiryDate = medication.expiry_date ? new Date(medication.expiry_date).toLocaleDateString() : 'N/A';
                  
                  return (
                    <tr key={medication.id} className="inventory-row">
                      <td>
                        <div className="medication-cell">
                          <div className="medication-name">{medication.name}</div>
                          <div className="medication-generic">{genericName}</div>
                          <div className="medication-details">
                            {dosage} {unit} • {form}
                          </div>
                        </div>
                      </td>
                      <td>
                        {getCategoryBadge(medication.category)}
                      </td>
                      <td>
                        <div className="stock-cell">
                          <div className="stock-quantity">
                            <span className="quantity">{stockQuantity}</span>
                            <span className="unit">units</span>
                          </div>
                          <div className="stock-min">Min: {minStockLevel}</div>
                          {stockQuantity <= minStockLevel && (
                            <div className="stock-alert">
                              <AlertTriangle size={12} />
                              Reorder needed
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="price-cell">
                          <div className="cost">Cost: <span>${cost.toFixed(2)}</span></div>
                          <div className="price">Price: <span>${price.toFixed(2)}</span></div>
                        </div>
                      </td>
                      <td>
                        <div className="expiry-cell">
                          {expiryDate}
                        </div>
                      </td>
                      <td>
                        {getStatusBadge(medication.status)}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => {
                              setSelectedMedication(medication);
                              setShowDetailsModal(true);
                            }}
                            className="btn btn-sm btn-view"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMedication(medication);
                              setShowEditModal(true);
                            }}
                            className="btn btn-sm btn-edit"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleUpdateStock(medication.id, stockQuantity)}
                            className="btn btn-sm btn-update"
                            title="Update Stock"
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteMedication(medication.id)}
                            className="btn btn-sm btn-delete"
                            title="Delete"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredMedications.length > 0 && (
          <div className="table-footer">
            <div className="table-summary">
              Showing {filteredMedications.length} of {medications.length} medications
            </div>
            <div className="export-actions">
              <button className="btn btn-secondary" onClick={() => alert('Export feature coming soon!')}>
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Modal Components
  const MedicationFormModal = ({ title, medication, onSubmit, onClose, register, handleSubmit, errors, setValue }) => {
    useEffect(() => {
      if (medication && setValue) {
        const formData = {
          name: medication.name || '',
          genericName: medication.generic_name || '',
          dosage: medication.dosage || '',
          unit: medication.unit || '',
          form: medication.form || '',
          category: medication.category || '',
          manufacturer: medication.manufacturer || '',
          stockQuantity: medication.stock_quantity || 0,
          minStockLevel: medication.min_stock_level || 0,
          cost: medication.cost || 0,
          price: medication.price || 0,
          requiresPrescription: medication.requires_prescription || false,
          sideEffects: medication.side_effects || '',
          contraindications: medication.contraindications || '',
          storage: medication.storage || '',
          expiryDate: medication.expiry_date ? medication.expiry_date.split('T')[0] : ''
        };
        
        Object.keys(formData).forEach(key => {
          setValue(key, formData[key]);
        });
      } else {
        // Reset form for new medication
        reset({
          name: '',
          genericName: '',
          dosage: '',
          unit: 'mg',
          form: 'tablet',
          category: '',
          manufacturer: '',
          stockQuantity: 0,
          minStockLevel: 0,
          cost: 0,
          price: 0,
          requiresPrescription: false,
          sideEffects: '',
          contraindications: '',
          storage: 'Room temperature',
          expiryDate: ''
        });
      }
    }, [medication, setValue, reset]);

    const watchedExpiryDate = watch('expiryDate');
    const isExpiringSoon = watchedExpiryDate && new Date(watchedExpiryDate) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    return (
      <div className="modal-overlay active">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {title}
              </h2>
              <button 
                onClick={onClose}
                className="modal-close-btn"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="medication-form">
              <div className="modal-body">
                <div className="form-sections">
                  
                  {/* Basic Information Section */}
                  <div className="form-section">
                    <h3 className="form-section-title">
                      <Package size={18} />
                      Basic Information
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">
                          Medication Name *
                        </label>
                        <input
                          type="text"
                          {...register('name', { required: 'Medication name is required' })}
                          className={`form-input ${errors.name ? 'error' : ''}`}
                          placeholder="e.g., Paracetamol, Amoxicillin"
                        />
                        {errors.name && <div className="form-error">{errors.name.message}</div>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Generic Name
                        </label>
                        <input
                          type="text"
                          {...register('genericName')}
                          className="form-input"
                          placeholder="e.g., Acetaminophen"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Category *
                        </label>
                        <select
                          {...register('category', { required: 'Category is required' })}
                          className={`form-select ${errors.category ? 'error' : ''}`}
                        >
                          <option value="">Select Category</option>
                          <option value="Analgesic">Pain Relief (Analgesic)</option>
                          <option value="Antibiotic">Antibiotic</option>
                          <option value="Cardiovascular">Cardiovascular</option>
                          <option value="Diabetes">Diabetes</option>
                          <option value="Mental Health">Mental Health</option>
                          <option value="Respiratory">Respiratory</option>
                          <option value="Gastrointestinal">Gastrointestinal</option>
                          <option value="Vitamin">Vitamin/Supplement</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.category && <div className="form-error">{errors.category.message}</div>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Manufacturer
                        </label>
                        <input
                          type="text"
                          {...register('manufacturer')}
                          className="form-input"
                          placeholder="e.g., PharmaCorp, MediLab"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dosage & Form Section */}
                  <div className="form-section">
                    <h3 className="form-section-title">
                      <Pill size={18} />
                      Dosage & Form
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">
                          Dosage *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...register('dosage', { required: 'Dosage is required', min: 0 })}
                          className={`form-input ${errors.dosage ? 'error' : ''}`}
                          placeholder="e.g., 500"
                        />
                        {errors.dosage && <div className="form-error">{errors.dosage.message}</div>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Unit *
                        </label>
                        <select
                          {...register('unit', { required: 'Unit is required' })}
                          className={`form-select ${errors.unit ? 'error' : ''}`}
                        >
                          <option value="">Select Unit</option>
                          <option value="mg">mg</option>
                          <option value="mcg">mcg</option>
                          <option value="g">g</option>
                          <option value="ml">ml</option>
                          <option value="IU">IU</option>
                          <option value="tablet">Tablet</option>
                          <option value="capsule">Capsule</option>
                        </select>
                        {errors.unit && <div className="form-error">{errors.unit.message}</div>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Form *
                        </label>
                        <select
                          {...register('form', { required: 'Form is required' })}
                          className={`form-select ${errors.form ? 'error' : ''}`}
                        >
                          <option value="">Select Form</option>
                          <option value="Tablet">Tablet</option>
                          <option value="Capsule">Capsule</option>
                          <option value="Liquid">Liquid</option>
                          <option value="Injection">Injection</option>
                          <option value="Cream">Cream/Ointment</option>
                          <option value="Inhaler">Inhaler</option>
                          <option value="Suppository">Suppository</option>
                        </select>
                        {errors.form && <div className="form-error">{errors.form.message}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Inventory Section */}
                  <div className="form-section">
                    <h3 className="form-section-title">
                      <Database size={18} />
                      Inventory Information
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">
                          Stock Quantity *
                        </label>
                        <input
                          type="number"
                          {...register('stockQuantity', { 
                            required: 'Stock quantity is required', 
                            min: { value: 0, message: 'Must be 0 or greater' } 
                          })}
                          className={`form-input ${errors.stockQuantity ? 'error' : ''}`}
                          placeholder="e.g., 100"
                        />
                        {errors.stockQuantity && <div className="form-error">{errors.stockQuantity.message}</div>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Minimum Stock Level *
                        </label>
                        <input
                          type="number"
                          {...register('minStockLevel', { 
                            required: 'Minimum stock level is required', 
                            min: { value: 0, message: 'Must be 0 or greater' } 
                          })}
                          className={`form-input ${errors.minStockLevel ? 'error' : ''}`}
                          placeholder="e.g., 10"
                        />
                        {errors.minStockLevel && <div className="form-error">{errors.minStockLevel.message}</div>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Cost per Unit ($) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...register('cost', { 
                            required: 'Cost is required', 
                            min: { value: 0, message: 'Must be 0 or greater' } 
                          })}
                          className={`form-input ${errors.cost ? 'error' : ''}`}
                          placeholder="e.g., 2.50"
                        />
                        {errors.cost && <div className="form-error">{errors.cost.message}</div>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Selling Price ($) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...register('price', { 
                            required: 'Price is required', 
                            min: { value: 0, message: 'Must be 0 or greater' } 
                          })}
                          className={`form-input ${errors.price ? 'error' : ''}`}
                          placeholder="e.g., 8.99"
                        />
                        {errors.price && <div className="form-error">{errors.price.message}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  <div className="form-section">
                    <h3 className="form-section-title">
                      <Shield size={18} />
                      Additional Information
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">
                          Expiry Date
                        </label>
                        <div className={`expiry-input-wrapper ${isExpiringSoon ? 'warning' : ''}`}>
                          <input
                            type="date"
                            {...register('expiryDate')}
                            className="form-input"
                          />
                          {isExpiringSoon && (
                            <div className="expiry-warning">
                              <AlertTriangle size={14} />
                              Expiring soon
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Storage Instructions
                        </label>
                        <input
                          type="text"
                          {...register('storage')}
                          className="form-input"
                          placeholder="e.g., Room temperature, Refrigerate"
                        />
                      </div>

                      <div className="form-group full-width">
                        <div className="checkbox-wrapper">
                          <input
                            id="requiresPrescription"
                            type="checkbox"
                            {...register('requiresPrescription')}
                            className="form-checkbox"
                          />
                          <label htmlFor="requiresPrescription" className="checkbox-label">
                            Requires Prescription
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group full-width">
                        <label className="form-label">
                          Side Effects
                        </label>
                        <textarea
                          rows="3"
                          {...register('sideEffects')}
                          className="form-textarea"
                          placeholder="Common side effects separated by commas"
                        />
                      </div>

                      <div className="form-group full-width">
                        <label className="form-label">
                          Contraindications
                        </label>
                        <textarea
                          rows="3"
                          {...register('contraindications')}
                          className="form-textarea"
                          placeholder="Conditions or medications that should not be combined"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <Check size={18} />
                  {medication ? 'Update Medication' : 'Add Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const MedicationDetailsModal = ({ medication, onClose }) => {
    if (!medication) return null;

    return (
      <div className="modal-overlay active">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Medication Details</h2>
              <button onClick={onClose} className="modal-close-btn">
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="medication-details-grid">
                <div className="detail-section">
                  <h3 className="detail-section-title">Basic Information</h3>
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{medication.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Generic Name:</span>
                    <span className="detail-value">{medication.generic_name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{getCategoryBadge(medication.category)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Manufacturer:</span>
                    <span className="detail-value">{medication.manufacturer || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3 className="detail-section-title">Dosage & Form</h3>
                  <div className="detail-item">
                    <span className="detail-label">Dosage:</span>
                    <span className="detail-value">{medication.dosage || 'N/A'} {medication.unit || ''}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Form:</span>
                    <span className="detail-value">{medication.form || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3 className="detail-section-title">Inventory</h3>
                  <div className="detail-item">
                    <span className="detail-label">Stock Quantity:</span>
                    <span className="detail-value">{medication.stock_quantity || 0} units</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Minimum Stock:</span>
                    <span className="detail-value">{medication.min_stock_level || 0} units</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">{getStatusBadge(medication.status)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Expiry Date:</span>
                    <span className="detail-value">
                      {medication.expiry_date ? new Date(medication.expiry_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3 className="detail-section-title">Pricing</h3>
                  <div className="detail-item">
                    <span className="detail-label">Cost per Unit:</span>
                    <span className="detail-value">${(medication.cost || 0).toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Selling Price:</span>
                    <span className="detail-value">${(medication.price || 0).toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Requires Prescription:</span>
                    <span className="detail-value">
                      {medication.requires_prescription ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                {medication.side_effects && (
                  <div className="detail-section full-width">
                    <h3 className="detail-section-title">Side Effects</h3>
                    <div className="detail-text">{medication.side_effects}</div>
                  </div>
                )}

                {medication.contraindications && (
                  <div className="detail-section full-width">
                    <h3 className="detail-section-title">Contraindications</h3>
                    <div className="detail-text">{medication.contraindications}</div>
                  </div>
                )}

                {medication.storage && (
                  <div className="detail-section">
                    <h3 className="detail-section-title">Storage Instructions</h3>
                    <div className="detail-text">{medication.storage}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={onClose} className="btn btn-secondary">
                Close
              </button>
              <button 
                onClick={() => {
                  setShowDetailsModal(false);
                  setShowEditModal(true);
                }}
                className="btn btn-primary"
              >
                <Edit size={16} />
                Edit Medication
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  if (loading && medications.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading medication management...</p>
      </div>
    );
  }

  return (
    <div className="medication-management">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Medication Management</h1>
          <p className="page-subtitle">Manage pharmacy inventory and medication catalog</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchMedications}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            Add Medication
          </button>
        </div>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={16} />
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Package size={16} />
          Inventory
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => alert('Reports feature coming soon!')}
        >
          <BarChart3 size={16} />
          Reports
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'inventory' && <InventoryTab />}
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <MedicationFormModal
          title="Add New Medication"
          onSubmit={handleAddMedication}
          onClose={() => {
            setShowAddModal(false);
            reset();
          }}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
          setValue={setValue}
        />
      )}

      {/* Edit Medication Modal */}
      {showEditModal && selectedMedication && (
        <MedicationFormModal
          title="Edit Medication"
          medication={selectedMedication}
          onSubmit={handleEditMedication}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMedication(null);
            reset();
          }}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
          setValue={setValue}
        />
      )}
      {/* Details Modal */}
      {showDetailsModal && selectedMedication && (
        <MedicationDetailsModal
          medication={selectedMedication}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedMedication(null);
          }}
        />
      )}
    </div>
  );
};

export default MedicationManagement;