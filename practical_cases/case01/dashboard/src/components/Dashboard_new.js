// src/components/Dashboard.js - Diseño UI/UX Profesional Minimalista
import React, { useState, useEffect } from 'react';
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
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="heading-2 mb-2">Dashboard</h1>
            <p className="text-body" style={{ color: 'var(--color-text-500)' }}>
              Sistema de predicción de ventas en tiempo real
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-small font-medium" style={{ color: 'var(--color-text-500)' }}>
                Período:
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  borderColor: 'var(--color-surface-200)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-700)'
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
              className="btn btn-primary"
            >
              <svg 
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <StatsGrid 
            modelData={modelData} 
            timeRange={timeRange} 
            refreshKey={refreshKey} 
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <h3 className="heading-3 mb-4">Rendimiento del Modelo</h3>
              <ModelPerformanceChart modelData={modelData} />
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <h3 className="heading-3 mb-4">Predicciones en Tiempo Real</h3>
              <PredictionsChart 
                modelData={modelData} 
                timeRange={timeRange} 
                refreshKey={refreshKey}
              />
            </div>
          </div>
        </div>

        {/* Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-body">
                <h3 className="heading-3 mb-4">Importancia de Características</h3>
                <FeatureImportanceChart modelData={modelData} />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <h3 className="heading-3 mb-4">Actividad Reciente</h3>
              <RecentActivity refreshKey={refreshKey} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;