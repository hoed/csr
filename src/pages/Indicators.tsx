import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

// Define interfaces
interface Project {
  id: string;
  name: string;
  description: string | null;
  location: string;
  category: string;
  start_date: string;
  end_date: string | null;
  budget: number;
  manager: string;
  sdgs: number[] | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Indicator {
  id: string;
  project_id: string;
  name: string;
  value: number;
  unit: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Currency formatter for IDR
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);

  useEffect(() => {
    if (!user) {
      setError('Anda harus login untuk melihat detail proyek');
      setLoading(false);
      return;
    }

    if (!id) {
      setError('ID proyek tidak ditemukan');
      setLoading(false);
      return;
    }

    const fetchProjectDetails = async () => {
      try {
        const timeout = setTimeout(() => {
          setError('Permintaan timeout. Silakan coba lagi.');
          setLoading(false);
        }, 10000);

        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (projectError) throw new Error(`Gagal mengambil proyek: ${projectError.message}`);

        if (!projectData) throw new Error('Proyek tidak ditemukan');

        const { data: indicatorData, error: indicatorError } = await supabase
          .from('project_indicators')
          .select('*')
          .eq('project_id', id)
          .order('created_at', { ascending: false });

        if (indicatorError) throw new Error(`Gagal mengambil indikator: ${indicatorError.message}`);

        setProject(projectData);
        setIndicators(indicatorData || []);
        clearTimeout(timeout);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga';
        setError(errorMessage);
        console.error('Kesalahan:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();

    // Real-time subscriptions
    const projectSubscription = supabase
      .channel('projects')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${id}` }, (payload) => {
        setProject(payload.new as Project);
      })
      .subscribe();

    const indicatorSubscription = supabase
      .channel('project_indicators')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_indicators', filter: `project_id=eq.${id}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setIndicators((prev) => [payload.new as Indicator, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setIndicators((prev) =>
            prev.map((ind) => (ind.id === payload.new.id ? (payload.new as Indicator) : ind))
          );
        } else if (payload.eventType === 'DELETE') {
          setIndicators((prev) => prev.filter((ind) => ind.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(projectSubscription);
      supabase.removeChannel(indicatorSubscription);
    };
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="mt-4 flex items-center gap-2 text-primary-600 hover:text-primary-800"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali ke Proyek
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <p className="text-gray-500">Proyek tidak ditemukan.</p>
            <button
              onClick={() => navigate('/projects')}
              className="mt-4 flex items-center gap-2 text-primary-600 hover:text-primary-800"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali ke Proyek
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/projects')}
          className="mb-6 flex items-center gap-2 text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Proyek
        </button>

        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{project.name}</h1>

          {/* Project Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Detail Proyek</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Kategori</p>
                <p className="text-gray-900">{project.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Lokasi</p>
                <p className="text-gray-900">{project.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Manajer</p>
                <p className="text-gray-900">{project.manager}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Tanggal Mulai</p>
                <p className="text-gray-900">{new Date(project.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Tanggal Selesai</p>
                <p className="text-gray-900">
                  {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Anggaran</p>
                <p className="text-gray-900">{formatCurrency(project.budget)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">SDGs</p>
                <p className="text-gray-900">{project.sdgs?.join(', ') || 'Tidak ada'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <p className="text-gray-900">{project.status}</p>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-sm font-medium text-gray-700">Deskripsi</p>
                <p className="text-gray-900">{project.description || 'Tidak ada deskripsi'}</p>
              </div>
            </div>
          </div>

          {/* Indicators */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Indikator CSR</h2>
            {indicators.length === 0 ? (
              <p className="text-gray-500">Tidak ada indikator terkait proyek ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nilai
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Satuan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dibuat Pada
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {indicators.map((indicator) => (
                      <tr key={indicator.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {indicator.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {indicator.unit === 'IDR' ? formatCurrency(indicator.value) : indicator.value}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{indicator.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{indicator.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(indicator.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}