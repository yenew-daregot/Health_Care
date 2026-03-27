import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const AddMedicationForm = ({ onSubmit, onCancel, initialData }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {}
  });

  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {initialData ? 'Edit Medication' : 'Add New Medication'}
      </h2>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Medication Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medication Name *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Medication name is required' })}
              className="input-field"
              placeholder="e.g., Aspirin"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Dosage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dosage *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('dosage', { 
                required: 'Dosage is required',
                min: { value: 0.1, message: 'Dosage must be greater than 0' }
              })}
              className="input-field"
              placeholder="e.g., 100"
            />
            {errors.dosage && (
              <p className="text-red-600 text-sm mt-1">{errors.dosage.message}</p>
            )}
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit *
            </label>
            <select
              {...register('unit', { required: 'Unit is required' })}
              className="input-field"
            >
              <option value="">Select Unit</option>
              <option value="mg">mg</option>
              <option value="ml">ml</option>
              <option value="tablet">tablet</option>
              <option value="capsule">capsule</option>
              <option value="drops">drops</option>
            </select>
            {errors.unit && (
              <p className="text-red-600 text-sm mt-1">{errors.unit.message}</p>
            )}
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency *
            </label>
            <select
              {...register('frequency', { required: 'Frequency is required' })}
              className="input-field"
            >
              <option value="">Select Frequency</option>
              <option value="once">Once</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="as_needed">As Needed</option>
            </select>
            {errors.frequency && (
              <p className="text-red-600 text-sm mt-1">{errors.frequency.message}</p>
            )}
          </div>

          {/* Times per Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Times per Day
            </label>
            <input
              type="number"
              {...register('times_per_day', { 
                min: { value: 1, message: 'Must be at least 1' },
                max: { value: 10, message: 'Cannot exceed 10' }
              })}
              className="input-field"
              placeholder="e.g., 3"
              defaultValue={1}
            />
            {errors.times_per_day && (
              <p className="text-red-600 text-sm mt-1">{errors.times_per_day.message}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              {...register('start_date', { required: 'Start date is required' })}
              className="input-field"
            />
            {errors.start_date && (
              <p className="text-red-600 text-sm mt-1">{errors.start_date.message}</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instructions
          </label>
          <textarea
            rows={3}
            {...register('instructions')}
            className="input-field"
            placeholder="e.g., Take with food, Avoid alcohol..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : (initialData ? 'Update Medication' : 'Add Medication')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMedicationForm;