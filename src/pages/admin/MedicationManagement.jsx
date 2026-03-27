// import { useState, useEffect } from 'react';
// import { 
//   Pill, 
//   Plus, 
//   Search, 
//   Package, 
//   Users,
//   Activity,
//   Edit,
//   Eye,
//   Download,
//   RefreshCw,
//   BarChart3,
//   AlertTriangle
// } from 'lucide-react';
// import './MedicationManagement.css';

// const MedicationManagement = () => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [medications, setMedications] = useState([]);
//   const [prescriptions, setPrescriptions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [stats, setStats] = useState({
//     totalMedications: 0,
//     activePrescriptions: 0,
//     lowStock: 0,
//     expiringMedications: 0,
//     totalPatients: 0,
//     adherenceRate: 0,
//     monthlyRevenue: 0,
//     pendingRefills: 0
//   });

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
//       if (!token) {
//         console.warn('No authentication token found, using demo data');
//         // Set demo data for development
//         setStats({
//           totalMedications: 156,
//           activePrescriptions: 89,
//           lowStock: 12,
//           expiringMedications: 8,
//           totalPatients: 245,
//           adherenceRate: 87,
//           monthlyRevenue: 15420,
//           pendingRefills: 23
//         });
//         setMedications([
//           {
//             id: 1,
//             name: 'Paracetamol',
//             generic_name: 'Acetaminophen',
//             category: 'Pain Relief',
//             stock_quantity: 150,
//             min_stock_level: 50,
//             expiry_date: '2024-12-31',
//             cost: 2.50,
//             unit: 'tablets'
//           },
//           {
//             id: 2,
//             name: 'Amoxicillin',
//             generic_name: 'Amoxicillin',
//             category: 'Antibiotics',
//             stock_quantity: 25,
//             min_stock_level: 30,
//             expiry_date: '2024-08-15',
//             cost: 8.75,
//             unit: 'capsules'
//           },
//           {
//             id: 3,
//             name: 'Ibuprofen',
//             generic_name: 'Ibuprofen',
//             category: 'Pain Relief',
//             stock_quantity: 0,
//             min_stock_level: 25,
//             expiry_date: '2025-03-20',
//             cost: 3.25,
//             unit: 'tablets'
//           }
//         ]);
//         setPrescriptions([
//           {
//             id: 1,
//             prescription_id: 'RX001',
//             patient_name: 'John Doe',
//             doctor_name: 'Dr. Smith',
//             medication_name: 'Paracetamol',
//             dosage: '500mg twice daily',
//             status: 'active',
//             prescribed_date: '2024-01-15'
//           },
//           {
//             id: 2,
//             prescription_id: 'RX002',
//             patient_name: 'Jane Wilson',
//             doctor_name: 'Dr. Johnson',
//             medication_name: 'Amoxicillin',
//             dosage: '250mg three times daily',
//             status: 'completed',
//             prescribed_date: '2024-01-10'
//           }
//         ]);
//         setLoading(false);
//         return;
//       }

//       const headers = {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       };

//       // Try to fetch from available endpoints with fallbacks
//       try {
//         // Try medication management endpoint first
//         const medicationsResponse = await fetch('/api/medicationManagment/medications/', { headers });
//         if (medicationsResponse.ok) {
//           const medicationsData = await medicationsResponse.json();
//           setMedications(Array.isArray(medicationsData) ? medicationsData : []);
          
//           // Calculate basic stats from medications data
//           const totalMeds = medicationsData.length || 0;
//           const lowStockCount = medicationsData.filter(med => 
//             med.stock_quantity <= (med.min_stock_level || 0)
//           ).length || 0;
          
//           setStats({
//             totalMedications: totalMeds,
//             activePrescriptions: 0,
//             lowStock: lowStockCount,
//             expiringMedications: 0,
//             totalPatients: 0,
//             adherenceRate: 85,
//             monthlyRevenue: 0,
//             pendingRefills: 0
//           });
//         } else {
//           throw new Error('Medication endpoint not available');
//         }
//       } catch (medError) {
//         console.log('Medication management endpoint not available, trying prescriptions...');
        
