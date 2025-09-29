"""
Script de Ejemplo: Pipeline de Limpieza de Datos
==============================================

Este script demuestra cómo usar la pipeline de limpieza de datos
para el caso de estudio de MegaMercado.

Ejecutar con: python ejemplo_uso_pipeline.py
"""

import os
import sys
from pathlib import Path

# Agregar el directorio actual al path para importar nuestros módulos
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

from data_cleaning_pipeline import DataCleaningPipeline, quick_clean_dataframe, analyze_dataset_quality
from config import ECOMMERCE_CONFIG, MEGAMERCADO_FILES, STRICT_CLEANING, get_config_by_domain


def ejemplo_pipeline_completo():
    """
    Ejemplo del pipeline completo de limpieza para MegaMercado.
    """
    print("🚀 INICIANDO EJEMPLO DE PIPELINE COMPLETO")
    print("=" * 60)
    
    # Configurar rutas
    BASE_PATH = r"C:\Users\emili\OneDrive\Desktop\Hola Mundo\365_AI_Journey\practical_cases\case01"
    
    try:
        # Crear pipeline con logging detallado
        pipeline = DataCleaningPipeline(BASE_PATH, log_level='INFO')
        
        # Usar configuración predefinida para ecommerce
        config = get_config_by_domain('ecommerce')
        
        print("📋 Configuración aplicada:")
        for dataset, dataset_config in config.items():
            print(f"  {dataset}: {dataset_config.get('missing_strategy', 'default')}")
        
        print("\n🔄 Ejecutando pipeline...")
        
        # Ejecutar pipeline completo
        clean_datasets = pipeline.run_complete_pipeline(
            MEGAMERCADO_FILES, 
            config
        )
        
        print("\n📊 RESULTADOS DEL PIPELINE:")
        print("=" * 40)
        
        for dataset_name, df in clean_datasets.items():
            print(f"{dataset_name}: {len(df):,} registros limpios")
        
        # Generar y mostrar reporte
        print("\n" + pipeline.generate_cleaning_report())
        
        # Guardar datos limpios
        output_dir = os.path.join(BASE_PATH, "EDA", "datos_limpios")
        pipeline.save_clean_data(output_dir)
        
        print(f"\n💾 Datos guardados en: {output_dir}")
        
        return clean_datasets
        
    except Exception as e:
        print(f"❌ Error en el ejemplo: {e}")
        return None


def ejemplo_limpieza_individual():
    """
    Ejemplo de limpieza rápida de un dataset individual.
    """
    print("\n🔧 EJEMPLO DE LIMPIEZA INDIVIDUAL")
    print("=" * 40)
    
    import pandas as pd
    
    # Crear datos de ejemplo con problemas típicos
    data_sucia = {
        'id': [1, 2, 3, 4, 5, 5, 7, 8, 9, 10],  # Duplicado
        'nombre': ['Juan  ', ' María', 'Pedro', None, 'Ana', 'Ana', '  Luis', 'Carmen', 'José', ''],
        'edad': [25, None, 35, 40, 28, 28, 150, 22, 30, 45],  # Outlier: 150
        'salario': [50000, 45000, None, 80000, 55000, 55000, 60000, None, 70000, 75000],
        'email': ['juan@email.com', 'maria@', 'pedro@email.com', None, 'ana@email.com', 'ana@email.com', 'luis@email.com', '', 'jose@email.com', 'carmen@email.com']
    }
    
    df_original = pd.DataFrame(data_sucia)
    
    print("📋 Dataset original:")
    print(df_original)
    print(f"\nForma: {df_original.shape}")
    
    # Analizar calidad inicial
    analyze_dataset_quality(df_original, "Datos Ejemplo")
    
    # Aplicar limpieza rápida
    print("\n🧹 Aplicando limpieza...")
    
    df_limpio = quick_clean_dataframe(
        df_original, 
        strategy='smart',  # Estrategia inteligente
        remove_duplicates=True
    )
    
    print("\n✅ Dataset limpio:")
    print(df_limpio)
    print(f"\nForma final: {df_limpio.shape}")
    
    # Analizar calidad final
    analyze_dataset_quality(df_limpio, "Datos Limpios")
    
    return df_limpio


