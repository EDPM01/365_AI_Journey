// src/components/Settings.js
import React, { useState } from 'react';

const Settings = ({ modelData }) => {
  const [settings, setSettings] = useState({
    // Configuración del modelo
    model: {
      retrain_frequency: 'weekly',
      confidence_threshold: 80,
      prediction_horizon: 7,
      enable_auto_retrain: true,
      max_features: 50
    },
    // Configuración de alertas
    alerts: {
      low_accuracy_threshold: 75,
      high_demand_threshold: 500,
      inventory_alert: true,
      email_notifications: true,
      slack_integration: false
    },
    // Configuración de la interfaz
    ui: {
      theme: 'light',
      language: 'es',
      timezone: 'America/Mexico_City',
      auto_refresh: 30,
      charts_animation: true
    },
    // Configuración de datos
    data: {
      data_retention_days: 365,
      backup_frequency: 'daily',
      data_validation: true,
      outlier_detection: true
    }
  });

  const [activeTab, setActiveTab] = useState('model');
  const [hasChanges, setHasChanges] = useState(false);

  const tabs = [
    { id: 'model', label: '🤖 Modelo', icon: '🤖' },
    { id: 'alerts', label: '🔔 Alertas', icon: '🔔' },
    { id: 'ui', label: '🎨 Interfaz', icon: '🎨' },
    { id: 'data', label: '💾 Datos', icon: '💾' }
  ];

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Aquí guardaría la configuración
    console.log('Guardando configuración:', settings);
    setHasChanges(false);
    
    // Mostrar notificación de éxito
    alert('✅ Configuración guardada exitosamente');
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres restaurar la configuración por defecto?')) {
      // Restaurar valores por defecto
      setSettings({
        model: {
          retrain_frequency: 'weekly',
          confidence_threshold: 80,
          prediction_horizon: 7,
          enable_auto_retrain: true,
          max_features: 50
        },
        alerts: {
          low_accuracy_threshold: 75,
          high_demand_threshold: 500,
          inventory_alert: true,
          email_notifications: true,
          slack_integration: false
        },
        ui: {
          theme: 'light',
          language: 'es',
          timezone: 'America/Mexico_City',
          auto_refresh: 30,
          charts_animation: true
        },
        data: {
          data_retention_days: 365,
          backup_frequency: 'daily',
          data_validation: true,
          outlier_detection: true
        }
      });
      setHasChanges(false);
    }
  };

  const ModelSettings = () => (
    <div className="space-y-6">
      
      <div className="card">
        <div className="card-body">
          <h4 className="text-lg font-semibold mb-4">🎯 Configuración del Modelo</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frecuencia de Reentrenamiento
              </label>
              <select
                value={settings.model.retrain_frequency}
                onChange={(e) => handleSettingChange('model', 'retrain_frequency', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Umbral de Confianza (%) {settings.model.confidence_threshold}
              </label>
              <input
                type="range"
                min="60"
                max="99"
                value={settings.model.confidence_threshold}
                onChange={(e) => handleSettingChange('model', 'confidence_threshold', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horizonte de Predicción (días)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.model.prediction_horizon}
                onChange={(e) => handleSettingChange('model', 'prediction_horizon', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo de Características
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={settings.model.max_features}
                onChange={(e) => handleSettingChange('model', 'max_features', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.model.enable_auto_retrain}
                onChange={(e) => handleSettingChange('model', 'enable_auto_retrain', e.target.checked)}
                className="mr-3"
              />
              <span className="text-sm font-medium text-gray-700">
                Habilitar reentrenamiento automático
              </span>
            </label>
          </div>

        </div>
      </div>

    </div>
  );

  const AlertsSettings = () => (
    <div className="space-y-6">
      
      <div className="card">
        <div className="card-body">
          <h4 className="text-lg font-semibold mb-4">🔔 Configuración de Alertas</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Umbral de Precisión Baja (%) {settings.alerts.low_accuracy_threshold}
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={settings.alerts.low_accuracy_threshold}
                onChange={(e) => handleSettingChange('alerts', 'low_accuracy_threshold', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Umbral de Alta Demanda
              </label>
              <input
                type="number"
                min="100"
                max="10000"
                value={settings.alerts.high_demand_threshold}
                onChange={(e) => handleSettingChange('alerts', 'high_demand_threshold', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          <div className="mt-6 space-y-4">
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.alerts.inventory_alert}
                onChange={(e) => handleSettingChange('alerts', 'inventory_alert', e.target.checked)}
                className="mr-3"
              />
              <span className="text-sm font-medium text-gray-700">
                Alertas de inventario bajo
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.alerts.email_notifications}
                onChange={(e) => handleSettingChange('alerts', 'email_notifications', e.target.checked)}
                className="mr-3"
              />
              <span className="text-sm font-medium text-gray-700">
                Notificaciones por email
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.alerts.slack_integration}
                onChange={(e) => handleSettingChange('alerts', 'slack_integration', e.target.checked)}
                className="mr-3"
              />
              <span className="text-sm font-medium text-gray-700">
                Integración con Slack
              </span>
            </label>

          </div>

        </div>
      </div>

    </div>
  );

  const UISettings = () => (
    <div className="space-y-6">
      
      <div className="card">
        <div className="card-body">
          <h4 className="text-lg font-semibold mb-4">🎨 Configuración de Interfaz</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tema
              </label>
              <select
                value={settings.ui.theme}
                onChange={(e) => handleSettingChange('ui', 'theme', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma
              </label>
              <select
                value={settings.ui.language}
                onChange={(e) => handleSettingChange('ui', 'language', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zona Horaria
              </label>
              <select
                value={settings.ui.timezone}
                onChange={(e) => handleSettingChange('ui', 'timezone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="America/Mexico_City">México (UTC-6)</option>
                <option value="America/New_York">Nueva York (UTC-5)</option>
                <option value="Europe/Madrid">Madrid (UTC+1)</option>
                <option value="Asia/Tokyo">Tokio (UTC+9)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-actualización (segundos)
              </label>
              <select
                value={settings.ui.auto_refresh}
                onChange={(e) => handleSettingChange('ui', 'auto_refresh', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="15">15 segundos</option>
                <option value="30">30 segundos</option>
                <option value="60">1 minuto</option>
                <option value="300">5 minutos</option>
                <option value="0">Desactivado</option>
              </select>
            </div>

          </div>

          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.ui.charts_animation}
                onChange={(e) => handleSettingChange('ui', 'charts_animation', e.target.checked)}
                className="mr-3"
              />
              <span className="text-sm font-medium text-gray-700">
                Animaciones en gráficos
              </span>
            </label>
          </div>

        </div>
      </div>

    </div>
  );

  const DataSettings = () => (
    <div className="space-y-6">
      
      <div className="card">
        <div className="card-body">
          <h4 className="text-lg font-semibold mb-4">💾 Configuración de Datos</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retención de datos (días)
              </label>
              <input
                type="number"
                min="30"
                max="1095"
                value={settings.data.data_retention_days}
                onChange={(e) => handleSettingChange('data', 'data_retention_days', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frecuencia de respaldo
              </label>
              <select
                value={settings.data.backup_frequency}
                onChange={(e) => handleSettingChange('data', 'backup_frequency', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="hourly">Cada hora</option>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
              </select>
            </div>

          </div>

          <div className="mt-6 space-y-4">
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.data.data_validation}
                onChange={(e) => handleSettingChange('data', 'data_validation', e.target.checked)}
                className="mr-3"
              />
              <span className="text-sm font-medium text-gray-700">
                Validación automática de datos
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.data.outlier_detection}
                onChange={(e) => handleSettingChange('data', 'outlier_detection', e.target.checked)}
                className="mr-3"
              />
              <span className="text-sm font-medium text-gray-700">
                Detección de valores atípicos
              </span>
            </label>

          </div>

        </div>
      </div>

    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'model':
        return <ModelSettings />;
      case 'alerts':
        return <AlertsSettings />;
      case 'ui':
        return <UISettings />;
      case 'data':
        return <DataSettings />;
      default:
        return <ModelSettings />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ⚙️ Configuración del Sistema
        </h1>
        <p className="text-gray-600">
          Personalizar el comportamiento del modelo y la interfaz
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="flex items-center space-x-2">
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      {renderTabContent()}

      {/* Botones de acción */}
      <div className="mt-8 flex items-center justify-between">
        
        <button
          onClick={handleReset}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
        >
          🔄 Restaurar por Defecto
        </button>

        <div className="flex items-center space-x-4">
          {hasChanges && (
            <span className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              ⚠️ Cambios sin guardar
            </span>
          )}
          
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`
              px-6 py-3 rounded-lg font-medium transition-all duration-200
              ${hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            💾 Guardar Cambios
          </button>
        </div>

      </div>

    </div>
  );
};

export default Settings;