// src/components/dashboard/ModelPerformanceChart.js
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ModelPerformanceChart = ({ modelData, timeRange, refreshKey }) => {
  
  // Generar datos históricos de rendimiento
  const generatePerformanceData = () => {
    const periods = {
      '1d': 24,  // 24 horas
      '7d': 7,   // 7 días  
      '30d': 30, // 30 días
      '90d': 90  // 90 días
    };

    const dataPoints = periods[timeRange] || 7;
    const baseRMSE = modelData.model_info.rmse;
    const baseR2 = modelData.model_info.r2;
    
    return Array.from({ length: dataPoints }, (_, i) => {
      const dayOffset = dataPoints - i - 1;
      
      // Simular tendencia de mejora gradual
      // const improvement = (dataPoints - dayOffset) / dataPoints * 0.15;
      
      // Agregar algo de ruido realista
      const noise = (Math.random() - 0.5) * 0.1;
      
      const rmse = Math.max(0.1, baseRMSE + (dayOffset * 0.02) + noise);
      const r2 = Math.min(0.95, Math.max(0.1, baseR2 - (dayOffset * 0.005) + (noise * 0.1)));
      const accuracy = r2 * 100;
      
      // Generar fecha/hora según el período
      let label;
      if (timeRange === '1d') {
        const hour = 24 - dayOffset;
        label = `${hour}:00`;
      } else {
        const date = new Date();
        date.setDate(date.getDate() - dayOffset);
        label = date.toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric' 
        });
      }

      return {
        period: label,
        rmse: parseFloat(rmse.toFixed(3)),
        r2: parseFloat(r2.toFixed(3)),
        accuracy: parseFloat(accuracy.toFixed(1)),
        predictions: Math.round(250 + (Math.random() * 100))
      };
    });
  };

  const performanceData = generatePerformanceData();

  // Configuración del tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{`Período: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey === 'accuracy' ? 'Precisión' : 
                entry.dataKey === 'rmse' ? 'RMSE' :
                entry.dataKey === 'r2' ? 'R² Score' : 
                'Predicciones'}: ${entry.value}${entry.dataKey === 'accuracy' ? '%' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="card-body">
        
        {/* Header del gráfico */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              📈 Rendimiento del Modelo
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Evolución de métricas en {timeRange === '1d' ? 'las últimas 24 horas' :
                                      timeRange === '7d' ? 'los últimos 7 días' :
                                      timeRange === '30d' ? 'los últimos 30 días' :
                                      'los últimos 90 días'}
            </p>
          </div>
          
          {/* Métricas actuales */}
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {(modelData.model_info.r2 * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Precisión Actual</div>
          </div>
        </div>

        {/* Gráfico */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              
              <YAxis 
                yAxisId="accuracy"
                orientation="left"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
                label={{ 
                  value: 'Precisión (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              
              <YAxis 
                yAxisId="rmse"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
                label={{ 
                  value: 'RMSE', 
                  angle: 90, 
                  position: 'insideRight',
                  style: { textAnchor: 'middle' }
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Legend />
              
              {/* Línea de precisión */}
              <Line
                yAxisId="accuracy"
                type="monotone"
                dataKey="accuracy"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                name="Precisión (%)"
              />
              
              {/* Línea de RMSE */}
              <Line
                yAxisId="rmse"
                type="monotone"
                dataKey="rmse"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2 }}
                name="RMSE"
                strokeDasharray="5 5"
              />
              
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Estadísticas de resumen */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            
            <div>
              <div className="text-lg font-semibold text-green-600">
                {Math.max(...performanceData.map(d => d.accuracy)).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Máximo</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {(performanceData.reduce((acc, d) => acc + d.accuracy, 0) / performanceData.length).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Promedio</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-orange-600">
                {Math.min(...performanceData.map(d => d.rmse)).toFixed(3)}
              </div>
              <div className="text-xs text-gray-500">Mejor RMSE</div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default ModelPerformanceChart;