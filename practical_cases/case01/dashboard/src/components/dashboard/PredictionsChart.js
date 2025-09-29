// src/components/dashboard/PredictionsChart.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const PredictionsChart = ({ modelData, timeRange, refreshKey }) => {

  // Generar datos de predicciones por categoría
  const generatePredictionsData = () => {
    const categories = [
      { name: 'Electrónicos', color: '#3b82f6', trend: 'up' },
      { name: 'Ropa', color: '#ef4444', trend: 'down' },
      { name: 'Hogar', color: '#10b981', trend: 'up' },
      { name: 'Deportes', color: '#f59e0b', trend: 'stable' },
      { name: 'Libros', color: '#8b5cf6', trend: 'up' },
      { name: 'Belleza', color: '#ec4899', trend: 'down' },
      { name: 'Alimentación', color: '#06b6d4', trend: 'up' },
      { name: 'Juguetes', color: '#84cc16', trend: 'stable' }
    ];

    const multipliers = {
      '1d': 1,
      '7d': 7,
      '30d': 28,
      '90d': 85
    };

    const multiplier = multipliers[timeRange] || 1;

    return categories.map((category, index) => {
      // Base de predicciones con variación por categoría
      const basePredictions = 150 + (index * 50) + (Math.random() * 100);
      
      // Aplicar multiplicador por período
      const predictions = Math.round(basePredictions * multiplier);
      
      // Generar demanda real con algo de variación
      const variance = 0.8 + (Math.random() * 0.4); // 80% - 120% de la predicción
      const realDemand = Math.round(predictions * variance);
      
      // Calcular precisión
      const accuracy = Math.max(0, 100 - Math.abs(predictions - realDemand) / predictions * 100);

      return {
        category: category.name,
        predicted: predictions,
        real: realDemand,
        accuracy: parseFloat(accuracy.toFixed(1)),
        color: category.color,
        trend: category.trend,
        difference: realDemand - predictions
      };
    });
  };

  const predictionsData = generatePredictionsData();

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-blue-600">🔮 Predicción:</span> {data.predicted.toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="text-green-600">📊 Real:</span> {data.real.toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="text-purple-600">🎯 Precisión:</span> {data.accuracy}%
            </p>
            <p className="text-sm">
              <span className={data.difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                📈 Diferencia:
              </span> {data.difference >= 0 ? '+' : ''}{data.difference.toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Función para obtener el color de la barra basado en la precisión
  const getBarColor = (accuracy) => {
    if (accuracy >= 90) return '#10b981'; // Verde
    if (accuracy >= 80) return '#f59e0b'; // Amarillo
    if (accuracy >= 70) return '#ef4444'; // Rojo
    return '#6b7280'; // Gris
  };

  return (
    <div className="card">
      <div className="card-body">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              🔮 Predicciones vs Realidad
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Comparación por categorías - {timeRange === '1d' ? 'Hoy' :
                                          timeRange === '7d' ? 'Últimos 7 días' :
                                          timeRange === '30d' ? 'Últimos 30 días' :
                                          'Últimos 90 días'}
            </p>
          </div>

          {/* Precisión promedio */}
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {(predictionsData.reduce((acc, item) => acc + item.accuracy, 0) / predictionsData.length).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Precisión Promedio</div>
          </div>
        </div>

        {/* Gráfico */}
        <div className="h-80 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={predictionsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'Cantidad', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Barras de predicción */}
              <Bar 
                dataKey="predicted" 
                name="Predicción"
                fill="#3b82f6"
                opacity={0.8}
                radius={[2, 2, 0, 0]}
              />
              
              {/* Barras de demanda real */}
              <Bar 
                dataKey="real" 
                name="Demanda Real"
                radius={[2, 2, 0, 0]}
              >
                {predictionsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.accuracy)} />
                ))}
              </Bar>
              
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla resumen */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-700">Categoría</th>
                <th className="text-center py-2 px-3 font-medium text-gray-700">Predicción</th>
                <th className="text-center py-2 px-3 font-medium text-gray-700">Real</th>
                <th className="text-center py-2 px-3 font-medium text-gray-700">Precisión</th>
                <th className="text-center py-2 px-3 font-medium text-gray-700">Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {predictionsData.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  
                  <td className="py-2 px-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-medium">{item.category}</span>
                    </div>
                  </td>
                  
                  <td className="text-center py-2 px-3 text-blue-600 font-medium">
                    {item.predicted.toLocaleString()}
                  </td>
                  
                  <td className="text-center py-2 px-3 font-medium">
                    {item.real.toLocaleString()}
                  </td>
                  
                  <td className="text-center py-2 px-3">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${item.accuracy >= 90 ? 'bg-green-100 text-green-800' :
                        item.accuracy >= 80 ? 'bg-yellow-100 text-yellow-800' :
                        item.accuracy >= 70 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'}
                    `}>
                      {item.accuracy}%
                    </span>
                  </td>
                  
                  <td className="text-center py-2 px-3">
                    <span className={`
                      text-xs
                      ${item.trend === 'up' ? 'text-green-600' :
                        item.trend === 'down' ? 'text-red-600' :
                        'text-gray-600'}
                    `}>
                      {item.trend === 'up' ? '📈' : 
                       item.trend === 'down' ? '📉' : '➡️'}
                    </span>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default PredictionsChart;