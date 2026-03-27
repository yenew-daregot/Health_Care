import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, UserCheck, UserCog, Shield, Search, Filter, Download,
  X, Check, AlertCircle, UserX, Activity, Calendar, Mail, Phone, Key, Eye, Edit, Trash2,
  FileDown, Settings, FileText, FileSpreadsheet, Loader2, Lock, Unlock
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import './ManageUsers.css';
import userApi from '../../api/userApi'; 
import adminApi from '../../api/adminApi'; 

const ManageUsers = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'PATIENT',
    password: '',
    confirmPassword: '',
    is_active: true,
    // Doctor-specific fields
    specialty: '',
    license_number: '',
    qualifications: '',
    experience_years: '',
    consultation_fee: '',
    bio: '',
    address: '',
    // Patient-specific fields
    age: '',
    gender: '',
    date_of_birth: '',
    blood_group: '',
    height: '',
    weight: '',
    emergency_contact: '',
    emergency_contact_phone: '',
    insurance_id: '',
    allergy_notes: '',
    chronic_conditions: ''
  });
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    includeColumns: ['name', 'email', 'role', 'status', 'date_joined', 'last_login'],
    includePasswords: false,
    dateRange: { start: '', end: '' }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Build params for backend filters
      const params = {
        search: searchTerm || undefined,
        role: filterRole !== 'all' ? filterRole : undefined,
        is_active: filterStatus !== 'all' ? (filterStatus === 'active' ? 'true' : 'false') : undefined,
      };

      console.log('Fetching users with params:', params);
      
      const response = await userApi.getUsers(params);
      
      // Backend returns data in different structures
      let usersData = [];
      if (response.data.results) {
        usersData = response.data.results; // Paginated response
      } else if (Array.isArray(response.data)) {
        usersData = response.data; // Direct array
      } else {
        usersData = response.data.data || []; // Wrapped response
      }

      console.log('Users data loaded:', usersData);
      setUsers(usersData);
      enqueueSnackbar(`Loaded ${usersData.length} users`, { variant: 'success' });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Failed to load users';
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Refetch when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filterRole, filterStatus]);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewUser({
      username: user.username,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone_number: user.phone_number || '',
      role: user.role,
      password: '',
      confirmPassword: '',
      is_active: user.is_active,
      specialty: user.specialty || '',
      department: user.department || '',
      address: user.address || '',
      date_of_birth: user.date_of_birth || '',
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`)) {
      try {
        await userApi.deleteUser(user.id);
        setUsers(prev => prev.filter(u => u.id !== user.id));
        setSelectedUsers(prev => prev.filter(id => id !== user.id));
        enqueueSnackbar('User deleted successfully', { variant: 'success' });
      } catch (error) {
        console.error('Failed to delete user:', error);
        const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Failed to delete user';
        enqueueSnackbar(errorMsg, { variant: 'error' });
      }
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      const newStatus = !user.is_active;
      await userApi.updateUserStatus(user.id, { is_active: newStatus });
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, is_active: newStatus } : u
      ));
      
      enqueueSnackbar(`User ${newStatus ? 'activated' : 'deactivated'} successfully`, { variant: 'success' });
    } catch (error) {
      console.error('Failed to update user status:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Failed to update user status';
      enqueueSnackbar(errorMsg, { variant: 'error' });
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleAddUser = () => {
    setNewUser({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      role: 'PATIENT',
      password: '',
      confirmPassword: '',
      is_active: true,
      // Doctor-specific fields
      specialty: '',
      license_number: '',
      qualifications: '',
      experience_years: '',
      consultation_fee: '',
      bio: '',
      address: '',
      // Patient-specific fields
      age: '',
      gender: '',
      date_of_birth: '',
      blood_group: '',
      height: '',
      weight: '',
      emergency_contact: '',
      emergency_contact_phone: '',
      insurance_id: '',
      allergy_notes: '',
      chronic_conditions: ''
    });
    setShowAddUser(true);
  };

  const handleSaveNewUser = async () => {
    // Validate required fields
    if (!newUser.username || !newUser.email || !newUser.first_name || !newUser.password) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'warning' });
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'warning' });
      return;
    }

    try {
      let response;
      
      // Use role-specific admin endpoints for doctors and patients
      if (newUser.role === 'DOCTOR') {
        // Prepare data for doctor creation
        const doctorData = {
          user: {
            username: newUser.username,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            phone_number: newUser.phone_number,  // Changed from 'phone' to 'phone_number'
            password: newUser.password,
            confirm_password: newUser.confirmPassword,
          },
          specialization: newUser.specialty || 'General Medicine',
          license_number: newUser.license_number || '',
          qualification: newUser.qualifications || 'MD',
          years_of_experience: parseInt(newUser.experience_years) || 0,
          consultation_fee: parseFloat(newUser.consultation_fee) || 500,
          bio: newUser.bio || '',
          address: newUser.address || '',
          is_available: true,
          is_verified: true
        };

        console.log('Creating doctor with data:', doctorData);
        console.log('Sending to adminApi.createDoctor...');
        response = await adminApi.createDoctor(doctorData);
        console.log('Doctor creation response:', response);
        
      } else if (newUser.role === 'PATIENT') {
        // Prepare minimal data for patient creation to test
        const patientData = {
          user: {
            username: newUser.username,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            phone_number: newUser.phone_number || '',
            password: newUser.password,
            confirm_password: newUser.confirmPassword,
          },
          // Only include basic fields to test
          age: parseInt(newUser.age) || null,
          gender: newUser.gender || null,
        };

        console.log('Creating patient with MINIMAL data:', patientData);
        console.log('Sending to adminApi.createPatient...');
        response = await adminApi.createPatient(patientData);
        console.log('Patient creation response:', response);
        
      } else {
        // For other roles (ADMIN, etc.), use the regular user creation endpoint
        const userData = {
          username: newUser.username,
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          phone_number: newUser.phone_number,
          role: newUser.role,
          password: newUser.password,
          confirmPassword: newUser.confirmPassword,
          is_active: newUser.is_active
        };

        console.log('Creating user with data:', userData);
        response = await userApi.createUser(userData);
      }
      
      // Add to users list - need to refresh to get the complete user data
      await fetchUsers(); // Refresh the entire list
      setShowAddUser(false);
      enqueueSnackbar(`${newUser.role.toLowerCase()} created successfully`, { variant: 'success' });
      
    } catch (error) {
      console.error('Failed to create user:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : 'Failed to create user');
      enqueueSnackbar(errorMsg, { variant: 'error' });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      // Prepare update data
      const updateData = {
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        phone_number: newUser.phone_number,
        role: newUser.role,
        is_active: newUser.is_active
      };

      // Only include password if provided
      if (newUser.password) {
        if (newUser.password !== newUser.confirmPassword) {
          enqueueSnackbar('Passwords do not match', { variant: 'warning' });
          return;
        }
        updateData.password = newUser.password;
      }

      // Add doctor-specific fields
      if (newUser.role === 'DOCTOR') {
        updateData.specialty = newUser.specialty;
        updateData.department = newUser.department;
      }

      console.log('Updating user with data:', updateData);
      const response = await userApi.updateUser(selectedUser.id, updateData);
      
      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === selectedUser.id ? { ...user, ...response.data } : user
      ));
      setShowEditModal(false);
      enqueueSnackbar('User updated successfully', { variant: 'success' });
    } catch (error) {
      console.error('Failed to update user:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Failed to update user';
      enqueueSnackbar(errorMsg, { variant: 'error' });
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      enqueueSnackbar('Please select users to delete', { variant: 'warning' });
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} selected users? This action cannot be undone.`)) {
      try {
        await userApi.bulkDeleteUsers(selectedUsers);
        setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
        setSelectedUsers([]);
        enqueueSnackbar(`${selectedUsers.length} users deleted successfully`, { variant: 'success' });
      } catch (error) {
        console.error('Failed to delete users:', error);
        const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Failed to delete users';
        enqueueSnackbar(errorMsg, { variant: 'error' });
      }
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedUsers.length === 0) {
      enqueueSnackbar('Please select users to update', { variant: 'warning' });
      return;
    }

    try {
      await userApi.bulkUpdateStatus({
        ids: selectedUsers,
        is_active: newStatus
      });
      
      // Update local state
      setUsers(prev => prev.map(user =>
        selectedUsers.includes(user.id) ? { ...user, is_active: newStatus } : user
      ));
      
      enqueueSnackbar(`${selectedUsers.length} users ${newStatus ? 'activated' : 'deactivated'}`, { variant: 'success' });
    } catch (error) {
      console.error('Failed to update user status:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Failed to update user status';
      enqueueSnackbar(errorMsg, { variant: 'error' });
    }
  };

  // Filter users locally (or use backend filtering via fetchUsers)
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone_number && user.phone_number.includes(searchTerm));

    const matchesRoleFilter = filterRole === 'all' || user.role === filterRole;
    const matchesStatusFilter = filterStatus === 'all' || 
      (filterStatus === 'active' ? user.is_active : !user.is_active);

    return matchesSearch && matchesRoleFilter && matchesStatusFilter;
  });

  // Export functions using real API
  const handleExportAllCSV = async () => {
    try {
      const response = await userApi.exportUsers({
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined,
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      
      link.href = url;
      link.setAttribute('download', `users-export-${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      
      enqueueSnackbar(`Exported ${users.length} users as CSV`, { variant: 'success' });
    } catch (error) {
      console.error('Export failed:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to export users';
      enqueueSnackbar(errorMsg, { variant: 'error' });
    }
  };

  const handleExportSelectedCSV = async () => {
    if (selectedUsers.length === 0) {
      enqueueSnackbar('Please select users to export', { variant: 'warning' });
      return;
    }

    try {
      // For selected users, you might need to implement a custom export endpoint
      // or export locally
      const selectedData = users.filter(user =>
        selectedUsers.includes(user.id)
      );

      // Create CSV locally
      const data = selectedData.map(user => ({
        'ID': user.id,
        'Username': user.username,
        'Email': user.email,
        'First Name': user.first_name || '',
        'Last Name': user.last_name || '',
        'Phone': user.phone_number || '',
        'Role': user.role,
        'Status': user.is_active ? 'Active' : 'Inactive',
        'Specialty': user.specialty || '',
        'Department': user.department || '',
        'Join Date': user.date_joined ? new Date(user.date_joined).toLocaleDateString() : '',
        'Last Login': user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'
      }));

      exportToCSV(data, `selected-users-export-${selectedUsers.length}-users`);
      enqueueSnackbar(`Exported ${selectedUsers.length} users as CSV`, { variant: 'success' });
    } catch (error) {
      console.error('Export failed:', error);
      enqueueSnackbar('Failed to export users', { variant: 'error' });
    }
  };

  const exportToCSV = (data, filename) => {
    const escapeCSV = (str) => {
      if (str === null || str === undefined) return '';
      const stringValue = String(str);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => escapeCSV(row[header])).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];

    link.href = url;
    link.setAttribute('download', `${filename}-${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAdvancedExport = async () => {
    try {
      const params = {
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined,
      };

      if (exportOptions.dateRange.start && exportOptions.dateRange.end) {
        params.start_date = exportOptions.dateRange.start;
        params.end_date = exportOptions.dateRange.end;
      }

      const response = await userApi.exportUsers(params);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      
      link.href = url;
      link.setAttribute('download', `advanced-users-export-${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      
      enqueueSnackbar('Export completed successfully', { variant: 'success' });
    } catch (error) {
      console.error('Export failed:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to export users';
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setShowExportModal(false);
    }
  };

  // Statistics
  const activeUsers = users.filter(u => u.is_active).length;
  const pendingUsers = users.filter(u => !u.is_active).length;
  const doctorUsers = users.filter(u => u.role === 'DOCTOR').length;
  const patientUsers = users.filter(u => u.role === 'PATIENT').length;
  const adminUsers = users.filter(u => u.role === 'ADMIN').length;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="loading-container">
        <Loader2 className="animate-spin" size={48} />
        <p className="loading-text">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="manage-users-page">
      <div className="manage-users-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">
              <Users size={32} />
            </div>
            <div>
              <h1 className="page-title">User Management</h1>
              <p className="page-subtitle">Manage system users, roles, and permissions</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleAddUser}>
            <UserPlus size={20} />
            Add New User
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="userstats-grid">
          <div className="userstats-card total-users">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <p className="stat-value">{users.length}</p>
            </div>
          </div>

          <div className="userstats-card active-users">
            <div className="stat-icon">
              <UserCheck size={24} />
            </div>
            <div className="stat-content">
              <h3>Active Users</h3>
              <p className="stat-value">{activeUsers}</p>
            </div>
          </div>

          <div className="userstats-card pending-users">
            <div className="stat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <h3>Inactive</h3>
              <p className="stat-value">{pendingUsers}</p>
            </div>
          </div>

          <div className="userstats-card doctors">
            <div className="stat-icon">
              <UserCog size={24} />
            </div>
            <div className="stat-content">
              <h3>Doctors</h3>
              <p className="stat-value">{doctorUsers}</p>
            </div>
          </div>

          <div className="userstats-card patients">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>Patients</h3>
              <p className="stat-value">{patientUsers}</p>
            </div>
          </div>

          <div className="userstats-card admins">
            <div className="stat-icon">
              <Shield size={24} />
            </div>
            <div className="stat-content">
              <h3>Admins</h3>
              <p className="stat-value">{adminUsers}</p>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedUsers.length > 0 && (
          <div className="bulk-actions-bar">
            <div className="bulk-actions-info">
              <span className="selected-count">
                {selectedUsers.length} users selected
              </span>
            </div>
            <div className="bulk-actions-buttons">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleBulkStatusUpdate(true)}
                title="Activate selected users"
              >
                <Check size={14} />
                Activate
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleBulkStatusUpdate(false)}
                title="Deactivate selected users"
              >
                <X size={14} />
                Deactivate
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleBulkDelete}
                title="Delete selected users"
              >
                <Trash2 size={14} />
                Delete
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedUsers([])}
                title="Clear selection"
              >
                <X size={14} />
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="controls-card">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, email, username, or phone..."
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
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Roles</option>
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="filter-group">
              <Activity size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="action-buttons">
              <button
                className="btn btn-secondary"
                onClick={handleExportAllCSV}
              >
                <FileDown size={20} />
                Export All
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleExportSelectedCSV}
                disabled={selectedUsers.length === 0}
              >
                <FileText size={20} />
                Export Selected ({selectedUsers.length})
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowExportModal(true)}
              >
                <Settings size={20} />
                Advanced Export
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          <div className="table-header">
            <h3>Users ({filteredUsers.length})</h3>
            <div className="table-actions">
              <div className="selection-info">
                {selectedUsers.length > 0 && (
                  <span className="selected-count">
                    {selectedUsers.length} selected
                  </span>
                )}
              </div>
              <button className="btn btn-sm btn-secondary" onClick={fetchUsers}>
                Refresh
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="select-all-checkbox"
                    />
                  </th>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Join Date</th>
                  <th>Last Login</th>
                  <th style={{ width: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-users">
                      <div className="empty-state">
                        <Users size={48} />
                        <p>No users found</p>
                        <p className="empty-subtext">
                          {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                            ? 'Try adjusting your search or filter criteria'
                            : 'Add your first user to get started'}
                        </p>
                        <button className="btn btn-primary" onClick={handleAddUser}>
                          <UserPlus size={16} />
                          Add Your First User
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className={`user-row ${selectedUsers.includes(user.id) ? 'selected' : ''}`}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="user-checkbox"
                        />
                      </td>
                      <td>
                        <div className="user-info">
                          {user.profile_picture ? (
                            <img
                              src={user.profile_picture}
                              alt={user.username}
                              className="user-avatar"
                            />
                          ) : (
                            <div className="user-avatar-placeholder">
                              {user.first_name ? user.first_name.charAt(0).toUpperCase() : 
                               user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                          <div className="user-details">
                            <div className="user-name">
                              {user.first_name || user.username} {user.last_name || ''}
                            </div>
                            <div className="user-username">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div className="contact-item">
                            <Mail size={14} />
                            {user.email}
                          </div>
                          {user.phone_number && (
                            <div className="contact-item">
                              <Phone size={14} />
                              {user.phone_number}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge role-${user.role.toLowerCase()}`}>
                          {user.role}
                          {user.specialty && <span className="role-specialty"> • {user.specialty}</span>}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="date-info">
                          <Calendar size={14} />
                          {formatDate(user.date_joined || user.created_at)}
                        </div>
                      </td>
                      <td>
                        <div className="last-login">
                          {formatDateTime(user.last_login)}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="btn btn-view btn-sm"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="btn btn-edit btn-sm"
                            title="Edit User"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user)}
                            className="btn btn-sm"
                            title={user.is_active ? 'Deactivate User' : 'Activate User'}
                            style={{
                              backgroundColor: user.is_active ? '#fef3c7' : '#dcfce7',
                              color: user.is_active ? '#92400e' : '#166534',
                              border: `1px solid ${user.is_active ? '#fbbf24' : '#22c55e'}`
                            }}
                          >
                            {user.is_active ? <Lock size={14} /> : <Unlock size={14} />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="btn btn-danger btn-sm"
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                <UserPlus size={24} />
                Add New User
              </h2>
              <button className="modal-close" onClick={() => setShowAddUser(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                    placeholder="Enter last name"
                  />
                </div>
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={newUser.phone_number}
                    onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newUser.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setNewUser({ ...newUser, is_active: e.target.value === 'active' })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                {newUser.role === 'DOCTOR' && (
                  <>
                    <div className="form-group">
                      <label>Specialty</label>
                      <input
                        type="text"
                        value={newUser.specialty}
                        onChange={(e) => setNewUser({ ...newUser, specialty: e.target.value })}
                        placeholder="Enter specialty"
                      />
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <input
                        type="text"
                        value={newUser.department}
                        onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                        placeholder="Enter department"
                      />
                    </div>
                  </>
                )}
                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea
                    value={newUser.address}
                    onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                    placeholder="Enter address"
                    rows="2"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={newUser.date_of_birth}
                    onChange={(e) => setNewUser({ ...newUser, date_of_birth: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddUser(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveNewUser}>
                <Check size={16} />
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                <FileDown size={24} />
                Advanced Export Settings
              </h2>
              <button className="modal-close" onClick={() => setShowExportModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="export-settings">
                <div className="form-group">
                  <label>Export Format</label>
                  <select
                    value={exportOptions.format}
                    onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value })}
                  >
                    <option value="csv">CSV (Excel compatible)</option>
                    <option value="json">JSON (Full data structure)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Include Columns</label>
                  <div className="column-selector">
                    {[
                      { id: 'id', label: 'ID' },
                      { id: 'name', label: 'Name' },
                      { id: 'username', label: 'Username' },
                      { id: 'email', label: 'Email' },
                      { id: 'phone', label: 'Phone' },
                      { id: 'role', label: 'Role' },
                      { id: 'status', label: 'Status' },
                      { id: 'specialty', label: 'Specialty' },
                      { id: 'department', label: 'Department' },
                      { id: 'date_joined', label: 'Join Date' },
                      { id: 'last_login', label: 'Last Login' }
                    ].map(col => (
                      <label key={col.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeColumns.includes(col.id)}
                          onChange={(e) => {
                            const newColumns = e.target.checked
                              ? [...exportOptions.includeColumns, col.id]
                              : exportOptions.includeColumns.filter(c => c !== col.id);
                            setExportOptions({ ...exportOptions, includeColumns: newColumns });
                          }}
                        />
                        {col.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Date Range</label>
                  <div className="date-range">
                    <input
                      type="date"
                      value={exportOptions.dateRange.start}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        dateRange: { ...exportOptions.dateRange, start: e.target.value }
                      })}
                    />
                    <span>to</span>
                    <input
                      type="date"
                      value={exportOptions.dateRange.end}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        dateRange: { ...exportOptions.dateRange, end: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="export-summary">
                  <h4>Export Summary</h4>
                  <p>Total users to export: {users.length}</p>
                  <p>Selected columns: {exportOptions.includeColumns.length}</p>
                  <p>Format: {exportOptions.format.toUpperCase()}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowExportModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAdvancedExport}>
                <Download size={16} />
                Generate Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                <Edit size={24} />
                Edit User
              </h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={newUser.phone_number}
                    onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newUser.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setNewUser({ ...newUser, is_active: e.target.value === 'active' })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                {newUser.role === 'DOCTOR' && (
                  <>
                    <div className="form-group">
                      <label>Specialty</label>
                      <input
                        type="text"
                        value={newUser.specialty}
                        onChange={(e) => setNewUser({ ...newUser, specialty: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <input
                        type="text"
                        value={newUser.department}
                        onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      />
                    </div>
                  </>
                )}
                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea
                    value={newUser.address}
                    onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                    rows="2"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={newUser.date_of_birth}
                    onChange={(e) => setNewUser({ ...newUser, date_of_birth: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleUpdateUser}>
                <Check size={16} />
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                <Users size={24} />
                User Details
              </h2>
              <button className="modal-close" onClick={() => setShowUserDetails(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="user-details-modal">
                <div className="user-profile-header">
                  {selectedUser.profile_picture ? (
                    <img
                      src={selectedUser.profile_picture}
                      alt={selectedUser.username}
                      className="user-avatar-large"
                    />
                  ) : (
                    <div className="user-avatar-large-placeholder">
                      {selectedUser.first_name ? selectedUser.first_name.charAt(0).toUpperCase() : 
                       selectedUser.username ? selectedUser.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="user-profile-info">
                    <h3 className="user-fullname">
                      {selectedUser.first_name || selectedUser.username} {selectedUser.last_name || ''}
                    </h3>
                    <p className="user-username">@{selectedUser.username}</p>
                    <span className={`role-badge role-${selectedUser.role.toLowerCase()}`}>
                      {selectedUser.role}
                    </span>
                    <span className={`status-badge status-${selectedUser.is_active ? 'active' : 'inactive'}`}>
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="user-details-grid">
                  <div className="detail-section">
                    <h4>Contact Information</h4>
                    <div className="detail-item">
                      <Mail size={16} />
                      <span>{selectedUser.email}</span>
                    </div>
                    {selectedUser.phone_number && (
                      <div className="detail-item">
                        <Phone size={16} />
                        <span>{selectedUser.phone_number}</span>
                      </div>
                    )}
                    {selectedUser.address && (
                      <div className="detail-item">
                        <span className="detail-label">Address:</span>
                        <span>{selectedUser.address}</span>
                      </div>
                    )}
                    {selectedUser.date_of_birth && (
                      <div className="detail-item">
                        <Calendar size={16} />
                        <span>Date of Birth: {formatDate(selectedUser.date_of_birth)}</span>
                      </div>
                    )}
                  </div>

                  <div className="detail-section">
                    <h4>Account Information</h4>
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>Joined: {formatDate(selectedUser.date_joined || selectedUser.created_at)}</span>
                    </div>
                    <div className="detail-item">
                      <Activity size={16} />
                      <span>Last Login: {formatDateTime(selectedUser.last_login)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Account Verified:</span>
                      <span>{selectedUser.is_verified ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  {selectedUser.role === 'DOCTOR' && (
                    <div className="detail-section">
                      <h4>Professional Information</h4>
                      {selectedUser.specialty && (
                        <div className="detail-item">
                          <span className="detail-label">Specialty:</span>
                          <span>{selectedUser.specialty}</span>
                        </div>
                      )}
                      {selectedUser.department && (
                        <div className="detail-item">
                          <span className="detail-label">Department:</span>
                          <span>{selectedUser.department}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowUserDetails(false)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowUserDetails(false);
                  handleEditUser(selectedUser);
                }}
              >
                <Edit size={16} />
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;