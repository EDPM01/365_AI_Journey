// src/components/dashboard/StatsGrid.js - Diseño UI/UX Profesional Minimalista
import React from 'react';

const StatsGrid = ({ modelData, timeRange, refreshKey }) => {
  
  // Generar datos dinámicos basados en timeRange y refreshKey
  const generateStats = () => {
    const baseStats = {
      accuracy: modelData.model_info.r2,
      predictions: modelData.predictions_today,
      total: modelData.total_predictions,
      rmse: modelData.model_info.rmse
    };

    // Simular variaciones basadas en timeRange
    const multipliers = {
      '1d': 1,
      '7d': 7.2,
      '30d': 28.5,
      '90d': 89.1
    };

    const multiplier = multipliers[timeRange] || 1;
    
    return {
      ...baseStats,
      predictions: Math.round(baseStats.predictions * multiplier),
      accuracy: Math.min(0.99, baseStats.accuracy + (Math.random() * 0.05 - 0.025)),
      improvement: ((Math.random() - 0.5) * 0.1).toFixed(3)
    };
  };

  const stats = generateStats();

  const statCards = [
    {
      title: 'Precisión del Modelo',
      value: `${(stats.accuracy * 100).toFixed(1)}%`,
      change: `+${(parseFloat(stats.improvement) * 100).toFixed(1)}%`,
      changeType: parseFloat(stats.improvement) >= 0 ? 'positive' : 'negative',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'R² Score actual',
      progress: stats.accuracy * 100
    },
    {
      title: 'Predicciones',
      value: stats.predictions.toLocaleString(),
      change: `+${Math.round(stats.predictions * 0.12)}`,
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      description: getTimeRangeLabel(timeRange)
    },
    {
      title: 'RMSE Actual',
      value: stats.rmse.toFixed(3),
      change: '-0.05',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Error cuadrático medio'
    },
    {
      title: 'Total Histórico',
      value: (stats.total + stats.predictions).toLocaleString(),
      change: `+${stats.predictions.toLocaleString()}`,
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Predicciones acumuladas'
    }
  ];

  function getTimeRangeLabel(range) {
    const labels = {
      '1d': 'Últimas 24 horas',
      '7d': 'Últimos 7 días',
      '30d': 'Últimos 30 días',
      '90d': 'Últimos 90 días'
    };
    return labels[range] || 'Período actual';
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className={`stat-card animate-fade-in`} 
             style={{ animationDelay: `${index * 100}ms` }}>
          
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl" 
                 style={{ backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary)' }}>
              {stat.icon}
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
              stat.changeType === 'positive' 
                ? 'bg-green-50 text-green-600' 
                : 'bg-red-50 text-red-600'
            }`}>
              {stat.change}
            </div>
          </div>

          {/* Title */}
          <div className="mb-2">
            <h3 className="stat-title">{stat.title}</h3>
          </div>

          {/* Value */}
          <div className="mb-3">
            <p className="stat-value">{stat.value}</p>
          </div>

          {/* Description */}
          <p className="stat-desc">{stat.description}</p>

          {/* Progress bar for accuracy */}
          {stat.progress && (
            <div className="mt-4">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${stat.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;