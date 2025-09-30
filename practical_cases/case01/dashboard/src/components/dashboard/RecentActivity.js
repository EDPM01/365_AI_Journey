// src/components/dashboard/RecentActivity.js
import React, { useState, useEffect } from 'react';

const RecentActivity = ({ modelData, refreshKey }) => {
  const [activities, setActivities] = useState([]);

  // Generar actividades recientes
  const generateActivities = () => {
    const activityTypes = [
      { type: 'prediction', icon: '🔮', color: 'blue' },
      { type: 'alert', icon: '🚨', color: 'red' },
      { type: 'retrain', icon: '🎓', color: 'green' },
      { type: 'data_update', icon: '📊', color: 'purple' },
      { type: 'system', icon: '⚙️', color: 'gray' },
      { type: 'accuracy', icon: '🎯', color: 'orange' }
    ];

    const messages = {
      prediction: [
        'Nueva predicción generada para Electrónicos',
        'Predicción actualizada para categoría Ropa',
        'Predicción de alta demanda detectada',
        'Predicción completada para 150 productos'
      ],
      alert: [
        'Alerta: Precisión por debajo del 80%',
        'Alerta: Inventario bajo en Deportes',
        'Alerta: Demanda inesperadamente alta',
        'Alerta: Error en validación de datos'
      ],
      retrain: [
        'Modelo reentrenado exitosamente',
        'Iniciando reentrenamiento programado',
        'Nuevos datos incorporados al modelo',
        'Optimización de hiperparámetros completada'
      ],
      data_update: [
        'Datos actualizados desde fuente externa',
        'Validación de datos completada',
        'Nuevos registros procesados: 1,247',
        'Limpieza de datos ejecutada'
      ],
      system: [
        'Sistema iniciado correctamente',
        'Respaldo de datos completado',
        'Configuración actualizada',
        'Mantenimiento programado ejecutado'
      ],
      accuracy: [
        'Precisión mejorada en 2.1%',
        'Métricas de rendimiento actualizadas',
        'Nueva mejor precisión registrada: 94.2%',
        'Evaluación de modelo completada'
      ]
    };

    const newActivities = [];
    
    for (let i = 0; i < 15; i++) {
      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const messageList = messages[activityType.type];
      const message = messageList[Math.floor(Math.random() * messageList.length)];
      
      // Generar timestamp realista
      const now = new Date();
      const minutesAgo = Math.floor(Math.random() * 480); // Últimas 8 horas
      const timestamp = new Date(now.getTime() - minutesAgo * 60000);
      
      newActivities.push({
        id: i + refreshKey,
        type: activityType.type,
        icon: activityType.icon,
        color: activityType.color,
        message: message,
        timestamp: timestamp,
        timeAgo: formatTimeAgo(timestamp),
        details: generateActivityDetails(activityType.type)
      });
    }

    return newActivities.sort((a, b) => b.timestamp - a.timestamp);
  };

  // Generar detalles adicionales por tipo de actividad
  const generateActivityDetails = (type) => {
    switch (type) {
      case 'prediction':
        return {
          products: Math.floor(Math.random() * 50) + 10,
          accuracy: (Math.random() * 20 + 80).toFixed(1) + '%'
        };
      case 'alert':
        return {
          severity: Math.random() > 0.5 ? 'Alta' : 'Media',
          affected_items: Math.floor(Math.random() * 20) + 1
        };
      case 'retrain':
        return {
          duration: Math.floor(Math.random() * 30) + 5 + ' min',
          improvement: (Math.random() * 5).toFixed(2) + '%'
        };
      case 'data_update':
        return {
          records: (Math.floor(Math.random() * 5000) + 1000).toLocaleString(),
          source: ['API', 'CSV Import', 'Database Sync'][Math.floor(Math.random() * 3)]
        };
      default:
        return {};
    }
  };

  // Formatear tiempo relativo
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes === 1) return 'Hace 1 minuto';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return 'Hace 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Hace 1 día';
    return `Hace ${diffInDays} días`;
  };

  // Obtener color para cada tipo de actividad
  const getActivityColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      red: 'bg-red-100 text-red-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      gray: 'bg-gray-100 text-gray-800',
      orange: 'bg-orange-100 text-orange-800'
    };
    return colors[color] || colors.gray;
  };

  // Obtener título legible para el tipo
  const getActivityTitle = (type) => {
    const titles = {
      prediction: 'Predicción',
      alert: 'Alerta',
      retrain: 'Entrenamiento',
      data_update: 'Datos',
      system: 'Sistema',
      accuracy: 'Precisión'
    };
    return titles[type] || 'Actividad';
  };

  useEffect(() => {
    setActivities(generateActivities());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <div className="card h-full">
      <div className="card-body">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            🕐 Actividad Reciente
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Últimas 8 horas
          </span>
        </div>

        {/* Lista de actividades */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150">
              
              {/* Ícono */}
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm
                ${getActivityColor(activity.color)}
              `}>
                {activity.icon}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                
                {/* Mensaje principal */}
                <p className="text-sm text-gray-900 font-medium leading-tight">
                  {activity.message}
                </p>

                {/* Detalles adicionales */}
                {Object.keys(activity.details).length > 0 && (
                  <div className="flex items-center space-x-4 mt-1">
                    {Object.entries(activity.details).map(([key, value]) => (
                      <span key={key} className="text-xs text-gray-500">
                        {key.replace('_', ' ')}: {value}
                      </span>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <div className="flex items-center justify-between mt-2">
                  <span className={`
                    text-xs px-2 py-1 rounded-full font-medium
                    ${getActivityColor(activity.color)}
                  `}>
                    {getActivityTitle(activity.type)}
                  </span>
                  
                  <span className="text-xs text-gray-400">
                    {activity.timeAgo}
                  </span>
                </div>

              </div>

            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{activities.length} actividades recientes</span>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Ver todas →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RecentActivity;