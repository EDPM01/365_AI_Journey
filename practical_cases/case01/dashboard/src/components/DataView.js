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
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📊 Vista de Datos del Modelo
        </h1>
        <p className="text-gray-600">
          Explorar y analizar los datos de predicciones del modelo
        </p>
      </div>

      {/* Controles de filtrado y paginación */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Filtros */}
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">Todas</option>
                  <option value="Electrónicos">Electrónicos</option>
                  <option value="Ropa">Ropa</option>
                  <option value="Hogar">Hogar</option>
                  <option value="Deportes">Deportes</option>
                  <option value="Libros">Libros</option>
                  <option value="Belleza">Belleza</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Elementos por página
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="text-sm text-gray-600">
              Mostrando {startIndex + 1}-{Math.min(startIndex + pageSize, filteredData.length)} de {filteredData.length} elementos
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de datos */}
      <div className="card">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('id')}
                  >
                    ID {getSortIcon('id')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Producto {getSortIcon('name')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('category')}
                  >
                    Categoría {getSortIcon('category')}
                  </th>
                  <th 
                    className="text-center py-3 px-4 font-medium cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('price')}
                  >
                    Precio {getSortIcon('price')}
                  </th>
                  <th 
                    className="text-center py-3 px-4 font-medium cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('predicted_demand')}
                  >
                    Predicción {getSortIcon('predicted_demand')}
                  </th>
                  <th 
                    className="text-center py-3 px-4 font-medium cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('actual_demand')}
                  >
                    Real {getSortIcon('actual_demand')}
                  </th>
                  <th 
                    className="text-center py-3 px-4 font-medium cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('accuracy')}
                  >
                    Precisión {getSortIcon('accuracy')}
                  </th>
                  <th className="text-center py-3 px-4 font-medium">Estado</th>
                  <th className="text-center py-3 px-4 font-medium">Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.id}</td>
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {item.category}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">${item.price}</td>
                    <td className="text-center py-3 px-4 font-medium text-blue-600">
                      {item.predicted_demand}
                    </td>
                    <td className="text-center py-3 px-4 font-medium">
                      {item.actual_demand}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`
                        px-2 py-1 text-xs rounded-full font-medium
                        ${item.accuracy >= 90 ? 'bg-green-100 text-green-800' :
                          item.accuracy >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}
                      `}>
                        {item.accuracy}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`
                        px-2 py-1 text-xs rounded-full font-medium
                        ${item.status === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      `}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 text-gray-500">
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
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Página {currentPage} de {totalPages}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`
                  px-3 py-2 border rounded-lg text-sm
                  ${currentPage === page 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'border-gray-300 hover:bg-gray-50'}
                `}
              >
                {page}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      </div>

    </div>
  );
};

export default DataView;