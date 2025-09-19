import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface ReportStats {
  date: string;
  totalPresent: number;
  totalCheckedOut: number;
  stillPresent: number;
  averageArrivalTime: string | null;
  averageDepartureTime: string | null;
  attendanceRate: number;
}

interface DailyReport {
  stats: ReportStats;
  records: any[];
}

interface WeeklyReport {
  period: { startDate: string; endDate: string };
  dailyBreakdown: any[];
  totalDays: number;
  totalAttendances: number;
}

export default function AttendanceReports() {
  const [user, setUser] = useState<any>(null);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('daily');
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
    
    // Set default week range
    const today = new Date();
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    const friday = new Date(today.setDate(today.getDate() - today.getDay() + 5));
    
    setWeekStart(monday.toISOString().split('T')[0]);
    setWeekEnd(friday.toISOString().split('T')[0]);
  }, [router]);

  useEffect(() => {
    if (user && activeTab === 'daily') {
      fetchDailyReport();
    }
  }, [user, selectedDate, activeTab]);

  useEffect(() => {
    if (user && activeTab === 'weekly' && weekStart && weekEnd) {
      fetchWeeklyReport();
    }
  }, [user, weekStart, weekEnd, activeTab]);

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

  const fetchDailyReport = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${getApiUrl()}/attendance/reports/daily?date=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDailyReport(data.data);
      } else {
        setError('Error al cargar el reporte diario');
      }
    } catch (error) {
      console.error('Error fetching daily report:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyReport = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${getApiUrl()}/attendance/reports/weekly?startDate=${weekStart}&endDate=${weekEnd}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setWeeklyReport(data.data);
      } else {
        setError('Error al cargar el reporte semanal');
      }
    } catch (error) {
      console.error('Error fetching weekly report:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Reportes de Asistencia - DayCare</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  📊 Reportes de Asistencia
                </h1>
                <p className="text-gray-600">
                  Análisis y estadísticas de asistencia
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {user?.firstName} {user?.lastName}
                </span>
                <button
                  onClick={() => router.push('/attendance')}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Asistencia
                </button>
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
          {/* Tab Navigation */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('daily')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'daily'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Reporte Diario
                </button>
                <button
                  onClick={() => setActiveTab('weekly')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'weekly'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Reporte Semanal
                </button>
              </nav>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Daily Report Tab */}
          {activeTab === 'daily' && (
            <div className="space-y-6">
              {/* Date Selection */}
              <div className="bg-white shadow rounded-lg">
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

              {/* Daily Stats */}
              {loading ? (
                <div className="text-center py-8">Cargando reporte...</div>
              ) : dailyReport && (
                <>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                                {dailyReport.stats.totalPresent}
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
                                Check-outs
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {dailyReport.stats.totalCheckedOut}
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
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <span className="text-yellow-600 text-sm font-medium">🏫</span>
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Aún Presentes
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {dailyReport.stats.stillPresent}
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
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 text-sm font-medium">⏰</span>
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Hora Promedio Llegada
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {dailyReport.stats.averageArrivalTime || '--:--'}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Records */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Registros Detallados - {new Date(selectedDate).toLocaleDateString('es-ES')}
                      </h3>
                      
                      {dailyReport.records.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay registros para esta fecha</p>
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
                                  Check-in
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Check-out
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Tiempo Total
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {dailyReport.records.map((record) => {
                                const checkInTime = record.checkIn ? new Date(`${record.date}T${record.checkIn}`) : null;
                                const checkOutTime = record.checkOut ? new Date(`${record.date}T${record.checkOut}`) : null;
                                const duration = checkInTime && checkOutTime 
                                  ? Math.round((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60 * 100)) / 100
                                  : null;

                                return (
                                  <tr key={record.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">
                                        {record.child?.firstName} {record.child?.lastName}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {record.child?.classroom?.name || 'Sin aula'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {record.checkIn || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {record.checkOut || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {duration ? `${duration}h` : '-'}
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
                </>
              )}
            </div>
          )}

          {/* Weekly Report Tab */}
          {activeTab === 'weekly' && (
            <div className="space-y-6">
              {/* Date Range Selection */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Seleccionar Período
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
                      <input
                        type="date"
                        value={weekStart}
                        onChange={(e) => setWeekStart(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
                      <input
                        type="date"
                        value={weekEnd}
                        onChange={(e) => setWeekEnd(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Stats */}
              {loading ? (
                <div className="text-center py-8">Cargando reporte semanal...</div>
              ) : weeklyReport && (
                <>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500">Total Días</dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {weeklyReport.totalDays}
                          </dd>
                        </dl>
                      </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500">Total Asistencias</dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {weeklyReport.totalAttendances}
                          </dd>
                        </dl>
                      </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500">Promedio por Día</dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {weeklyReport.totalDays > 0 
                              ? Math.round(weeklyReport.totalAttendances / weeklyReport.totalDays)
                              : 0}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>

                  {/* Daily Breakdown */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Desglose Diario
                      </h3>
                      
                      {weeklyReport.dailyBreakdown.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay datos para este período</p>
                      ) : (
                        <div className="space-y-4">
                          {weeklyReport.dailyBreakdown.map((day: any) => (
                            <div key={day.date} className="border rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-gray-900">
                                  {new Date(day.date).toLocaleDateString('es-ES', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </h4>
                                <div className="flex space-x-4 text-sm">
                                  <span className="text-green-600">✓ {day.present} presentes</span>
                                  <span className="text-blue-600">⌛ {day.checkedOut} salidas</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
