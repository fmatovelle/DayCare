import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  classroom: {
    id: string;
    name: string;
  };
}

interface AttendanceRecord {
  id: string;
  childId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  notes: string | null;
  child: Child;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function Attendance() {
  const [user, setUser] = useState<User | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // API URL helper
  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('github.dev')) {
        return `https://${hostname.replace('-3000.', '-3001.')}/api/v1`;
      }
    }
    return 'http://localhost:3001/api/v1';
  };

  // Check authentication and fetch data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUserProfile(token);
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchChildren();
      fetchAttendance();
    }
  }, [user, selectedDate]);

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

  const fetchChildren = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${getApiUrl()}/children`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setChildren(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      setError('Error al cargar los niños');
    }
  };

  const fetchAttendance = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/attendance?date=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('Error al cargar la asistencia');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (childId: string) => {
    const token = localStorage.getItem('token');
    setActionLoading(`checkin-${childId}`);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${getApiUrl()}/attendance/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          childId,
          date: selectedDate,
          checkIn: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSuccess('Check-in registrado exitosamente');
        fetchAttendance();
      } else {
        const error = await response.json();
        setError(error.message || 'Error en el check-in');
      }
    } catch (error) {
      console.error('Error in check-in:', error);
      setError('Error de conexión');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (childId: string) => {
    const token = localStorage.getItem('token');
    setActionLoading(`checkout-${childId}`);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${getApiUrl()}/attendance/check-out`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          childId,
          date: selectedDate,
          checkOut: new Date().toTimeString().slice(0, 8),
        }),
      });

      if (response.ok) {
        setSuccess('Check-out registrado exitosamente');
        fetchAttendance();
      } else {
        const error = await response.json();
        setError(error.message || 'Error en el check-out');
      }
    } catch (error) {
      console.error('Error in check-out:', error);
      setError('Error de conexión');
    } finally {
      setActionLoading(null);
    }
  };

  const getAttendanceForChild = (childId: string) => {
    return attendanceRecords.find(record => record.childId === childId);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (child: Child) => {
    const attendance = getAttendanceForChild(child.id);
    
    if (!attendance || !attendance.checkIn) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Ausente</span>;
    }
    
    if (attendance.checkIn && !attendance.checkOut) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Presente</span>;
    }
    
    if (attendance.checkIn && attendance.checkOut) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Finalizado</span>;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Asistencia - DayCare</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  📊 Asistencia Diaria
                </h1>
                <p className="text-gray-600">
                  Gestión de check-in y check-out de los niños
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
                  onClick={() => router.push('/attendance/reports')}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Ver Reportes
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
          {/* Date Selection */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Seleccionar Fecha
                </h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
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

          {/* Attendance List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Lista de Asistencia - {new Date(selectedDate).toLocaleDateString('es-ES')}
              </h3>
              
              {loading ? (
                <div className="text-center py-4">Cargando asistencia...</div>
              ) : children.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No hay niños registrados
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Niño
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aula
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-in
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-out
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {children.map((child) => {
                        const attendance = getAttendanceForChild(child.id);
                        const isCheckedIn = attendance?.checkIn;
                        const isCheckedOut = attendance?.checkOut;
                        
                        return (
                          <tr key={child.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {child.firstName} {child.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(child.birthDate || child.dateOfBirth).toLocaleDateString('es-ES')}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {child.classroom?.name || 'Sin aula'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(child)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {isCheckedIn ? formatTime(attendance.checkIn) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {isCheckedOut ? formatTime(attendance.checkOut) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                {!isCheckedIn ? (
                                  <button
                                    onClick={() => handleCheckIn(child.id)}
                                    disabled={actionLoading === `checkin-${child.id}`}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                  >
                                    {actionLoading === `checkin-${child.id}` ? 'Procesando...' : 'Check-in'}
                                  </button>
                                ) : !isCheckedOut ? (
                                  <button
                                    onClick={() => handleCheckOut(child.id)}
                                    disabled={actionLoading === `checkout-${child.id}`}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {actionLoading === `checkout-${child.id}` ? 'Procesando...' : 'Check-out'}
                                  </button>
                                ) : (
                                  <span className="text-gray-500 text-sm">Completado</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm font-medium">✓</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Presentes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {attendanceRecords.filter(r => r.checkIn && !r.checkOut).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-medium">⌛</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Finalizados
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {attendanceRecords.filter(r => r.checkIn && r.checkOut).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">✗</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Ausentes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {children.length - attendanceRecords.filter(r => r.checkIn).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