def ejemplo_configuracion_personalizada():
    """
    Ejemplo de configuración personalizada para casos específicos.
    """
    print("\n⚙️ EJEMPLO DE CONFIGURACIÓN PERSONALIZADA")
    print("=" * 45)
    
    BASE_PATH = r"C:\Users\emili\OneDrive\Desktop\Hola Mundo\365_AI_Journey\practical_cases\case01"
    
    # Configuración personalizada más estricta
    config_personalizada = {
        'clientes': {
            'missing_strategy': 'drop_rows',  # Más estricto
            'remove_outliers': True,
            'outlier_columns': ['edad'],
            'outlier_method': 'iqr',
            'outlier_factor': 1.2  # Más agresivo
        },
        'productos': {
            'missing_strategy': 'fill',
            'fill_values': {
                'categoria': 'Sin Categoría',
                'marca': 'Genérica',
                'precio': 0
            },
            'remove_outliers': True,
            'outlier_columns': ['precio', 'stock'],
            'type_mapping': {
                'activo': 'bool',
                'precio': 'float64'
            }
        },
        'ventas': {
            'missing_strategy': 'drop_rows',
            'duplicate_subset': ['id_venta'],  # Eliminar por ID único
            'remove_outliers': True,
            'outlier_columns': ['cantidad', 'total'],
            'type_mapping': {
                'fecha': 'datetime'
            }
        }
    }
    
    try:
        # Crear pipeline
        pipeline = DataCleaningPipeline(BASE_PATH, log_level='DEBUG')
        
        print("🔧 Aplicando configuración personalizada...")
        
        # Solo procesar algunos datasets como ejemplo
        archivos_ejemplo = {
            'clientes': 'clientes.csv',
            'productos': 'productos.csv'
        }
        
        # Ejecutar con configuración personalizada
        datasets_limpios = pipeline.run_complete_pipeline(
            archivos_ejemplo,
            config_personalizada
        )
        
        print("\n📈 Comparación de estrategias:")
        for dataset in datasets_limpios.keys():
            inicial = pipeline.cleaning_report.get(f"{dataset}_inicial", {})
            final = pipeline.cleaning_report.get(f"{dataset}_final", {})
            
            if inicial and final:
                print(f"\n{dataset}:")
                print(f"  Registros: {inicial.get('total_records', 0)} → {final.get('total_records', 0)}")
                print(f"  Duplicados: {inicial.get('duplicates', 0)} → {final.get('duplicates', 0)}")
        
        return datasets_limpios
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None


def ejemplo_validacion_calidad():
    """
    Ejemplo de validación de calidad de datos.
    """
    print("\n🔍 EJEMPLO DE VALIDACIÓN DE CALIDAD")
    print("=" * 40)
    
    import pandas as pd
    
    # Crear datasets con diferentes niveles de calidad
    datasets_ejemplo = {
        'buena_calidad': pd.DataFrame({
            'id': range(1, 101),
            'nombre': [f'Cliente_{i}' for i in range(1, 101)],
            'edad': [20 + (i % 50) for i in range(1, 101)],
            'activo': [True] * 100
        }),
        
        'mala_calidad': pd.DataFrame({
            'id': [1, 2, 2, 4, 5] * 20,  # Muchos duplicados
            'nombre': ['Juan', None, 'Pedro', '', '  '] * 20,  # Muchos nulos
            'edad': [25, None, -5, 200, None] * 20,  # Outliers y nulos
            'salario': [50000, None, None, None, 45000] * 20  # Muchos nulos
        })
    }
    
    # Validar calidad de cada dataset
    for nombre, df in datasets_ejemplo.items():
        print(f"\n📊 Analizando: {nombre}")
        print("-" * 30)
        
        pipeline = DataCleaningPipeline(".")
        reporte = pipeline.analyze_data_quality(df, nombre)
        
        # Calcular métricas de calidad
        total_nulls = sum(info['count'] for info in reporte['missing_values'].values())
        null_percentage = (total_nulls / (len(df) * len(df.columns))) * 100
        duplicate_percentage = (reporte['duplicates'] / len(df)) * 100
        
        print(f"Calidad general: ", end="")
        if null_percentage < 5 and duplicate_percentage < 5:
            print("🟢 EXCELENTE")
        elif null_percentage < 15 and duplicate_percentage < 10:
            print("🟡 BUENA")
        elif null_percentage < 30 and duplicate_percentage < 20:
            print("🟠 REGULAR")
        else:
            print("🔴 MALA")
        
        print(f"Valores nulos: {null_percentage:.1f}%")
        print(f"Duplicados: {duplicate_percentage:.1f}%")


def main():
    """
    Función principal que ejecuta todos los ejemplos.
    """
    print("🎯 EJEMPLOS DE USO: PIPELINE DE LIMPIEZA DE DATOS")
    print("=" * 60)
    
    try:
        # Ejemplo 1: Pipeline completo
        datasets_limpios = ejemplo_pipeline_completo()
        
        # Ejemplo 2: Limpieza individual
        ejemplo_limpieza_individual()
        
        # Ejemplo 3: Configuración personalizada
        ejemplo_configuracion_personalizada()
        
        # Ejemplo 4: Validación de calidad
        ejemplo_validacion_calidad()
        
        print("\n🎉 TODOS LOS EJEMPLOS COMPLETADOS EXITOSAMENTE")
        print("=" * 50)
        
        if datasets_limpios:
            print("\n💡 CONSEJOS:")
            print("• Los datos limpios están guardados en 'datos_limpios/'")
            print("• Revisa 'cleaning_report.txt' para detalles del proceso")
            print("• Ajusta la configuración en 'config.py' según tus necesidades")
            print("• Usa 'data_cleaning.log' para depurar problemas")
        
    except Exception as e:
        print(f"\n❌ Error ejecutando ejemplos: {e}")
        print("Verifica que los archivos de datos estén en la ruta correcta")


if __name__ == "__main__":
    main()