import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Indicator {
  id: string;
  project_id: string;
  name: string;
  description: string;
  category: 'Quantitative' | 'Qualitative';
  unit: string;
  target_value: number | null;
  current_value: number | null;
  start_value: number | null;
  sdg_goals?: number[];
  data_collection_method: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
  created_at: string;
  last_updated: string | null;
}

export interface IndicatorMeasurement {
  id: string;
  indicator_id: string;
  value: number;
  date: string;
  notes: string | null;
}

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
      
      // Mock data for demonstration purposes
      const mockIndicators: Indicator[] = [
        {
          id: '1',
          project_id: '1',
          name: 'Clean Water Access',
          description: 'Number of people with new access to clean water',
          category: 'Quantitative',
          unit: 'people',
          target_value: 5000,
          current_value: 2500,
          start_value: 0,
          sdg_goals: [6],
          data_collection_method: 'Community surveys',
          frequency: 'Monthly',
          created_at: '2023-05-20',
          last_updated: '2023-08-15'
        },
        {
          id: '2',
          project_id: '1',
          name: 'Water Quality',
          description: 'Water quality index improvement',
          category: 'Quantitative',
          unit: 'index value',
          target_value: 95,
          current_value: 80,
          start_value: 65,
          sdg_goals: [6, 3],
          data_collection_method: 'Lab testing',
          frequency: 'Weekly',
          created_at: '2023-05-20',
          last_updated: '2023-08-10'
        },
        {
          id: '3',
          project_id: '2',
          name: 'Student Enrollment',
          description: 'Number of students enrolled in program',
          category: 'Quantitative',
          unit: 'students',
          target_value: 250,
          current_value: 180,
          start_value: 0,
          sdg_goals: [4],
          data_collection_method: 'Registration records',
          frequency: 'Quarterly',
          created_at: '2023-03-20',
          last_updated: '2023-07-01'
        },
        {
          id: '4',
          project_id: '2',
          name: 'Academic Improvement',
          description: 'Average grade improvement',
          category: 'Quantitative',
          unit: 'percentage points',
          target_value: 30,
          current_value: 18,
          start_value: 0,
          sdg_goals: [4],
          data_collection_method: 'School records',
          frequency: 'Quarterly',
          created_at: '2023-03-25',
          last_updated: '2023-07-01'
        },
        {
          id: '5',
          project_id: '3',
          name: 'CO2 Reduction',
          description: 'Metric tons of CO2 emissions reduced',
          category: 'Quantitative',
          unit: 'metric tons',
          target_value: 10000,
          current_value: 0,
          start_value: 0,
          sdg_goals: [13, 7],
          data_collection_method: 'Energy audits',
          frequency: 'Quarterly',
          created_at: '2023-07-15',
          last_updated: null
        }
      ];
      
      // Filter by project if a projectId is provided
      const filteredIndicators = projectId 
        ? mockIndicators.filter(i => i.project_id === projectId)
        : mockIndicators;
      
      setIndicators(filteredIndicators);
      
      // Mock measurements data
      const mockMeasurements: IndicatorMeasurement[] = [
        {
          id: '1',
          indicator_id: '1',
          value: 500,
          date: '2023-06-15',
          notes: 'Initial community reached'
        },
        {
          id: '2',
          indicator_id: '1',
          value: 1200,
          date: '2023-07-15',
          notes: 'Expanded to neighboring villages'
        },
        {
          id: '3',
          indicator_id: '1',
          value: 2500,
          date: '2023-08-15',
          notes: 'Completed phase 1 of pipeline project'
        },
        {
          id: '4',
          indicator_id: '2',
          value: 70,
          date: '2023-06-10',
          notes: 'First water quality testing after treatment plant installation'
        },
        {
          id: '5',
          indicator_id: '2',
          value: 75,
          date: '2023-07-10',
          notes: 'Improvements after adjusting treatment process'
        },
        {
          id: '6',
          indicator_id: '2',
          value: 80,
          date: '2023-08-10',
          notes: 'Further improvements after system optimization'
        }
      ];
      
      setMeasurements(mockMeasurements);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching indicators:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createIndicator(indicatorData: Omit<Indicator, 'id' | 'created_at' | 'last_updated'>) {
    try {
      setLoading(true);
      
      // This would create a record in Supabase in a real app
      const newIndicator: Indicator = {
        ...indicatorData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        last_updated: null
      };
      
      setIndicators([...indicators, newIndicator]);
      return { data: newIndicator, error: null };
    } catch (err) {
      console.error('Error creating indicator:', err);
      return { data: null, error: err as Error };
    } finally {
      setLoading(false);
    }
  }

  async function addMeasurement(data: Omit<IndicatorMeasurement, 'id'>) {
    try {
      setLoading(true);
      
      // Create new measurement
      const newMeasurement: IndicatorMeasurement = {
        ...data,
        id: Date.now().toString()
      };
      
      setMeasurements([...measurements, newMeasurement]);
      
      // Update the current value of the indicator
      const indicator = indicators.find(i => i.id === data.indicator_id);
      if (indicator) {
        const updatedIndicator = { 
          ...indicator, 
          current_value: data.value,
          last_updated: new Date().toISOString()
        };
        
        setIndicators(indicators.map(i => 
          i.id === data.indicator_id ? updatedIndicator : i
        ));
      }
      
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
    getIndicatorMeasurements
  };
}