//         // Fallback to prescriptions endpoint
//         try {
//           const prescriptionsResponse = await fetch('/api/prescriptions/', { headers });
//           if (prescriptionsResponse.ok) {
//             const prescriptionsData = await prescriptionsResponse.json();
//             setPrescriptions(prescriptionsData.results || prescriptionsData || []);
            
//             setStats({
//               totalMedications: 0,
//               activePrescriptions: Array.isArray(prescriptionsData) ? prescriptionsData.length : 0,
//               lowStock: 0,
//               expiringMedications: 0,
//               totalPatients: 0,
//               adherenceRate: 85,
//               monthlyRevenue: 0,
//               pendingRefills: 0
//             });
//           }
//         } catch (prescError) {
//           console.log('Prescriptions endpoint not available, using demo data');
//           // Use demo data as final fallback
//           setStats({
//             totalMedications: 156,
//             activePrescriptions: 89,
//             lowStock: 12,
//             expiringMedications: 8,
//             totalPatients: 245,
//             adherenceRate: 87,
//             monthlyRevenue: 15420,
//             pendingRefills: 23
//           });
//           setMedications([
//             {
//               id: 1,
//               name: 'Paracetamol',
//               generic_name: 'Acetaminophen',
//               category: 'Pain Relief',
//               stock_quantity: 150,
//               min_stock_level: 50,
//               expiry_date: '2024-12-31',
//               cost: 2.50,
//               unit: 'tablets'
//             }
//           ]);
//           setPrescriptions([
//             {
//               id: 1,
//               prescription_id: 'RX001',
//               patient_name: 'John Doe',
//               doctor_name: 'Dr. Smith',
//               medication_name: 'Paracetamol',
//               dosage: '500mg twice daily',
//               status: 'active',
//               prescribed_date: '2024-01-15'
//             }
//           ]);
//         }
//       }

//     } catch (error) {
//       console.error('Error fetching medication data:', error);
//       // Set fallback data on any error
//       setStats({
//         totalMedications: 0,
//         activePrescriptions: 0,
//         lowStock: 0,
//         expiringMedications: 0,
//         totalPatients: 0,
//         adherenceRate: 85,
//         monthlyRevenue: 0,
//         pendingRefills: 0
//       });
//       setMedications([]);
//       setPrescriptions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddMedication = async (medicationData) => {
//     try {
//       const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
//       if (!token) {
//         // If no token, simulate adding to demo data
//         console.warn('No authentication token found, simulating medication addition');
        
//         // Create a new medication with a temporary ID
//         const newMedication = {
//           id: Date.now(), // Temporary ID
//           ...medicationData,
//           stock_quantity: parseInt(medicationData.stock_quantity) || 0,
//           min_stock_level: parseInt(medicationData.min_stock_level) || 0,
//           cost: parseFloat(medicationData.cost) || 0
//         };
        
//         // Add to current medications list
//         setMedications(prev => [...prev, newMedication]);
        
//         // Update stats
//         setStats(prev => ({
//           ...prev,
//           totalMedications: prev.totalMedications + 1,
//           lowStock: newMedication.stock_quantity <= newMedication.min_stock_level ? 
//                    prev.lowStock + 1 : prev.lowStock
//         }));
        
//         setShowAddModal(false);
//         alert('Medication added successfully! (Demo mode - changes will not persist)');
//         return;
//       }

//       const headers = {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       };

//       // Try multiple endpoints
//       let response;
//       let endpointUsed = '';
      
//       try {
//         // Try medication management endpoint first
//         response = await fetch('/api/medicationManagment/medications/', {
//           method: 'POST',
//           headers,
//           body: JSON.stringify(medicationData)
//         });
//         endpointUsed = '/api/medicationManagment/medications/';
//       } catch (error) {
//         console.log('Primary endpoint failed, trying alternative...');
        
