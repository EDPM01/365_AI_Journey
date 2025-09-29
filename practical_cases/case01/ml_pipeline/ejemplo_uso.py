# 🚀 Ejemplo de Uso del Pipeline ML - MegaMercado
"""
Ejemplo completo de cómo usar el pipeline de Machine Learning
para el caso de predicción de demanda de MegaMercado
"""

import sys
import os
from pathlib import Path

# Añadir el directorio del pipeline al path
pipeline_dir = Path(__file__).parent
sys.path.append(str(pipeline_dir))

from pipeline import create_demand_prediction_pipeline, MLPipeline
from config import get_config

def ejemplo_pipeline_completo():
    """
    Ejemplo de ejecución completa del pipeline
    """
    print("🏪 === PIPELINE ML MEGAMERCADO ===")
    print("🚀 Iniciando ejemplo de predicción de demanda")
    
    # 1. Configurar rutas de datos
    print("\n📁 Configurando rutas de datos...")
    
    base_dir = Path(__file__).parent.parent  # Directorio del caso práctico
    
    data_files = {
        'ventas': str(base_dir / 'ventas.csv'),
        'productos': str(base_dir / 'productos.csv'),
        'clientes': str(base_dir / 'clientes.csv'),
        'logistica': str(base_dir / 'logistica.csv'),
        'proveedores': str(base_dir / 'proveedores.csv')
    }
    
    # Verificar que los archivos existan
    archivos_disponibles = {}
    for nombre, ruta in data_files.items():
        if os.path.exists(ruta):
            archivos_disponibles[nombre] = ruta
            print(f"✅ {nombre}: {ruta}")
        else:
            print(f"⚠️  {nombre}: {ruta} (no encontrado)")
    
    if not archivos_disponibles:
        print("❌ No se encontraron archivos de datos")
        return
    
    # 2. Crear pipeline
    print("\n🔧 Creando pipeline de predicción de demanda...")
    
    try:
        pipeline = create_demand_prediction_pipeline(
            archivos_disponibles, 
            'development'  # Usar configuración de desarrollo
        )
        print("✅ Pipeline creado correctamente")
    except Exception as e:
        print(f"❌ Error creando pipeline: {e}")
        return
    
    # 3. Ejecutar pipeline completo
    print("\n🚀 Ejecutando pipeline completo...")
    
    try:
        # Especificar modelos a entrenar (reducir para ejemplo rápido)
        modelos_ejemplo = [
            'linear_regression',
            'random_forest',
            'xgboost'
        ]
        
        resultados = pipeline.run_full_pipeline(
            archivos_disponibles,
            target_column='cantidad_vendida',
            models_to_train=modelos_ejemplo,
            generate_final_report=True
        )
        
        # 4. Mostrar resultados principales
        print("\n📊 === RESULTADOS DEL PIPELINE ===")
        
        # Información del preprocesamiento
        if 'preprocessing' in resultados:
            prep_info = resultados['preprocessing']
            print(f"🔄 Datos procesados: {prep_info.get('final_shape', 'N/A')}")
            print(f"📈 Features: {prep_info.get('features_count', 'N/A')}")
            print(f"🎯 Target: {prep_info.get('target_column', 'N/A')}")
        
        # Información del entrenamiento
        if 'training' in resultados:
            train_info = resultados['training']
            print(f"🤖 Modelos entrenados: {len(train_info.get('successful_models', []))}")
            print(f"🏆 Mejor modelo: {train_info.get('best_model', 'N/A')}")
        
        # Métricas de evaluación
        if 'evaluation' in resultados:
            eval_info = resultados['evaluation']
            if 'test_metrics' in eval_info:
                metrics = eval_info['test_metrics']
                print("\n📈 Métricas del mejor modelo:")
                print(f"   RMSE: {metrics.get('rmse', 'N/A'):.4f}")
                print(f"   MAE: {metrics.get('mae', 'N/A'):.4f}")
                print(f"   R²: {metrics.get('r2', 'N/A'):.4f}")
                print(f"   MAPE: {metrics.get('mape', 'N/A'):.2f}%")
        
        # Información del resumen ejecutivo
        if 'executive_summary' in resultados:
            summary = resultados['executive_summary']
            print(f"\n⏱️  Duración total: {summary.get('duracion_total', 'N/A')}")
        
        print("\n🎉 ¡Pipeline ejecutado exitosamente!")
        print("📋 Revisa la carpeta 'reports' para gráficas y reportes detallados")
        print("💾 Los modelos entrenados están en la carpeta 'models'")
        
    except Exception as e:
        print(f"❌ Error ejecutando pipeline: {e}")
        import traceback
        traceback.print_exc()

