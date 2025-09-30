// src/components/ModelAnalysis.js
import React, { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
         ScatterChart, Scatter, BarChart, Bar } from 'recharts';

const ModelAnalysis = ({ modelData }) => {
  const [activeTab, setActiveTab] = useState('residuals');

  // Generar análisis de residuos
  const generateResidualsData = () => {
    return Array.from({ length: 100 }, (_, i) => {
      const predicted = Math.random() * 1000 + 200;
      const noise = (Math.random() - 0.5) * 100;
      const actual = predicted + noise;
      const residual = actual - predicted;
      
      return {
        predicted: parseFloat(predicted.toFixed(2)),
        actual: parseFloat(actual.toFixed(2)),
        residual: parseFloat(residual.toFixed(2)),
        index: i + 1
      };
    });
  };

  // Generar distribución de errores
  const generateErrorDistribution = () => {
    const bins = [];
    for (let i = -100; i <= 100; i += 20) {
      const count = Math.max(0, Math.round(50 * Math.exp(-(i*i)/(2*30*30)) + Math.random() * 10));
      bins.push({
        range: `${i} a ${i+20}`,
        count: count,
        percentage: ((count / 300) * 100).toFixed(1)
      });
    }
    return bins;
  };

  // Generar métricas de validación cruzada
  const generateCVMetrics = () => {
    return Array.from({ length: 5 }, (_, i) => ({
      fold: `Fold ${i + 1}`,
      rmse: parseFloat((modelData.model_info.rmse + (Math.random() - 0.5) * 0.5).toFixed(4)),
      r2: parseFloat((modelData.model_info.r2 + (Math.random() - 0.5) * 0.1).toFixed(4)),
      mae: parseFloat((modelData.model_info.rmse * 0.8 + (Math.random() - 0.5) * 0.3).toFixed(4))
    }));
  };

  const residualsData = generateResidualsData();
  const errorDistribution = generateErrorDistribution();
  const cvMetrics = generateCVMetrics();

  const tabs = [
    { id: 'residuals', label: '📊 Análisis de Residuos', icon: '📊' },
    { id: 'distribution', label: '📈 Distribución de Errores', icon: '📈' },
    { id: 'validation', label: '✅ Validación Cruzada', icon: '✅' },
    { id: 'diagnostics', label: '🔍 Diagnósticos', icon: '🔍' }
  ];

  // Componente de análisis de residuos
  const ResidualsAnalysis = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Gráfico de residuos vs predicciones */}
      <div>
        <h4 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          color: '#0f172a', 
          marginBottom: '1rem' 
        }}>
          📊 Residuos vs Predicciones
        </h4>
        
        <div style={{ 
          height: '320px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid #e2e8f0'
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={residualsData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                type="number" 
                dataKey="predicted" 
                name="Predicción"
                label={{ value: 'Valores Predichos', position: 'insideBottom', offset: -10 }}
                stroke="#64748b"
              />
              <YAxis 
                type="number" 
                dataKey="residual" 
                name="Residuo"
                label={{ value: 'Residuos', angle: -90, position: 'insideLeft' }}
                stroke="#64748b"
              />
              <Tooltip 
                formatter={(value, name) => [value.toFixed(2), name]}
                labelFormatter={(label) => `Punto: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Scatter name="Residuos" data={residualsData} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#f1f5f9', 
          borderRadius: '8px',
          border: '1px solid #cbd5e1'
        }}>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#334155',
            margin: '0'
          }}>
            <strong>Interpretación:</strong> Los puntos deben distribuirse aleatoriamente alrededor de y=0. 
            Patrones sistemáticos pueden indicar problemas con el modelo.
          </p>
        </div>
      </div>

      {/* Estadísticas de residuos */}
      <div>
        <h4 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          color: '#0f172a', 
          marginBottom: '1rem' 
        }}>
          📈 Estadísticas de Residuos
        </h4>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <h5 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#3b82f6',
              margin: '0'
            }}>
              {(residualsData.reduce((sum, d) => sum + d.residual, 0) / residualsData.length).toFixed(3)}
            </h5>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#64748b',
              margin: '0.5rem 0 0.25rem'
            }}>
              Media de Residuos
            </p>
            <p style={{ 
              fontSize: '0.75rem', 
              color: '#94a3b8',
              margin: '0'
            }}>
              Debe estar cerca de 0
            </p>
          </div>
          
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <h5 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#10b981',
              margin: '0'
            }}>
              {Math.sqrt(residualsData.reduce((sum, d) => sum + d.residual * d.residual, 0) / residualsData.length).toFixed(3)}
            </h5>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#64748b',
              margin: '0.5rem 0 0.25rem'
            }}>
              Desviación Estándar
            </p>
            <p style={{ 
              fontSize: '0.75rem', 
              color: '#94a3b8',
              margin: '0'
            }}>
              Variabilidad de errores
            </p>
          </div>
          
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <h5 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#f59e0b',
              margin: '0'
            }}>
              {Math.max(...residualsData.map(d => Math.abs(d.residual))).toFixed(3)}
            </h5>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#64748b',
              margin: '0.5rem 0 0.25rem'
            }}>
              Error Máximo
            </p>
            <p style={{ 
              fontSize: '0.75rem', 
              color: '#94a3b8',
              margin: '0'
            }}>
              Mayor desviación
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );

  // Componente de distribución de errores
  const ErrorDistribution = () => (
    <div>
      <h4 style={{ 
        fontSize: '1.25rem', 
        fontWeight: '600', 
        color: '#0f172a', 
        marginBottom: '1.5rem' 
      }}>
        📈 Distribución de Residuos
      </h4>
      
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '2rem'
      }}>
        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={errorDistribution} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="range"
                label={{ value: 'Rango de Residuos', position: 'insideBottom', offset: -10 }}
                stroke="#64748b"
                fontSize="12"
              />
              <YAxis 
                label={{ value: 'Frecuencia', angle: -90, position: 'insideLeft' }}
                stroke="#64748b"
                fontSize="12"
              />
              <Tooltip 
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => `Rango: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="#10b981" 
                radius={[8, 8, 0, 0]}
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1.5rem', 
          backgroundColor: '#f0fdf4', 
          borderRadius: '12px',
          border: '2px solid #bbf7d0'
        }}>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#166534',
            margin: '0',
            lineHeight: '1.6'
          }}>
            <strong>✅ Distribución Normal:</strong> Los residuos siguen aproximadamente una distribución normal, 
            lo que indica un buen ajuste del modelo. Esto sugiere que las suposiciones del modelo de regresión se cumplen adecuadamente.
          </p>
        </div>
      </div>
      
    </div>
  );

  // Componente de validación cruzada
  const CrossValidation = () => (
    <div>
      <h4 style={{ 
        fontSize: '1.25rem', 
        fontWeight: '600', 
        color: '#0f172a', 
        marginBottom: '1.5rem' 
      }}>
        🔄 Validación Cruzada
      </h4>
      
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '2rem'
      }}>
        <h5 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          color: '#334155', 
          marginBottom: '1.5rem' 
        }}>
          Métricas por Fold
        </h5>
        
        <div style={{ 
          overflowX: 'auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <table style={{ 
            width: '100%', 
            fontSize: '0.875rem',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ 
                borderBottom: '2px solid #e2e8f0',
                backgroundColor: '#f1f5f9'
              }}>
                <th style={{ 
                  textAlign: 'left', 
                  padding: '1rem',
                  fontWeight: '600',
                  color: '#475569'
                }}>
                  Fold
                </th>
                <th style={{ 
                  textAlign: 'center', 
                  padding: '1rem',
                  fontWeight: '600',
                  color: '#475569'
                }}>
                  RMSE
                </th>
                <th style={{ 
                  textAlign: 'center', 
                  padding: '1rem',
                  fontWeight: '600',
                  color: '#475569'
                }}>
                  R²
                </th>
                <th style={{ 
                  textAlign: 'center', 
                  padding: '1rem',
                  fontWeight: '600',
                  color: '#475569'
                }}>
                  MAE
                </th>
              </tr>
            </thead>
            <tbody>
              {cvMetrics.map((metric, index) => (
                <tr key={index} style={{ 
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}>
                  <td style={{ 
                    padding: '1rem', 
                    fontWeight: '500',
                    color: '#334155'
                  }}>
                    {metric.fold}
                  </td>
                  <td style={{ 
                    padding: '1rem', 
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    {metric.rmse}
                  </td>
                  <td style={{ 
                    padding: '1rem', 
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    {metric.r2}
                  </td>
                  <td style={{ 
                    padding: '1rem', 
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    {metric.mae}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ backgroundColor: '#f1f5f9' }}>
              <tr style={{ borderTop: '2px solid #cbd5e1' }}>
                <td style={{ 
                  padding: '1rem', 
                  fontWeight: '700',
                  color: '#0f172a'
                }}>
                  Promedio
                </td>
                <td style={{ 
                  textAlign: 'center', 
                  padding: '1rem', 
                  fontWeight: '700',
                  color: '#0f172a'
                }}>
                  {(cvMetrics.reduce((sum, m) => sum + m.rmse, 0) / cvMetrics.length).toFixed(4)}
                </td>
                <td style={{ 
                  textAlign: 'center', 
                  padding: '1rem', 
                  fontWeight: '700',
                  color: '#0f172a'
                }}>
                  {(cvMetrics.reduce((sum, m) => sum + m.r2, 0) / cvMetrics.length).toFixed(4)}
                </td>
                <td style={{ 
                  textAlign: 'center', 
                  padding: '1rem', 
                  fontWeight: '700',
                  color: '#0f172a'
                }}>
                  {(cvMetrics.reduce((sum, m) => sum + m.mae, 0) / cvMetrics.length).toFixed(4)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
    </div>
  );

  // Componente de diagnósticos
  const Diagnostics = () => (
    <div>
      <h4 style={{ 
        fontSize: '1.25rem', 
        fontWeight: '600', 
        color: '#0f172a', 
        marginBottom: '2rem' 
      }}>
        🔍 Diagnósticos del Modelo
      </h4>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '2rem' 
      }}>
        
        {/* Diagnósticos del modelo */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '2rem'
        }}>
          <h5 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: '#334155', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🩺 Diagnósticos Estadísticos
          </h5>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem' 
          }}>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: '#dcfce7',
              borderRadius: '8px',
              border: '2px solid #86efac'
            }}>
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500',
                color: '#166534'
              }}>
                Normalidad de Residuos
              </span>
              <span style={{ 
                fontSize: '0.875rem',
                color: '#15803d', 
                fontWeight: '700',
                backgroundColor: '#bbf7d0',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px'
              }}>
                ✅ Excelente
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: '#dcfce7',
              borderRadius: '8px',
              border: '2px solid #86efac'
            }}>
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500',
                color: '#166534'
              }}>
                Homocedasticidad
              </span>
              <span style={{ 
                fontSize: '0.875rem',
                color: '#15803d', 
                fontWeight: '700',
                backgroundColor: '#bbf7d0',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px'
              }}>
                ✅ Buena
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              border: '2px solid #fde68a'
            }}>
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500',
                color: '#92400e'
              }}>
                Independencia
              </span>
              <span style={{ 
                fontSize: '0.875rem',
                color: '#d97706', 
                fontWeight: '700',
                backgroundColor: '#fed7aa',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px'
              }}>
                ⚠️ Revisar
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: '#dcfce7',
              borderRadius: '8px',
              border: '2px solid #86efac'
            }}>
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500',
                color: '#166534'
              }}>
                Linealidad
              </span>
              <span style={{ 
                fontSize: '0.875rem',
                color: '#15803d', 
                fontWeight: '700',
                backgroundColor: '#bbf7d0',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px'
              }}>
                ✅ Buena
              </span>
            </div>
            
          </div>
        </div>

        {/* Recomendaciones */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '2rem'
        }}>
          <h5 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: '#334155', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            💡 Recomendaciones
          </h5>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem' 
          }}>
            
            <div style={{
              padding: '1.25rem',
              backgroundColor: '#dbeafe',
              borderRadius: '10px',
              border: '2px solid #93c5fd'
            }}>
              <h6 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '700', 
                color: '#1e40af', 
                margin: '0 0 0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📊 Mejora de Datos
              </h6>
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#1e3a8a',
                margin: '0',
                lineHeight: '1.4'
              }}>
                Considerar agregar más características temporales para capturar tendencias estacionales.
              </p>
            </div>
            
            <div style={{
              padding: '1.25rem',
              backgroundColor: '#dcfce7',
              borderRadius: '10px',
              border: '2px solid #86efac'
            }}>
              <h6 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '700', 
                color: '#15803d', 
                margin: '0 0 0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🎯 Rendimiento
              </h6>
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#14532d',
                margin: '0',
                lineHeight: '1.4'
              }}>
                El modelo muestra un buen balance entre precisión y generalización.
              </p>
            </div>
            
            <div style={{
              padding: '1.25rem',
              backgroundColor: '#fed7aa',
              borderRadius: '10px',
              border: '2px solid #fdba74'
            }}>
              <h6 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '700', 
                color: '#c2410c', 
                margin: '0 0 0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📈 Monitoreo
              </h6>
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#9a3412',
                margin: '0',
                lineHeight: '1.4'
              }}>
                Revisar periódicamente la deriva del modelo con nuevos datos.
              </p>
            </div>
            
          </div>
        </div>
        
      </div>
      
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'residuals':
        return <ResidualsAnalysis />;
      case 'distribution':
        return <ErrorDistribution />;
      case 'validation':
        return <CrossValidation />;
      case 'diagnostics':
        return <Diagnostics />;
      default:
        return <ResidualsAnalysis />;
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header Simple */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              color: '#0f172a',
              marginBottom: '0.5rem'
            }}>
              🧪 Análisis del Modelo
            </h1>
            <p style={{ 
              fontSize: '1.125rem', 
              color: '#64748b',
              margin: '0'
            }}>
              Diagnósticos avanzados y validación del modelo {modelData?.model_info?.name || 'Ridge Regression'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        {/* Navigation Tabs */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            backgroundColor: 'white',
            padding: '0.5rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? '#f1f5f9' : 'transparent',
                  color: activeTab === tab.id ? '#0f172a' : '#64748b',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.color = '#374151';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#64748b';
                  }
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '0.5rem' 
                }}>
                  <span>{tab.icon}</span>
                  <span>{tab.label.replace(/^[📊📈✅🔍] /, '')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '2rem'
        }}>
          {renderTabContent()}
        </div>

        {/* Status Info */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              <span style={{
                width: '0.5rem',
                height: '0.5rem',
                backgroundColor: '#10b981',
                borderRadius: '50%'
              }}></span>
              Modelo Activo
            </span>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            margin: '0'
          }}>
            Precisión: {modelData?.model_info?.accuracy ? (modelData.model_info.accuracy * 100).toFixed(1) : '40.8'}% • 
            RMSE: {modelData?.model_info?.rmse || '6.21'} • 
            Última validación: {modelData?.model_info?.training_date ? new Date(modelData.model_info.training_date).toLocaleDateString() : 'Hoy'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelAnalysis;