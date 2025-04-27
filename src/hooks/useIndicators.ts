import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tables, Enums } from '../types/supabase';

// Define type aliases for clarity
type Indicator = Tables<"indicators">;
type IndicatorMeasurement = Tables<"measurements">;
type IndicatorCategory = Enums<"indicator_category">;
type MeasurementFrequency = Enums<"measurement_frequency">;

export function useIndicators(projectId?: string) {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [measurements, setMeasurements] = useState<IndicatorMeasurement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchIndicators();
  }, [projectId]);

  async function fetchIndicators() {
    try {
      setLoading(true);
      setError(null);

      // Fetch indicators
      let query = supabase
        .from('indicators')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data: indicatorsData, error: indicatorsError } = await query;

      if (indicatorsError) {
        throw new Error(indicatorsError.message);
      }

      setIndicators(indicatorsData || []);

      // Fetch measurements
      const { data: measurementsData, error: measurementsError } = await supabase
        .from('measurements')
        .select('*')
        .order('date', { ascending: false });

      if (measurementsError) {
        throw new Error(measurementsError.message);
      }

      setMeasurements(measurementsData || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching indicators:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createIndicator(indicatorData: Omit<Indicator, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    try {
      setLoading(true);
      setError(null);

      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError || !authData.session) {
        throw new Error('You must be logged in to create an indicator');
      }

      const createdBy = authData.session.user.id;
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('indicators')
        .insert({
          ...indicatorData,
          created_by: createdBy,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setIndicators([data, ...indicators]);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating indicator:', err);
      return { data: null, error: err as Error };
    } finally {
      setLoading(false);
    }
  }

  async function addMeasurement(data: Omit<IndicatorMeasurement, 'id' | 'created_at' | 'created_by'>) {
    try {
      setLoading(true);
      setError(null);

      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError || !authData.session) {
        throw new Error('You must be logged in to add a measurement');
      }

      const createdBy = authData.session.user.id;
      const now = new Date().toISOString();

      // Create new measurement
      const { data: newMeasurement, error: measurementError } = await supabase
        .from('measurements')
        .insert({
          ...data,
          created_by: createdBy,
          created_at: now,
        })
        .select()
        .single();

      if (measurementError) {
        throw new Error(measurementError.message);
      }

      setMeasurements([newMeasurement, ...measurements]);

      // Update the current value of the indicator
      const { data: updatedIndicator, error: indicatorError } = await supabase
        .from('indicators')
        .update({
          current_value: data.value,
          updated_at: now,
        })
        .eq('id', data.indicator_id)
        .select()
        .single();

      if (indicatorError) {
        throw new Error(indicatorError.message);
      }

      setIndicators(indicators.map(i => (i.id === data.indicator_id ? updatedIndicator : i)));

      return { data: newMeasurement, error: null };
    } catch (err) {
      console.error('Error adding measurement:', err);
      return { data: null, error: err as Error };
    } finally {
      setLoading(false);
    }
  }

  function getIndicatorById(id: string) {
    return indicators.find(indicator => indicator.id === id) || null;
  }

  function getIndicatorMeasurements(indicatorId: string) {
    return measurements.filter(m => m.indicator_id === indicatorId);
  }

  return {
    indicators,
    measurements,
    loading,
    error,
    fetchIndicators,
    createIndicator,
    addMeasurement,
    getIndicatorById,
    getIndicatorMeasurements,
  };
}