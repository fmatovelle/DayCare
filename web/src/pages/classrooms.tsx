import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface Classroom {
  id: string;
  name: string;
  description: string;
  ageGroupMin: number;
  ageGroupMax: number;
  capacity: number;
  isActive: boolean;
  centerId: string;
  center?: {
    id: string;
    name: string;
  };
}

interface Center {
  id: string;
  name: string;
}

export default function Classrooms() {
  const [user, setUser] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ageGroupMin: '',
    ageGroupMax: '',
    capacity: '',
    centerId: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const router = useRouter();

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('github.dev')) {
        return `https://${hostname.replace('-3000.', '-3001.')}/api/v1`;
      }
    }
    return 'http://localhost:3001/api/v1';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUserProfile(token);
    fetchClassrooms();
    fetchCenters();
  }, [router]);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      router.push('/login');
    }
  };

  const fetchClassrooms = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${getApiUrl()}/classrooms`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setClassrooms(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      setError('Error al cargar las aulas');
    } finally {
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${getApiUrl()}/centers`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCenters(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching centers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    const url = editingClassroom 
      ? `${getApiUrl()}/classrooms/${editingClassroom.id}`
      : `${getApiUrl()}/classrooms`;
    
    const method = editingClassroom ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          ageGroupMin: parseInt(formData.ageGroupMin),
          ageGroupMax: parseInt(formData.ageGroupMax),
          capacity: parseInt(formData.capacity),
          centerId: formData.centerId,
        }),
      });

      if (response.ok) {
        setSuccess(editingClassroom ? 'Aula actualizada exitosamente' : 'Aula creada exitosamente');
        resetForm();
        fetchClassrooms();
      } else {
        const error = await response.json();
        setError(error.message || 'Error al guardar el aula');
      }
    } catch (error) {
      console.error('Error saving classroom:', error);
      setError('Error de conexión');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    setFormData({
      name: classroom.name,
      description: classroom.description || '',
      ageGroupMin: classroom.ageGroupMin.toString(),
      ageGroupMax: classroom.ageGroupMax.toString(),
      capacity: classroom.capacity.toString(),
      centerId: classroom.centerId || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta aula?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${getApiUrl()}/classrooms/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess('Aula eliminada exitosamente');
        fetchClassrooms();
      } else {
        setError('Error al eliminar el aula');
      }
    } catch (error) {
      console.error('Error deleting classroom:', error);
      setError('Error de conexión');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      ageGroupMin: '',
      ageGroupMax: '',
      capacity: '',
      centerId: '',
    });
    setEditingClassroom(null);
    setShowForm(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Aulas - DayCare</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  🏫 Aulas
                </h1>
                <p className="text-gray-600">
                  Gestiona las aulas por grupos de edad
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {user?.firstName} {user?.lastName}
                </span>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Add Classroom Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
            >
              ➕ Agregar Aula
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Add/Edit Classroom Form */}
          {showForm && (
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {editingClassroom ? 'Editar Aula' : 'Agregar Nueva Aula'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre del Aula *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Centro
                      </label>
                      <select
                        value={formData.centerId}
                        onChange={(e) => setFormData({...formData, centerId: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Seleccionar centro</option>
                        {centers.map((center) => (
                          <option key={center.id} value={center.id}>
                            {center.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Edad Mínima (meses)
                      </label>
                      <input
                        type="number"
                        value={formData.ageGroupMin}
                        onChange={(e) => setFormData({...formData, ageGroupMin: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Edad Máxima (meses)
                      </label>
                      <input
                        type="number"
                        value={formData.ageGroupMax}
                        onChange={(e) => setFormData({...formData, ageGroupMax: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Capacidad (número de niños)
                      </label>
                      <input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={2}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descripción opcional del aula"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {formLoading ? 'Guardando...' : (editingClassroom ? 'Actualizar' : 'Crear')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Classrooms List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Lista de Aulas ({classrooms.length})
              </h3>
              
              {classrooms.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay aulas registradas</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-2 text-blue-600 hover:text-blue-500"
                  >
                    Agregar la primera aula
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {classrooms.map((classroom) => (
                    <div key={classroom.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-semibold text-gray-900">
                          {classroom.name}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          classroom.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {classroom.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        {classroom.description && (
                          <p><strong>Descripción:</strong> {classroom.description}</p>
                        )}
                        <p><strong>Edad:</strong> {classroom.ageGroupMin} - {classroom.ageGroupMax} meses</p>
                        <p><strong>Capacidad:</strong> {classroom.capacity} niños</p>
                        <p><strong>Centro:</strong> {classroom.center?.name || 'No asignado'}</p>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(classroom)}
                          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(classroom.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
