import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Activity, 
  AlertTriangle,
  Eye,
  Edit,
  RefreshCw,
  Heart,
  Thermometer,
  Stethoscope,
  Pill
} from 'lucide-react';
import { medicalRecordsApi, demoMedicalRecords } from '../../api/medicalRecordsApi';
import './MedicalRecords.css';

const MedicalRecords = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [records, setRecords] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [medications, setMedications] = useState([]);
  const [vitalSigns, setVitalSigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);

  useEffect(() => {
    fetchMedicalData();
  }, []);

  const fetchMedicalData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      if (!token) {
        console.warn('No authentication token found, using demo data');
        setRecords(demoMedicalRecords.records);
        setAllergies(demoMedicalRecords.allergies);
        setDiagnoses(demoMedicalRecords.diagnoses);
        setMedications(demoMedicalRecords.medications);
        setVitalSigns(demoMedicalRecords.vitalSigns);
        setLoading(false);
        return;
      }

      try {
        // Try to fetch real data
        const [recordsData, allergiesData, diagnosesData, medicationsData, vitalsData] = await Promise.allSettled([
          medicalRecordsApi.getMedicalRecords(),
          medicalRecordsApi.getAllergies(),
          medicalRecordsApi.getDiagnoses(),
          medicalRecordsApi.getMedicationHistory(),
          medicalRecordsApi.getVitalSigns()
        ]);

        setRecords(recordsData.status === 'fulfilled' ? recordsData.value.results || recordsData.value || [] : []);
        setAllergies(allergiesData.status === 'fulfilled' ? allergiesData.value.results || allergiesData.value || [] : []);
        setDiagnoses(diagnosesData.status === 'fulfilled' ? diagnosesData.value.results || diagnosesData.value || [] : []);
        setMedications(medicationsData.status === 'fulfilled' ? medicationsData.value.results || medicationsData.value || [] : []);
        setVitalSigns(vitalsData.status === 'fulfilled' ? vitalsData.value.results || vitalsData.value || [] : []);

      } catch (error) {
        console.log('API endpoints not available, using demo data');
        setRecords(demoMedicalRecords.records);
        setAllergies(demoMedicalRecords.allergies);
        setDiagnoses(demoMedicalRecords.diagnoses);
        setMedications(demoMedicalRecords.medications);
        setVitalSigns(demoMedicalRecords.vitalSigns);
      }

    } catch (error) {
      console.error('Error fetching medical data:', error);
      // Fallback to demo data
      setRecords(demoMedicalRecords.records);
      setAllergies(demoMedicalRecords.allergies);
      setDiagnoses(demoMedicalRecords.diagnoses);
      setMedications(demoMedicalRecords.medications);
      setVitalSigns(demoMedicalRecords.vitalSigns);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (recordData) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      if (!token) {
        // Demo mode - add to local state
        const newRecord = {
          id: Date.now(),
          ...recordData,
          date_recorded: new Date().toISOString(),
          patient: { id: 1, user: { first_name: 'John', last_name: 'Doe' } },
          doctor: { id: 1, user: { first_name: 'Dr. Sarah', last_name: 'Smith' } }
        };
        
        setRecords(prev => [newRecord, ...prev]);
        setShowAddModal(false);
        alert('Medical record added successfully! (Demo mode)');
        return;
      }

      try {
        const newRecord = await medicalRecordsApi.createMedicalRecord(recordData);
        setRecords(prev => [newRecord, ...prev]);
        setShowAddModal(false);
        alert('Medical record added successfully!');
      } catch (error) {
        console.error('API error, falling back to demo mode');
        const newRecord = {
          id: Date.now(),
          ...recordData,
          date_recorded: new Date().toISOString(),
          patient: { id: 1, user: { first_name: 'John', last_name: 'Doe' } },
          doctor: { id: 1, user: { first_name: 'Dr. Sarah', last_name: 'Smith' } }
        };
        
        setRecords(prev => [newRecord, ...prev]);
        setShowAddModal(false);
        alert('Medical record added successfully! (Demo mode - API not available)');
      }
    } catch (error) {
      console.error('Error adding medical record:', error);
      alert('Error adding medical record. Please try again.');
    }
  };

  const handleAddVitalSigns = async (vitalsData) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      if (!token) {
        // Demo mode
        const newVitals = {
          id: Date.now(),
          ...vitalsData,
          recorded_date: new Date().toISOString(),
          patient: { id: 1, user: { first_name: 'John', last_name: 'Doe' } }
        };
        
        setVitalSigns(prev => [newVitals, ...prev]);
        setShowVitalsModal(false);
        alert('Vital signs recorded successfully! (Demo mode)');
        return;
      }

      try {
        const newVitals = await medicalRecordsApi.createVitalSigns(vitalsData);
        setVitalSigns(prev => [newVitals, ...prev]);
        setShowVitalsModal(false);
        alert('Vital signs recorded successfully!');
      } catch (error) {
        console.error('API error, falling back to demo mode');
        const newVitals = {
          id: Date.now(),
          ...vitalsData,
          recorded_date: new Date().toISOString(),
          patient: { id: 1, user: { first_name: 'John', last_name: 'Doe' } }
        };
        
        setVitalSigns(prev => [newVitals, ...prev]);
        setShowVitalsModal(false);
        alert('Vital signs recorded successfully! (Demo mode)');
      }
    } catch (error) {
      console.error('Error recording vital signs:', error);
      alert('Error recording vital signs. Please try again.');
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && record.record_type === filterType;
  });

  const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
    <div 
      className={`medical-stat-card stat-${color} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="stat-icon">
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="medical-overview">
      <div className="stats-grid">
        <StatCard
          title="Total Records"
          value={records.length}
          icon={FileText}
          color="blue"
          onClick={() => setActiveTab('records')}
        />
        <StatCard
          title="Active Diagnoses"
          value={diagnoses.filter(d => d.status === 'active').length}
          icon={Activity}
          color="green"
          onClick={() => setActiveTab('diagnoses')}
        />
        <StatCard
          title="Current Medications"
          value={medications.filter(m => m.status === 'active').length}
          icon={Pill}
          color="purple"
          onClick={() => setActiveTab('medications')}
        />
        <StatCard
          title="Active Allergies"
          value={allergies.filter(a => a.is_active).length}
          icon={AlertTriangle}
          color="orange"
          onClick={() => setActiveTab('allergies')}
        />
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="action-btn primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            Add Medical Record
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => setShowVitalsModal(true)}
          >
            <Heart size={16} />
            Record Vital Signs
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => setActiveTab('records')}
          >
            <FileText size={16} />
            View All Records
          </button>
          <button 
            className="action-btn secondary"
            onClick={fetchMedicalData}
          >
            <RefreshCw size={16} />
            Refresh Data
          </button>
        </div>
      </div>

      <div className="recent-records">
        <h3>Recent Medical Records</h3>
        <div className="records-list">
          {records.slice(0, 5).map(record => (
            <div key={record.id} className="record-item">
              <div className="record-icon">
                <FileText size={16} />
              </div>
              <div className="record-content">
                <div className="record-title">{record.title}</div>
                <div className="record-meta">
                  {record.record_type} • {new Date(record.date_recorded).toLocaleDateString()}
                </div>
              </div>
              <div className={`record-priority priority-${record.priority}`}>
                {record.priority}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const RecordsTab = () => (
    <div className="medical-records-tab">
      <div className="records-header">
        <div className="search-filter-bar">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search medical records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="consultation">Consultation</option>
            <option value="lab_result">Lab Results</option>
            <option value="imaging">Imaging</option>
            <option value="diagnosis">Diagnosis</option>
            <option value="treatment_plan">Treatment Plan</option>
            <option value="progress_note">Progress Note</option>
          </select>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            Add Record
          </button>
        </div>
      </div>

      <div className="records-grid">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading medical records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No Medical Records Found</h3>
            <p>Start by adding a new medical record</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} />
              Add First Record
            </button>
          </div>
        ) : (
          filteredRecords.map(record => (
            <div key={record.id} className="record-card">
              <div className="record-card-header">
                <div className="record-type">
                  <FileText size={16} />
                  {record.record_type}
                </div>
                <div className={`priority-badge priority-${record.priority}`}>
                  {record.priority}
                </div>
              </div>
              <div className="record-card-content">
                <h4>{record.title}</h4>
                <p>{record.description}</p>
                <div className="record-meta">
                  <span>
                    <User size={14} />
                    {record.patient?.user?.first_name} {record.patient?.user?.last_name}
                  </span>
                  <span>
                    <Calendar size={14} />
                    {new Date(record.date_recorded).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="record-card-actions">
                <button className="btn btn-sm btn-secondary">
                  <Eye size={14} />
                  View
                </button>
                <button className="btn btn-sm btn-primary">
                  <Edit size={14} />
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const AllergiesTab = () => (
    <div className="allergies-tab">
      <div className="tab-header">
        <h3>Patient Allergies</h3>
        <button className="btn btn-primary">
          <Plus size={16} />
          Add Allergy
        </button>
      </div>
      
      <div className="allergies-list">
        {allergies.map(allergy => (
          <div key={allergy.id} className="allergy-card">
            <div className="allergy-header">
              <div className="allergy-name">{allergy.allergen}</div>
              <div className={`severity-badge severity-${allergy.severity}`}>
                {allergy.severity}
              </div>
            </div>
            <div className="allergy-details">
              <p><strong>Type:</strong> {allergy.allergen_type}</p>
              <p><strong>Reaction:</strong> {allergy.reaction}</p>
              <p><strong>Symptoms:</strong> {allergy.symptoms}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const DiagnosesTab = () => (
    <div className="diagnoses-tab">
      <div className="tab-header">
        <h3>Patient Diagnoses</h3>
        <button className="btn btn-primary">
          <Plus size={16} />
          Add Diagnosis
        </button>
      </div>
      
      <div className="diagnoses-list">
        {diagnoses.map(diagnosis => (
          <div key={diagnosis.id} className="diagnosis-card">
            <div className="diagnosis-header">
              <div className="diagnosis-code">{diagnosis.diagnosis_code}</div>
              <div className={`status-badge status-${diagnosis.status}`}>
                {diagnosis.status}
              </div>
            </div>
            <div className="diagnosis-content">
              <h4>{diagnosis.description}</h4>
              <div className="diagnosis-meta">
                <span>Diagnosed: {new Date(diagnosis.date_diagnosed).toLocaleDateString()}</span>
                {diagnosis.is_primary && <span className="primary-badge">Primary</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const VitalSignsTab = () => (
    <div className="vitals-tab">
      <div className="tab-header">
        <h3>Vital Signs</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowVitalsModal(true)}
        >
          <Plus size={16} />
          Record Vitals
        </button>
      </div>
      
      <div className="vitals-list">
        {vitalSigns.map(vitals => (
          <div key={vitals.id} className="vitals-card">
            <div className="vitals-header">
              <div className="vitals-date">
                {new Date(vitals.recorded_date).toLocaleDateString()}
              </div>
              <div className="vitals-time">
                {new Date(vitals.recorded_date).toLocaleTimeString()}
              </div>
            </div>
            <div className="vitals-grid">
              {vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic && (
                <div className="vital-item">
                  <Heart size={16} />
                  <span>BP: {vitals.blood_pressure_systolic}/{vitals.blood_pressure_diastolic}</span>
                </div>
              )}
              {vitals.heart_rate && (
                <div className="vital-item">
                  <Activity size={16} />
                  <span>HR: {vitals.heart_rate} bpm</span>
                </div>
              )}
              {vitals.temperature && (
                <div className="vital-item">
                  <Thermometer size={16} />
                  <span>Temp: {vitals.temperature}°C</span>
                </div>
              )}
              {vitals.weight && (
                <div className="vital-item">
                  <User size={16} />
                  <span>Weight: {vitals.weight} kg</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AddRecordModal = () => {
    const [formData, setFormData] = useState({
      record_type: 'consultation',
      title: '',
      description: '',
      clinical_notes: '',
      priority: 'medium',
      patient_id: 1,
      doctor_id: 1
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleAddRecord(formData);
    };

    if (!showAddModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Add Medical Record</h3>
            <button 
              className="modal-close"
              onClick={() => setShowAddModal(false)}
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit} className="record-form">
            <div className="form-row">
              <div className="form-group">
                <label>Record Type *</label>
                <select
                  value={formData.record_type}
                  onChange={(e) => setFormData({...formData, record_type: e.target.value})}
                  required
                >
                  <option value="consultation">Consultation</option>
                  <option value="lab_result">Lab Result</option>
                  <option value="imaging">Imaging</option>
                  <option value="diagnosis">Diagnosis</option>
                  <option value="treatment_plan">Treatment Plan</option>
                  <option value="progress_note">Progress Note</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                required
              />
            </div>
            <div className="form-group">
              <label>Clinical Notes</label>
              <textarea
                value={formData.clinical_notes}
                onChange={(e) => setFormData({...formData, clinical_notes: e.target.value})}
                rows="4"
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Record
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const VitalSignsModal = () => {
    const [formData, setFormData] = useState({
      blood_pressure_systolic: '',
      blood_pressure_diastolic: '',
      heart_rate: '',
      temperature: '',
      respiratory_rate: '',
      oxygen_saturation: '',
      weight: '',
      height: '',
      patient_id: 1,
      recorded_by_id: 1
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleAddVitalSigns(formData);
    };

    if (!showVitalsModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Record Vital Signs</h3>
            <button 
              className="modal-close"
              onClick={() => setShowVitalsModal(false)}
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit} className="vitals-form">
            <div className="form-row">
              <div className="form-group">
                <label>Systolic BP</label>
                <input
                  type="number"
                  value={formData.blood_pressure_systolic}
                  onChange={(e) => setFormData({...formData, blood_pressure_systolic: e.target.value})}
                  placeholder="120"
                />
              </div>
              <div className="form-group">
                <label>Diastolic BP</label>
                <input
                  type="number"
                  value={formData.blood_pressure_diastolic}
                  onChange={(e) => setFormData({...formData, blood_pressure_diastolic: e.target.value})}
                  placeholder="80"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={formData.heart_rate}
                  onChange={(e) => setFormData({...formData, heart_rate: e.target.value})}
                  placeholder="72"
                />
              </div>
              <div className="form-group">
                <label>Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                  placeholder="36.5"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  placeholder="70.5"
                />
              </div>
              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  placeholder="175"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowVitalsModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Record Vitals
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="medical-records">
      <div className="page-header">
        <div className="header-content">
          <h1>Medical Records</h1>
          <p>Comprehensive patient medical records management</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchMedicalData}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            Add Record
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
          className={`tab-btn ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          <FileText size={16} />
          Records
        </button>
        <button 
          className={`tab-btn ${activeTab === 'allergies' ? 'active' : ''}`}
          onClick={() => setActiveTab('allergies')}
        >
          <AlertTriangle size={16} />
          Allergies
        </button>
        <button 
          className={`tab-btn ${activeTab === 'diagnoses' ? 'active' : ''}`}
          onClick={() => setActiveTab('diagnoses')}
        >
          <Stethoscope size={16} />
          Diagnoses
        </button>
        <button 
          className={`tab-btn ${activeTab === 'vitals' ? 'active' : ''}`}
          onClick={() => setActiveTab('vitals')}
        >
          <Heart size={16} />
          Vital Signs
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'records' && <RecordsTab />}
        {activeTab === 'allergies' && <AllergiesTab />}
        {activeTab === 'diagnoses' && <DiagnosesTab />}
        {activeTab === 'vitals' && <VitalSignsTab />}
      </div>

      <AddRecordModal />
      <VitalSignsModal />
    </div>
  );
};

export default MedicalRecords;