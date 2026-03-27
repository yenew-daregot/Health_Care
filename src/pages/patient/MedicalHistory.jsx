// import React, { useState, useEffect } from 'react';
// import { format } from 'date-fns';

// const ViewMedicalRecord = () => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [medicalRecord, setMedicalRecord] = useState(null);

//   useEffect(() => {
//     // Mock data - replace with API call
//     const mockRecord = {
//       patient: {
//         name: 'John Doe',
//         age: 45,
//         gender: 'Male',
//         bloodType: 'A+',
//         allergies: ['Penicillin', 'Shellfish'],
//         conditions: ['Hypertension', 'Type 2 Diabetes']
//       },
//       visits: [
//         {
//           id: 1,
//           date: '2024-01-15',
//           doctor: 'Dr. Sarah Johnson',
//           reason: 'Routine Check-up',
//           diagnosis: 'Hypertension controlled',
//           medications: ['Lisinopril 10mg', 'Metformin 500mg'],
//           notes: 'Blood pressure well controlled. Continue current medications.'
//         },
//         {
//           id: 2,
//           date: '2024-01-10',
//           doctor: 'Dr. Michael Chen',
//           reason: 'Diabetes Follow-up',
//           diagnosis: 'Type 2 Diabetes - stable',
//           medications: ['Metformin 500mg'],
//           notes: 'Blood sugar levels improving. Maintain current diet and exercise.'
//         }
//       ],
//       medications: [
//         {
//           name: 'Lisinopril',
//           dosage: '10mg',
//           frequency: 'Once daily',
//           startDate: '2023-06-01',
//           prescribedBy: 'Dr. Sarah Johnson'
//         },
//         {
//           name: 'Metformin',
//           dosage: '500mg',
//           frequency: 'Twice daily',
//           startDate: '2023-06-01',
//           prescribedBy: 'Dr. Michael Chen'
//         }
//       ],
//       allergies: [
//         {
//           allergen: 'Penicillin',
//           reaction: 'Rash, difficulty breathing',
//           severity: 'Severe',
//           diagnosed: '2010'
//         },
//         {
//           allergen: 'Shellfish',
//           reaction: 'Hives, swelling',
//           severity: 'Moderate',
//           diagnosed: '2015'
//         }
//       ],
//       immunizations: [
//         { vaccine: 'COVID-19 Booster', date: '2023-10-15', location: 'City Health Clinic' },
//         { vaccine: 'Flu Shot', date: '2023-09-20', location: 'Workplace Clinic' },
//         { vaccine: 'Tetanus', date: '2020-05-10', location: 'General Hospital' }
//       ]
//     };
//     setMedicalRecord(mockRecord);
//   }, []);

//   if (!medicalRecord) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
//         <p className="text-gray-600 mt-2">Complete medical history and health information</p>
//       </div>

//       {/* Patient Summary */}
//       <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <h2 className="text-xl font-semibold text-gray-900">{medicalRecord.patient.name}</h2>
//             <p className="text-gray-600">
//               {medicalRecord.patient.age} years • {medicalRecord.patient.gender} • Blood Type: {medicalRecord.patient.bloodType}
//             </p>
//           </div>
//           <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
//             Download Full Record
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="bg-blue-50 rounded-lg p-4">
//             <p className="text-sm text-blue-600 font-medium">Chronic Conditions</p>
//             <p className="text-lg font-semibold">{medicalRecord.patient.conditions.length}</p>
//           </div>
//           <div className="bg-green-50 rounded-lg p-4">
//             <p className="text-sm text-green-600 font-medium">Allergies</p>
//             <p className="text-lg font-semibold">{medicalRecord.patient.allergies.length}</p>
//           </div>
//           <div className="bg-purple-50 rounded-lg p-4">
//             <p className="text-sm text-purple-600 font-medium">Current Medications</p>
//             <p className="text-lg font-semibold">{medicalRecord.medications.length}</p>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="bg-white rounded-lg shadow-md">
//         <div className="border-b border-gray-200">
//           <nav className="flex space-x-8 px-6">
//             {['overview', 'visits', 'medications', 'allergies', 'immunizations'].map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
//                   activeTab === tab
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </nav>
//         </div>

