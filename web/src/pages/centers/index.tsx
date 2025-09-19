import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function CentersPage() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('http://localhost:3001/api/v1/centers', {
      headers: { 
        'Authorization': 'Bearer ' + token
      },
    })
    .then(res => res.json())
    .then(data => {
      setCenters(data.data || []);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Cargando centros...</div>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>Centros - DayCare</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Centros</h1>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto py-6 px-4">
          {centers.length === 0 ? (
            <div className="bg-white p-6 rounded shadow text-center">
              <h3 className="text-lg font-medium mb-2">No hay centros registrados</h3>
              <p>Los centros apareceran aqui cuando se registren</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {centers.map((center) => (
                <div key={center.id} className="bg-white p-6 rounded shadow">
                  <h3 className="text-lg font-medium mb-2">{center.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{center.description || 'Sin descripcion'}</p>
                  <div className="text-sm space-y-1">
                    <div><strong>Direccion:</strong> {center.address}, {center.city}</div>
                    <div><strong>Telefono:</strong> {center.phone}</div>
                    <div><strong>Email:</strong> {center.email}</div>
                    <div><strong>Capacidad:</strong> {center.capacity} ninos</div>
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
