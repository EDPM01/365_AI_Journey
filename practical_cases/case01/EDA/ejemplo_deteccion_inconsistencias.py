"""
Ejemplo de Detección de Inconsistencias en Datos
==============================================

Este script demuestra cómo usar el detector de inconsistencias
integrado en la pipeline de limpieza de datos.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sys
from pathlib import Path

# Agregar el directorio actual al path
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

from data_cleaning_pipeline import DataCleaningPipeline
from inconsistency_detector import (
    InconsistencyDetector, 
    MEGAMERCADO_BUSINESS_RULES,
    precio_mayor_que_costo,
    edad_coherente,
    email_unico_por_cliente
)


def crear_datos_con_inconsistencias():
    """
    Crea datasets de ejemplo con inconsistencias intencionadas para demostrar la detección.
    """
    # Dataset de clientes con inconsistencias
    clientes_data = {
        'id_cliente': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        'nombre': ['Juan Pérez', 'MARÍA GONZÁLEZ', 'pedro lópez', '  Ana Silva  ', 'Luis RODRÍGUEZ', 
                  'Carmen Morales', 'José García', 'Laura Fernández', 'Miguel Torres', 'Sofía Ruiz'],
        'email': ['juan@email.com', 'maria@gmail.com', 'pedro@invalid', 'ana@email.com', 'luis@email.com',
                 'carmen@email.com', 'jose@', 'laura@email.com', 'miguel@email.com', 'ana@email.com'],  # Email duplicado
        'edad': [25, 30, -5, 200, 28, 35, 22, 150, 40, 25],  # Edades negativas y muy altas
        'telefono': ['123-456-7890', '987654321', 'INVALID', '555-0123', '', 
                    '111-222-3333', '+1-555-0199', 'NO_PHONE', '444-555-6666', '777-888-9999'],
        'fecha_nacimiento': ['1998-01-15', '1993-05-20', '2030-12-01', '1800-01-01', '1995-03-10',  # Fecha futura y muy antigua
                           '1988-07-25', '2001-11-30', '1850-06-15', '1983-09-12', '1998-04-20'],
        'ciudad': ['Madrid', 'barcelona', 'VALENCIA', 'madrid', 'Sevilla',
                  'Bilbao', 'málaga', 'ZARAGOZA', 'Murcia', 'Palma']
    }
    
    # Dataset de productos con inconsistencias
    productos_data = {
        'id_producto': [101, 102, 103, 104, 105, 106, 107, 108, 109, 110],
        'nombre': ['Laptop Dell', 'mouse USB', 'TECLADO MECÁNICO', '  Monitor 24"  ', 'Smartphone Samsung',
                  'Tablet Apple', 'auriculares bluetooth', 'WEBCAM HD', 'Impresora HP', 'Router WiFi'],
        'categoria': ['Electrónicos', 'electronico', 'ELECTRONICO', 'Electrónicos', 'Teléfonos',
                     'Tablets', 'Audio', 'video', 'IMPRESORAS', 'Redes'],
        'precio': [899.99, 25.50, 150.00, 299.99, 699.00, 499.99, 89.99, 75.00, 199.99, 129.99],
        'costo': [750.00, 15.00, 180.00, 200.00, 500.00, 400.00, 60.00, 90.00, 150.00, 100.00],  # Algunos costos > precio
        'stock': [50, 100, -5, 25, 75, 30, 200, -10, 40, 60],  # Stock negativo
        'marca': ['Dell', 'genérica', 'CORSAIR', 'LG', 'Samsung', 'Apple', 'sony', 'LOGITECH', 'HP', 'TP-Link'],
        'id_proveedor': [1, 2, 3, 99, 5, 6, 7, 88, 9, 10]  # Proveedores que no existen
    }
    
    # Dataset de ventas con inconsistencias temporales
    base_date = datetime.now() - timedelta(days=365)
    ventas_data = {
        'id_venta': [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010],
        'id_cliente': [1, 2, 99, 4, 5, 6, 88, 8, 9, 10],  # Clientes que no existen
        'id_producto': [101, 102, 103, 199, 105, 106, 107, 188, 109, 110],  # Productos que no existen
        'fecha_pedido': [(base_date + timedelta(days=i*30)).strftime('%Y-%m-%d') for i in range(10)],
        'fecha_entrega': [
            (base_date + timedelta(days=i*30 - 5)).strftime('%Y-%m-%d') if i in [2, 7] 
            else (base_date + timedelta(days=i*30 + 5)).strftime('%Y-%m-%d') 
            for i in range(10)  # Algunas entregas antes del pedido
        ],
        'cantidad': [1, 2, 0, 5, 1, 3, -2, 4, 1, 2],  # Cantidades negativas y cero
        'precio_unitario': [899.99, 25.50, 150.00, 299.99, 699.00, 499.99, 89.99, 75.00, 199.99, 129.99],
        'total': [899.99, 51.00, 0.00, 1499.95, 699.00, 1499.97, -179.98, 300.00, 199.99, 259.98],
        'estado': ['Entregado', 'pendiente', 'CANCELADO', 'Entregado', 'En tránsito',
                  'entregado', 'PENDIENTE', 'Cancelado', 'EN_TRANSITO', 'Delivered']  # Inconsistencias de formato
    }
    
    # Dataset de proveedores
    proveedores_data = {
        'id_proveedor': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        'nombre': ['TechSupply', 'ElectroWorld', 'GadgetCorp', 'DeviceHub', 'TechMart',
                  'ElectroSupply', 'GizmoStore', 'TechSource', 'DeviceWorld', 'GadgetSupply'],
        'contacto': ['Juan Pérez', 'María López', 'Carlos García', 'Ana Martín', 'Luis Silva',
                    'Carmen Ruiz', 'José Moreno', 'Laura Torres', 'Miguel Díaz', 'Sofía Vega'],
        'email': ['juan@techsupply.com', 'maria@invalid', 'carlos@gadgetcorp.com', '', 'luis@techmart.com',
                 'carmen@electro.com', 'jose@', 'laura@techsource.com', 'miguel@device.com', 'sofia@gadget.com'],
        'telefono': ['555-0101', 'INVALID', '555-0103', '555-0104', '',
                    '555-0106', '555-0107', '555-0108', '555-0109', '555-0110']
    }
    
    # Crear DataFrames
    datasets = {
        'clientes': pd.DataFrame(clientes_data),
        'productos': pd.DataFrame(productos_data),
        'ventas': pd.DataFrame(ventas_data),
        'proveedores': pd.DataFrame(proveedores_data)
    }
    
    return datasets


def ejemplo_deteccion_basica():
    """
    Ejemplo básico de detección de inconsistencias.
    """
    print("🔍 EJEMPLO 1: DETECCIÓN BÁSICA DE INCONSISTENCIAS")
    print("=" * 60)
    
    # Crear datos con inconsistencias
    datasets = crear_datos_con_inconsistencias()
    
    # Crear detector
    detector = InconsistencyDetector()
    
    # Ejecutar detección en un dataset
    print("\n📊 Analizando dataset de clientes...")
    inconsistencies = detector.detect_format_inconsistencies(datasets['clientes'], 'clientes')
    inconsistencies.extend(detector.detect_range_inconsistencies(datasets['clientes'], 'clientes'))
    inconsistencies.extend(detector.detect_temporal_inconsistencies(datasets['clientes'], 'clientes'))
    
    print(f"✅ Encontradas {len(inconsistencies)} inconsistencias en clientes")
    
    for inc in inconsistencies[:3]:  # Mostrar solo las primeras 3
        print(f"\n🚨 {inc.type}")
        print(f"   Severidad: {inc.severity}")
        print(f"   Columna: {inc.column}")
        print(f"   Descripción: {inc.description}")
        print(f"   Casos: {inc.count}")
        print(f"   Ejemplos: {inc.examples[:3]}")
    
    return inconsistencies


def ejemplo_deteccion_completa():
    """
    Ejemplo de detección completa con la pipeline integrada.
    """
    print("\n🔍 EJEMPLO 2: DETECCIÓN COMPLETA CON PIPELINE")
    print("=" * 60)
    
    # Crear datos con inconsistencias
    datasets = crear_datos_con_inconsistencias()
    
    # Guardar temporalmente los datos (simular archivos)
    temp_path = Path(__file__).parent / "temp_data"
    temp_path.mkdir(exist_ok=True)
    
    file_mapping = {}
    for name, df in datasets.items():
        file_path = temp_path / f"{name}.csv"
        df.to_csv(file_path, index=False)
        file_mapping[name] = f"temp_data/{name}.csv"
    
    try:
        # Crear pipeline con detección de inconsistencias activada
        pipeline = DataCleaningPipeline(str(Path(__file__).parent))
        
        print("🔄 Ejecutando pipeline con detección de inconsistencias...")
        
        # Ejecutar pipeline completo con detección
        clean_data = pipeline.run_complete_pipeline(
            file_mapping,
            detect_inconsistencies=True
        )
        
        # Mostrar resumen de inconsistencias
        if 'inconsistencies' in pipeline.cleaning_report:
            summary = pipeline.cleaning_report['inconsistencies']['summary']
            print(f"\n📊 RESUMEN DE INCONSISTENCIAS:")
            print(f"Total: {summary['total']}")
            
            for severity, count in summary['by_severity'].items():
                icon = {'CRITICAL': '🔴', 'HIGH': '🟠', 'MEDIUM': '🟡', 'LOW': '🟢'}.get(severity, '⚪')
                print(f"{icon} {severity}: {count}")
            
            print(f"\n📋 Por tabla:")
            for table, count in summary['by_table'].items():
                print(f"  {table}: {count}")
        
        return clean_data
        
    finally:
        # Limpiar archivos temporales
        import shutil
        if temp_path.exists():
            shutil.rmtree(temp_path)


def ejemplo_reglas_personalizadas():
    """
    Ejemplo de detección con reglas de negocio personalizadas.
    """
    print("\n🔍 EJEMPLO 3: REGLAS DE NEGOCIO PERSONALIZADAS")
    print("=" * 60)
    
    # Crear datos con inconsistencias
    datasets = crear_datos_con_inconsistencias()
    
    # Crear detector
    detector = InconsistencyDetector()
    
    # Añadir reglas de negocio personalizadas
    detector.add_business_rule('productos', 'precio_vs_costo', precio_mayor_que_costo, 'HIGH')
    detector.add_business_rule('clientes', 'email_unico', email_unico_por_cliente, 'CRITICAL')
    
    # Añadir referencias de integridad
    detector.add_reference_mapping('ventas', 'clientes', 'id_cliente', 'id_cliente')
    detector.add_reference_mapping('ventas', 'productos', 'id_producto', 'id_producto')
    detector.add_reference_mapping('productos', 'proveedores', 'id_proveedor', 'id_proveedor')
    
    print("✅ Reglas de negocio y referencias configuradas")
    
    # Ejecutar detección completa
    all_inconsistencies = detector.run_full_inconsistency_detection(datasets)
    
    print(f"\n📊 RESULTADOS POR TIPO DE INCONSISTENCIA:")
    
    # Agrupar por tipo
    by_type = {}
    for table_inconsistencies in all_inconsistencies.values():
        for inc in table_inconsistencies:
            if inc.type not in by_type:
                by_type[inc.type] = []
            by_type[inc.type].append(inc)
    
    for inc_type, incidents in by_type.items():
        print(f"\n🚨 {inc_type}: {len(incidents)} casos")
        
        # Mostrar ejemplo más crítico
        critical_incident = min(incidents, key=lambda x: {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}[x.severity])
        print(f"   Más crítico: {critical_incident.table}.{critical_incident.column}")
        print(f"   Descripción: {critical_incident.description}")
        print(f"   Acción: {critical_incident.suggested_action}")
    
    # Generar reporte completo
    print("\n📄 Generando reporte completo...")
    report = detector.generate_inconsistency_report()
    
    # Guardar reporte
    report_path = Path(__file__).parent / "inconsistencies_example_report.txt"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"📁 Reporte guardado en: {report_path}")
    
    return all_inconsistencies


def ejemplo_validacion_continua():
    """
    Ejemplo de cómo usar la detección de inconsistencias para validación continua.
    """
    print("\n🔍 EJEMPLO 4: VALIDACIÓN CONTINUA DE CALIDAD")
    print("=" * 60)
    
    # Simular datasets que llegan periódicamente
    datasets_scenarios = [
        {
            'name': 'Datos Buenos',
            'data': {
                'clientes': pd.DataFrame({
                    'id_cliente': [1, 2, 3],
                    'nombre': ['Juan Pérez', 'María González', 'Carlos López'],
                    'email': ['juan@email.com', 'maria@email.com', 'carlos@email.com'],
                    'edad': [25, 30, 35]
                })
            }
        },
        {
            'name': 'Datos con Problemas Menores',
            'data': {
                'clientes': pd.DataFrame({
                    'id_cliente': [1, 2, 3],
                    'nombre': ['juan pérez', 'MARÍA GONZÁLEZ', '  carlos lópez  '],  # Formato inconsistente
                    'email': ['juan@email.com', 'maria@email.com', 'carlos@email.com'],
                    'edad': [25, 30, 35]
                })
            }
        },
        {
            'name': 'Datos con Problemas Críticos',
            'data': {
                'clientes': pd.DataFrame({
                    'id_cliente': [1, 2, 3],
                    'nombre': ['Juan Pérez', 'María González', 'Carlos López'],
                    'email': ['juan@email.com', 'maria@email.com', 'juan@email.com'],  # Email duplicado
                    'edad': [25, 200, -5]  # Edades inválidas
                })
            }
        }
    ]
    
    # Configurar detector
    detector = InconsistencyDetector()
    detector.add_business_rule('clientes', 'email_unico', email_unico_por_cliente, 'CRITICAL')
    
    print("📊 VALIDANDO CALIDAD DE DATOS POR LOTES:")
    
    results = []
    
    for scenario in datasets_scenarios:
        print(f"\n🔄 Procesando: {scenario['name']}")
        
        # Detectar inconsistencias
        inconsistencies = detector.run_full_inconsistency_detection(scenario['data'])
        summary = detector.get_inconsistencies_summary()
        
        # Evaluar calidad
        total_inconsistencies = summary['total']
        critical_count = summary['by_severity'].get('CRITICAL', 0)
        high_count = summary['by_severity'].get('HIGH', 0)
        
        # Determinar estado de calidad
        if critical_count > 0:
            status = "🔴 RECHAZADO - Problemas críticos"
            action = "Rechazar lote y notificar al equipo de datos"
        elif high_count > 5:
            status = "🟠 REVISIÓN - Muchos problemas de alta prioridad"
            action = "Revisar manualmente antes de procesar"
        elif total_inconsistencies > 0:
            status = "🟡 ACEPTADO CON OBSERVACIONES - Problemas menores"
            action = "Procesar con limpieza automática"
        else:
            status = "🟢 ACEPTADO - Calidad excelente"
            action = "Procesar normalmente"
        
        print(f"   Estado: {status}")
        print(f"   Inconsistencias: {total_inconsistencies}")
        print(f"   Acción: {action}")
        
        results.append({
            'scenario': scenario['name'],
            'total_inconsistencies': total_inconsistencies,
            'critical': critical_count,
            'high': high_count,
            'status': status,
            'action': action
        })
    
    print(f"\n📋 RESUMEN DE VALIDACIÓN:")
    print("=" * 50)
    for result in results:
        print(f"{result['scenario']}: {result['total_inconsistencies']} inconsistencias")
        print(f"  Críticas: {result['critical']}, Altas: {result['high']}")
        print(f"  Acción: {result['action']}")
        print()
    
    return results


def main():
    """
    Ejecuta todos los ejemplos de detección de inconsistencias.
    """
    print("🚨 EJEMPLOS DE DETECCIÓN DE INCONSISTENCIAS EN DATOS")
    print("=" * 70)
    print("Este script demuestra las capacidades avanzadas de detección")
    print("de inconsistencias integradas en la pipeline de limpieza.\n")
    
    try:
        # Ejemplo 1: Detección básica
        ejemplo_deteccion_basica()
        
        # Ejemplo 2: Detección integrada en pipeline
        ejemplo_deteccion_completa()
        
        # Ejemplo 3: Reglas personalizadas
        ejemplo_reglas_personalizadas()
        
        # Ejemplo 4: Validación continua
        ejemplo_validacion_continua()
        
        print("\n🎉 TODOS LOS EJEMPLOS COMPLETADOS EXITOSAMENTE")
        print("=" * 50)
        
        print("\n💡 CONCLUSIONES:")
        print("• La pipeline puede detectar múltiples tipos de inconsistencias")
        print("• Las reglas de negocio son personalizables por dominio")
        print("• La detección se integra perfectamente con la limpieza")
        print("• Los reportes proporcionan acciones claras para remediar problemas")
        print("• La validación continua permite control de calidad automatizado")
        
    except Exception as e:
        print(f"\n❌ Error ejecutando ejemplos: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()