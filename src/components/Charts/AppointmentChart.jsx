import React from 'react';

const AppointmentChart = ({ data = [], timeframe = 'month' }) => {
  // Sample data if none provided
  const chartData = data.length > 0 ? data : [
    { month: 'Jan', appointments: 45 },
    { month: 'Feb', appointments: 52 },
    { month: 'Mar', appointments: 48 },
    { month: 'Apr', appointments: 60 },
    { month: 'May', appointments: 55 },
    { month: 'Jun', appointments: 70 },
  ];

  const maxAppointments = Math.max(...chartData.map(d => d.appointments));
  const totalAppointments = chartData.reduce((sum, d) => sum + d.appointments, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Appointment Trends</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Total: {totalAppointments}</span>
          <select className="border border-gray-300 rounded-lg px-2 py-1 text-sm">
            <option value="month">Monthly</option>
            <option value="week">Weekly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
      </div>

      <div className="flex items-end justify-between space-x-2 h-48">
        {chartData.map((item, index) => {
          const height = (item.appointments / maxAppointments) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="text-xs text-gray-500 mb-2">{item.appointments}</div>
              <div
                className="w-full bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-colors cursor-pointer"
                style={{ height: `${height}%` }}
                title={`${item.month}: ${item.appointments} appointments`}
              ></div>
              <div className="text-xs text-gray-600 mt-2">{item.month}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">{chartData[chartData.length - 1]?.appointments || 0}</div>
          <div className="text-sm text-gray-600">Current Month</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(totalAppointments / chartData.length)}
          </div>
          <div className="text-sm text-gray-600">Monthly Average</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-600">+12%</div>
          <div className="text-sm text-gray-600">Growth</div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentChart;