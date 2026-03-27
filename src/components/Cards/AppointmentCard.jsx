import { format } from 'date-fns';

const AppointmentCard = ({ appointment, onCancel, onReschedule, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'cancelled':
        return 'red';
      case 'completed':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const statusColor = getStatusColor(appointment.status);

  return (
    <div className="bg-white rounded-lg shadow-md border-l-4 border-green-500 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Appointment with Dr. {appointment.doctor_name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
              {appointment.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Date & Time:</span><br />
              {format(new Date(appointment.datetime), 'MMM dd, yyyy • hh:mm a')}
            </div>
            <div>
              <span className="font-medium">Duration:</span><br />
              {appointment.duration || '30 mins'}
            </div>
            <div>
              <span className="font-medium">Type:</span><br />
              {appointment.type || 'Consultation'}
            </div>
            <div>
              <span className="font-medium">Location:</span><br />
              {appointment.location || 'Clinic'}
            </div>
          </div>

          {appointment.notes && (
            <p className="text-sm text-gray-500 mt-3">
              <span className="font-medium">Notes:</span> {appointment.notes}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={onViewDetails}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View Details
        </button>
        
        <div className="flex space-x-2">
          {appointment.status === 'pending' && (
            <>
              <button
                onClick={() => onReschedule(appointment)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors font-medium"
              >
                Reschedule
              </button>
              <button
                onClick={() => onCancel(appointment.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;