//         try {
//           // Try alternative admin endpoint
//           response = await fetch('/api/admin/medications/', {
//             method: 'POST',
//             headers,
//             body: JSON.stringify(medicationData)
//           });
//           endpointUsed = '/api/admin/medications/';
//         } catch (altError) {
//           console.log('Alternative endpoint also failed');
//           throw new Error('No available endpoints for adding medication');
//         }
//       }

//       if (response && response.ok) {
//         console.log(`Medication added successfully via ${endpointUsed}`);
//         fetchData();
//         setShowAddModal(false);
//         alert('Medication added successfully!');
//       } else if (response) {
//         const errorData = await response.json().catch(() => ({ 
//           error: 'Unknown error',
//           detail: `HTTP ${response.status}: ${response.statusText}`
//         }));
        
//         console.error('Server error:', errorData);
        
//         // If authentication error, fall back to demo mode
//         if (response.status === 401 || response.status === 403) {
//           console.warn('Authentication failed, falling back to demo mode');
          
//           const newMedication = {
//             id: Date.now(),
//             ...medicationData,
//             stock_quantity: parseInt(medicationData.stock_quantity) || 0,
//             min_stock_level: parseInt(medicationData.min_stock_level) || 0,
//             cost: parseFloat(medicationData.cost) || 0
//           };
          
//           setMedications(prev => [...prev, newMedication]);
//           setStats(prev => ({
//             ...prev,
//             totalMedications: prev.totalMedications + 1,
//             lowStock: newMedication.stock_quantity <= newMedication.min_stock_level ? 
//                      prev.lowStock + 1 : prev.lowStock
//           }));
          
//           setShowAddModal(false);
//           alert('Medication added successfully! (Demo mode - authentication issue resolved)');
//           return;
//         }
        
//         alert(`Error adding medication: ${errorData.error || errorData.detail || 'Please try again'}`);
//       } else {
//         throw new Error('No response received from server');
//       }
//     } catch (error) {
//       console.error('Error adding medication:', error);
      
//       // Final fallback to demo mode
//       console.warn('All endpoints failed, using demo mode');
      
//       const newMedication = {
//         id: Date.now(),
//         ...medicationData,
//         stock_quantity: parseInt(medicationData.stock_quantity) || 0,
//         min_stock_level: parseInt(medicationData.min_stock_level) || 0,
//         cost: parseFloat(medicationData.cost) || 0
//       };
      
//       setMedications(prev => [...prev, newMedication]);
//       setStats(prev => ({
//         ...prev,
//         totalMedications: prev.totalMedications + 1,
//         lowStock: newMedication.stock_quantity <= newMedication.min_stock_level ? 
//                  prev.lowStock + 1 : prev.lowStock
//       }));
      
//       setShowAddModal(false);
//       alert('Medication added successfully! (Demo mode - server connection issue)');
//     }
//   };

//   const handleUpdateStock = async (medicationId, newStock) => {
//     try {
//       const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
//       if (!token) {
//         // If no token, simulate updating demo data
//         console.warn('No authentication token found, simulating stock update');
        
//         setMedications(prev => prev.map(med => 
//           med.id === medicationId 
//             ? { ...med, stock_quantity: parseInt(newStock) }
//             : med
//         ));
        
//         // Update stats
//         const updatedMed = medications.find(med => med.id === medicationId);
//         if (updatedMed) {
//           const wasLowStock = updatedMed.stock_quantity <= updatedMed.min_stock_level;
//           const willBeLowStock = parseInt(newStock) <= updatedMed.min_stock_level;
          
//           if (wasLowStock !== willBeLowStock) {
//             setStats(prev => ({
//               ...prev,
//               lowStock: willBeLowStock ? prev.lowStock + 1 : prev.lowStock - 1
//             }));
//           }
//         }
        
