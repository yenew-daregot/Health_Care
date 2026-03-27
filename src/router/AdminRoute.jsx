// import React, { useState } from 'react';
// import { emergencyApi } from '../../api/emergencyApi';

// const EmergencySOS = () => {
//   const [isEmergencyActive, setIsEmergencyActive] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleEmergencyAlert = async () => {
//     setLoading(true);
//     try {
//       // Get current location
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const location = {
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude,
//           };
          
//           await emergencyApi.sendEmergencyAlert({
//             location,
//             timestamp: new Date().toISOString(),
//             message: 'Emergency assistance needed!'
//           });
          
//           setIsEmergencyActive(true);
//           setLoading(false);
//         },
//         (error) => {
//           console.error('Error getting location:', error);
//           // Send alert without location
//           emergencyApi.sendEmergencyAlert({
//             timestamp: new Date().toISOString(),
//             message: 'Emergency assistance needed! Location unavailable.'
//           });
//           setIsEmergencyActive(true);
//           setLoading(false);
//         }
//       );
//     } catch (error) {
//       console.error('Emergency alert failed:', error);
//       setLoading(false);
//     }
//   };

//   const emergencyContacts = [
//     { name: 'Emergency Services', number: '911', type: 'Emergency' },
//     { name: 'Hospital Main', number: '(555) 123-4567', type: 'Hospital' },
//     { name: 'Poison Control', number: '(555) 222-3333', type: 'Emergency' },
//   ];

//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">Emergency SOS</h1>
//         <p className="text-gray-600 mt-2">Get immediate medical assistance</p>
//       </div>

//       {/* Emergency Button */}
//       <div className="text-center mb-8">
//         <button
//           onClick={handleEmergencyAlert}
//           disabled={loading || isEmergencyActive}
//           className={`${
//             isEmergencyActive 
//               ? 'bg-red-700 cursor-not-allowed' 
//               : 'bg-red-600 hover:bg-red-700 animate-pulse'
//           } text-white text-2xl font-bold py-8 px-16 rounded-full transition-colors`}
//         >
//           {loading ? 'SENDING ALERT...' : isEmergencyActive ? 'HELP IS COMING!' : '🚨 EMERGENCY SOS'}
//         </button>
//         {isEmergencyActive && (
//           <p className="text-green-600 mt-4 font-semibold">
//             ✅ Emergency alert sent! Help is on the way.
//           </p>
//         )}
//       </div>

//       {/* Emergency Contacts */}
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
//         <div className="space-y-3">
//           {emergencyContacts.map((contact, index) => (
//             <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
//               <div>
//                 <p className="font-medium text-gray-900">{contact.name}</p>
//                 <p className="text-sm text-gray-600">{contact.type}</p>
//               </div>
//               <div className="text-right">
//                 <p className="font-mono text-gray-900">{contact.number}</p>
//                 <a 
//                   href={`tel:${contact.number}`}
//                   className="text-blue-600 text-sm hover:text-blue-700"
//                 >
//                   Call Now
//                 </a>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Emergency Instructions */}
//       <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
//         <h3 className="text-lg font-semibold text-yellow-800 mb-3">Important Instructions</h3>
//         <ul className="text-yellow-700 space-y-2">
//           <li>• Stay calm and follow operator instructions</li>
//           <li>• Provide your exact location if possible</li>
//           <li>• Describe the nature of the emergency clearly</li>
//           <li>• Do not hang up until help arrives</li>
//           <li>• Keep your phone accessible</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default EmergencySOS;