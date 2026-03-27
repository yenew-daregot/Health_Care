import React from 'react';

const PatientInfoCard = ({ patient, onEdit, onViewRecords }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl text-blue-600">👤</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h3>
            <p className="text-gray-600">Patient ID: {patient.id}</p>
            <p className="text-sm text-gray-500">{patient.email}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          patient.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {patient.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
        <div>
          <span className="font-medium">Phone:</span> {patient.phone || 'N/A'}
        </div>
        <div>
          <span className="font-medium">Age:</span> {patient.age || 'N/A'}
        </div>
        <div>
          <span className="font-medium">Gender:</span> {patient.gender || 'N/A'}
        </div>
        <div>
          <span className="font-medium">Blood Type:</span> {patient.blood_type || 'N/A'}
        </div>
      </div>

      {patient.emergency_contact && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-yellow-800">Emergency Contact</p>
          <p className="text-sm text-yellow-700">
            {patient.emergency_contact.name} - {patient.emergency_contact.phone}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={onViewRecords}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View Medical Records
        </button>
        <button
          onClick={onEdit}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors font-medium"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default PatientInfoCard;