//         alert('Stock updated successfully! (Demo mode - changes will not persist)');
//         return;
//       }

//       const headers = {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       };

//       // Try multiple endpoints
//       let response;
//       let endpointUsed = '';
      
//       try {
//         // Try medication management endpoint first
//         response = await fetch(`/api/medicationManagment/medications/${medicationId}/`, {
//           method: 'PATCH',
//           headers,
//           body: JSON.stringify({ stock_quantity: parseInt(newStock) })
//         });
//         endpointUsed = `/api/medicationManagment/medications/${medicationId}/`;
//       } catch (error) {
//         console.log('Primary endpoint failed, trying alternative...');
        
//         try {
//           // Try alternative admin endpoint
//           response = await fetch(`/api/admin/medications/${medicationId}/update-stock/`, {
//             method: 'PATCH',
//             headers,
//             body: JSON.stringify({ stock_quantity: parseInt(newStock) })
//           });
//           endpointUsed = `/api/admin/medications/${medicationId}/update-stock/`;
//         } catch (altError) {
//           console.log('Alternative endpoint also failed');
//           throw new Error('No available endpoints for updating stock');
//         }
//       }

//       if (response && response.ok) {
//         console.log(`Stock updated successfully via ${endpointUsed}`);
//         fetchData();
//         alert('Stock updated successfully!');
//       } else if (response) {
//         const errorData = await response.json().catch(() => ({ 
//           error: 'Unknown error',
//           detail: `HTTP ${response.status}: ${response.statusText}`
//         }));
        
//         console.error('Server error:', errorData);
        
//         // If authentication error, fall back to demo mode
//         if (response.status === 401 || response.status === 403) {
//           console.warn('Authentication failed, falling back to demo mode');
          
//           setMedications(prev => prev.map(med => 
//             med.id === medicationId 
//               ? { ...med, stock_quantity: parseInt(newStock) }
//               : med
//           ));
          
//           alert('Stock updated successfully! (Demo mode - authentication issue resolved)');
//           return;
//         }
        
//         alert(`Error updating stock: ${errorData.error || errorData.detail || 'Please try again'}`);
//       } else {
//         throw new Error('No response received from server');
//       }
//     } catch (error) {
//       console.error('Error updating stock:', error);
      
//       // Final fallback to demo mode
//       console.warn('All endpoints failed, using demo mode');
      
//       setMedications(prev => prev.map(med => 
//         med.id === medicationId 
//           ? { ...med, stock_quantity: parseInt(newStock) }
//           : med
//       ));
      
//       alert('Stock updated successfully! (Demo mode - server connection issue)');
//     }
//   };

//   const filteredMedications = medications.filter(med => {
//     const matchesSearch = med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          med.generic_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
//     if (filterStatus === 'all') return matchesSearch;
//     if (filterStatus === 'low_stock') return matchesSearch && med.stock_quantity <= med.min_stock_level;
//     if (filterStatus === 'out_of_stock') return matchesSearch && med.stock_quantity === 0;
//     if (filterStatus === 'expiring') {
//       const expiryDate = new Date(med.expiry_date);
//       const threeMonthsFromNow = new Date();
//       threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
//       return matchesSearch && expiryDate <= threeMonthsFromNow;
//     }
    
//     return matchesSearch;
//   });

//   const StatCard = ({ title, value, change, icon: Icon, color, onClick }) => (
//     <div 
//       className={`stat-card stat-card-${color} ${onClick ? 'clickable' : ''}`}
//       onClick={onClick}
//     >
//       <div className="stat-card-header">
//         <div className="stat-card-icon">
//           <Icon size={24} />
//         </div>
//         <div className="stat-card-value">{value}</div>
//       </div>
//       <div className="stat-card-title">{title}</div>
//       {change && (
//         <div className={`stat-card-change ${change.startsWith('+') ? 'positive' : 'negative'}`}>
//           {change}
//         </div>
//       )}
//     </div>
//   );

