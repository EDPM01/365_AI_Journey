// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import ModelAnalysis from './components/ModelAnalysis';
import Predictions from './components/Predictions';
import DataView from './components/DataView';
import DataExploration from './components/DataExploration';
import Settings from './components/Settings';

function App() {
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar datos del modelo al iniciar la aplicación
    loadModelData();
  }, []);

  const loadModelData = async () => {
    try {
      setLoading(true);
      // Simulamos los datos del pipeline de ML
      const mockData = {
        model_info: {
          name: "Ridge Regression",
          version: "1.0.0",
          accuracy: 0.4081,
          rmse: 6.2056,
          mae: 5.0191,
          r2: 0.4081,
          training_date: "2025-09-28T21:43:14.814247",
          features: [
            "precio_unitario",
            "precio_base", 
            "edad",
            "mes",
            "dia_semana",
            "es_fin_semana",
            "categoria_encoded",
            "margen"
          ]
        },
        predictions_today: 1247,
        total_predictions: 15632,
        model_status: "active",
        data_quality: 0.94,
        feature_importance: [
          { name: "precio_unitario", value: 0.8027 },
          { name: "margen", value: 0.0722 },
          { name: "mes", value: 0.0492 },
          { name: "dia_semana", value: 0.0301 },
          { name: "edad", value: 0.0201 },
          { name: "precio_base", value: 0.0157 },
          { name: "es_fin_semana", value: 0.0080 },
          { name: "categoria_encoded", value: 0.0020 }
        ]
      };
      
      setModelData(mockData);
    } catch (error) {
      console.error('Error loading model data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading w-8 h-8 mb-4"></div>
          <p className="text-gray-600">Cargando MegaMercado Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard modelData={modelData} />} />
          <Route path="/model-analysis" element={<ModelAnalysis modelData={modelData} />} />
          <Route path="/predictions" element={<Predictions modelData={modelData} />} />
          <Route path="/data" element={<DataView />} />
          <Route path="/data-exploration" element={<DataExploration />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;