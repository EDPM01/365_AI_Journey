// src/components/Dashboard.js
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
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-4">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        
        {/* Header Premium */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl text-white">📊</span>
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                    Dashboard Principal
                  </h1>
                  <p className="text-gray-600 text-lg font-medium">
                    Monitoreo inteligente en tiempo real • MegaMercado AI
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-400">🏠</span>
                <span className="text-gray-600 font-medium">Inicio</span>
                <span className="text-gray-400">•</span>
                <span className="text-blue-600 font-semibold">Dashboard</span>
              </div>
            </div>

            {/* Controles Premium */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="form-select appearance-none bg-white/80 backdrop-blur-sm border border-white/30 text-gray-700 font-semibold pr-10 focus:ring-blue-500/30 shadow-lg"
                >
                  <option value="1d">📅 Últimas 24h</option>
                  <option value="7d">📊 Últimos 7 días</option>
                  <option value="30d">📈 Últimos 30 días</option>
                  <option value="90d">📋 Últimos 90 días</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn btn-primary group hover-lift shadow-2xl"
              >
                <div className="flex items-center space-x-2">
                  <span className={`text-lg transition-transform duration-500 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`}>
                    🔄
                  </span>
                  <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
                </div>
              </button>

              <div className="text-xs text-gray-500 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/30">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Actualizado hace {Math.floor(Math.random() * 5) + 1} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Stats Grid - KPIs principales */}
      <div className="mb-8">
        <StatsGrid 
          modelData={modelData} 
          timeRange={timeRange}
          refreshKey={refreshKey}
        />
      </div>

      {/* Charts Grid - Gráficas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Performance del Modelo */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📈 Performance del Modelo
            </h3>
            <ModelPerformanceChart 
              modelData={modelData}
              timeRange={timeRange}
              refreshKey={refreshKey}
            />
          </div>
        </div>

        {/* Predicciones en el tiempo */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔮 Predicciones Diarias
            </h3>
            <PredictionsChart 
              timeRange={timeRange}
              refreshKey={refreshKey}
            />
          </div>
        </div>

      </div>

      {/* Segunda fila de gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Feature Importance */}
        <div className="lg:col-span-2 card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎯 Importancia de Características
            </h3>
            <FeatureImportanceChart 
              data={modelData.feature_importance}
            />
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Actividad Reciente
            </h3>
            <RecentActivity refreshKey={refreshKey} />
          </div>
        </div>

      </div>

      {/* Status del Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Estado del Modelo */}
        <div className="card">
          <div className="card-body text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h4 className="font-semibold text-gray-900">Modelo Activo</h4>
            <p className="text-sm text-gray-600 mt-1">
              {modelData.model_info.name} v{modelData.model_info.version}
            </p>
            <p className="text-xs text-green-600 mt-2">
              Funcionando correctamente
            </p>
          </div>
        </div>

        {/* Calidad de Datos */}
        <div className="card">
          <div className="card-body text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h4 className="font-semibold text-gray-900">Calidad de Datos</h4>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {(modelData.data_quality * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Excelente calidad
            </p>
          </div>
        </div>

        {/* Próximo Entrenamiento */}
        <div className="card">
          <div className="card-body text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏰</span>
            </div>
            <h4 className="font-semibold text-gray-900">Próximo Retrain</h4>
            <p className="text-sm text-gray-600 mt-1">
              Programado para
            </p>
            <p className="text-sm font-medium text-yellow-600 mt-1">
              05 Oct 2025
            </p>
          </div>
        </div>

      </div>

      </div>
    </div>
  );
};

export default Dashboard;