// src/components/DataExploration.js
import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

const DataExploration = () => {
  const [activeView, setActiveView] = useState('correlations');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const loadData = async () => {
      // Datos simulados basados en el notebook
      const mockData = {
        correlations: {
          matriz: [
            [1.0, 0.75, -0.45, 0.60, 0.30],
            [0.75, 1.0, -0.30, 0.55, 0.25],
            [-0.45, -0.30, 1.0, -0.25, -0.40],
            [0.60, 0.55, -0.25, 1.0, 0.50],
            [0.30, 0.25, -0.40, 0.50, 1.0]
          ],
          variables: ['Ventas', 'Precio', 'Inventario', 'Promociones', 'Temporada']
        },
        distributions: {
          ventas: Array.from({ length: 100 }, () => Math.random() * 1000 + 200),
          precios: Array.from({ length: 100 }, () => Math.random() * 50 + 10),
          categorias: ['Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros'],
          ventasPorCategoria: [450, 320, 280, 210, 140]
        },
        temporal: {
          fechas: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'],
          ventas: [1200, 1350, 1180, 1450, 1380, 1520],
          tendencia: [1150, 1250, 1300, 1400, 1450, 1500]
        }
      };
      
      setData(mockData);
      setLoading(false);
    };

    loadData();
  }, []);

  const views = [
    { id: 'correlations', name: '🔗 Correlaciones', color: '#3b82f6' },
    { id: 'distributions', name: '📊 Distribuciones', color: '#10b981' },
    { id: 'temporal', name: '📈 Serie Temporal', color: '#f59e0b' }
  ];

  const renderCorrelations = () => {
    if (!data) return null;

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🔗 Matriz de Correlación
          </h3>
          
          <Plot
            data={[{
              z: data.correlations.matriz,
              x: data.correlations.variables,
              y: data.correlations.variables,
              type: 'heatmap',
              colorscale: [
                [0, '#ef4444'],
                [0.5, '#ffffff'], 
                [1, '#10b981']
              ],
              text: data.correlations.matriz.map(row => 
                row.map(val => val.toFixed(2))
              ),
              texttemplate: '%{text}',
              textfont: { size: 14, color: 'black' },
              showscale: true,
              colorbar: {
                title: 'Correlación',
                titleside: 'right'
              }
            }]}
            layout={{
              width: undefined,
              height: 500,
              margin: { l: 100, r: 50, t: 50, b: 100 },
              font: { family: 'system-ui, sans-serif', size: 12 },
              paper_bgcolor: 'white',
              plot_bgcolor: 'white'
            }}
            config={{ displayModeBar: false, responsive: true }}
            useResizeHandler={true}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    );
  };

  const renderDistributions = () => {
    if (!data) return null;

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '1rem'
          }}>
            📊 Distribución de Ventas
          </h3>
          
          <Plot
            data={[{
              x: data.distributions.ventas,
              type: 'histogram',
              nbinsx: 20,
              marker: {
                color: '#3b82f6',
                opacity: 0.7
              },
              name: 'Ventas'
            }]}
            layout={{
              width: undefined,
              height: 300,
              margin: { l: 40, r: 20, t: 20, b: 40 },
              xaxis: { title: 'Ventas' },
              yaxis: { title: 'Frecuencia' },
              font: { family: 'system-ui, sans-serif', size: 12 },
              paper_bgcolor: 'white',
              plot_bgcolor: '#f8fafc'
            }}
            config={{ displayModeBar: false, responsive: true }}
            useResizeHandler={true}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '1rem'
          }}>
            🥧 Ventas por Categoría
          </h3>
          
          <Plot
            data={[{
              values: data.distributions.ventasPorCategoria,
              labels: data.distributions.categorias,
              type: 'pie',
              marker: {
                colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
              },
              textinfo: 'label+percent',
              textposition: 'auto'
            }]}
            layout={{
              width: undefined,
              height: 300,
              margin: { l: 20, r: 20, t: 20, b: 20 },
              font: { family: 'system-ui, sans-serif', size: 12 },
              paper_bgcolor: 'white',
              showlegend: false
            }}
            config={{ displayModeBar: false, responsive: true }}
            useResizeHandler={true}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    );
  };

  const renderTemporal = () => {
    if (!data) return null;

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '1rem'
          }}>
            📈 Evolución Temporal
          </h3>
          
          <Plot
            data={[
              {
                x: data.temporal.fechas,
                y: data.temporal.ventas,
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#3b82f6', width: 3 },
                marker: { size: 8, color: '#3b82f6' },
                name: 'Ventas Reales'
              },
              {
                x: data.temporal.fechas,
                y: data.temporal.tendencia,
                type: 'scatter',
                mode: 'lines',
                line: { color: '#ef4444', width: 2, dash: 'dash' },
                name: 'Tendencia'
              }
            ]}
            layout={{
              width: undefined,
              height: 400,
              margin: { l: 60, r: 20, t: 20, b: 60 },
              xaxis: { title: 'Período' },
              yaxis: { title: 'Ventas' },
              font: { family: 'system-ui, sans-serif', size: 12 },
              paper_bgcolor: 'white',
              plot_bgcolor: '#f8fafc',
              legend: { x: 0, y: 1 }
            }}
            config={{ displayModeBar: false, responsive: true }}
            useResizeHandler={true}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: '3px solid #e5e7eb', 
            borderTop: '3px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            marginBottom: '16px',
            margin: '0 auto 16px auto'
          }}></div>
          <p style={{ color: '#6b7280' }}>Cargando análisis exploratorio...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            🔍 Exploración de Datos
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Análisis exploratorio avanzado de patrones y correlaciones
          </p>
        </div>

        {/* Navigation */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: activeView === view.id ? view.color : 'transparent',
                  color: activeView === view.id ? 'white' : '#64748b',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== view.id) {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== view.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {view.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '2rem',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}>
            <div style={{
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              borderRadius: '50%',
              padding: '1rem',
              display: 'inline-flex',
              marginBottom: '1rem'
            }}>
              📊
            </div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 0.5rem'
            }}>
              Variables Analizadas
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748b',
              margin: '0',
              lineHeight: '1.5'
            }}>
              Se analizan 15+ variables clave del modelo predictivo
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '2rem',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}>
            <div style={{
              backgroundColor: '#d1fae5',
              color: '#065f46',
              borderRadius: '50%',
              padding: '1rem',
              display: 'inline-flex',
              marginBottom: '1rem'
            }}>
              📈
            </div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 0.5rem'
            }}>
              Tendencia Creciente
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748b',
              margin: '0',
              lineHeight: '1.5'
            }}>
              Las ventas muestran una tendencia creciente del 12.5% en el último período
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '2rem',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}>
            <div style={{
              backgroundColor: '#fef3c7',
              color: '#92400e',
              borderRadius: '50%',
              padding: '1rem',
              display: 'inline-flex',
              marginBottom: '1rem'
            }}>
              🔗
            </div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 0.5rem'
            }}>
              Correlación Fuerte
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748b',
              margin: '0',
              lineHeight: '1.5'
            }}>
              Correlación de 0.75 entre precio y ventas, indicando alta dependencia
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '2rem',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}>
            <div style={{
              backgroundColor: '#ede9fe',
              color: '#6b46c1',
              borderRadius: '50%',
              padding: '1rem',
              display: 'inline-flex',
              marginBottom: '1rem'
            }}>
              👥
            </div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 0.5rem'
            }}>
              Clientes VIP
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748b',
              margin: '0',
              lineHeight: '1.5'
            }}>
              El top 10% de clientes genera el 40% de los ingresos totales
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '16px',
          padding: '2rem',
          minHeight: '600px'
        }}>
          {activeView === 'correlations' && renderCorrelations()}
          {activeView === 'distributions' && renderDistributions()}
          {activeView === 'temporal' && renderTemporal()}
        </div>
      </div>
    </div>
  );
};

export default DataExploration;