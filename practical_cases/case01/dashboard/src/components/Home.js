// src/components/Home.js - Directorio Sencillo
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const sections = [
    {
      title: 'Dashboard',
      description: 'Vista general del sistema de predicción',
      href: '/dashboard',
      color: 'blue'
    },
    {
      title: 'Análisis de Modelo',
      description: 'Métricas y rendimiento del modelo ML',
      href: '/model-analysis',
      color: 'purple'
    },
    {
      title: 'Predicciones',
      description: 'Generar nuevas predicciones de ventas',
      href: '/predictions',
      color: 'green'
    },
    {
      title: 'Exploración de Datos',
      description: 'Análisis y visualización de datos',
      href: '/data',
      color: 'orange'
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sistema',
      href: '/settings',
      color: 'gray'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50',
      purple: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50',
      green: 'border-green-200 hover:border-green-300 hover:bg-green-50',
      orange: 'border-orange-200 hover:border-orange-300 hover:bg-orange-50',
      gray: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
    };
    return colors[color] || colors.gray;
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header Simple */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              color: '#0f172a',
              marginBottom: '0.5rem'
            }}>
              MegaMercado AI
            </h1>
            <p style={{ 
              fontSize: '1.125rem', 
              color: '#64748b',
              margin: '0'
            }}>
              Sistema Inteligente de Predicción de Ventas
            </p>
          </div>
        </div>
      </div>

      {/* Directory Listing */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ 
          display: 'grid', 
          gap: '1rem',
          gridTemplateColumns: '1fr'
        }}>
          {sections.map((section, index) => (
            <Link
              key={index}
              to={section.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1.5rem',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              className={`directory-item ${getColorClasses(section.color)}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Content */}
              <div style={{ flex: '1' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '0.25rem'
                }}>
                  {section.title}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: '0'
                }}>
                  {section.description}
                </p>
              </div>

              {/* Arrow */}
              <div style={{
                fontSize: '1.25rem',
                color: '#94a3b8',
                marginLeft: '1rem'
              }}>
                →
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '3rem',
          padding: '2rem',
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
              Sistema Online
            </span>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            margin: '0'
          }}>
            Modelo entrenado con 94.2% de precisión • Última actualización: Hoy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;