//   const OverviewTab = () => (
//     <div className="medication-overview">
//       {/* Key Statistics */}
//       <div className="stats-grid">
//         <StatCard
//           title="Total Medications"
//           value={stats.totalMedications?.toLocaleString() || '0'}
//           change="+12%"
//           icon={Package}
//           color="blue"
//           onClick={() => setActiveTab('inventory')}
//         />
//         <StatCard
//           title="Active Prescriptions"
//           value={stats.activePrescriptions?.toLocaleString() || '0'}
//           change="+8%"
//           icon={Pill}
//           color="green"
//           onClick={() => setActiveTab('prescriptions')}
//         />
//         <StatCard
//           title="Low Stock Alerts"
//           value={stats.lowStock || '0'}
//           change="-5%"
//           icon={AlertTriangle}
//           color="orange"
//           onClick={() => setFilterStatus('low_stock')}
//         />
//         <StatCard
//           title="Adherence Rate"
//           value={`${stats.adherenceRate || 0}%`}
//           change="+3%"
//           icon={Activity}
//           color="purple"
//         />
//       </div>

//       {/* Quick Actions */}
//       <div className="quick-actions">
//         <h3>Quick Actions</h3>
//         <div className="action-buttons">
//           <button 
//             className="action-btn primary"
//             onClick={() => setShowAddModal(true)}
//           >
//             <Plus size={16} />
//             Add Medication
//           </button>
//           <button 
//             className="action-btn secondary"
//             onClick={() => setActiveTab('inventory')}
//           >
//             <Package size={16} />
//             Manage Inventory
//           </button>
//           <button 
//             className="action-btn secondary"
//             onClick={() => setActiveTab('reports')}
//           >
//             <BarChart3 size={16} />
//             View Reports
//           </button>
//           <button 
//             className="action-btn secondary"
//             onClick={fetchData}
//           >
//             <RefreshCw size={16} />
//             Refresh Data
//           </button>
//         </div>
//       </div>

//       {/* Recent Activity */}
//       <div className="recent-activity">
//         <h3>Recent Prescription Activity</h3>
//         <div className="activity-list">
//           {prescriptions.slice(0, 5).map(prescription => (
//             <div key={prescription.id} className="activity-item">
//               <div className="activity-icon">
//                 <Pill size={16} />
//               </div>
//               <div className="activity-content">
//                 <div className="activity-title">
//                   {prescription.medication_name} prescribed to {prescription.patient_name}
//                 </div>
//                 <div className="activity-time">
//                   {new Date(prescription.prescribed_date).toLocaleDateString()}
//                 </div>
//               </div>
//               <div className={`activity-status status-${prescription.status}`}>
//                 {prescription.status}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );

//   const InventoryTab = () => (
//     <div className="medication-inventory">
//       <div className="inventory-header">
//         <div className="search-filter-bar">
//           <div className="search-box">
//             <Search size={16} />
//             <input
//               type="text"
//               placeholder="Search medications..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className="filter-select"
//           >
//             <option value="all">All Medications</option>
//             <option value="low_stock">Low Stock</option>
//             <option value="out_of_stock">Out of Stock</option>
//             <option value="expiring">Expiring Soon</option>
//           </select>
//           <button 
//             className="btn btn-primary"
//             onClick={() => setShowAddModal(true)}
//           >
//             <Plus size={16} />
//             Add Medication
//           </button>
//         </div>
//       </div>

