// src/components/dashboard/StatsGrid.js
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
      icon: '🎯',
      description: 'R² Score actual'
    },
    {
      title: 'Predicciones',
      value: stats.predictions.toLocaleString(),
      change: `+${Math.round(stats.predictions * 0.12)}`,
      changeType: 'positive',
      icon: '🔮',
      description: getTimeRangeLabel(timeRange)
    },
    {
      title: 'RMSE Actual',
      value: stats.rmse.toFixed(3),
      change: '-0.05',
      changeType: 'positive',
      icon: '📊',
      description: 'Error cuadrático medio'
    },
    {
      title: 'Total Histórico',
      value: (stats.total + stats.predictions).toLocaleString(),
      change: `+${stats.predictions.toLocaleString()}`,
      changeType: 'positive',
      icon: '📈',
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {statCards.map((stat, index) => {
        // Colores específicos para cada tarjeta
        const cardThemes = [
          { bg: 'from-emerald-400/20 to-teal-500/20', border: 'border-emerald-400/30', glow: 'shadow-emerald-400/20' },
          { bg: 'from-blue-400/20 to-purple-500/20', border: 'border-blue-400/30', glow: 'shadow-blue-400/20' },
          { bg: 'from-amber-400/20 to-orange-500/20', border: 'border-amber-400/30', glow: 'shadow-amber-400/20' },
          { bg: 'from-pink-400/20 to-rose-500/20', border: 'border-pink-400/30', glow: 'shadow-pink-400/20' }
        ];
        
        const theme = cardThemes[index] || cardThemes[0];
        
        return (
          <div key={index} className={`
              relative overflow-hidden group cursor-pointer
              bg-gradient-to-br ${theme.bg}
              backdrop-blur-2xl rounded-3xl 
              border ${theme.border}
              shadow-2xl hover:shadow-3xl ${theme.glow}
              transform transition-all duration-500 hover:scale-105 hover:-translate-y-2
              animate-fade-in
            `}
            style={{ animationDelay: `${index * 150}ms` }}>
            
            {/* Fondo animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Partículas flotantes */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>
              <div className="absolute bottom-4 left-4 w-20 h-20 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-lg group-hover:scale-110 transition-transform duration-500"></div>
            </div>
            
            <div className="relative z-10 p-8">
              
              {/* Header ultra premium */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/40 shadow-2xl group-hover:scale-110 transition-all duration-500">
                      <span className="text-3xl filter drop-shadow-lg">{stat.icon}</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                </div>
                
                {/* Badge premium de cambio */}
                <div className={`
                  relative flex items-center px-4 py-2 rounded-2xl text-xs font-black shadow-xl backdrop-blur-xl border
                  ${stat.changeType === 'positive' 
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-600 border-emerald-400/30' 
                    : 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-600 border-red-400/30'
                  }
                  transform group-hover:scale-110 transition-all duration-300
                `}>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {stat.changeType === 'positive' ? '�' : '📉'}
                    </span>
                    <span className="font-bold">{stat.change}</span>
                  </div>
                </div>
              </div>

              {/* Título elegante */}
              <div className="mb-6">
                <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3 opacity-80">
                  {stat.title}
                </h4>
              </div>

              {/* Valor principal con efecto espectacular */}
              <div className="mb-6">
                <div className="relative">
                  <div className="text-5xl font-black mb-3 bg-gradient-to-br from-gray-900 via-gray-700 to-gray-800 bg-clip-text text-transparent filter drop-shadow-sm group-hover:scale-105 transition-transform duration-500">
                    {stat.value}
                  </div>
                  {/* Resplandor sutil */}
                  <div className="absolute inset-0 text-5xl font-black mb-3 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 bg-clip-text text-transparent blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {stat.value}
                  </div>
                </div>
              </div>

              {/* Descripción elegante */}
              <p className="text-gray-600 font-semibold text-sm mb-6 leading-relaxed">
                {stat.description}
              </p>

              {/* Barra de progreso ultra premium */}
              {stat.title.includes('Precisión') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                    <span className="flex items-center space-x-2">
                      <span>🎯</span>
                      <span>Rendimiento</span>
                    </span>
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {(stats.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl h-4 overflow-hidden shadow-inner border border-gray-200/50">
                      <div 
                        className="h-full rounded-2xl transition-all duration-1500 ease-out relative overflow-hidden"
                        style={{ 
                          width: `${stats.accuracy * 100}%`,
                          background: 'linear-gradient(90deg, #10b981, #06b6d4, #3b82f6)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 2s ease infinite',
                          boxShadow: '0 0 20px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/30 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="absolute -top-1 right-0 w-3 h-3 bg-emerald-400 rounded-full shadow-lg animate-bounce" style={{ right: `${100 - stats.accuracy * 100}%` }}></div>
                  </div>
                </div>
              )}

              {/* Gráfico sparkline premium */}
              {index === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                    <span className="flex items-center space-x-2">
                      <span>📈</span>
                      <span>Tendencia 24h</span>
                    </span>
                    <span className="text-blue-600">+12.5%</span>
                  </div>
                  <div className="relative">
                    <div className="flex items-end space-x-1 h-12 bg-gradient-to-t from-blue-50/50 to-transparent rounded-2xl p-2">
                      {Array.from({length: 24}, (_, i) => {
                        const height = 20 + Math.sin(i * 0.5) * 15 + Math.random() * 20;
                        return (
                          <div 
                            key={i} 
                            className="flex-1 bg-gradient-to-t from-blue-400 to-blue-500 rounded-full shadow-sm hover:from-blue-500 hover:to-blue-600 transition-all duration-300 cursor-pointer group-hover:scale-y-110"
                            style={{ 
                              height: `${height}%`,
                              animationDelay: `${i * 50}ms`
                            }}
                          ></div>
                        );
                      })}
                    </div>
                    <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-blue-400/20 via-purple-400/10 to-pink-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              )}

              {/* Métricas adicionales para RMSE */}
              {index === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                    <span className="flex items-center space-x-2">
                      <span>⚡</span>
                      <span>Optimización</span>
                    </span>
                    <span className="text-amber-600">-8.2%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-200/50">
                      <div className="text-xs font-bold text-amber-700">MAE</div>
                      <div className="text-sm font-black text-amber-800">0.142</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200/50">
                      <div className="text-xs font-bold text-emerald-700">R²</div>
                      <div className="text-sm font-black text-emerald-800">0.94</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200/50">
                      <div className="text-xs font-bold text-blue-700">CV</div>
                      <div className="text-sm font-black text-blue-800">0.08</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Información histórica para total */}
              {index === 3 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                    <span className="flex items-center space-x-2">
                      <span>🏆</span>
                      <span>Hitos Alcanzados</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200/50">
                      <span className="text-xs font-semibold text-pink-700">1M Predicciones</span>
                      <span className="text-xs text-pink-600">✅</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200/50">
                      <span className="text-xs font-semibold text-purple-700">99% Uptime</span>
                      <span className="text-xs text-purple-600">✅</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsGrid;