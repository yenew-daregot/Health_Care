import React from 'react';
import { format } from 'date-fns';

const MedicationCard = ({ medication, onMarkTaken, onSkip, onEdit }) => {
  const getStatusInfo = (med) => {
    if (med.last_taken) {
      return { color: 'green', text: 'Taken', icon: '✅' };
    }
    if (med.is_overdue) {
      return { color: 'red', text: 'Overdue', icon: '⚠️' };
    }
    return { color: 'blue', text: 'Pending', icon: '⏰' };
  };

  const status = getStatusInfo(medication);

  return (
    <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-500 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}>
              {status.icon} {status.text}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Dosage:</span> {medication.dosage} {medication.unit}
            </div>
            <div>
              <span className="font-medium">Frequency:</span> {medication.frequency}
            </div>
            <div>
              <span className="font-medium">Times per day:</span> {medication.times_per_day}
            </div>
            <div>
              <span className="font-medium">Status:</span> {medication.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>

          {medication.instructions && (
            <p className="text-sm text-gray-500 mt-3">
              <span className="font-medium">Instructions:</span> {medication.instructions}
            </p>
          )}

          {medication.last_taken && (
            <p className="text-sm text-green-600 mt-2">
              ✅ Last taken: {format(new Date(medication.last_taken), 'MMM dd, yyyy HH:mm')}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => onMarkTaken(medication.id)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors font-medium"
          >
            Mark Taken
          </button>
          <button
            onClick={() => onSkip(medication.id)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 transition-colors font-medium"
          >
            Skip Dose
          </button>
        </div>
        <button
          onClick={() => onEdit(medication)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default MedicationCard;