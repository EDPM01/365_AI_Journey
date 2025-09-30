// src/components/DataView.js
import React, { useState } from 'react';

const DataView = ({ modelData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterCategory, setFilterCategory] = useState('all');

  // Generar datos de muestra para la tabla
  const generateSampleData = () => {
    const categories = ['Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Belleza'];
    const products = [];
    
    for (let i = 1; i <= 100; i++) {
      products.push({
        id: i,
        name: `Producto ${i.toString().padStart(3, '0')}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        price: parseFloat((Math.random() * 500 + 10).toFixed(2)),
        predicted_demand: Math.floor(Math.random() * 200 + 50),
        actual_demand: Math.floor(Math.random() * 250 + 40),
        accuracy: parseFloat((80 + Math.random() * 20).toFixed(1)),
        status: Math.random() > 0.8 ? 'Alert' : 'Normal',
        last_updated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
      });
    }
    
    return products;
  };

  const sampleData = generateSampleData();

  // Filtrar datos
  const filteredData = sampleData.filter(item => 
    filterCategory === 'all' || item.category === filterCategory
  );

  // Ordenar datos
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Paginación
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? '↑' : '↓';
    }
    return '↕️';
  };

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
            📊 Vista de Datos del Modelo
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#64748b',
            margin: '0'
          }}>
            Explorar y analizar los datos de predicciones del modelo en tiempo real
          </p>
        </div>

        {/* Controles de filtrado y paginación */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem'
          }}>
            
            {/* Filtros */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem'
            }}>
              <div>
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
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease',
                    minWidth: '150px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  <option value="all">Todas las categorías</option>
                  <option value="Electrónicos">📱 Electrónicos</option>
                  <option value="Ropa">👕 Ropa</option>
                  <option value="Hogar">🏠 Hogar</option>
                  <option value="Deportes">⚽ Deportes</option>
                  <option value="Libros">📚 Libros</option>
                  <option value="Belleza">💄 Belleza</option>
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
                  📋 Elementos por página
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease',
                    minWidth: '100px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  <option value="10">10 filas</option>
                  <option value="25">25 filas</option>
                  <option value="50">50 filas</option>
                </select>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div style={{
              fontSize: '0.875rem',
              color: '#64748b',
              fontWeight: '500',
              backgroundColor: '#dbeafe',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid #93c5fd'
            }}>
              📈 Mostrando {startIndex + 1}-{Math.min(startIndex + pageSize, filteredData.length)} de {filteredData.length} elementos
            </div>
          </div>
        </div>

        {/* Tabla de datos */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem'
        }}>
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
                  backgroundColor: '#f1f5f9',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  <th 
                    style={{
                      textAlign: 'left',
                      padding: '1rem',
                      fontWeight: '700',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      borderRight: '1px solid #e2e8f0'
                    }}
                    onClick={() => handleSort('id')}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    🆔 ID {getSortIcon('id')}
                  </th>
                  <th 
                    style={{
                      textAlign: 'left',
                      padding: '1rem',
                      fontWeight: '700',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      borderRight: '1px solid #e2e8f0'
                    }}
                    onClick={() => handleSort('name')}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    📦 Producto {getSortIcon('name')}
                  </th>
                  <th 
                    style={{
                      textAlign: 'left',
                      padding: '1rem',
                      fontWeight: '700',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      borderRight: '1px solid #e2e8f0'
                    }}
                    onClick={() => handleSort('category')}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    📂 Categoría {getSortIcon('category')}
                  </th>
                  <th 
                    style={{
                      textAlign: 'center',
                      padding: '1rem',
                      fontWeight: '700',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      borderRight: '1px solid #e2e8f0'
                    }}
                    onClick={() => handleSort('price')}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    💰 Precio {getSortIcon('price')}
                  </th>
                  <th 
                    style={{
                      textAlign: 'center',
                      padding: '1rem',
                      fontWeight: '700',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      borderRight: '1px solid #e2e8f0'
                    }}
                    onClick={() => handleSort('predicted_demand')}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    📈 Predicción {getSortIcon('predicted_demand')}
                  </th>
                  <th 
                    style={{
                      textAlign: 'center',
                      padding: '1rem',
                      fontWeight: '700',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      borderRight: '1px solid #e2e8f0'
                    }}
                    onClick={() => handleSort('actual_demand')}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    📊 Real {getSortIcon('actual_demand')}
                  </th>
                  <th 
                    style={{
                      textAlign: 'center',
                      padding: '1rem',
                      fontWeight: '700',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      borderRight: '1px solid #e2e8f0'
                    }}
                    onClick={() => handleSort('accuracy')}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    🎯 Precisión {getSortIcon('accuracy')}
                  </th>
                  <th 
                    style={{
                      textAlign: 'center',
                      padding: '1rem',
                      fontWeight: '700',
                      color: '#374151',
                      borderRight: '1px solid #e2e8f0'
                    }}
                  >
                    ⚡ Estado
                  </th>
                  <th 
                    style={{
                      textAlign: 'center',
                      padding: '1rem',
                      fontWeight: '700',
                      color: '#374151'
                    }}
                  >
                    🕐 Actualizado
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr 
                    key={item.id} 
                    style={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                      e.currentTarget.style.transform = 'scale(1.01)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <td style={{ 
                      padding: '1rem', 
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      {item.id}
                    </td>
                    <td style={{ 
                      padding: '1rem',
                      color: '#374151'
                    }}>
                      {item.name}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        fontSize: '0.75rem',
                        borderRadius: '9999px',
                        fontWeight: '500'
                      }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ 
                      textAlign: 'center', 
                      padding: '1rem',
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      ${item.price}
                    </td>
                    <td style={{ 
                      textAlign: 'center', 
                      padding: '1rem', 
                      fontWeight: '600',
                      color: '#3b82f6'
                    }}>
                      {item.predicted_demand}
                    </td>
                    <td style={{ 
                      textAlign: 'center', 
                      padding: '1rem', 
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      {item.actual_demand}
                    </td>
                    <td style={{ textAlign: 'center', padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        borderRadius: '9999px',
                        fontWeight: '500',
                        backgroundColor: item.accuracy >= 90 ? '#d1fae5' : item.accuracy >= 80 ? '#fef3c7' : '#fee2e2',
                        color: item.accuracy >= 90 ? '#065f46' : item.accuracy >= 80 ? '#92400e' : '#991b1b'
                      }}>
                        {item.accuracy}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        borderRadius: '9999px',
                        fontWeight: '500',
                        backgroundColor: item.status === 'Normal' ? '#d1fae5' : '#fee2e2',
                        color: item.status === 'Normal' ? '#065f46' : '#991b1b'
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ 
                      textAlign: 'center', 
                      padding: '1rem',
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      {item.last_updated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Paginación */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          fontSize: '0.875rem', 
          color: '#6b7280',
          fontWeight: '500'
        }}>
          📄 Página {currentPage} de {totalPages} ({filteredData.length} registros)
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem',
              backgroundColor: currentPage === 1 ? '#f9fafb' : '#ffffff',
              color: currentPage === 1 ? '#9ca3af' : '#374151',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
              transition: 'all 0.2s ease',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.borderColor = '#9ca3af';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.borderColor = '#d1d5db';
              }
            }}
          >
            ← Anterior
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            const isActive = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: '0.75rem 1rem',
                  border: `1px solid ${isActive ? '#3b82f6' : '#d1d5db'}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: isActive ? '#3b82f6' : '#ffffff',
                  color: isActive ? '#ffffff' : '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: isActive ? '600' : '500',
                  minWidth: '40px'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.borderColor = '#9ca3af';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.borderColor = '#d1d5db';
                  }
                }}
              >
                {page}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem',
              backgroundColor: currentPage === totalPages ? '#f9fafb' : '#ffffff',
              color: currentPage === totalPages ? '#9ca3af' : '#374151',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1,
              transition: 'all 0.2s ease',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.borderColor = '#9ca3af';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.borderColor = '#d1d5db';
              }
            }}
          >
            Siguiente →
          </button>
        </div>
      </div>

    </div>
  );
};

export default DataView;