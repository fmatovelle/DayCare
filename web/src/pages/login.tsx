import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// NEW VERSION
export default function Login() {
    const [email, setEmail] = useState('admin@daycare.com');
    const [password, setPassword] = useState('admin123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    // Fixed API URL function
    const getApiUrl = () => {
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            if (hostname.includes('github.dev')) {
                return `https://${hostname.replace('-3000.', '-3001.')}/api/v1`;
            }
        }
        return 'http://localhost:3001/api/v1';
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const apiUrl = getApiUrl();
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.data.access_token);
                setSuccess(`Login exitoso! Bienvenido ${data.data.user.firstName}`);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            } else {
                setError(data.message || 'Error al iniciar sesión');
            }
        } catch (error) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Login - DayCare</title>
            </Head>

            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
                <div style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                            DayCare Login
                        </h2>
                        <p style={{ color: '#6b7280' }}>
                            Ingresa con tus credenciales
                        </p>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '1rem'
                            }}
                            placeholder="Email"
                            required
                        />

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '1rem'
                            }}
                            placeholder="Contraseña"
                            required
                        />

                        {error && (
                            <div style={{
                                color: '#dc2626',
                                fontSize: '0.875rem',
                                textAlign: 'center',
                                backgroundColor: '#fef2f2',
                                padding: '0.5rem',
                                borderRadius: '0.375rem'
                            }}>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div style={{
                                color: '#059669',
                                fontSize: '0.875rem',
                                textAlign: 'center',
                                backgroundColor: '#f0fdf4',
                                padding: '0.5rem',
                                borderRadius: '0.375rem'
                            }}>
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
                        <p>Usuario de prueba:</p>
                        <p>Email: admin@daycare.com</p>
                        <p>Password: admin123</p>
                    </div>
                </div>
            </div>
        </>
    );
}