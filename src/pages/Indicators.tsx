import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, Plus, Edit, Trash2, Search, SortAsc, SortDesc, Loader2 } from 'lucide-react';

// Define interfaces
interface Indicator {
  id: string;
  project_id: string;
  name: string;
  value: number;
  unit: string;
  category: 'Environmental' | 'Social' | 'Governance' | 'Financial';
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

export default function Indicators() {
  const { user } = useAuth();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterProject, setFilterProject] = useState<string>('All');
  const [sortField, setSortField] = useState<'value' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [newIndicator, setNewIndicator] = useState({
    project_id: '',
    name: '',
    value: 0,
    unit: '',
    category: 'Environmental' as 'Environmental' | 'Social' | 'Governance' | 'Financial',
  });
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Currency formatter for IDR
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);

  // Fetch indicators and projects
  useEffect(() => {
    if (!user) {
      setError('Anda harus login untuk melihat indikator');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        console.log('Mengambil indikator dan proyek...'); // Debug
        const timeout = setTimeout(() => {
          setError('Permintaan timeout. Silakan coba lagi.');
          setLoading(false);
        }, 10000); // 10s timeout

        // Fetch indicators
        const { data: indicatorData, error: indicatorError } = await supabase
          .from('project_indicators')
          .select('*')
          .order('created_at', { ascending: false });

        if (indicatorError) {
          console.error('Kesalahan kueri indikator:', indicatorError);
          throw new Error(`Gagal mengambil indikator: ${indicatorError.message}`);
        }

        console.log('Data indikator:', indicatorData); // Debug

        // Fetch projects
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id, name')
          .order('name');

        if (projectError) {
          console.error('Kesalahan kueri proyek:', projectError);
          throw new Error(`Gagal mengambil proyek: ${projectError.message}`);
        }

        console.log('Data proyek:', projectData); // Debug

        setIndicators(indicatorData || []);
        setProjects(projectData || []);
        clearTimeout(timeout);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga';
        setError(errorMessage);
        console.error('Kesalahan:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time subscription
    const channel = supabase
      .channel('project_indicators')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_indicators' }, (payload) => {
        console.log('Pembaruan real-time:', payload); // Debug
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
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Handle add indicator
  const handleAddIndicator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Anda harus login untuk menambah indikator');
      return;
    }

    if (!newIndicator.project_id || !newIndicator.name || !newIndicator.unit || newIndicator.value < 0) {
      setError('Harap isi semua kolom yang diperlukan dan pastikan nilai tidak negatif');
      return;
    }

    try {
      const { error } = await supabase.from('project_indicators').insert([newIndicator]);
      if (error) throw new Error(`Gagal menambah indikator: ${error.message}`);

      setNewIndicator({ project_id: '', name: '', value: 0, unit: '', category: 'Environmental' });
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga');
      console.error('Kesalahan:', err);
    }
  };

  // Handle edit indicator
  const handleEditIndicator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIndicator || !user) return;

    try {
      const { error } = await supabase
        .from('project_indicators')
        .update({
          name: editingIndicator.name,
          value: editingIndicator.value,
          unit: editingIndicator.unit,
          category: editingIndicator.category,
        })
        .eq('id', editingIndicator.id);

      if (error) throw new Error(`Gagal memperbarui indikator: ${error.message}`);

      setShowEditModal(false);
      setEditingIndicator(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga');
      console.error('Kesalahan:', err);
    }
  };

  // Handle delete indicator
  const handleDeleteIndicator = async (id: string) => {
    if (!user || !confirm('Apakah Anda yakin ingin menghapus indikator ini?')) return;

    try {
      const { error } = await supabase.from('project_indicators').delete().eq('id', id);
      if (error) throw new Error(`Gagal menghapus indikator: ${error.message}`);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga');
      console.error('Kesalahan:', err);
    }
  };

  // Filter and sort indicators
  const filteredIndicators = indicators
    .filter((ind) => {
      const matchesSearch =
        ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ind.unit.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || ind.category === filterCategory;
      const matchesProject = filterProject === 'All' || ind.project_id === filterProject;
      return matchesSearch && matchesCategory && matchesProject;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      if (sortField === 'value') {
        return multiplier * (a.value - b.value);
      } else {
        return multiplier * (new Date(a.created_at) > new Date(b.created_at) ? 1 : -1);
      }
    });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center sm:text-left">Kelola Indikator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 animate-slide-in">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters, Search, and Sort */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Cari indikator..."
                className="w-full sm:w-64 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4 items-center">
              <select
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="All">Semua Kategori</option>
                <option value="Environmental">Lingkungan</option>
                <option value="Social">Sosial</option>
                <option value="Governance">Tata Kelola</option>
                <option value="Financial">Keuangan</option>
              </select>
              <select
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
              >
                <option value="All">Semua Proyek</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <select
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as 'value' | 'created_at')}
                >
                  <option value="value">Nilai</option>
                  <option value="created_at">Tanggal Dibuat</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 rounded-md bg-gray-200 hover:bg-gray-300"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              Tambah Indikator
            </button>
          </div>
        </div>

        {/* Indicators Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : filteredIndicators.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">Tidak ada indikator ditemukan.</div>
          ) : (
            filteredIndicators.map((indicator) => (
              <div
                key={indicator.id}
                className={`p-6 rounded-lg shadow-lg border ${
                  indicator.category === 'Environmental'
                    ? 'bg-green-50 border-green-200'
                    : indicator.category === 'Social'
                    ? 'bg-blue-50 border-blue-200'
                    : indicator.category === 'Governance'
                    ? 'bg-purple-50 border-purple-200'
                    : 'bg-yellow-50 border-yellow-200'
                } hover:shadow-xl transition-shadow`}
              >
                <h3 className="text-lg font-semibold text-gray-900">{indicator.name}</h3>
                <p className="text-sm text-gray-600">
                  Proyek: {projects.find((p) => p.id === indicator.project_id)?.name || 'Tidak Diketahui'}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {indicator.unit === 'IDR' ? formatCurrency(indicator.value) : `${indicator.value} ${indicator.unit}`}
                </p>
                <p className="text-sm text-gray-600">Kategori: {indicator.category}</p>
                <p className="text-sm text-gray-500">
                  Dibuat: {new Date(indicator.created_at).toLocaleDateString()}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingIndicator(indicator);
                      setShowEditModal(true);
                    }}
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-800"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteIndicator(indicator.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Indicator Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Tambah Indikator Baru</h2>
              <form onSubmit={handleAddIndicator} className="space-y-4">
                <div>
                  <label htmlFor="project_id" className="block text-sm font-medium text-gray-700">Proyek</label>
                  <select
                    id="project_id"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={newIndicator.project_id}
                    onChange={(e) => setNewIndicator({ ...newIndicator, project_id: e.target.value })}
                  >
                    <option value="">Pilih proyek</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama</label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={newIndicator.name}
                    onChange={(e) => setNewIndicator({ ...newIndicator, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="value" className="block text-sm font-medium text-gray-700">Nilai</label>
                  <input
                    type="number"
                    id="value"
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={newIndicator.value}
                    onChange={(e) => setNewIndicator({ ...newIndicator, value: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Satuan</label>
                  <input
                    type="text"
                    id="unit"
                    required
                    placeholder="Contoh: IDR, tons CO2e, jobs"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={newIndicator.unit}
                    onChange={(e) => setNewIndicator({ ...newIndicator, unit: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Kategori</label>
                  <select
                    id="category"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={newIndicator.category}
                    onChange={(e) =>
                      setNewIndicator({ ...newIndicator, category: e.target.value as 'Environmental' | 'Social' | 'Governance' | 'Financial' })
                    }
                  >
                    <option value="Environmental">Lingkungan</option>
                    <option value="Social">Sosial</option>
                    <option value="Governance">Tata Kelola</option>
                    <option value="Financial">Keuangan</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Tambah
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Indicator Modal */}
        {showEditModal && editingIndicator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Indikator</h2>
              <form onSubmit={handleEditIndicator} className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Nama</label>
                  <input
                    type="text"
                    id="edit-name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={editingIndicator.name}
                    onChange={(e) => setEditingIndicator({ ...editingIndicator, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="edit-value" className="block text-sm font-medium text-gray-700">Nilai</label>
                  <input
                    type="number"
                    id="edit-value"
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={editingIndicator.value}
                    onChange={(e) => setEditingIndicator({ ...editingIndicator, value: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label htmlFor="edit-unit" className="block text-sm font-medium text-gray-700">Satuan</label>
                  <input
                    type="text"
                    id="edit-unit"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={editingIndicator.unit}
                    onChange={(e) => setEditingIndicator({ ...editingIndicator, unit: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">Kategori</label>
                  <select
                    id="edit-category"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={editingIndicator.category}
                    onChange={(e) =>
                      setEditingIndicator({ ...editingIndicator, category: e.target.value as 'Environmental' | 'Social' | 'Governance' | 'Financial' })
                    }
                  >
                    <option value="Environmental">Lingkungan</option>
                    <option value="Social">Sosial</option>
                    <option value="Governance">Tata Kelola</option>
                    <option value="Financial">Keuangan</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slide-in {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}