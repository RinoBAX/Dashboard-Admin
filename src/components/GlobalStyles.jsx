import React from 'react';

// Komponen ini berisi semua styling global untuk aplikasi.
// Ini membantu menjaga file App.jsx tetap bersih dan fokus pada logika.
const GlobalStyles = () => (
    <style>{`
        :root { 
            --bg-color: #1a1a2e; 
            --panel-color: rgba(255, 255, 255, 0.05); 
            --text-color: #e0e0e0; 
            --primary-color: #00f6ff; 
            --secondary-color: #ff007f; 
        }
        body { 
            background-color: var(--bg-color); 
            color: var(--text-color); 
            font-family: 'Inter', sans-serif; 
            margin: 0;
            padding: 0;
        }
        .glass-panel { 
            background: var(--panel-color); 
            backdrop-filter: blur(10px); 
            border-radius: 1rem; 
            border: 1px solid rgba(255, 255, 255, 0.1); 
        }
        .loading-overlay { 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: rgba(0,0,0,0.7); 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            z-index: 1000; 
            flex-direction: column; 
        }
        .loader { 
            border: 4px solid #f3f3f3; 
            border-top: 4px solid var(--primary-color); 
            border-radius: 50%; 
            width: 50px; 
            height: 50px; 
            animation: spin 1s linear infinite; 
        }
        .loading-overlay p { 
            margin-top: 1rem; 
            font-size: 1.2rem; 
        }
        @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
        }
        .login-page { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
        }
        .login-container { 
            padding: 2rem; 
            width: 100%; 
            max-width: 400px; 
            text-align: center; 
        }
        .login-header h2 { 
            font-size: 2rem; 
            font-weight: bold; 
            color: var(--primary-color); 
        }
        .login-header p { 
            margin-top: 0.5rem; 
            color: #a0a0a0; 
        }
        .login-form { 
            margin-top: 2rem; 
            display: flex; 
            flex-direction: column; 
            gap: 1rem; 
        }
        .input-wrapper { 
            position: relative; 
        }
        .form-input { 
            width: 100%; 
            background: rgba(0,0,0,0.2); 
            border: 1px solid rgba(255,255,255,0.2); 
            border-radius: 0.5rem; 
            padding: 0.75rem 1rem; 
            color: white; 
            box-sizing: border-box;
        }
        .password-toggle { 
            position: absolute; 
            right: 1rem; 
            top: 50%; 
            transform: translateY(-50%); 
            background: none; 
            border: none; 
            color: #a0a0a0; 
            cursor: pointer; 
        }
        .button { 
            padding: 0.75rem; 
            border-radius: 0.5rem; 
            border: none; 
            cursor: pointer; 
            font-weight: bold; 
            transition: all 0.3s; 
        }
        .button-sm { 
            padding: 0.25rem 0.75rem; 
            font-size: 0.8rem; 
        }
        .button-primary { 
            background-color: var(--primary-color); 
            color: var(--bg-color); 
        }
        .button-secondary { 
            background-color: rgba(255,255,255,0.1); 
            color: var(--text-color); 
        }
        .button:disabled { 
            opacity: 0.5; 
            cursor: not-allowed; 
        }
        .error-message { 
            color: var(--secondary-color); 
            background: rgba(255,0,127,0.1); 
            padding: 0.5rem; 
            border-radius: 0.5rem; 
        }
        .app-layout { 
            display: flex; 
        }
        .sidebar { 
            width: 250px; 
            height: 100vh; 
            padding: 1.5rem; 
            display: flex; 
            flex-direction: column;
            position: fixed;
            top: 0;
            left: 0;
        }
        .sidebar-header { 
            font-size: 1.5rem; 
            font-weight: bold; 
            text-align: center; 
        }
        .sidebar-profile { 
            text-align: center; 
            margin-top: 2rem; 
        }
        .sidebar-profile img { 
            width: 80px; 
            height: 80px; 
            border-radius: 50%; 
            margin: 0 auto; 
            border: 2px solid var(--primary-color); 
        }
        .sidebar-profile h4 { 
            margin-top: 0.5rem; 
            font-weight: bold; 
        }
        .sidebar-profile p { 
            font-size: 0.8rem; 
            color: #a0a0a0; 
        }
        .sidebar-nav { 
            margin-top: 2rem; 
            flex-grow: 1; 
            display: flex; 
            flex-direction: column; 
            justify-content: space-between; 
        }
        .nav-item { 
            display: flex; 
            align-items: center; 
            gap: 1rem; 
            padding: 0.75rem; 
            border-radius: 0.5rem; 
            background: none; 
            border: none; 
            color: var(--text-color); 
            width: 100%; 
            text-align: left; 
            cursor: pointer; 
            transition: background 0.2s; 
        }
        .nav-item:hover { 
            background: rgba(255,255,255,0.1); 
        }
        .nav-item-active { 
            background: var(--primary-color); 
            color: var(--bg-color); 
        }
        .main-content { 
            flex: 1; 
            padding: 2rem; 
            margin-left: 250px;
        }
        .page-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 2rem;
        }
        .page-header h1 { 
            font-size: 2.5rem; 
            font-weight: bold; 
            margin: 0;
        }
        .page-header p { 
            color: #a0a0a0; 
            margin: 0;
        }
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 1rem; 
        }
        .stat-card { 
            padding: 1.5rem; 
        }
        .stat-card p:first-child { 
            color: #a0a0a0; 
            margin: 0;
        }
        .stat-card p:nth-child(2) { 
            font-size: 2rem; 
            font-weight: bold; 
            margin: 0.25rem 0;
        }
        .stat-change { 
            margin-top: 0.5rem; 
            font-size: 0.9rem; 
        }
        .stat-change--positive { 
            color: #4ade80; 
        }
        .stat-change--negative { 
            color: #f87171; 
        }
        .table-container { 
            padding: 1.5rem; 
            overflow-x: auto;
        }
        /* STYLING SCROLLBAR BARU */
        .table-container::-webkit-scrollbar {
            height: 8px; /* Tinggi scrollbar horizontal */
        }
        .table-container::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2); /* Warna track yang lebih gelap */
            border-radius: 10px;
        }
        .table-container::-webkit-scrollbar-thumb {
            background-color: var(--primary-color); /* Menggunakan warna aksen utama */
            border-radius: 10px;
            border: 2px solid transparent;
            background-clip: content-box;
        }
        .table-container::-webkit-scrollbar-thumb:hover {
            background-color: var(--secondary-color); /* Warna berbeda saat di-hover */
        }
        .data-table { 
            width: 100%; 
            border-collapse: collapse; 
            min-width: 900px;
        }
        .data-table th, .data-table td { 
            padding: 0.75rem 1rem; 
            text-align: left; 
            border-bottom: 1px solid rgba(255,255,255,0.1); 
            vertical-align: middle; 
        }
        /* PERBAIKAN: Menargetkan gambar ikon di dalam tabel */
        .data-table td img.project-icon {
            width: 40px;
            height: 40px;
            border-radius: 0.375rem; /* 6px */
            object-fit: cover;
            display: block;
        }
        .data-table th { 
            font-weight: bold; 
            color: #a0a0a0; 
        }
        .data-table th.text-center, .data-table td.text-center { 
            text-align: center; 
        }
        .table-actions { 
            display: flex; 
            gap: 0.5rem;
            align-items: center; /* PERBAIKAN: Menengahkan tombol secara vertikal */
        }
        .button-approve { 
            background-color: #22c55e; 
            color: white; 
        }
        .button-reject { 
            background-color: #ef4444; 
            color: white; 
        }
        .fields-list { 
            list-style: none; 
            padding: 0; 
            margin: 0; 
            display: flex; 
            flex-direction: column; 
            gap: 0.25rem; 
        }
        .fields-list li { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            font-size: 0.8rem; 
        }
        .field-type { 
            background-color: rgba(255, 255, 255, 0.1); 
            color: var(--primary-color); 
            padding: 0.1rem 0.4rem; 
            border-radius: 0.25rem; 
            font-size: 0.7rem; 
            font-weight: 500; 
        }
        .modal-overlay { 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: rgba(0,0,0,0.7); 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            z-index: 50; 
        }
        .modal-content { 
            width: 100%; 
            max-width: 600px; 
            padding: 2rem; 
            max-height: 90vh; 
            overflow-y: auto; 
        }
        .modal-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 1.5rem; 
        }
        .modal-header h2 { 
            font-size: 1.5rem; 
            font-weight: bold; 
        }
        .form-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 1rem; 
        }
        .form-group { 
            display: flex; 
            flex-direction: column; 
        }
        .form-group label { 
            margin-bottom: 0.5rem; 
            font-size: 0.9rem; 
            color: #a0a0a0; 
        }
        .form-select { 
            width: 100%; 
            background: rgba(0,0,0,0.2); 
            border: 1px solid rgba(255,255,255,0.2); 
            border-radius: 0.5rem; 
            padding: 0.75rem 1rem; 
            color: white; 
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23a0a0a0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 1em;
        }
        .dynamic-field { 
            display: flex; 
            gap: 1rem; 
            align-items: center; 
            margin-bottom: 0.5rem; 
        }
        .modal-actions { 
            display: flex; 
            justify-content: flex-end; 
            gap: 1rem; 
            margin-top: 2rem; 
        }
    `}</style>
);

export default GlobalStyles;