def ejemplo_pipeline_personalizado():
    """
    Ejemplo de pipeline personalizado paso a paso
    """
    print("\n🔧 === PIPELINE PERSONALIZADO ===")
    
    # Configuración personalizada
    config_personalizada = {
        'TARGET_COLUMN': 'cantidad_vendida',
        'HYPERPARAMETER_TUNING': False,  # Desactivar para ejemplo rápido
        'CV_FOLDS': 3,  # Reducir para ejemplo rápido
        'LOG_LEVEL': 'INFO'
    }
    
    # Crear pipeline con configuración personalizada
    pipeline = MLPipeline('development', config_personalizada)
    
    print("✅ Pipeline personalizado creado")
    print("🔧 Configuración: Entrenamiento rápido sin optimización de hiperparámetros")

def ejemplo_predicciones():
    """
    Ejemplo de cómo realizar predicciones con un modelo entrenado
    """
    print("\n🔮 === EJEMPLO DE PREDICCIONES ===")
    
    try:
        # Cargar un modelo previamente entrenado
        models_dir = Path(__file__).parent.parent / 'models'
        
        if models_dir.exists():
            # Buscar modelo guardado
            model_files = list(models_dir.glob('*.pkl'))
            
            if model_files:
                print(f"📂 Modelos disponibles: {len(model_files)}")
                # En un caso real, cargarías el modelo y realizarías predicciones
                print("💡 Para usar: pipeline.predict_new_data(nuevos_datos)")
            else:
                print("⚠️  No se encontraron modelos entrenados")
        else:
            print("⚠️  Directorio de modelos no existe. Ejecuta primero el entrenamiento")
            
    except Exception as e:
        print(f"❌ Error en ejemplo de predicciones: {e}")

def mostrar_configuraciones_disponibles():
    """
    Muestra las configuraciones disponibles del pipeline
    """
    print("\n⚙️  === CONFIGURACIONES DISPONIBLES ===")
    
    # Configuración de desarrollo
    dev_config = get_config('development')
    print("🔧 Configuración de Desarrollo:")
    print(f"   - Hyperparameter Tuning: {dev_config.HYPERPARAMETER_TUNING}")
    print(f"   - CV Folds: {dev_config.CV_FOLDS}")
    print(f"   - Log Level: {dev_config.LOG_LEVEL}")
    
    # Configuración de producción
    prod_config = get_config('production')
    print("\n🏭 Configuración de Producción:")
    print(f"   - Hyperparameter Tuning: {prod_config.HYPERPARAMETER_TUNING}")
    print(f"   - CV Folds: {prod_config.CV_FOLDS}")
    print(f"   - Log Level: {prod_config.LOG_LEVEL}")
    
    print("\n📋 Modelos disponibles:")
    for model_name in dev_config.MODELS_CONFIG.keys():
        print(f"   - {model_name}")

def main():
    """
    Función principal del ejemplo
    """
    print("🏪 SISTEMA DE MACHINE LEARNING - MEGAMERCADO")
    print("=" * 50)
    
    # Mostrar opciones
    print("\n📋 Opciones disponibles:")
    print("1️⃣  Ejecutar pipeline completo")
    print("2️⃣  Ejemplo de pipeline personalizado")
    print("3️⃣  Mostrar configuraciones")
    print("4️⃣  Ejemplo de predicciones")
    
    # En un entorno interactivo, podrías pedir input del usuario
    # Para este ejemplo, ejecutamos el pipeline completo
    
    try:
        mostrar_configuraciones_disponibles()
        ejemplo_pipeline_completo()
        ejemplo_pipeline_personalizado()
        ejemplo_predicciones()
        
    except KeyboardInterrupt:
        print("\n⏹️  Ejecución interrumpida por el usuario")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()