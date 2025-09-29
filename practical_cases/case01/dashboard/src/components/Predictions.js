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
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔮 Predicciones en Tiempo Real
        </h1>
        <p className="text-gray-600">
          Generar predicciones de demanda para productos específicos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Panel de configuración */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <div className="card-body">
              
              <h3 className="text-lg font-semibold mb-6">⚙️ Configuración de Predicción</h3>
              
              {/* Selector de categoría */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'Todas las categorías' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de producto */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Producto
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              <div className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio ($) {predictionInputs.precio}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    value={predictionInputs.precio}
                    onChange={(e) => setPredictionInputs(prev => ({ ...prev, precio: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temporada
                  </label>
                  <select
                    value={predictionInputs.temporada}
                    onChange={(e) => setPredictionInputs(prev => ({ ...prev, temporada: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Día de la semana
                  </label>
                  <select
                    value={predictionInputs.dia_semana}
                    onChange={(e) => setPredictionInputs(prev => ({ ...prev, dia_semana: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inventario (unidades) {predictionInputs.inventario}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={predictionInputs.inventario}
                    onChange={(e) => setPredictionInputs(prev => ({ ...prev, inventario: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Competencia ($) {predictionInputs.competencia_precio}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    value={predictionInputs.competencia_precio}
                    onChange={(e) => setPredictionInputs(prev => ({ ...prev, competencia_precio: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="promocion"
                    checked={predictionInputs.promocion}
                    onChange={(e) => setPredictionInputs(prev => ({ ...prev, promocion: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="promocion" className="text-sm font-medium text-gray-700">
                    Promoción activa
                  </label>
                </div>

              </div>

              {/* Botón de predicción */}
              <button
                onClick={handlePredict}
                disabled={!selectedProduct || isLoading}
                className={`
                  w-full mt-6 py-3 px-4 rounded-lg font-medium transition-all duration-200
                  ${!selectedProduct || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                  }
                `}
              >
                {isLoading ? '🔄 Prediciendo...' : '🔮 Generar Predicción'}
              </button>

            </div>
          </div>
        </div>

        {/* Panel principal */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Historial de predicciones */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold mb-4">📈 Predicciones vs Realidad (Últimos 30 días)</h3>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="prediccion" 
                      stroke="#3b82f6" 
                      name="Predicción"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="real" 
                      stroke="#10b981" 
                      name="Real"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Resultados de predicciones recientes */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold mb-4">🎯 Predicciones Recientes</h3>
              
              {predictions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay predicciones aún. ¡Genera tu primera predicción!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {predictions.map(prediction => (
                    <div key={prediction.id} className="border border-gray-200 rounded-lg p-4">
                      
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{prediction.producto}</h4>
                          <p className="text-sm text-gray-500">{prediction.categoria} • {prediction.timestamp}</p>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {prediction.resultado.demanda_predicha}
                          </div>
                          <div className="text-xs text-gray-500">unidades/día</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {prediction.resultado.confianza}%
                          </div>
                          <div className="text-xs text-gray-500">Confianza</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm font-medium">
                            {prediction.resultado.intervalo_inferior} - {prediction.resultado.intervalo_superior}
                          </div>
                          <div className="text-xs text-gray-500">Rango</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm font-medium">${prediction.inputs.precio}</div>
                          <div className="text-xs text-gray-500">Precio</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm font-medium capitalize">{prediction.inputs.temporada}</div>
                          <div className="text-xs text-gray-500">Temporada</div>
                        </div>
                        
                      </div>

                      {prediction.resultado.factores_clave.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Factores Clave:</h5>
                          <div className="flex flex-wrap gap-2">
                            {prediction.resultado.factores_clave.map((factor, index) => (
                              <span
                                key={index}
                                className={`
                                  text-xs px-2 py-1 rounded-full
                                  ${factor.impact === 'positive'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                  }
                                `}
                              >
                                {factor.factor}
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
    </div>
  );
};

export default Predictions;