# 🚀 Pipeline Principal de Machine Learning - MegaMercado
"""
Pipeline principal que orquesta todo el proceso de Machine Learning:
- Carga y preprocesamiento de datos
- Entrenamiento de múltiples modelos
- Evaluación y selección del mejor modelo
- Generación de reportes y visualizaciones
"""

import os
import sys
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import pandas as pd
import numpy as np

# Importar módulos del pipeline
from config import MLConfig, get_config, create_directories
from preprocessor import DataPreprocessor
from model_trainer import ModelTrainer

class MLPipeline:
    """
    Clase principal que orquesta todo el pipeline de Machine Learning
    """
    
    def __init__(self, config_name: str = 'development', custom_config: Dict = None):
        """
        Inicializa el pipeline ML
        
        Args:
            config_name: Nombre de la configuración ('development' o 'production')
            custom_config: Configuración personalizada (opcional)
        """
        # Configuración
        self.config = get_config(config_name)
        if custom_config:
            for key, value in custom_config.items():
                setattr(self.config, key, value)
        
        # Setup del pipeline
        self.logger = self._setup_logger()
        self._setup_directories()
        
        # Componentes del pipeline
        self.preprocessor = DataPreprocessor(self.config)
        self.trainer = ModelTrainer(self.config)
        
        # Almacenamiento de resultados
        self.results = {
            'preprocessing': {},
            'training': {},
            'evaluation': {},
            'pipeline_info': {
                'start_time': datetime.now(),
                'config': config_name,
                'pipeline_version': '1.0.0'
            }
        }
        
        self.logger.info("🚀 Pipeline ML inicializado correctamente")
    
    def _setup_logger(self) -> logging.Logger:
        """Configura el sistema de logging"""
        # Crear directorio de logs
        log_dir = Path(self.config.LOGS_DIR)
        log_dir.mkdir(parents=True, exist_ok=True)
        
        # Configurar logger
        logger = logging.getLogger('MLPipeline')
        logger.setLevel(getattr(logging, self.config.LOG_LEVEL))
        
        # Remover handlers existentes
        for handler in logger.handlers[:]:
            logger.removeHandler(handler)
        
        # Handler para consola
        console_handler = logging.StreamHandler()
        console_handler.setLevel(getattr(logging, self.config.LOG_LEVEL))
        
        # Handler para archivo
        log_file = log_dir / f"ml_pipeline_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.INFO)
        
        # Formato
        formatter = logging.Formatter(self.config.LOG_FORMAT)
        console_handler.setFormatter(formatter)
        file_handler.setFormatter(formatter)
        
        # Añadir handlers
        logger.addHandler(console_handler)
        logger.addHandler(file_handler)
        
        return logger
    
    def _setup_directories(self):
        """Crea los directorios necesarios"""
        create_directories(self.config)
        self.logger.info("📁 Directorios creados correctamente")
    
    def load_and_preprocess_data(self, 
                               file_paths: Dict[str, str],
                               target_column: str = None,
                               save_processed: bool = True) -> tuple:
        """
        Carga y preprocesa los datos
        
        Args:
            file_paths: Diccionario con rutas de archivos
            target_column: Nombre de la columna objetivo
            save_processed: Si guardar datos procesados
        
        Returns:
            Tupla con datos procesados (X_train, X_val, X_test, y_train, y_val, y_test)
        """
        self.logger.info("🔄 Iniciando carga y preprocesamiento de datos")
        
        # Usar target por defecto si no se especifica
        if target_column is None:
            target_column = self.config.TARGET_COLUMN
        
        try:
            # Ejecutar pipeline de preprocesamiento
            X_train, X_val, X_test, y_train, y_val, y_test, df_processed = \
                self.preprocessor.full_preprocessing_pipeline(file_paths, target_column)
            
            # Guardar información del preprocesamiento
            self.results['preprocessing'] = {
                'target_column': target_column,
                'original_files': list(file_paths.keys()),
                'final_shape': df_processed.shape,
                'train_samples': len(X_train),
                'val_samples': len(X_val),
                'test_samples': len(X_test),
                'features_count': X_train.shape[1],
                'feature_names': X_train.columns.tolist(),
                'preprocessing_time': datetime.now()
            }
            
            # Guardar datos procesados si se solicita
            if save_processed:
                processed_dir = Path(self.config.PROCESSED_DATA_DIR)
                processed_dir.mkdir(parents=True, exist_ok=True)
                
                # Guardar datasets
                X_train.to_csv(processed_dir / 'X_train.csv', index=False)
                X_val.to_csv(processed_dir / 'X_val.csv', index=False)
                X_test.to_csv(processed_dir / 'X_test.csv', index=False)
                y_train.to_csv(processed_dir / 'y_train.csv', index=False)
                y_val.to_csv(processed_dir / 'y_val.csv', index=False)
                y_test.to_csv(processed_dir / 'y_test.csv', index=False)
                
                # Guardar preprocesador
                self.preprocessor.save_preprocessor(processed_dir / 'preprocessor.pkl')
                
                self.logger.info(f"💾 Datos procesados guardados en: {processed_dir}")
            
            self.logger.info("✅ Preprocesamiento completado exitosamente")
            return X_train, X_val, X_test, y_train, y_val, y_test
            
        except Exception as e:
            self.logger.error(f"❌ Error en preprocesamiento: {e}")
            raise
    
    def train_models(self, 
                    X_train: pd.DataFrame, 
                    y_train: pd.Series,
                    X_val: pd.DataFrame = None, 
                    y_val: pd.Series = None,
                    models_to_train: List[str] = None,
                    save_models: bool = True) -> Dict:
        """
        Entrena múltiples modelos de ML
        
        Args:
            X_train: Features de entrenamiento
            y_train: Target de entrenamiento
            X_val: Features de validación
            y_val: Target de validación
            models_to_train: Lista de modelos a entrenar
            save_models: Si guardar los modelos entrenados
        
        Returns:
            Diccionario con resultados del entrenamiento
        """
        self.logger.info("🤖 Iniciando entrenamiento de modelos")
        
        try:
            # Entrenar modelos
            training_results = self.trainer.train_multiple_models(
                X_train, y_train, X_val, y_val, models_to_train
            )
            
            # Guardar resultados del entrenamiento
            self.results['training'] = {
                'models_trained': list(training_results.keys()),
                'successful_models': [name for name, result in training_results.items() 
                                   if result.get('success', False)],
                'best_model': None,
                'training_time': datetime.now(),
                'results_summary': {}
            }
            
            # Encontrar mejor modelo
            if self.trainer.best_model:
                best_model_name = None
                for name, model in self.trainer.trained_models.items():
                    if model == self.trainer.best_model:
                        best_model_name = name
                        break
                
                self.results['training']['best_model'] = best_model_name
                self.logger.info(f"🏆 Mejor modelo identificado: {best_model_name}")
            
            # Crear reporte de comparación
            comparison_df = self.trainer.create_model_comparison_report()
            if not comparison_df.empty:
                self.results['training']['comparison_report'] = comparison_df.to_dict()
            
            # Guardar modelos si se solicita
            if save_models:
                models_dir = Path(self.config.MODELS_DIR)
                self.trainer.save_all_results(str(models_dir))
            
            self.logger.info("✅ Entrenamiento de modelos completado")
            return training_results
            
        except Exception as e:
            self.logger.error(f"❌ Error en entrenamiento: {e}")
            raise
    
    def evaluate_best_model(self, 
                          X_test: pd.DataFrame, 
                          y_test: pd.Series,
                          generate_plots: bool = True) -> Dict:
        """
        Evalúa el mejor modelo en el conjunto de prueba
        
        Args:
            X_test: Features de prueba
            y_test: Target de prueba
            generate_plots: Si generar gráficas de evaluación
        
        Returns:
            Diccionario con resultados de evaluación
        """
        self.logger.info("📊 Evaluando mejor modelo en conjunto de prueba")
        
        if not self.trainer.best_model:
            raise ValueError("No hay mejor modelo disponible. Ejecute primero train_models()")
        
        try:
            # Obtener nombre del mejor modelo
            best_model_name = self.results['training']['best_model']
            
            # Evaluar modelo
            evaluation_results = self.trainer.evaluate_model(
                self.trainer.best_model, 
                X_test, 
                y_test, 
                best_model_name
            )
            
            # Guardar resultados
            self.results['evaluation'] = evaluation_results
            
            # Generar visualizaciones
            if generate_plots:
                reports_dir = Path(self.config.REPORTS_DIR)
                reports_dir.mkdir(parents=True, exist_ok=True)
                
                # Gráfica de predicciones vs reales
                pred_plot_path = reports_dir / f"{best_model_name}_predictions.png"
                self.trainer.plot_predictions_vs_actual(
                    self.trainer.best_model, 
                    X_test, 
                    y_test,
                    best_model_name,
                    str(pred_plot_path)
                )
                
                # Comparación de modelos
                comparison_plot_path = reports_dir / "models_comparison.png"
                self.trainer.plot_model_comparison(str(comparison_plot_path))
            
            # Log de métricas principales
            metrics = evaluation_results['test_metrics']
            self.logger.info("📈 Métricas del mejor modelo en prueba:")
            self.logger.info(f"  RMSE: {metrics['rmse']:.4f}")
            self.logger.info(f"  MAE: {metrics['mae']:.4f}")
            self.logger.info(f"  R²: {metrics['r2']:.4f}")
            self.logger.info(f"  MAPE: {metrics['mape']:.2f}%")
            
            self.logger.info("✅ Evaluación completada")
            return evaluation_results
            
        except Exception as e:
            self.logger.error(f"❌ Error en evaluación: {e}")
            raise
    
    def generate_final_report(self) -> Dict:
        """
        Genera un reporte final completo del pipeline
        
        Returns:
            Diccionario con reporte completo
        """
        self.logger.info("📋 Generando reporte final")
        
        # Completar información del pipeline
        self.results['pipeline_info']['end_time'] = datetime.now()
        self.results['pipeline_info']['total_duration'] = \
            self.results['pipeline_info']['end_time'] - self.results['pipeline_info']['start_time']
        
        # Crear resumen ejecutivo
        executive_summary = {
            'proyecto': 'Sistema de Predicción de Demanda - MegaMercado',
            'fecha_ejecucion': self.results['pipeline_info']['start_time'].strftime('%Y-%m-%d %H:%M:%S'),
            'duracion_total': str(self.results['pipeline_info']['total_duration']),
            'modelos_entrenados': len(self.results['training'].get('successful_models', [])),
            'mejor_modelo': self.results['training'].get('best_model', 'N/A'),
            'metricas_finales': {}
        }
        
        # Añadir métricas del mejor modelo si están disponibles
        if 'evaluation' in self.results and 'test_metrics' in self.results['evaluation']:
            executive_summary['metricas_finales'] = self.results['evaluation']['test_metrics']
        
        self.results['executive_summary'] = executive_summary
        
        # Guardar reporte completo
        reports_dir = Path(self.config.REPORTS_DIR)
        reports_dir.mkdir(parents=True, exist_ok=True)
        
        report_file = reports_dir / f"pipeline_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        import json
        with open(report_file, 'w', encoding='utf-8') as f:
            # Convertir objetos no serializables
            serializable_results = self._make_serializable(self.results)
            json.dump(serializable_results, f, indent=2, ensure_ascii=False, default=str)
        
        self.logger.info(f"📄 Reporte final guardado en: {report_file}")
        self.logger.info("🎉 Pipeline ML completado exitosamente!")
        
        return self.results
    
    def _make_serializable(self, obj):
        """Convierte objetos no serializables a formato JSON"""
        if isinstance(obj, dict):
            return {key: self._make_serializable(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._make_serializable(item) for item in obj]
        elif isinstance(obj, (pd.DataFrame, pd.Series)):
            return obj.to_dict() if hasattr(obj, 'to_dict') else str(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, (datetime, pd.Timestamp)):
            return obj.isoformat()
        elif isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        else:
            try:
                json.dumps(obj)
                return obj
            except:
                return str(obj)
    
    def run_full_pipeline(self, 
                         file_paths: Dict[str, str],
                         target_column: str = None,
                         models_to_train: List[str] = None,
                         generate_final_report: bool = True) -> Dict:
        """
        Ejecuta el pipeline completo de ML
        
        Args:
            file_paths: Rutas de archivos de datos
            target_column: Columna objetivo
            models_to_train: Modelos a entrenar
            generate_final_report: Si generar reporte final
        
        Returns:
            Diccionario completo con todos los resultados
        """
        self.logger.info("🚀 Ejecutando pipeline completo de Machine Learning")
        
        try:
            # 1. Preprocesamiento
            self.logger.info("📊 Paso 1: Preprocesamiento de datos")
            X_train, X_val, X_test, y_train, y_val, y_test = self.load_and_preprocess_data(
                file_paths, target_column
            )
            
            # 2. Entrenamiento
            self.logger.info("🤖 Paso 2: Entrenamiento de modelos")
            training_results = self.train_models(
                X_train, y_train, X_val, y_val, models_to_train
            )
            
            # 3. Evaluación
            self.logger.info("📈 Paso 3: Evaluación del mejor modelo")
            evaluation_results = self.evaluate_best_model(X_test, y_test)
            
            # 4. Reporte final
            if generate_final_report:
                self.logger.info("📋 Paso 4: Generación de reporte final")
                self.generate_final_report()
            
            self.logger.info("🎉 Pipeline ejecutado exitosamente!")
            return self.results
            
        except Exception as e:
            self.logger.error(f"❌ Error en pipeline: {e}")
            raise
    
    def predict_new_data(self, 
                        new_data: pd.DataFrame,
                        model_path: str = None) -> np.ndarray:
        """
        Realiza predicciones sobre nuevos datos
        
        Args:
            new_data: DataFrame con nuevos datos
            model_path: Ruta del modelo a usar (opcional)
        
        Returns:
            Array con predicciones
        """
        self.logger.info("🔮 Realizando predicciones sobre nuevos datos")
        
        try:
            # Usar mejor modelo o cargar modelo especificado
            if model_path:
                model = self.trainer.load_model(model_path)
            elif self.trainer.best_model:
                model = self.trainer.best_model
            else:
                raise ValueError("No hay modelo disponible para predicciones")
            
            # Procesar nuevos datos (simplificado, asume que ya están procesados)
            predictions = model.predict(new_data)
            
            self.logger.info(f"✅ Predicciones completadas: {len(predictions)} muestras")
            return predictions
            
        except Exception as e:
            self.logger.error(f"❌ Error en predicciones: {e}")
            raise

# 🎯 Funciones de utilidad para casos de uso específicos

def create_demand_prediction_pipeline(data_files: Dict[str, str], 
                                    config_env: str = 'development') -> MLPipeline:
    """
    Crea un pipeline específico para predicción de demanda
    
    Args:
        data_files: Archivos de datos
        config_env: Ambiente de configuración
    
    Returns:
        Pipeline configurado para predicción de demanda
    """
    # Configuración específica para predicción de demanda
    demand_config = {
        'TARGET_COLUMN': 'cantidad_vendida',
        'NUMERICAL_FEATURES': [
            'precio_unitario', 'descuento', 'stock_disponible',
            'costo_logistico', 'tiempo_entrega', 'margen_beneficio'
        ],
        'CATEGORICAL_FEATURES': [
            'categoria_producto', 'marca', 'tipo_cliente',
            'region', 'canal_venta', 'temporada'
        ]
    }
    
    # Crear pipeline
    pipeline = MLPipeline(config_env, demand_config)
    
    return pipeline

def create_customer_segmentation_pipeline(data_files: Dict[str, str],
                                        config_env: str = 'development') -> MLPipeline:
    """
    Crea un pipeline específico para segmentación de clientes
    
    Args:
        data_files: Archivos de datos
        config_env: Ambiente de configuración
    
    Returns:
        Pipeline configurado para segmentación
    """
    # Configuración específica para segmentación
    segmentation_config = {
        'TARGET_COLUMN': 'segmento_cliente',
        'NUMERICAL_FEATURES': [
            'total_compras', 'frecuencia_compra', 'valor_promedio_compra',
            'antiguedad_cliente', 'productos_unicos'
        ],
        'CATEGORICAL_FEATURES': [
            'region', 'tipo_cliente', 'canal_preferido'
        ]
    }
    
    # Usar modelos apropiados para clasificación
    segmentation_config['MODELS_CONFIG'] = {
        'random_forest': {
            'name': 'Random Forest Classifier',
            'params': {'n_estimators': 100, 'random_state': 42}
        },
        'xgboost': {
            'name': 'XGBoost Classifier',  
            'params': {'random_state': 42}
        }
    }
    
    pipeline = MLPipeline(config_env, segmentation_config)
    
    return pipeline

# 📋 Ejemplo de uso
if __name__ == "__main__":
    # Configurar rutas de datos
    data_files = {
        'ventas': '../ventas.csv',
        'productos': '../productos.csv', 
        'clientes': '../clientes.csv',
        'logistica': '../logistica.csv',
        'proveedores': '../proveedores.csv'
    }
    
    # Crear y ejecutar pipeline
    pipeline = create_demand_prediction_pipeline(data_files, 'development')
    
    # Ejecutar pipeline completo
    results = pipeline.run_full_pipeline(
        data_files,
        target_column='cantidad_vendida',
        models_to_train=['linear_regression', 'random_forest', 'xgboost']
    )
    
    print("🎉 Pipeline ejecutado exitosamente!")
    print(f"Mejor modelo: {results['training']['best_model']}")