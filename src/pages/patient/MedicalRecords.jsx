import { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  Activity, 
  AlertTriangle,
  Eye,
  RefreshCw,
  Heart,
  Thermometer,
  Stethoscope,
  Pill,
  Download,
  Clock
} from 'lucide-react';
import { medicalRecordsApi, demoMedicalRecords } from '../../api/medicalRecordsApi';
import './PatientMedicalRecords.css';

const MedicalRecords = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [records, setRecords] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [medications, setMedications] = useState([]);
  const [vitalSigns, setVitalSigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredRecords = records.filter(record => 
    record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`patient-stat-card stat-${color}`}>
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
    <div className="patient-medical-overview">
      <div className="stats-grid">
        <StatCard
          title="Total Records"
          value={records.length}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Active Conditions"
          value={diagnoses.filter(d => d.status === 'active').length}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Current Medications"
          value={medications.filter(m => m.status === 'active').length}
          icon={Pill}
          color="purple"
        />
        <StatCard
          title="Known Allergies"
          value={allergies.filter(a => a.is_active).length}
          icon={AlertTriangle}
          color="orange"
        />
      </div>

      <div className="overview-sections">
        <div className="overview-section">
          <h3>Recent Medical Records</h3>
          <div className="records-preview">
            {records.slice(0, 3).map(record => (
              <div key={record.id} className="record-preview-item">
                <div className="record-icon">
                  <FileText size={16} />
                </div>
                <div className="record-content">
                  <div className="record-title">{record.title}</div>
                  <div className="record-date">
                    {new Date(record.date_recorded).toLocaleDateString()}
                  </div>
                </div>
                <div className={`priority-badge priority-${record.priority}`}>
                  {record.priority}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overview-section">
          <h3>Current Health Status</h3>
          <div className="health-status">
            {diagnoses.filter(d => d.status === 'active').slice(0, 3).map(diagnosis => (
              <div key={diagnosis.id} className="health-item">
                <div className="health-icon">
                  <Stethoscope size={16} />
                </div>
                <div className="health-content">
                  <div className="health-title">{diagnosis.description}</div>
                  <div className="health-date">
                    Since {new Date(diagnosis.date_diagnosed).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {vitalSigns.length > 0 && (
        <div className="latest-vitals">
          <h3>Latest Vital Signs</h3>
          <div className="vitals-summary">
            {vitalSigns[0] && (
              <div className="vitals-grid">
                {vitalSigns[0].blood_pressure_systolic && vitalSigns[0].blood_pressure_diastolic && (
                  <div className="vital-item">
                    <Heart size={20} />
                    <div>
                      <div className="vital-value">
                        {vitalSigns[0].blood_pressure_systolic}/{vitalSigns[0].blood_pressure_diastolic}
                      </div>
                      <div className="vital-label">Blood Pressure</div>
                    </div>
                  </div>
                )}
                {vitalSigns[0].heart_rate && (
                  <div className="vital-item">
                    <Activity size={20} />
                    <div>
                      <div className="vital-value">{vitalSigns[0].heart_rate} bpm</div>
                      <div className="vital-label">Heart Rate</div>
                    </div>
                  </div>
                )}
                {vitalSigns[0].temperature && (
                  <div className="vital-item">
                    <Thermometer size={20} />
                    <div>
                      <div className="vital-value">{vitalSigns[0].temperature}°C</div>
                      <div className="vital-label">Temperature</div>
                    </div>
                  </div>
                )}
                {vitalSigns[0].weight && (
                  <div className="vital-item">
                    <User size={20} />
                    <div>
                      <div className="vital-value">{vitalSigns[0].weight} kg</div>
                      <div className="vital-label">Weight</div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="vitals-date">
              Recorded on {new Date(vitalSigns[0]?.recorded_date).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const RecordsTab = () => (
    <div className="patient-records-tab">
      <div className="records-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search your medical records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="records-timeline">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your medical records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No Medical Records Found</h3>
            <p>Your medical records will appear here as they are created by your healthcare providers.</p>
          </div>
        ) : (
          filteredRecords.map(record => (
            <div key={record.id} className="timeline-item">
              <div className="timeline-marker">
                <FileText size={16} />
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <h4>{record.title}</h4>
                  <div className="timeline-date">
                    <Calendar size={14} />
                    {new Date(record.date_recorded).toLocaleDateString()}
                  </div>
                </div>
                <div className="timeline-meta">
                  <span className="record-type">{record.record_type}</span>
                  <span className={`priority-badge priority-${record.priority}`}>
                    {record.priority}
                  </span>
                </div>
                <p className="timeline-description">{record.description}</p>
                <div className="timeline-actions">
                  <button className="btn btn-sm btn-secondary">
                    <Eye size={14} />
                    View Details
                  </button>
                  <button className="btn btn-sm btn-secondary">
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const AllergiesTab = () => (
    <div className="patient-allergies-tab">
      <div className="tab-header">
        <h3>Your Allergies</h3>
        <p>Important allergy information for your healthcare providers</p>
      </div>
      
      {allergies.length === 0 ? (
        <div className="empty-state">
          <AlertTriangle size={48} />
          <h3>No Known Allergies</h3>
          <p>You have no recorded allergies in your medical record.</p>
        </div>
      ) : (
        <div className="allergies-grid">
          {allergies.map(allergy => (
            <div key={allergy.id} className="allergy-card">
              <div className="allergy-header">
                <div className="allergy-name">{allergy.allergen}</div>
                <div className={`severity-badge severity-${allergy.severity}`}>
                  {allergy.severity}
                </div>
              </div>
              <div className="allergy-details">
                <div className="allergy-row">
                  <strong>Type:</strong> {allergy.allergen_type}
                </div>
                <div className="allergy-row">
                  <strong>Reaction:</strong> {allergy.reaction}
                </div>
                <div className="allergy-row">
                  <strong>Symptoms:</strong> {allergy.symptoms}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const MedicationsTab = () => (
    <div className="patient-medications-tab">
      <div className="tab-header">
        <h3>Your Medications</h3>
        <p>Current and past medications prescribed by your doctors</p>
      </div>
      
      {medications.length === 0 ? (
        <div className="empty-state">
          <Pill size={48} />
          <h3>No Medications</h3>
          <p>You have no recorded medications in your medical record.</p>
        </div>
      ) : (
        <div className="medications-grid">
          {medications.map(medication => (
            <div key={medication.id} className="medication-card">
              <div className="medication-header">
                <div className="medication-name">{medication.medication_name}</div>
                <div className={`status-badge status-${medication.status}`}>
                  {medication.status}
                </div>
              </div>
              <div className="medication-details">
                <div className="medication-row">
                  <strong>Dosage:</strong> {medication.dosage}
                </div>
                <div className="medication-row">
                  <strong>Frequency:</strong> {medication.frequency}
                </div>
                <div className="medication-row">
                  <strong>Route:</strong> {medication.route}
                </div>
                <div className="medication-row">
                  <strong>Started:</strong> {new Date(medication.start_date).toLocaleDateString()}
                </div>
                {medication.reason && (
                  <div className="medication-row">
                    <strong>Reason:</strong> {medication.reason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const VitalSignsTab = () => (
    <div className="patient-vitals-tab">
      <div className="tab-header">
        <h3>Your Vital Signs History</h3>
        <p>Track your vital signs over time</p>
      </div>
      
      {vitalSigns.length === 0 ? (
        <div className="empty-state">
          <Heart size={48} />
          <h3>No Vital Signs Recorded</h3>
          <p>Your vital signs will appear here when recorded by healthcare providers.</p>
        </div>
      ) : (
        <div className="vitals-timeline">
          {vitalSigns.map(vitals => (
            <div key={vitals.id} className="vitals-entry">
              <div className="vitals-date-header">
                <Clock size={16} />
                <span>{new Date(vitals.recorded_date).toLocaleDateString()}</span>
                <span className="vitals-time">
                  {new Date(vitals.recorded_date).toLocaleTimeString()}
                </span>
              </div>
              <div className="vitals-measurements">
                {vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic && (
                  <div className="vital-measurement">
                    <Heart size={16} />
                    <span>Blood Pressure: {vitals.blood_pressure_systolic}/{vitals.blood_pressure_diastolic} mmHg</span>
                  </div>
                )}
                {vitals.heart_rate && (
                  <div className="vital-measurement">
                    <Activity size={16} />
                    <span>Heart Rate: {vitals.heart_rate} bpm</span>
                  </div>
                )}
                {vitals.temperature && (
                  <div className="vital-measurement">
                    <Thermometer size={16} />
                    <span>Temperature: {vitals.temperature}°C</span>
                  </div>
                )}
                {vitals.weight && (
                  <div className="vital-measurement">
                    <User size={16} />
                    <span>Weight: {vitals.weight} kg</span>
                  </div>
                )}
                {vitals.height && (
                  <div className="vital-measurement">
                    <User size={16} />
                    <span>Height: {vitals.height} cm</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="patient-medical-records">
      <div className="page-header">
        <div className="header-content">
          <h1>My Medical Records</h1>
          <p>View and manage your personal health information</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchMedicalData}>
            <RefreshCw size={16} />
            Refresh
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
          Medical Records
        </button>
        <button 
          className={`tab-btn ${activeTab === 'allergies' ? 'active' : ''}`}
          onClick={() => setActiveTab('allergies')}
        >
          <AlertTriangle size={16} />
          Allergies
        </button>
        <button 
          className={`tab-btn ${activeTab === 'medications' ? 'active' : ''}`}
          onClick={() => setActiveTab('medications')}
        >
          <Pill size={16} />
          Medications
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
        {activeTab === 'medications' && <MedicationsTab />}
        {activeTab === 'vitals' && <VitalSignsTab />}
      </div>
    </div>
  );
};

export default MedicalRecords;