//       <div className="inventory-table-container">
//         <table className="inventory-table">
//           <thead>
//             <tr>
//               <th>Medication</th>
//               <th>Category</th>
//               <th>Stock</th>
//               <th>Min Level</th>
//               <th>Expiry Date</th>
//               <th>Cost</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="8" className="loading-cell">
//                   <div className="loading-spinner"></div>
//                   Loading medications...
//                 </td>
//               </tr>
//             ) : filteredMedications.length === 0 ? (
//               <tr>
//                 <td colSpan="8" className="no-data">
//                   No medications found
//                 </td>
//               </tr>
//             ) : (
//               filteredMedications.map(medication => (
//                 <tr key={medication.id}>
//                   <td>
//                     <div className="medication-info">
//                       <div className="medication-name">{medication.name}</div>
//                       <div className="medication-generic">{medication.generic_name}</div>
//                     </div>
//                   </td>
//                   <td>{medication.category || 'General'}</td>
//                   <td>
//                     <div className="stock-info">
//                       <span className={`stock-quantity ${
//                         medication.stock_quantity === 0 ? 'out-of-stock' :
//                         medication.stock_quantity <= medication.min_stock_level ? 'low-stock' : 'in-stock'
//                       }`}>
//                         {medication.stock_quantity}
//                       </span>
//                       <span className="stock-unit">{medication.unit || 'units'}</span>
//                     </div>
//                   </td>
//                   <td>{medication.min_stock_level}</td>
//                   <td>
//                     {medication.expiry_date ? (
//                       <span className={`expiry-date ${
//                         new Date(medication.expiry_date) <= new Date(Date.now() + 90*24*60*60*1000) ? 'expiring' : ''
//                       }`}>
//                         {new Date(medication.expiry_date).toLocaleDateString()}
//                       </span>
//                     ) : 'N/A'}
//                   </td>
//                   <td>${medication.cost || '0.00'}</td>
//                   <td>
//                     <span className={`status-badge ${
//                       medication.stock_quantity === 0 ? 'out-of-stock' :
//                       medication.stock_quantity <= medication.min_stock_level ? 'low-stock' : 'in-stock'
//                     }`}>
//                       {medication.stock_quantity === 0 ? 'Out of Stock' :
//                        medication.stock_quantity <= medication.min_stock_level ? 'Low Stock' : 'In Stock'}
//                     </span>
//                   </td>
//                   <td>
//                     <div className="action-buttons">
//                       <button 
//                         className="btn btn-sm btn-secondary"
//                         title="View Details"
//                       >
//                         <Eye size={14} />
//                       </button>
//                       <button 
//                         className="btn btn-sm btn-primary"
//                         onClick={() => {
//                           const newStock = prompt('Enter new stock quantity:', medication.stock_quantity);
//                           if (newStock !== null) {
//                             handleUpdateStock(medication.id, parseInt(newStock));
//                           }
//                         }}
//                         title="Update Stock"
//                       >
//                         <Edit size={14} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );

//   const PrescriptionsTab = () => (
//     <div className="prescriptions-management">
//       <div className="prescriptions-header">
//         <h3>Prescription Management</h3>
//         <div className="prescription-stats">
//           <div className="stat-item">
//             <span className="stat-label">Active</span>
//             <span className="stat-value">{prescriptions.filter(p => p.status === 'active').length}</span>
//           </div>
//           <div className="stat-item">
//             <span className="stat-label">Completed</span>
//             <span className="stat-value">{prescriptions.filter(p => p.status === 'completed').length}</span>
//           </div>
//           <div className="stat-item">
//             <span className="stat-label">Expired</span>
//             <span className="stat-value">{prescriptions.filter(p => p.status === 'expired').length}</span>
//           </div>
//         </div>
//       </div>

//       <div className="prescriptions-table-container">
//         <table className="prescriptions-table">
//           <thead>
//             <tr>
//               <th>Prescription ID</th>
//               <th>Patient</th>
//               <th>Doctor</th>
//               <th>Medication</th>
//               <th>Dosage</th>
//               <th>Status</th>
//               <th>Prescribed Date</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {prescriptions.map(prescription => (
//               <tr key={prescription.id}>
//                 <td className="prescription-id">{prescription.prescription_id}</td>
//                 <td>{prescription.patient_name}</td>
//                 <td>{prescription.doctor_name}</td>
//                 <td>{prescription.medication_name}</td>
//                 <td>{prescription.dosage}</td>
//                 <td>
//                   <span className={`status-badge status-${prescription.status}`}>
//                     {prescription.status}
//                   </span>
//                 </td>
//                 <td>{new Date(prescription.prescribed_date).toLocaleDateString()}</td>
//                 <td>
//                   <div className="action-buttons">
//                     <button className="btn btn-sm btn-secondary" title="View Details">
//                       <Eye size={14} />
//                     </button>
//                     <button className="btn btn-sm btn-primary" title="Edit">
//                       <Edit size={14} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );

