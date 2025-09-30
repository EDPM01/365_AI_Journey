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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#1a202c',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🎯 Configuración del Modelo
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              📅 Frecuencia de Reentrenamiento
            </label>
            <select
              value={settings.model.retrain_frequency}
              onChange={(e) => handleSettingChange('model', 'retrain_frequency', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '0.95rem',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              🎯 Umbral de Confianza: {settings.model.confidence_threshold}%
            </label>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '2px solid #e2e8f0'
            }}>
              <input
                type="range"
                min="60"
                max="99"
                value={settings.model.confidence_threshold}
                onChange={(e) => handleSettingChange('model', 'confidence_threshold', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(settings.model.confidence_threshold - 60) / (99 - 60) * 100}%, #e2e8f0 ${(settings.model.confidence_threshold - 60) / (99 - 60) * 100}%, #e2e8f0 100%)`,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#6b7280',
                marginTop: '0.5rem'
              }}>
                <span>60%</span>
                <span>99%</span>
              </div>
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              📊 Horizonte de Predicción (días)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.model.prediction_horizon}
              onChange={(e) => handleSettingChange('model', 'prediction_horizon', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              🔢 Máximo de Características
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={settings.model.max_features}
              onChange={(e) => handleSettingChange('model', 'max_features', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '12px',
          border: '2px solid #bfdbfe'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.model.enable_auto_retrain}
              onChange={(e) => handleSettingChange('model', 'enable_auto_retrain', e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                accentColor: '#3b82f6',
                cursor: 'pointer'
              }}
            />
            <span style={{
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#1e40af'
            }}>
              🤖 Habilitar reentrenamiento automático
            </span>
          </label>
        </div>

      </div>

    </div>
  );

  const AlertsSettings = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#1a202c',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🔔 Configuración de Alertas
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              ⚠️ Umbral de Precisión Baja: {settings.alerts.low_accuracy_threshold}%
            </label>
            <div style={{
              padding: '1rem',
              backgroundColor: '#fef3c7',
              borderRadius: '12px',
              border: '2px solid #fbbf24'
            }}>
              <input
                type="range"
                min="50"
                max="95"
                value={settings.alerts.low_accuracy_threshold}
                onChange={(e) => handleSettingChange('alerts', 'low_accuracy_threshold', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(settings.alerts.low_accuracy_threshold - 50) / (95 - 50) * 100}%, #e2e8f0 ${(settings.alerts.low_accuracy_threshold - 50) / (95 - 50) * 100}%, #e2e8f0 100%)`,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#92400e',
                marginTop: '0.5rem'
              }}>
                <span>50%</span>
                <span>95%</span>
              </div>
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              📈 Umbral de Alta Demanda
            </label>
            <input
              type="number"
              min="100"
              max="10000"
              value={settings.alerts.high_demand_threshold}
              onChange={(e) => handleSettingChange('alerts', 'high_demand_threshold', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

        </div>

        <div style={{
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          
          <div style={{
            padding: '1rem',
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            border: '2px solid #bbf7d0'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.alerts.inventory_alert}
                onChange={(e) => handleSettingChange('alerts', 'inventory_alert', e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#10b981',
                  cursor: 'pointer'
                }}
              />
              <span style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#065f46'
              }}>
                📦 Alertas de inventario bajo
              </span>
            </label>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: '#eff6ff',
            borderRadius: '12px',
            border: '2px solid #93c5fd'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.alerts.email_notifications}
                onChange={(e) => handleSettingChange('alerts', 'email_notifications', e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#3b82f6',
                  cursor: 'pointer'
                }}
              />
              <span style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#1d4ed8'
              }}>
                📧 Notificaciones por email
              </span>
            </label>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: '#faf5ff',
            borderRadius: '12px',
            border: '2px solid #c4b5fd'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.alerts.slack_integration}
                onChange={(e) => handleSettingChange('alerts', 'slack_integration', e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#8b5cf6',
                  cursor: 'pointer'
                }}
              />
              <span style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#6b46c1'
              }}>
                💬 Integración con Slack
              </span>
            </label>
          </div>

        </div>

      </div>

    </div>
  );

  const UISettings = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#1a202c',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🎨 Configuración de Interfaz
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              🌈 Tema
            </label>
            <select
              value={settings.ui.theme}
              onChange={(e) => handleSettingChange('ui', 'theme', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '0.95rem',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#8b5cf6';
                e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="light">☀️ Claro</option>
              <option value="dark">🌙 Oscuro</option>
              <option value="auto">🔄 Automático</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              🌍 Idioma
            </label>
            <select
              value={settings.ui.language}
              onChange={(e) => handleSettingChange('ui', 'language', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '0.95rem',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="es">🇪🇸 Español</option>
              <option value="en">🇺🇸 English</option>
              <option value="pt">🇧🇷 Português</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              🕐 Zona Horaria
            </label>
            <select
              value={settings.ui.timezone}
              onChange={(e) => handleSettingChange('ui', 'timezone', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '0.95rem',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f59e0b';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="America/Mexico_City">🇲🇽 México (UTC-6)</option>
              <option value="America/New_York">🇺🇸 Nueva York (UTC-5)</option>
              <option value="Europe/Madrid">🇪🇸 Madrid (UTC+1)</option>
              <option value="Asia/Tokyo">🇯🇵 Tokio (UTC+9)</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              🔄 Auto-actualización
            </label>
            <select
              value={settings.ui.auto_refresh}
              onChange={(e) => handleSettingChange('ui', 'auto_refresh', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '0.95rem',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="15">⚡ 15 segundos</option>
              <option value="30">🔥 30 segundos</option>
              <option value="60">⏱️ 1 minuto</option>
              <option value="300">🐌 5 minutos</option>
              <option value="0">❌ Desactivado</option>
            </select>
          </div>

        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '12px',
          border: '2px solid #bfdbfe'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.ui.charts_animation}
              onChange={(e) => handleSettingChange('ui', 'charts_animation', e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                accentColor: '#3b82f6',
                cursor: 'pointer'
              }}
            />
            <span style={{
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#1e40af'
            }}>
              ✨ Animaciones en gráficos
            </span>
          </label>
        </div>

      </div>

    </div>
  );

  const DataSettings = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#1a202c',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          💾 Configuración de Datos
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              📅 Retención de datos (días)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="30"
                max="1095"
                value={settings.data.data_retention_days}
                onChange={(e) => handleSettingChange('data', 'data_retention_days', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#f59e0b';
                  e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.75rem',
                color: '#6b7280',
                pointerEvents: 'none'
              }}>
                días
              </div>
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              marginTop: '0.5rem'
            }}>
              Rango: 30 - 1095 días (3 años)
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              💽 Frecuencia de respaldo
            </label>
            <select
              value={settings.data.backup_frequency}
              onChange={(e) => handleSettingChange('data', 'backup_frequency', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '0.95rem',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="hourly">⚡ Cada hora</option>
              <option value="daily">📅 Diario</option>
              <option value="weekly">🗓️ Semanal</option>
            </select>
          </div>

        </div>

        <div style={{
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          
          <div style={{
            padding: '1rem',
            backgroundColor: '#ecfdf5',
            borderRadius: '12px',
            border: '2px solid #a7f3d0'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.data.data_validation}
                onChange={(e) => handleSettingChange('data', 'data_validation', e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#10b981',
                  cursor: 'pointer'
                }}
              />
              <div style={{ flex: 1 }}>
                <span style={{
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: '#047857',
                  display: 'block'
                }}>
                  ✅ Validación automática de datos
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#059669',
                  marginTop: '0.25rem',
                  display: 'block'
                }}>
                  Verificación continua de integridad
                </span>
              </div>
            </label>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: '#fef3c7',
            borderRadius: '12px',
            border: '2px solid #fcd34d'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.data.outlier_detection}
                onChange={(e) => handleSettingChange('data', 'outlier_detection', e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#f59e0b',
                  cursor: 'pointer'
                }}
              />
              <div style={{ flex: 1 }}>
                <span style={{
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: '#92400e',
                  display: 'block'
                }}>
                  🔍 Detección de valores atípicos
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#a16207',
                  marginTop: '0.25rem',
                  display: 'block'
                }}>
                  Identificación automática de anomalías
                </span>
              </div>
            </label>
          </div>

        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '2px dashed #cbd5e1'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '1.25rem' }}>💡</span>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#475569'
            }}>
              Información adicional
            </span>
          </div>
          <p style={{
            fontSize: '0.8rem',
            color: '#64748b',
            margin: 0,
            lineHeight: 1.4
          }}>
            Los datos se almacenan de forma segura y encriptada. Los respaldos automáticos garantizan la continuidad del servicio.
          </p>
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
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
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
          ⚙️ Configuración del Sistema
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: '1.1rem',
          margin: 0
        }}>
          Personalizar el comportamiento del modelo y la interfaz del dashboard
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          borderBottom: '2px solid #f1f5f9',
          marginBottom: '-2px'
        }}>
          <nav style={{
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '1rem 1.5rem',
                    borderBottom: `2px solid ${isActive ? '#3b82f6' : 'transparent'}`,
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    backgroundColor: isActive ? '#f0f9ff' : 'transparent',
                    color: isActive ? '#1e40af' : '#64748b',
                    borderRadius: '8px 8px 0 0',
                    cursor: 'pointer',
                    border: 'none',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.color = '#374151';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#64748b';
                    }
                  }}
                >
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      {renderTabContent()}

      {/* Botones de acción */}
      <div style={{
        marginTop: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        
        <button
          onClick={handleReset}
          style={{
            padding: '0.75rem 1.5rem',
            border: '2px solid #d1d5db',
            borderRadius: '12px',
            color: '#374151',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontWeight: '500',
            fontSize: '0.95rem'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
            e.target.style.borderColor = '#9ca3af';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#ffffff';
            e.target.style.borderColor = '#d1d5db';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          🔄 Restaurar por Defecto
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {hasChanges && (
            <span style={{
              fontSize: '0.875rem',
              color: '#c2410c',
              backgroundColor: '#fed7aa',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontWeight: '500',
              animation: 'pulse 2s infinite'
            }}>
              ⚠️ Cambios sin guardar
            </span>
          )}
          
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              cursor: hasChanges ? 'pointer' : 'not-allowed',
              backgroundColor: hasChanges ? '#3b82f6' : '#e5e7eb',
              color: hasChanges ? '#ffffff' : '#9ca3af',
              border: 'none',
              boxShadow: hasChanges ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (hasChanges) {
                e.target.style.backgroundColor = '#1d4ed8';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (hasChanges) {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }
            }}
          >
            💾 Guardar Cambios
          </button>
        </div>

      </div>

    </div>
  );
};

export default Settings;