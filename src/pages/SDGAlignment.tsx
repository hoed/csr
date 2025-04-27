import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Target } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { supabase } from '../lib/supabase';
import ImpactChart from '../components/dashboard/ImpactChart';

interface ProjectSDG {
  id: string;
  project_id: string;
  sdg_number: number;
  contribution_level: 'direct' | 'indirect';
  description: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  sdgs: number[];
}

const SDGAlignment = () => {
  const { t } = useTranslation();
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [showAlignmentModal, setShowAlignmentModal] = useState(false);
  const [projectSDGs, setProjectSDGs] = useState<ProjectSDG[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    sdg_number: 1,
    contribution_level: 'direct' as 'direct' | 'indirect',
    description: ''
  });

  useEffect(() => {
    if (selectedProject) {
      fetchProjectSDGs();
    }
  }, [selectedProject]);

  const fetchProjectSDGs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_sdgs')
        .select('*')
        .eq('project_id', selectedProject);

      if (error) throw error;
      setProjectSDGs(data || []);
    } catch (err) {
      console.error('Error fetching project SDGs:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase
        .from('project_sdgs')
        .insert([
          {
            project_id: selectedProject,
            ...formData
          }
        ]);

      if (error) throw error;

      await fetchProjectSDGs();
      setShowAlignmentModal(false);
      setFormData({
        sdg_number: 1,
        contribution_level: 'direct',
        description: ''
      });
    } catch (err) {
      console.error('Error creating SDG alignment:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sdgData = projectSDGs.reduce((acc, sdg) => {
    const existing = acc.find(item => item.name === `SDG ${sdg.sdg_number}`);
    if (existing) {
      existing.value += sdg.contribution_level === 'direct' ? 1 : 0.5;
    } else {
      acc.push({
        name: `SDG ${sdg.sdg_number}`,
        value: sdg.contribution_level === 'direct' ? 1 : 0.5
      });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('sdg.title', 'SDG Alignment Dashboard')}</h1>
        <button
          onClick={() => setShowAlignmentModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          {t('sdg.addAlignment', 'Add SDG Alignment')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="form-select"
          >
            <option value="">{t('sdg.selectProject', 'Select Project')}</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ImpactChart
          title={t('sdg.alignmentChart', 'Project SDG Alignment')}
          type="bar"
          data={sdgData}
          dataKeys={[
            { key: 'value', color: '#10B981', name: t('sdg.contribution', 'Contribution') }
          ]}
          yAxisLabel={t('sdg.score', 'Alignment Score')}
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">{t('sdg.currentAlignments', 'Current Alignments')}</h3>
          {projectSDGs.length > 0 ? (
            <div className="space-y-4">
              {projectSDGs.map((sdg) => (
                <div key={sdg.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0">
                    <Target size={24} className="text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">SDG {sdg.sdg_number}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{sdg.description}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      sdg.contribution_level === 'direct' 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-info-100 text-info-800'
                    }`}>
                      {sdg.contribution_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">{t('sdg.noAlignments', 'No alignments added yet')}</p>
          )}
        </div>
      </div>

      {/* SDG Alignment Modal */}
      {showAlignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{t('sdg.addNewAlignment', 'Add New SDG Alignment')}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('sdg.selectSDG', 'Select SDG')}</label>
                <select
                  value={formData.sdg_number}
                  onChange={(e) => setFormData({ ...formData, sdg_number: Number(e.target.value) })}
                  className="form-select w-full"
                  required
                >
                  {Array.from({ length: 17 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>SDG {num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('sdg.contributionLevel', 'Contribution Level')}</label>
                <select
                  value={formData.contribution_level}
                  onChange={(e) => setFormData({ ...formData, contribution_level: e.target.value as 'direct' | 'indirect' })}
                  className="form-select w-full"
                  required
                >
                  <option value="direct">{t('sdg.direct', 'Direct')}</option>
                  <option value="indirect">{t('sdg.indirect', 'Indirect')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('sdg.description', 'Description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input w-full"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAlignmentModal(false)}
                  className="btn-secondary"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SDGAlignment;