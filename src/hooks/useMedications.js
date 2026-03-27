import { useState, useEffect } from 'react';
import medicationApi from '../api/medicationApi';

export const useMedications = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const response = await medicationApi.getMedications();
      setMedications(response.data);
    } catch (err) {
      setError(err.response?.data || 'Failed to fetch medications');
    } finally {
      setLoading(false);
    }
  };

  const addMedication = async (medicationData) => {
    try {
      const response = await medicationApi.createMedication(medicationData);
      setMedications(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data || 'Failed to add medication');
      throw err;
    }
  };

  const updateMedication = async (id, medicationData) => {
    try {
      const response = await medicationApi.updateMedication(id, medicationData);
      setMedications(prev => 
        prev.map(med => med.id === id ? response.data : med)
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data || 'Failed to update medication');
      throw err;
    }
  };

  const deleteMedication = async (id) => {
    try {
      await medicationApi.deleteMedication(id);
      setMedications(prev => prev.filter(med => med.id !== id));
    } catch (err) {
      setError(err.response?.data || 'Failed to delete medication');
      throw err;
    }
  };

  const markAsTaken = async (medicationId) => {
    try {
      await medicationApi.markTaken(medicationId);
      setMedications(prev => 
        prev.map(med => 
          med.id === medicationId 
            ? { ...med, last_taken: new Date().toISOString() }
            : med
        )
      );
    } catch (err) {
      setError(err.response?.data || 'Failed to mark medication as taken');
      throw err;
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  return {
    medications,
    loading,
    error,
    refetch: fetchMedications,
    addMedication,
    updateMedication,
    deleteMedication,
    markAsTaken,
  };
};