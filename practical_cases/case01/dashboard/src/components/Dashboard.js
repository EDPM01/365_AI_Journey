// src/components/Dashboard.js - Dashboard Funcional Principal
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatsGrid from './dashboard/StatsGrid';
import ModelPerformanceChart from './dashboard/ModelPerformanceChart';
import PredictionsChart from './dashboard/PredictionsChart';
import FeatureImportanceChart from './dashboard/FeatureImportanceChart';
import RecentActivity from './dashboard/RecentActivity';

const Dashboard = ({ modelData }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Función para refrescar datos
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    
    // Simular tiempo de carga
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!modelData) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="space-y-6">
          <div className="loading-skeleton h-8" style={{ width: '200px' }}></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="loading-skeleton h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="loading-skeleton h-96"></div>
            <div className="loading-skeleton h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  const timeRangeOptions = [
    { value: '1d', label: '24h' },
    { value: '7d', label: '7 días' },
    { value: '30d', label: '30 días' },
    { value: '90d', label: '90 días' }
  ];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Navbar Simple */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <Link 
            to="/" 
            style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#0f172a',
              textDecoration: 'none'
            }}
          >
            ← MegaMercado AI
          </Link>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/predictions" style={{ textDecoration: 'none', color: '#64748b', fontSize: '0.875rem' }}>
              Predicciones
            </Link>
            <Link to="/model-analysis" style={{ textDecoration: 'none', color: '#64748b', fontSize: '0.875rem' }}>
              Análisis
            </Link>
            <Link to="/data" style={{ textDecoration: 'none', color: '#64748b', fontSize: '0.875rem' }}>
              Datos
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
              Dashboard Principal
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>
              Sistema de predicción de ventas en tiempo real
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Time Range Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>
                Período:
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  fontSize: '0.875rem',
                  color: '#374151'
                }}
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: isRefreshing ? '#94a3b8' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ marginBottom: '2rem' }}>
          <StatsGrid 
            modelData={modelData} 
            timeRange={timeRange} 
            refreshKey={refreshKey} 
          />
        </div>

        {/* Charts Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>
              Rendimiento del Modelo
            </h3>
            <ModelPerformanceChart modelData={modelData} />
          </div>
          
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>
              Predicciones en Tiempo Real
            </h3>
            <PredictionsChart 
              modelData={modelData} 
              timeRange={timeRange} 
              refreshKey={refreshKey}
            />
          </div>
        </div>

        {/* Secondary Charts */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>
              Importancia de Características
            </h3>
            <FeatureImportanceChart modelData={modelData} />
          </div>
          
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>
              Actividad Reciente
            </h3>
            <RecentActivity refreshKey={refreshKey} />
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '2rem'
        }}>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '1.5rem',
            color: '#0f172a'
          }}>
            Acciones Rápidas
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1rem'
          }}>
            <Link
              to="/predictions"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#0f172a',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: '500' }}>Nueva Predicción</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Generar predicción de ventas
                </div>
              </div>
            </Link>

            <Link
              to="/model-analysis"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#0f172a',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: '500' }}>Análisis del Modelo</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Métricas detalladas
                </div>
              </div>
            </Link>

            <Link
              to="/data"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#0f172a',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: '500' }}>Explorar Datos</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Visualizar dataset
                </div>
              </div>
            </Link>

            <Link
              to="/settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#0f172a',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: '500' }}>Configuración</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Ajustes del sistema
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;