//         <div className="p-6">
//           {/* Overview Tab */}
//           {activeTab === 'overview' && (
//             <div className="space-y-6">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Chronic Conditions</h3>
//                 <div className="space-y-2">
//                   {medicalRecord.patient.conditions.map((condition, index) => (
//                     <div key={index} className="flex items-center p-3 bg-red-50 rounded-lg">
//                       <span className="text-red-600 mr-3">⚠️</span>
//                       <span className="text-red-800 font-medium">{condition}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Visits</h3>
//                 <div className="space-y-3">
//                   {medicalRecord.visits.slice(0, 3).map((visit) => (
//                     <div key={visit.id} className="border border-gray-200 rounded-lg p-4">
//                       <div className="flex justify-between items-start mb-2">
//                         <h4 className="font-semibold text-gray-900">{visit.reason}</h4>
//                         <span className="text-sm text-gray-500">
//                           {format(new Date(visit.date), 'MMM dd, yyyy')}
//                         </span>
//                       </div>
//                       <p className="text-sm text-gray-600">Doctor: {visit.doctor}</p>
//                       <p className="text-sm text-gray-700 mt-2">{visit.notes}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Visits Tab */}
//           {activeTab === 'visits' && (
//             <div className="space-y-4">
//               {medicalRecord.visits.map((visit) => (
//                 <div key={visit.id} className="border border-gray-200 rounded-lg p-6">
//                   <div className="flex justify-between items-start mb-4">
//                     <div>
//                       <h4 className="text-lg font-semibold text-gray-900">{visit.reason}</h4>
//                       <p className="text-gray-600">with {visit.doctor}</p>
//                     </div>
//                     <span className="text-sm text-gray-500">
//                       {format(new Date(visit.date), 'MMMM dd, yyyy')}
//                     </span>
//                   </div>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                     <div>
//                       <p className="text-sm font-medium text-gray-700">Diagnosis</p>
//                       <p className="text-gray-900">{visit.diagnosis}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-700">Medications Prescribed</p>
//                       <div className="space-y-1">
//                         {visit.medications.map((med, index) => (
//                           <span key={index} className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mr-2">
//                             {med}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   {visit.notes && (
//                     <div className="bg-gray-50 rounded-lg p-3">
//                       <p className="text-sm font-medium text-gray-700 mb-1">Doctor's Notes</p>
//                       <p className="text-gray-600">{visit.notes}</p>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Medications Tab */}
//           {activeTab === 'medications' && (
//             <div className="space-y-4">
//               {medicalRecord.medications.map((med, index) => (
//                 <div key={index} className="border border-gray-200 rounded-lg p-6">
//                   <div className="flex justify-between items-start mb-3">
//                     <h4 className="text-lg font-semibold text-gray-900">{med.name}</h4>
//                     <span className="text-sm text-gray-500">
//                       Since {format(new Date(med.startDate), 'MMM yyyy')}
//                     </span>
//                   </div>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div>
//                       <p className="text-sm font-medium text-gray-700">Dosage</p>
//                       <p className="text-gray-900">{med.dosage}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-700">Frequency</p>
//                       <p className="text-gray-900">{med.frequency}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-700">Prescribed By</p>
//                       <p className="text-gray-900">{med.prescribedBy}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Allergies Tab */}
//           {activeTab === 'allergies' && (
//             <div className="space-y-4">
//               {medicalRecord.allergies.map((allergy, index) => (
//                 <div key={index} className="border border-red-200 rounded-lg p-6 bg-red-50">
//                   <div className="flex justify-between items-start mb-3">
//                     <h4 className="text-lg font-semibold text-red-900">{allergy.allergen}</h4>
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                       allergy.severity === 'Severe' 
//                         ? 'bg-red-100 text-red-800'
//                         : 'bg-yellow-100 text-yellow-800'
//                     }`}>
//                       {allergy.severity}
//                     </span>
//                   </div>
                  
//                   <div className="space-y-2">
//                     <div>
//                       <p className="text-sm font-medium text-red-700">Reaction</p>
//                       <p className="text-red-800">{allergy.reaction}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-red-700">Diagnosed</p>
//                       <p className="text-red-800">{allergy.diagnosed}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Immunizations Tab */}
//           {activeTab === 'immunizations' && (
//             <div className="space-y-4">
//               {medicalRecord.immunizations.map((immunization, index) => (
//                 <div key={index} className="border border-gray-200 rounded-lg p-6">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <h4 className="text-lg font-semibold text-gray-900">{immunization.vaccine}</h4>
//                       <p className="text-gray-600">{immunization.location}</p>
//                     </div>
//                     <span className="text-sm text-gray-500">
//                       {format(new Date(immunization.date), 'MMM dd, yyyy')}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ViewMedicalRecord;