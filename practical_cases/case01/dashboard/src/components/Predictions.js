// src/components/Predictions.js
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Predictions = ({ modelData }) => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [predictionInputs, setPredictionInputs] = useState({
    precio: 100,
    temporada: 'alta',
    promocion: false,
    dia_semana: 'lunes',
    inventario: 100,
    competencia_precio: 95
  });
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Productos de ejemplo
  const products = [
    { id: 'ELEC001', name: 'Smartphone Galaxy X1', category: 'Electrónicos', basePrice: 699 },
    { id: 'ROPA002', name: 'Camiseta Deportiva Pro', category: 'Ropa', basePrice: 45 },
    { id: 'HOGAR003', name: 'Aspiradora Robot Smart', category: 'Hogar', basePrice: 299 },
    { id: 'DEPORTE004', name: 'Zapatillas Running Ultra', category: 'Deportes', basePrice: 129 },
    { id: 'LIBRO005', name: 'Manual de IA Práctica', category: 'Libros', basePrice: 35 },
    { id: 'BELLEZA006', name: 'Crema Anti-edad Premium', category: 'Belleza', basePrice: 85 }
  ];

  const categories = ['all', 'Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Belleza'];

  // Filtrar productos por categoría
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  // Simular predicción en tiempo real
  const generatePrediction = (inputs, product) => {
    const basedemand = 100;
    
    // Factores de ajuste basados en las características
    let demandMultiplier = 1;
    
    // Efecto del precio
    const priceRatio = inputs.precio / (product?.basePrice || 100);
    demandMultiplier *= Math.max(0.1, 2 - priceRatio);
    
    // Efecto de la temporada
    const seasonMultipliers = { alta: 1.5, media: 1, baja: 0.7 };
    demandMultiplier *= seasonMultipliers[inputs.temporada];
    
    // Efecto de promoción
    if (inputs.promocion) demandMultiplier *= 1.3;
    
    // Efecto del día de la semana
    const dayMultipliers = {
      lunes: 0.8, martes: 0.9, miercoles: 1, jueves: 1.1,
      viernes: 1.2, sabado: 1.4, domingo: 1.1
    };
    demandMultiplier *= dayMultipliers[inputs.dia_semana];
    
    // Efecto del inventario
    const inventoryFactor = Math.min(1, inputs.inventario / 50);
    demandMultiplier *= inventoryFactor;
    
    // Efecto de la competencia
    const competitionRatio = inputs.competencia_precio / inputs.precio;
    demandMultiplier *= Math.max(0.5, 1 + (competitionRatio - 1) * 0.5);
    
    const predictedDemand = Math.max(1, Math.round(basedemand * demandMultiplier));
    const confidence = Math.min(95, Math.max(60, 85 + (Math.random() - 0.5) * 20));
    
    return {
      demanda_predicha: predictedDemand,
      confianza: parseFloat(confidence.toFixed(1)),
      intervalo_superior: Math.round(predictedDemand * 1.2),
      intervalo_inferior: Math.round(predictedDemand * 0.8),
      factores_clave: getKeyFactors(inputs, demandMultiplier)
    };
  };

  // Identificar factores clave
  const getKeyFactors = (inputs, multiplier) => {
    const factors = [];
    
    if (multiplier > 1.2) {
      factors.push({ factor: 'Alta demanda esperada', impact: 'positive' });
    } else if (multiplier < 0.8) {
      factors.push({ factor: 'Baja demanda esperada', impact: 'negative' });
    }
    
    if (inputs.promocion) {
      factors.push({ factor: 'Promoción activa', impact: 'positive' });
    }
    
    if (inputs.temporada === 'alta') {
      factors.push({ factor: 'Temporada alta', impact: 'positive' });
    } else if (inputs.temporada === 'baja') {
      factors.push({ factor: 'Temporada baja', impact: 'negative' });
    }
    
    if (inputs.inventario < 30) {
      factors.push({ factor: 'Inventario bajo', impact: 'negative' });
    }
    
    return factors;
  };

  // Generar predicciones históricas
  const generateHistoricalPredictions = () => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      
      const baseDemand = 80 + Math.sin(i * 0.2) * 20 + Math.random() * 30;
      const actualDemand = baseDemand + (Math.random() - 0.5) * 20;
      
      return {
        fecha: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
        prediccion: Math.round(baseDemand),
        real: Math.round(actualDemand),
        accuracy: Math.max(70, 100 - Math.abs(baseDemand - actualDemand))
      };
    });
  };

  const historicalData = generateHistoricalPredictions();

  // Manejar predicción
  const handlePredict = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const selectedProd = products.find(p => p.id === selectedProduct);
      const newPrediction = {
        id: Date.now(),
        producto: selectedProd?.name || 'Producto Genérico',
        categoria: selectedProd?.category || 'General',
        timestamp: new Date().toLocaleString('es-ES'),
        inputs: { ...predictionInputs },
        resultado: generatePrediction(predictionInputs, selectedProd)
      };
      
      setPredictions(prev => [newPrediction, ...prev.slice(0, 4)]);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    // Cargar algunas predicciones de ejemplo al inicio
    const initialPredictions = products.slice(0, 3).map(product => ({
      id: Date.now() + Math.random(),
      producto: product.name,
      categoria: product.category,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toLocaleString('es-ES'),
      inputs: { ...predictionInputs, precio: product.basePrice },
      resultado: generatePrediction({ ...predictionInputs, precio: product.basePrice }, product)
    }));
    
    setPredictions(initialPredictions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
      
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#0f172a',
            margin: '0 0 0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            🔮 Predicciones en Tiempo Real
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#64748b',
            margin: '0'
          }}>
            Generar predicciones de demanda inteligentes para productos específicos
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '2rem' 
        }}>
        
        {/* Panel de configuración */}
        <div style={{ gridColumn: 'span 1' }}>
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '2rem',
            position: 'sticky',
            top: '1rem'
          }}>
              
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              ⚙️ Configuración de Predicción
            </h3>
              
              {/* Selector de categoría */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  📂 Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'Todas las categorías' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de producto */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  🛍️ Producto
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  <option value="">Seleccionar producto...</option>
                  {filteredProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.basePrice}
                    </option>
                  ))}
                </select>
              </div>

              {/* Parámetros de predicción */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.5rem' 
              }}>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    💰 Precio ($) <span style={{ 
                      color: '#3b82f6', 
                      fontWeight: '700',
                      backgroundColor: '#dbeafe',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px'
                    }}>{predictionInputs.precio}</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    value={predictionInputs.precio}
                    onChange={(e) => setPredictionInputs(prev => ({ ...prev, precio: parseInt(e.target.value) }))}
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      background: 'linear-gradient(to right, #3b82f6 0%, #3b82f6 ' + ((predictionInputs.precio - 10) / 990 * 100) + '%, #e2e8f0 ' + ((predictionInputs.precio - 10) / 990 * 100) + '%, #e2e8f0 100%)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    🌤️ Temporada
                  </label>
                  <select
                    value={predictionInputs.temporada}
                    onChange={(e) => setPredictionInputs(prev => ({ ...prev, temporada: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  >
                    <option value="baja">🔵 Temporada Baja</option>
                    <option value="media">🟡 Temporada Media</option>
                    <option value="alta">🔴 Temporada Alta</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    📅 Día de la Semana
                  </label>
                  <select
                    value={predictionInputs.dia_semana}
                    onChange={(e) => setPredictionInputs(prev => ({ ...prev, dia_semana: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  >
                    <option value="lunes">Lunes</option>
                    <option value="martes">Martes</option>
                    <option value="miercoles">Miércoles</option>
                    <option value="jueves">Jueves</option>
                    <option value="viernes">Viernes</option>
                    <option value="sabado">Sábado</option>
                    <option value="domingo">Domingo</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    📦 Inventario (unidades) <span style={{ 
                      color: '#10b981', 
                      fontWeight: '700',
                      backgroundColor: '#dcfce7',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px'
                    }}>{predictionInputs.inventario}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={predictionInputs.inventario}
                    onChange={(e) => setPredictionInputs(prev => ({ ...prev, inventario: parseInt(e.target.value) }))}
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      background: 'linear-gradient(to right, #10b981 0%, #10b981 ' + (predictionInputs.inventario / 500 * 100) + '%, #e2e8f0 ' + (predictionInputs.inventario / 500 * 100) + '%, #e2e8f0 100%)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    🏪 Precio Competencia ($) <span style={{ 
                      color: '#f59e0b', 
                      fontWeight: '700',
                      backgroundColor: '#fef3c7',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px'
                    }}>{predictionInputs.competencia_precio}</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    value={predictionInputs.competencia_precio}
                    onChange={(e) => setPredictionInputs(prev => ({ ...prev, competencia_precio: parseInt(e.target.value) }))}
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      background: 'linear-gradient(to right, #f59e0b 0%, #f59e0b ' + ((predictionInputs.competencia_precio - 10) / 990 * 100) + '%, #e2e8f0 ' + ((predictionInputs.competencia_precio - 10) / 990 * 100) + '%, #e2e8f0 100%)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  backgroundColor: '#f0fdf4',
                  border: '2px solid #bbf7d0',
                  borderRadius: '8px'
                }}>
                  <input
                    type="checkbox"
                    id="promocion"
                    checked={predictionInputs.promocion}
                    onChange={(e) => setPredictionInputs(prev => ({ ...prev, promocion: e.target.checked }))}
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      cursor: 'pointer'
                    }}
                  />
                  <label htmlFor="promocion" style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#166534',
                    cursor: 'pointer'
                  }}>
                    🎯 Promoción Activa
                  </label>
                </div>

              </div>

              {/* Botón de predicción */}
              <button
                onClick={handlePredict}
                disabled={!selectedProduct || isLoading}
                style={{
                  width: '100%',
                  marginTop: '2rem',
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  border: 'none',
                  cursor: !selectedProduct || isLoading ? 'not-allowed' : 'pointer',
                  backgroundColor: !selectedProduct || isLoading ? '#d1d5db' : '#3b82f6',
                  color: !selectedProduct || isLoading ? '#6b7280' : 'white',
                  transition: 'all 0.2s ease',
                  transform: !selectedProduct || isLoading ? 'none' : 'translateY(0)',
                  boxShadow: !selectedProduct || isLoading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!(!selectedProduct || isLoading)) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!selectedProduct || isLoading)) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {isLoading ? '🔄 Prediciendo...' : '🔮 Generar Predicción'}
              </button>

            </div>
          </div>
        </div>

        {/* Panel principal */}
        <div style={{ 
          gridColumn: 'span 1',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          
          {/* Historial de predicciones */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              📈 Predicciones vs Realidad (Últimos 30 días)
            </h3>
            
            <div style={{ 
              height: '320px',
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '1rem',
              border: '1px solid #e2e8f0'
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="fecha" 
                    stroke="#64748b"
                    fontSize="12"
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize="12"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="prediccion" 
                    stroke="#3b82f6" 
                    name="Predicción"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="real" 
                    stroke="#10b981" 
                    name="Real"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resultados de predicciones recientes */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              🎯 Predicciones Recientes
            </h3>
            
            {predictions.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '2px dashed #cbd5e1'
              }}>
                <p style={{
                  color: '#64748b',
                  fontSize: '1rem',
                  margin: '0'
                }}>
                  💭 No hay predicciones aún. ¡Genera tu primera predicción!
                </p>
              </div>
            ) : (
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem'
                }}>
                  {predictions.map(prediction => (
                    <div key={prediction.id} style={{
                      backgroundColor: 'white',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '2rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'start',
                        justifyContent: 'space-between',
                        marginBottom: '1.5rem'
                      }}>
                        <div>
                          <h4 style={{
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            color: '#0f172a',
                            margin: '0 0 0.5rem'
                          }}>
                            {prediction.producto}
                          </h4>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#64748b',
                            margin: '0'
                          }}>
                            📦 {prediction.categoria} • 🕒 {prediction.timestamp}
                          </p>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontSize: '2rem',
                            fontWeight: '800',
                            color: '#3b82f6',
                            margin: '0'
                          }}>
                            {prediction.resultado.demanda_predicha}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                            marginTop: '0.25rem'
                          }}>
                            unidades/día
                          </div>
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                      }}>
                        
                        <div style={{
                          textAlign: 'center',
                          padding: '1rem',
                          backgroundColor: '#dcfce7',
                          borderRadius: '8px',
                          border: '1px solid #bbf7d0'
                        }}>
                          <div style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: '#15803d',
                            margin: '0'
                          }}>
                            {prediction.resultado.confianza}%
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#166534',
                            marginTop: '0.25rem'
                          }}>
                            Confianza
                          </div>
                        </div>
                        
                        <div style={{
                          textAlign: 'center',
                          padding: '1rem',
                          backgroundColor: '#dbeafe',
                          borderRadius: '8px',
                          border: '1px solid #93c5fd'
                        }}>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#1e40af',
                            margin: '0'
                          }}>
                            {prediction.resultado.intervalo_inferior} - {prediction.resultado.intervalo_superior}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#1e3a8a',
                            marginTop: '0.25rem'
                          }}>
                            Rango
                          </div>
                        </div>
                        
                        <div style={{
                          textAlign: 'center',
                          padding: '1rem',
                          backgroundColor: '#fef3c7',
                          borderRadius: '8px',
                          border: '1px solid #fde68a'
                        }}>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#d97706',
                            margin: '0'
                          }}>
                            ${prediction.inputs.precio}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#92400e',
                            marginTop: '0.25rem'
                          }}>
                            Precio
                          </div>
                        </div>
                        
                        <div style={{
                          textAlign: 'center',
                          padding: '1rem',
                          backgroundColor: '#f3e8ff',
                          borderRadius: '8px',
                          border: '1px solid #c4b5fd'
                        }}>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#7c3aed',
                            margin: '0',
                            textTransform: 'capitalize'
                          }}>
                            {prediction.inputs.temporada}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#581c87',
                            marginTop: '0.25rem'
                          }}>
                            Temporada
                          </div>
                        </div>
                        
                      </div>

                      {prediction.resultado.factores_clave.length > 0 && (
                        <div style={{
                          marginTop: '1rem',
                          padding: '1.5rem',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1'
                        }}>
                          <h5 style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#334155',
                            margin: '0 0 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            🔍 Factores Clave:
                          </h5>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.75rem'
                          }}>
                            {prediction.resultado.factores_clave.map((factor, index) => (
                              <span
                                key={index}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '20px',
                                  fontWeight: '600',
                                  backgroundColor: factor.impact === 'positive' ? '#dcfce7' : '#fef2f2',
                                  color: factor.impact === 'positive' ? '#166534' : '#dc2626',
                                  border: `2px solid ${factor.impact === 'positive' ? '#bbf7d0' : '#fecaca'}`,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                              >
                                {factor.impact === 'positive' ? '✅' : '❌'} {factor.factor}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
  );
};

export default Predictions;