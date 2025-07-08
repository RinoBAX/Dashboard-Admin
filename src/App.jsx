import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as THREE from 'three';

// Impor komponen yang telah dipisahkan
import DashboardPage from './components/DashboardPage';
import ProjectsPage from './components/ProjectPage';
import UsersPage from './components/UsersPage';
import AdminSubmissionsPage from './components/AdminSubmissionsPage';
import AdminWithdrawalsPage from './components/AdminWithdrawalsPage';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import LoadingComponent from './components/LoadingComponent';
import GlobalStyles from './components/GlobalStyles';

// --- MAIN APP COMPONENT ---
function App() {
    const [token, setTokenState] = useState(() => localStorage.getItem('adminToken'));
    const [user, setUserState] = useState(() => {
        const savedUser = localStorage.getItem('adminUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [page, setPage] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(true);
    
    // Helper hook untuk API call
    const useApi = (token) => {
        return useCallback(async (endpoint, method = 'GET', body = null) => {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
            const url = `${API_BASE_URL}${endpoint}`;
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const options = { method, headers };
            if (body) { options.body = JSON.stringify(body); }

            try {
                const response = await fetch(url, options);
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'An error occurred');
                }
                return data;
            } catch (error) {
                console.error(`API Error on ${method} ${endpoint}:`, error);
                throw error;
            }
        }, [token]);
    };

    const request = useApi(token);

    const setToken = (newToken) => {
        if (newToken) localStorage.setItem('adminToken', newToken);
        else localStorage.removeItem('adminToken');
        setTokenState(newToken);
    };

    const setUser = (newUser) => {
        if (newUser) localStorage.setItem('adminUser', JSON.stringify(newUser));
        else localStorage.removeItem('adminUser');
        setUserState(newUser);
    };

    const handleLogout = () => {
        setToken(null);
        setUser(null);
    };
    
    useEffect(() => {
        const verifyToken = async () => {
            if (token) {
                try {
                    const profileData = await request('/users/me');
                    if (profileData && (profileData.role === 'ADMIN' || profileData.role === 'SUPER_ADMIN')) {
                       setUser(profileData);
                    } else { handleLogout(); }
                } catch (error) {
                    console.error("Token verification failed", error);
                    handleLogout();
                }
            }
            setIsLoading(false);
        };
        verifyToken();
    }, [token, request]);

    // Background Animation Effect
    useEffect(() => {
        let scene, camera, renderer, crystal;
        const canvas = document.getElementById('bg-canvas');

        if (!canvas) return;

        function init() {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);

            const geometry = new THREE.IcosahedronGeometry(2, 0);
            const material = new THREE.MeshStandardMaterial({
                color: 0x8A2BE2,
                transparent: true,
                opacity: 0.3,
                roughness: 0.1,
                metalness: 0.8,
            });
            crystal = new THREE.Mesh(geometry, material);
            scene.add(crystal);

            const pointLight = new THREE.PointLight(0x00f6ff, 2, 100);
            pointLight.position.set(10, 10, 10);
            scene.add(pointLight);
            
            const ambientLight = new THREE.AmbientLight(0xff007f, 0.5);
            scene.add(ambientLight);

            camera.position.z = 5;
            animate();
        }

        let animationFrameId;
        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            if(crystal) {
                crystal.rotation.x += 0.001;
                crystal.rotation.y += 0.001;
            }
            renderer.render(scene, camera);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        window.addEventListener('resize', onWindowResize, false);
        init();

        return () => {
            window.removeEventListener('resize', onWindowResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);
    
    const renderPage = () => {
        switch (page) {
            case 'dashboard': return <DashboardPage />;
            case 'projects': return <ProjectsPage token={token} />;
            case 'users': return <UsersPage />;
            case 'submissions': return <AdminSubmissionsPage token={token} />;
            case 'withdrawals': return <AdminWithdrawalsPage token={token} />;
            default: return <DashboardPage />;
        }
    };
    
    if (isLoading) { return <LoadingComponent />; }
    if (!token || !user) { return <LoginPage setToken={setToken} setUser={setUser} />; }

    return (
        <div className="app-layout">
            <canvas id="bg-canvas" style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }}></canvas>
            <GlobalStyles />
            <Sidebar user={user} setPage={setPage} currentPage={page} handleLogout={handleLogout} />
            <main className="main-content">{renderPage()}</main>
        </div>
    );
}

export default App;
