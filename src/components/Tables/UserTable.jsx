import React, { useState } from 'react';
import { Eye, Edit, Trash2, Mail, Phone } from 'lucide-react';
import './UserTable.css';

const UserTable = ({ users, onEdit, onDelete, onView }) => {
  const [sortField, setSortField] = useState('first_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (sortDirection === 'asc') {
      return aValue.toString().localeCompare(bValue.toString());
    } else {
      return bValue.toString().localeCompare(aValue.toString());
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      PATIENT: { class: 'role-badge-patient', text: 'Patient' },
      DOCTOR: { class: 'role-badge-doctor', text: 'Doctor' },
      ADMIN: { class: 'role-badge-admin', text: 'Admin' },
    };
    
    const config = roleConfig[role] || { class: 'role-badge-default', text: role };
    return (
      <span className={`role-badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="status-badge status-active">
        Active
      </span>
    ) : (
      <span className="status-badge status-inactive">
        Inactive
      </span>
    );
  };

  const getInitials = (user) => {
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="user-table-container">
      <div className="table-header">
        <div className="table-header-content">
          <h3>System Users ({filteredUsers.length} users)</h3>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th 
                className="sortable-header"
                onClick={() => handleSort('first_name')}
              >
                User
                {sortField === 'first_name' && (
                  <span className="sort-indicator">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('email')}
              >
                Contact
                {sortField === 'email' && (
                  <span className="sort-indicator">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  {searchTerm ? 'No users found matching your search' : 'No users found'}
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => (
                <tr key={user.id} className="user-row">
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {getInitials(user)}
                      </div>
                      <div className="user-details">
                        <div className="user-name">
                          <strong>{user.first_name} {user.last_name}</strong>
                        </div>
                        <div className="user-username">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-contact">
                      <div className="user-email">
                        <Mail size={12} />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="user-phone">
                          <Phone size={12} />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {getRoleBadge(user.role)}
                  </td>
                  <td>
                    {getStatusBadge(user.is_active)}
                  </td>
                  <td>
                    {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => onView(user)}
                        className="btn btn-view btn-sm"
                        title="View User"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => onEdit(user)}
                        className="btn btn-edit btn-sm"
                        title="Edit User"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(user)}
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
  );
};

export default UserTable;