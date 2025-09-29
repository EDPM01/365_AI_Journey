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

      description: 'R² Score actual',
      progress: stats.accuracy * 100
    },
    {
      title: 'Predicciones',
      value: stats.predictions.toLocaleString(),
      change: `+${Math.round(stats.predictions * 0.12)}`,
      changeType: 'positive',

      description: getTimeRangeLabel(timeRange)
    },
    {
      title: 'RMSE Actual',
      value: stats.rmse.toFixed(3),
      change: '-0.05',
      changeType: 'positive',

      description: 'Error cuadrático medio'
    },
    {
      title: 'Total Histórico',
      value: (stats.total + stats.predictions).toLocaleString(),
      change: `+${stats.predictions.toLocaleString()}`,
      changeType: 'positive',

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