import React, { useState, useCallback } from 'react';

// Ikon yang dibutuhkan untuk halaman ini
const ICONS = {
    eye: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
    eyeOff: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>,
};

// Komponen Utama Halaman Login
const LoginPage = ({ setToken, setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Hook kustom untuk melakukan panggilan API
    const useApi = () => {
        return useCallback(async (endpoint, method = 'GET', body = null) => {
            
            const url = `${API_BASE_URL}${endpoint}`;
            const headers = { 'Content-Type': 'application/json' };
            const options = { method, headers, ...(body && { body: JSON.stringify(body) }) };
            const response = await fetch(url, options);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'An error occurred');
            return data;
        }, []);
    };
    const request = useApi();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // Step 1: Login untuk mendapatkan token
            const loginData = await request('/auth/login', 'POST', { email, password });
            
            if (loginData.accessToken) {
                // Step 2: Gunakan token baru untuk mengambil profil pengguna
                const profileResponse = await fetch(`${API_BASE_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${loginData.accessToken}` }
                });
                const profileData = await profileResponse.json();
                
                if (!profileResponse.ok) {
                    throw new Error(profileData.message || "Gagal mengambil data profil setelah login.");
                }

                // Step 3: Periksa peran dari profil yang baru diambil
                if (profileData && (profileData.role === 'ADMIN' || profileData.role === 'SUPER_ADMIN')) {
                    setToken(loginData.accessToken);
                    setUser(profileData);
                } else {
                    setError('Login berhasil, tetapi Anda tidak memiliki hak akses ke panel admin.');
                }
            } else {
                setError('Login gagal. Token tidak diterima.');
            }
        } catch (err) {
            setError(err.message || 'Login gagal. Silakan periksa kembali kredensial Anda.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="login-page">
            <div className="login-container glass-panel">
                <div className="login-header">
                    <h2>Admin TheBaxLancer</h2>
                </div>
                <form className="login-form" onSubmit={handleLogin}>
                    {error && <div className="error-message">{error}</div>}
                    <div className="input-wrapper">
                        <input 
                            id="email-address" 
                            type="email" 
                            required 
                            className="form-input" 
                            placeholder="Email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>
                    <div className="input-wrapper">
                        <input 
                            id="password" 
                            type={showPassword ? 'text' : 'password'} 
                            required 
                            className="form-input" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="password-toggle"
                        >
                            {showPassword ? ICONS.eyeOff : ICONS.eye}
                        </button>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="button button-primary"
                    >
                        {isLoading ? 'Authenticating...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
