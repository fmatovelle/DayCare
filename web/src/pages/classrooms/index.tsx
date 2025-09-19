import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface Classroom {
  id: string;
  name: string;
  description: string;
  ageGroupMin: number;
  ageGroupMax: number;
  capacity: number;
  centerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const getAgeGroupDisplay = (minAge: number, maxAge: number) => {
    if (maxAge < 12) {
      return `${minAge}-${maxAge} meses`;
    } else if (minAge < 12) {
      const maxYears = Math.floor(maxAge / 12);
      return `${minAge} meses - ${maxYears} años`;
    } else {
      const minYears = Math.floor(minAge / 12);
      const maxYears = Math.floor(maxAge / 12);
      return `${minYears}-${maxYears} años`;
    }
  };

  const fetchClassrooms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${getApiUrl()}/classrooms`, {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClassrooms(data.data || []);
      } else {
        setError('Error al cargar aulas');
      }
    } catch (error) {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Cargando aulas...</div>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>Aulas - DayCare</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Aulas</h1>
                <p className="text-gray-600">Gestiona las aulas por grupos de edad</p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto py-6 px-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {classrooms.length === 0 ? (
            <div className="bg-white p-6 rounded shadow text-center">
              <h3 className="text-lg font-medium mb-2">No hay aulas registradas</h3>
              <p>Las aulas apareceran aqui cuando se registren</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {classrooms.map((classroom) => (
                <div key={classroom.id} className="bg-white p-6 rounded shadow">
                  <h3 className="text-lg font-medium mb-2">{classroom.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{classroom.description || 'Sin descripcion'}</p>
                  
                  <div className="text-sm space-y-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-500 w-20">Edad:</span>
                      <span className="text-gray-900">{getAgeGroupDisplay(classroom.ageGroupMin, classroom.ageGroupMax)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-500 w-20">Capacidad:</span>
                      <span className="text-gray-900">{classroom.capacity} niños</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-500 w-20">Estado:</span>
                      <span className={`px-2 py-1 text-xs rounded ${classroom.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {classroom.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