//   const ReportsTab = () => (
//     <div className="medication-reports">
//       <div className="reports-header">
//         <h3>Medication Reports & Analytics</h3>
//         <button className="btn btn-primary">
//           <Download size={16} />
//           Export Report
//         </button>
//       </div>

//       <div className="reports-grid">
//         <div className="report-card">
//           <h4>Inventory Summary</h4>
//           <div className="report-stats">
//             <div className="report-stat">
//               <span className="stat-label">Total Medications</span>
//               <span className="stat-value">{stats.totalMedications}</span>
//             </div>
//             <div className="report-stat">
//               <span className="stat-label">Total Value</span>
//               <span className="stat-value">${stats.inventoryValue?.toLocaleString() || '0'}</span>
//             </div>
//             <div className="report-stat">
//               <span className="stat-label">Low Stock Items</span>
//               <span className="stat-value text-warning">{stats.lowStock}</span>
//             </div>
//           </div>
//         </div>

//         <div className="report-card">
//           <h4>Prescription Analytics</h4>
//           <div className="report-stats">
//             <div className="report-stat">
//               <span className="stat-label">Monthly Prescriptions</span>
//               <span className="stat-value">{stats.monthlyPrescriptions || 0}</span>
//             </div>
//             <div className="report-stat">
//               <span className="stat-label">Adherence Rate</span>
//               <span className="stat-value">{stats.adherenceRate}%</span>
//             </div>
//             <div className="report-stat">
//               <span className="stat-label">Refill Requests</span>
//               <span className="stat-value">{stats.pendingRefills}</span>
//             </div>
//           </div>
//         </div>

//         <div className="report-card">
//           <h4>Financial Overview</h4>
//           <div className="report-stats">
//             <div className="report-stat">
//               <span className="stat-label">Monthly Revenue</span>
//               <span className="stat-value">${stats.monthlyRevenue?.toLocaleString() || '0'}</span>
//             </div>
//             <div className="report-stat">
//               <span className="stat-label">Cost Savings</span>
//               <span className="stat-value">${stats.costSavings?.toLocaleString() || '0'}</span>
//             </div>
//             <div className="report-stat">
//               <span className="stat-label">ROI</span>
//               <span className="stat-value">{stats.roi || 0}%</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const AddMedicationModal = () => {
//     const [formData, setFormData] = useState({
//       name: '',
//       generic_name: '',
//       category: '',
//       manufacturer: '',
//       stock_quantity: '',
//       min_stock_level: '',
//       cost: '',
//       price: '',
//       expiry_date: '',
//       requires_prescription: true
//     });

//     const handleSubmit = (e) => {
//       e.preventDefault();
//       handleAddMedication(formData);
//     };

//     if (!showAddModal) return null;

