import React, { useState, useEffect } from 'react';
import { Building2, Users, UserPlus, Search, Filter, MoreVertical, X, Check, Edit, Trash2, UserCog,
         Activity, Clock, Shield, Plus, Building, FileText, Mail, Phone, MapPin, Calendar
} from 'lucide-react';
import './Departments.css';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showEditDepartment, setShowEditDepartment] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    head: '',
    staff: '',
    description: '',
    status: 'active',
    email: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = () => {
    setLoading(true);
    // Mock data - replace with API call
    const mockDepartments = [
      { 
        id: 1, 
        name: 'Cardiology', 
        head: 'Dr. Smith', 
        staff: 12, 
        status: 'active', 
        description: 'Specializes in heart and cardiovascular care, treatments, and surgeries.',
        email: 'cardiology@hospital.com',
        phone: '+1 234-567-8901',
        location: 'Building A, Floor 3',
        lastUpdated: '2024-03-20'
      },
      { 
        id: 2, 
        name: 'Neurology', 
        head: 'Dr. Johnson', 
        staff: 8, 
        status: 'active', 
        description: 'Focuses on brain and nervous system disorders and treatments.',
        email: 'neurology@hospital.com',
        phone: '+1 234-567-8902',
        location: 'Building B, Floor 2',
        lastUpdated: '2024-03-19'
      },
      { 
        id: 3, 
        name: 'Pediatrics', 
        head: 'Dr. Williams', 
        staff: 15, 
        status: 'active', 
        description: 'Provides comprehensive child healthcare and development services.',
        email: 'pediatrics@hospital.com',
        phone: '+1 234-567-8903',
        location: 'Building C, Floor 1',
        lastUpdated: '2024-03-18'
      },
      { 
        id: 4, 
        name: 'Orthopedics', 
        head: 'Dr. Brown', 
        staff: 10, 
        status: 'maintenance', 
        description: 'Specializes in bone and joint treatments and surgeries.',
        email: 'orthopedics@hospital.com',
        phone: '+1 234-567-8904',
        location: 'Building A, Floor 2',
        lastUpdated: '2024-03-15'
      },
    ];
    
    setTimeout(() => {
      setDepartments(mockDepartments);
      setLoading(false);
    }, 800);
  };

  const handleAddDepartment = (e) => {
    e.preventDefault();
    if (newDepartment.name && newDepartment.head) {
      const departmentToAdd = {
        ...newDepartment,
        id: Date.now(),
        staff: parseInt(newDepartment.staff) || 0,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      
      setDepartments(prev => [departmentToAdd, ...prev]);
      setNewDepartment({ 
        name: '', 
        head: '', 
        staff: '', 
        description: '', 
        status: 'active',
        email: '',
        phone: '',
        location: ''
      });
      setShowAddDepartment(false);
    }
  };

  const handleEditDepartment = (department) => {
    setSelectedDepartment(department);
    setNewDepartment({
      name: department.name,
      head: department.head,
      staff: department.staff.toString(),
      description: department.description || '',
      status: department.status,
      email: department.email || '',
      phone: department.phone || '',
      location: department.location || ''
    });
    setShowEditDepartment(true);
  };

  const handleUpdateDepartment = (e) => {
    e.preventDefault();
    if (selectedDepartment && newDepartment.name && newDepartment.head) {
      const updatedDepartment = {
        ...selectedDepartment,
        ...newDepartment,
        staff: parseInt(newDepartment.staff) || 0,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      
      setDepartments(prev => prev.map(dept => 
        dept.id === selectedDepartment.id ? updatedDepartment : dept
      ));
      setShowEditDepartment(false);
      setSelectedDepartment(null);
    }
  };

  const handleDeleteDepartment = (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      setDepartments(prev => prev.filter(dept => dept.id !== id));
    }
  };

  const filteredDepartments = departments.filter(department => {
    const matchesSearch = 
      department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || department.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const totalStaff = departments.reduce((sum, dept) => sum + dept.staff, 0);
  const activeDepartments = departments.filter(dept => dept.status === 'active').length;
  const maintenanceDepartments = departments.filter(dept => dept.status === 'maintenance').length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading departments...</p>
      </div>
    );
  }

  return (
    <div className="departments-page">
      <div className="departments-container">
        {/* Header */}
        <div className="departmentpage-header">
          <div className="departmentheader-content">
            <div className="header-icon">
              <Building2 size={32} />
            </div>
            <div>
              <h1 className="page-title">Departments Management</h1>
              <p className="page-subtitle">Manage hospital departments, staff allocation, and operations</p>
            </div>
          </div>
          <button className="adddepbtn depbtn-primary" onClick={() => setShowAddDepartment(true)}>
            <Plus size={20} />
            Add Department
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="depstats-grid">
          <div className="depstat-card total-depts">
            <div className="depstat-icon">
              <Building size={24} />
            </div>
            <div className="stat-content">
              <div className="depstat-value">{departments.length}</div>
              <div className="depstat-label">Total Departments</div>
            </div>
          </div>

          <div className="depstat-card active-depts">
            <div className="depstat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <div className="depstat-value">{activeDepartments}</div>
              <div className="depstat-label">Active</div>
            </div>
          </div>

          <div className="depstat-card maintenance-depts">
            <div className="depstat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="depstat-value">{maintenanceDepartments}</div>
              <div className="depstat-label">Maintenance</div>
            </div>
          </div>

          <div className="depstat-card total-staff">
            <div className="depstat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="depstat-value">{totalStaff}</div>
              <div className="depstat-label">Total Staff</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="controls-card">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search departments by name, head, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search" 
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <Filter size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button className="adddepbtn btn-secondary" onClick={fetchDepartments}>
              Refresh
            </button>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="departments-grid">
          {filteredDepartments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏥</div>
              <h3 className="empty-title">No Departments Found</h3>
              <p className="empty-subtitle">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Add your first department to get started'}
              </p>
              <button className="btn btn-primary" onClick={() => setShowAddDepartment(true)}>
                <Plus size={16} />
                Add Your First Department
              </button>
            </div>
          ) : (
            filteredDepartments.map((department) => (
              <div key={department.id} className="department-card">
                <div className="department-header">
                  <h3 className="department-name">{department.name}</h3>
                  <span className={`status-badge status-${department.status}`}>
                    {department.status}
                  </span>
                </div>
                
                <div className="department-details">
                  <div className="detail-row">
                    <span className="detail-label">
                      <UserCog size={14} />
                      Department Head:
                    </span>
                    <span className="detail-value">{department.head}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">
                      <Users size={14} />
                      Staff Count:
                    </span>
                    <span className="detail-value">{department.staff} members</span>
                  </div>
                  
                  {department.email && (
                    <div className="detail-row">
                      <span className="detail-label">
                        <Mail size={14} />
                        Email:
                      </span>
                      <span className="detail-value">{department.email}</span>
                    </div>
                  )}
                  
                  {department.phone && (
                    <div className="detail-row">
                      <span className="detail-label">
                        <Phone size={14} />
                        Phone:
                      </span>
                      <span className="detail-value">{department.phone}</span>
                    </div>
                  )}
                  
                  {department.location && (
                    <div className="detail-row">
                      <span className="detail-label">
                        <MapPin size={14} />
                        Location:
                      </span>
                      <span className="detail-value">{department.location}</span>
                    </div>
                  )}
                  
                  {department.description && (
                    <div className="department-description">
                      <div className="description-label">Description</div>
                      <p className="description-text">{department.description}</p>
                    </div>
                  )}
                  
                  {department.lastUpdated && (
                    <div className="detail-row">
                      <span className="detail-label">
                        <Calendar size={14} />
                        Last Updated:
                      </span>
                      <span className="detail-value">{department.lastUpdated}</span>
                    </div>
                  )}
                </div>

                <div className="department-footer">
                  <div className="department-actions">
                    <button
                      onClick={() => handleDeleteDepartment(department.id)}
                      className="btn btn-danger btn-sm"
                      title="Delete Department"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                    <div className="action-menu">
                      <button className="menu-button">
                        <MoreVertical size={16} />
                      </button>
                      <div className="menu-content">
                        <button onClick={() => handleEditDepartment(department)}>
                          <Edit size={14} />
                          Edit Department
                        </button>
                        <button>
                          <Users size={14} />
                          Manage Staff
                        </button>
                        <button>
                          <FileText size={14} />
                          View Reports
                        </button>
                        <button onClick={() => handleDeleteDepartment(department.id)} className="danger">
                          <Trash2 size={14} />
                          Delete Department
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="btn btn-manage"
                    onClick={() => handleEditDepartment(department)}
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Department Modal */}
      {showAddDepartment && (
        <div className="depmodal-overlay">
          <div className="depmodal">
            <div className="depmodal-header">
              <h3>
                <Plus size={24} />
                Add New Department
              </h3>
              <button className="depmodal-close" onClick={() => setShowAddDepartment(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="depmodal-body">
              <form onSubmit={handleAddDepartment} className="department-form">
                <div className="depform-group">
                  <label className="required">Department Name</label>
                  <input 
                    type="text" 
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field" 
                    placeholder="Enter department name"
                    required 
                  />
                </div>
                <div className="depform-group">
                  <label className="required">Department Head</label>
                  <input 
                    type="text" 
                    value={newDepartment.head}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, head: e.target.value }))}
                    className="input-field" 
                    placeholder="Enter department head name"
                    required 
                  />
                </div>
                <div className="form-grid">
                  <div className="depform-group">
                    <label>Staff Count</label>
                    <input 
                      type="number" 
                      value={newDepartment.staff}
                      onChange={(e) => setNewDepartment(prev => ({ ...prev, staff: e.target.value }))}
                      className="input-field" 
                      placeholder="Enter number of staff"
                      min="0"
                    />
                  </div>
                  <div className="depform-group">
                    <label>Status</label>
                    <select 
                      value={newDepartment.status}
                      onChange={(e) => setNewDepartment(prev => ({ ...prev, status: e.target.value }))}
                      className="input-field"
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="depform-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={newDepartment.email}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field" 
                    placeholder="department@hospital.com"
                  />
                </div>
                <div className="depform-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    value={newDepartment.phone}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, phone: e.target.value }))}
                    className="input-field" 
                    placeholder="+2519....../2517..."
                  />
                </div>
                <div className="depform-group">
                  <label>Location</label>
                  <input 
                    type="text" 
                    value={newDepartment.location}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, location: e.target.value }))}
                    className="input-field" 
                    placeholder="Building A, Floor 3"
                  />
                </div>
                <div className="depform-group">
                  <label>Description</label>
                  <textarea 
                    value={newDepartment.description}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    className="input-field" 
                    placeholder="Enter department description and specialization"
                  />
                </div>
              </form>
            </div>
            <div className="depmodal-footer">
              <button
                type="button"
                onClick={() => setShowAddDepartment(false)}
                className="depbtn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleAddDepartment}
                className="depbtn btn-primary"
              >
                <Check size={16} />
                Add Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditDepartment && selectedDepartment && (
        <div className="depmodal-overlay">
          <div className="depmodal">
            <div className="depmodal-header">
              <h3>
                <Edit size={24} />
                Edit Department
              </h3>
              <button className="depmodal-close" onClick={() => setShowEditDepartment(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="depmodal-body">
              <form onSubmit={handleUpdateDepartment} className="department-form">
                <div className="depform-group">
                  <label className="required">Department Name</label>
                  <input 
                    type="text" 
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field" 
                    required 
                  />
                </div>
                <div className="depform-group">
                  <label className="required">Department Head</label>
                  <input 
                    type="text" 
                    value={newDepartment.head}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, head: e.target.value }))}
                    className="input-field" 
                    required 
                  />
                </div>
                <div className="form-grid">
                  <div className="depform-group">
                    <label>Staff Count</label>
                    <input 
                      type="number" 
                      value={newDepartment.staff}
                      onChange={(e) => setNewDepartment(prev => ({ ...prev, staff: e.target.value }))}
                      className="input-field" 
                      min="0"
                    />
                  </div>
                  <div className="depform-group">
                    <label>Status</label>
                    <select 
                      value={newDepartment.status}
                      onChange={(e) => setNewDepartment(prev => ({ ...prev, status: e.target.value }))}
                      className="input-field"
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="depform-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={newDepartment.email}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field" 
                  />
                </div>
                <div className="depform-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    value={newDepartment.phone}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, phone: e.target.value }))}
                    className="input-field" 
                  />
                </div>
                <div className="depform-group">
                  <label>Location</label>
                  <input 
                    type="text" 
                    value={newDepartment.location}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, location: e.target.value }))}
                    className="input-field" 
                  />
                </div>
                <div className="depform-group">
                  <label>Description</label>
                  <textarea 
                    value={newDepartment.description}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    className="input-field" 
                  />
                </div>
              </form>
            </div>
            <div className="depmodal-footer">
              <button
                type="button"
                onClick={() => setShowEditDepartment(false)}
                className="depbtn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleUpdateDepartment}
                className="depbtn btn-primary"
              >
                <Check size={16} />
                Update Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;