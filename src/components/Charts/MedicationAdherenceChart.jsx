import React from 'react';

const MedicationAdherenceChart = ({ adherenceData = [] }) => {
  const data = adherenceData.length > 0 ? adherenceData : [
    { medication: 'Aspirin', taken: 28, total: 30, adherence: 93 },
    { medication: 'Metformin', taken: 25, total: 30, adherence: 83 },
    { medication: 'Lisinopril', taken: 29, total: 30, adherence: 97 },
    { medication: 'Atorvastatin', taken: 26, total: 30, adherence: 87 },
  ];

  const getAdherenceColor = (percentage) => {
    if (percentage >= 90) return 'green';
    if (percentage >= 80) return 'yellow';
    return 'red';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Medication Adherence</h3>

      <div className="space-y-4">
        {data.map((item, index) => {
          const color = getAdherenceColor(item.adherence);
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-900">{item.medication}</span>
                  <span className="text-sm text-gray-600">
                    {item.taken}/{item.total} doses
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${item.adherence}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-xs font-medium text-${color}-600`}>
                    {item.adherence}% adherence
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full bg-${color}-100 text-${color}-800`}>
                    {color === 'green' ? 'Excellent' : color === 'yellow' ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">Overall Adherence</p>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(data.reduce((sum, item) => sum + item.adherence, 0) / data.length)}%
            </p>
          </div>
          <div className="text-3xl">📊</div>
        </div>
      </div>
    </div>
  );
};

export default MedicationAdherenceChart;