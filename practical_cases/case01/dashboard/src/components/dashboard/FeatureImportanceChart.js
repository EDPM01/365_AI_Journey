// src/components/dashboard/FeatureImportanceChart.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const FeatureImportanceChart = ({ modelData, timeRange = '7d', refreshKey = 1 }) => {

  // Generar datos de importancia de características
  const generateFeatureImportance = () => {
    const features = [
      { name: 'Precio', baseImportance: 0.35, category: 'Producto' },
      { name: 'Historial Ventas', baseImportance: 0.28, category: 'Histórico' },
      { name: 'Temporada', baseImportance: 0.15, category: 'Temporal' },
      { name: 'Promociones', baseImportance: 0.12, category: 'Marketing' },
      { name: 'Inventario', baseImportance: 0.08, category: 'Logística' },
      { name: 'Competencia', baseImportance: 0.07, category: 'Mercado' },
      { name: 'Día Semana', baseImportance: 0.06, category: 'Temporal' },
      { name: 'Reviews', baseImportance: 0.05, category: 'Producto' },
      { name: 'Ubicación', baseImportance: 0.04, category: 'Geográfico' },
      { name: 'Categoría', baseImportance: 0.03, category: 'Producto' }
    ];

    // Colores por categoría
    const categoryColors = {
      'Producto': '#3b82f6',    // Azul
      'Histórico': '#ef4444',   // Rojo
      'Temporal': '#10b981',    // Verde
      'Marketing': '#f59e0b',   // Amarillo
      'Logística': '#8b5cf6',   // Púrpura
      'Mercado': '#ec4899',     // Rosa
      'Geográfico': '#06b6d4'   // Cian
    };

    return features.map(feature => {
      // Agregar algo de variación basada en refreshKey y timeRange
      const safeRefreshKey = isNaN(refreshKey) ? 1 : refreshKey;
      const variation = (Math.sin(safeRefreshKey + feature.baseImportance * 10) * 0.1 + 1);
      const timeMultiplier = timeRange === '1d' ? 1 : 
                           timeRange === '7d' ? 1.05 :
                           timeRange === '30d' ? 1.1 : 1.15;
      
      let importance = feature.baseImportance * variation * timeMultiplier;
      
      // Normalizar para que sume aproximadamente 1 y evitar NaN
      importance = Math.max(0.01, Math.min(0.5, importance));
      if (isNaN(importance)) {
        importance = feature.baseImportance;
      }
      
      return {
        name: feature.name,
        importance: parseFloat((importance * 100).toFixed(2)) || 0,
        category: feature.category,
        color: categoryColors[feature.category] || '#6b7280',
        description: getFeatureDescription(feature.name)
      };
    }).sort((a, b) => b.importance - a.importance);
  };

  // Descripciones de las características
  const getFeatureDescription = (featureName) => {
    const descriptions = {
      'Precio': 'Impacto del precio del producto en la demanda',
      'Historial Ventas': 'Patrones de ventas anteriores del producto',
      'Temporada': 'Efectos estacionales en la demanda',
      'Promociones': 'Influencia de ofertas y descuentos',
      'Inventario': 'Niveles actuales de stock disponible',
      'Competencia': 'Precios y acciones de la competencia',
      'Día Semana': 'Variaciones por día de la semana',
      'Reviews': 'Calificaciones y comentarios de clientes',
      'Ubicación': 'Factores geográficos y regionales',
      'Categoría': 'Tipo de producto y clasificación'
    };
    return descriptions[featureName] || 'Característica del modelo';
  };

  const featureData = generateFeatureImportance();

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          <p className="text-sm text-gray-600 mb-2">{data.description}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-blue-600">📊 Importancia:</span> {data.importance}%
            </p>
            <p className="text-sm">
              <span className="text-purple-600">🏷️ Categoría:</span> {data.category}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Agrupar por categorías para la leyenda
  const categorySummary = featureData.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = {
        totalImportance: 0,
        count: 0,
        color: feature.color
      };
    }
    // Asegurarse de que importance sea un número válido
    const importance = isNaN(feature.importance) ? 0 : feature.importance;
    acc[feature.category].totalImportance += importance;
    acc[feature.category].count += 1;
    return acc;
  }, {});

  return (
    <div className="card">
      <div className="card-body">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              🧠 Importancia de Características
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Factores más influyentes en las predicciones del modelo
            </p>
          </div>

          {/* Característica más importante */}
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {featureData[0]?.importance.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">{featureData[0]?.name}</div>
          </div>
        </div>

        {/* Gráfico */}
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={featureData} 
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              
              <XAxis 
                type="number"
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'Importancia (%)', 
                  position: 'insideBottom',
                  offset: -5
                }}
              />
              
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={90}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                {featureData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resumen por categorías */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Importancia por Categoría
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(categorySummary)
              .sort(([,a], [,b]) => b.totalImportance - a.totalImportance)
              .map(([category, data]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: data.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">
                      {category}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {(data.totalImportance || 0).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {data.count} {data.count === 1 ? 'característica' : 'características'}
                    </div>
                  </div>
                  
                </div>
              ))}
          </div>
        </div>

        {/* Insights adicionales */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">
            💡 Insights del Modelo
          </h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Las características de <strong>Producto</strong> tienen el mayor impacto acumulado</li>
            <li>• El <strong>{featureData[0]?.name}</strong> es el factor más determinante ({featureData[0]?.importance.toFixed(1)}%)</li>
            <li>• Los factores <strong>Temporales</strong> contribuyen significativamente a las predicciones</li>
            <li>• El modelo utiliza {featureData.length} características principales para sus predicciones</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default FeatureImportanceChart;