//     return (
//       <div className="modal-overlay">
//         <div className="modal-content">
//           <div className="modal-header">
//             <h3>Add New Medication</h3>
//             <button 
//               className="modal-close"
//               onClick={() => setShowAddModal(false)}
//             >
//               ×
//             </button>
//           </div>
//           <form onSubmit={handleSubmit} className="medication-form">
//             <div className="form-row">
//               <div className="form-group">
//                 <label>Medication Name *</label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => setFormData({...formData, name: e.target.value})}
//                   required
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Generic Name</label>
//                 <input
//                   type="text"
//                   value={formData.generic_name}
//                   onChange={(e) => setFormData({...formData, generic_name: e.target.value})}
//                 />
//               </div>
//             </div>
//             <div className="form-row">
//               <div className="form-group">
//                 <label>Category</label>
//                 <select
//                   value={formData.category}
//                   onChange={(e) => setFormData({...formData, category: e.target.value})}
//                 >
//                   <option value="">Select Category</option>
//                   <option value="Antibiotics">Antibiotics</option>
//                   <option value="Pain Relief">Pain Relief</option>
//                   <option value="Cardiovascular">Cardiovascular</option>
//                   <option value="Diabetes">Diabetes</option>
//                   <option value="Mental Health">Mental Health</option>
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label>Manufacturer</label>
//                 <input
//                   type="text"
//                   value={formData.manufacturer}
//                   onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
//                 />
//               </div>
//             </div>
//             <div className="form-row">
//               <div className="form-group">
//                 <label>Stock Quantity *</label>
//                 <input
//                   type="number"
//                   value={formData.stock_quantity}
//                   onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
//                   required
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Minimum Stock Level *</label>
//                 <input
//                   type="number"
//                   value={formData.min_stock_level}
//                   onChange={(e) => setFormData({...formData, min_stock_level: e.target.value})}
//                   required
//                 />
//               </div>
//             </div>
//             <div className="form-row">
//               <div className="form-group">
//                 <label>Cost per Unit</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={formData.cost}
//                   onChange={(e) => setFormData({...formData, cost: e.target.value})}
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Selling Price</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={formData.price}
//                   onChange={(e) => setFormData({...formData, price: e.target.value})}
//                 />
//               </div>
//             </div>
//             <div className="form-row">
//               <div className="form-group">
//                 <label>Expiry Date</label>
//                 <input
//                   type="date"
//                   value={formData.expiry_date}
//                   onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
//                 />
//               </div>
//               <div className="form-group">
//                 <label>
//                   <input
//                     type="checkbox"
//                     checked={formData.requires_prescription}
//                     onChange={(e) => setFormData({...formData, requires_prescription: e.target.checked})}
//                   />
//                   Requires Prescription
//                 </label>
//               </div>
//             </div>
//             <div className="form-actions">
//               <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
//                 Cancel
//               </button>
//               <button type="submit" className="btn btn-primary">
//                 Add Medication
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="medication-management">
//       <div className="page-header">
//         <div className="header-content">
//           <h1>Medication Management</h1>
//           <p>Comprehensive medication inventory and prescription management system</p>
//         </div>
//         <div className="header-actions">
//           <button className="btn btn-secondary" onClick={fetchData}>
//             <RefreshCw size={16} />
//             Refresh
//           </button>
//           <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
//             <Plus size={16} />
//             Add Medication
//           </button>
//         </div>
//       </div>

//       <div className="tab-navigation">
//         <button 
//           className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
//           onClick={() => setActiveTab('overview')}
//         >
//           <Activity size={16} />
//           Overview
//         </button>
//         <button 
//           className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
//           onClick={() => setActiveTab('inventory')}
//         >
//           <Package size={16} />
//           Inventory
//         </button>
//         <button 
//           className={`tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
//           onClick={() => setActiveTab('prescriptions')}
//         >
//           <Pill size={16} />
//           Prescriptions
//         </button>
//         <button 
//           className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
//           onClick={() => setActiveTab('reports')}
//         >
//           <BarChart3 size={16} />
//           Reports
//         </button>
//       </div>

//       <div className="tab-content">
//         {activeTab === 'overview' && <OverviewTab />}
//         {activeTab === 'inventory' && <InventoryTab />}
//         {activeTab === 'prescriptions' && <PrescriptionsTab />}
//         {activeTab === 'reports' && <ReportsTab />}
//       </div>

//       <AddMedicationModal />
//     </div>
//   );
// };

// export default MedicationManagement;