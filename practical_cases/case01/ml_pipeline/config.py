# 🔧 Configuración del Pipeline ML - MegaMercado
"""
Configuraciones centralizadas para el pipeline de Machine Learning
"""

import os
from dataclasses import dataclass
from typing import Dict, List, Any
from pathlib import Path

@dataclass
class MLConfig:
    """Configuración principal del pipeline ML"""
    
    # 📁 Rutas de datos
    DATA_DIR: str = "data"
    RAW_DATA_DIR: str = os.path.join(DATA_DIR, "raw")
    PROCESSED_DATA_DIR: str = os.path.join(DATA_DIR, "processed")
    MODELS_DIR: str = "models"
    REPORTS_DIR: str = "reports"
    LOGS_DIR: str = "logs"
    
    # 📊 Configuración de datos
    TARGET_COLUMN: str = "cantidad_vendida"
    DATE_COLUMN: str = "fecha_venta"
    ID_COLUMNS: List[str] = None
    
    def __post_init__(self):
        if self.ID_COLUMNS is None:
            self.ID_COLUMNS = ["id_producto", "id_cliente", "id_proveedor"]
    
    # 🔄 Configuración de división de datos
    TRAIN_SIZE: float = 0.7
    VALIDATION_SIZE: float = 0.15
    TEST_SIZE: float = 0.15
    RANDOM_STATE: int = 42
    
    # 🎯 Configuración de modelos
    MODELS_CONFIG: Dict[str, Dict[str, Any]] = None
    
    def __post_init__(self):
        if self.MODELS_CONFIG is None:
            self.MODELS_CONFIG = {
                'linear_regression': {
                    'name': 'Linear Regression',
                    'params': {},
                    'grid_search_params': {
                        'fit_intercept': [True, False],
                        'normalize': [True, False]
                    }
                },
                'random_forest': {
                    'name': 'Random Forest',
                    'params': {
                        'n_estimators': 100,
                        'random_state': 42,
                        'n_jobs': -1
                    },
                    'grid_search_params': {
                        'n_estimators': [50, 100, 200],
                        'max_depth': [10, 20, None],
                        'min_samples_split': [2, 5, 10],
                        'min_samples_leaf': [1, 2, 4]
                    }
                },
                'xgboost': {
                    'name': 'XGBoost',
                    'params': {
                        'random_state': 42,
                        'n_jobs': -1
                    },
                    'grid_search_params': {
                        'n_estimators': [100, 200, 300],
                        'max_depth': [3, 6, 10],
                        'learning_rate': [0.01, 0.1, 0.2],
                        'subsample': [0.8, 1.0]
                    }
                }
            }
    
    # 📈 Métricas de evaluación
    EVALUATION_METRICS: List[str] = None
    
    def __post_init__(self):
        if self.EVALUATION_METRICS is None:
            self.EVALUATION_METRICS = [
                'mean_absolute_error',
                'mean_squared_error',
                'root_mean_squared_error',
                'r2_score',
                'mean_absolute_percentage_error'
            ]
    
    # 🔍 Configuración de validación cruzada
    CV_FOLDS: int = 5
    CV_SCORING: str = 'neg_mean_squared_error'
    
    # 🎛️ Configuración de hiperparámetros
    HYPERPARAMETER_TUNING: bool = True
    GRID_SEARCH_CV: int = 3
    N_JOBS: int = -1
    
    # 📝 Configuración de logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # 🔄 Configuración de pipeline
    PREPROCESSING_STEPS: List[str] = None
    
    def __post_init__(self):
        if self.PREPROCESSING_STEPS is None:
            self.PREPROCESSING_STEPS = [
                'handle_missing_values',
                'remove_outliers',
                'feature_engineering',
                'encode_categorical',
                'scale_numerical'
            ]
    
    # 🎯 Configuración de features
    NUMERICAL_FEATURES: List[str] = None
    CATEGORICAL_FEATURES: List[str] = None
    
    def __post_init__(self):
        if self.NUMERICAL_FEATURES is None:
            self.NUMERICAL_FEATURES = [
                'precio_unitario', 'descuento', 'stock_disponible',
                'costo_logistico', 'tiempo_entrega'
            ]
        
        if self.CATEGORICAL_FEATURES is None:
            self.CATEGORICAL_FEATURES = [
                'categoria_producto', 'marca', 'tipo_cliente',
                'region', 'canal_venta'
            ]
    
    # 🌟 Configuración de feature engineering
    FEATURE_ENGINEERING_CONFIG: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.FEATURE_ENGINEERING_CONFIG is None:
            self.FEATURE_ENGINEERING_CONFIG = {
                'create_temporal_features': True,
                'create_lag_features': True,
                'lag_periods': [1, 7, 30],
                'rolling_windows': [7, 30, 90],
                'create_interaction_features': True,
                'polynomial_features_degree': 2
            }

# 🏭 Configuración específica por ambiente
class DevelopmentConfig(MLConfig):
    """Configuración para desarrollo"""
    LOG_LEVEL: str = "DEBUG"
    HYPERPARAMETER_TUNING: bool = False
    CV_FOLDS: int = 3

class ProductionConfig(MLConfig):
    """Configuración para producción"""
    LOG_LEVEL: str = "WARNING"
    HYPERPARAMETER_TUNING: bool = True
    CV_FOLDS: int = 5
    N_JOBS: int = -1

# 🎯 Configuración de modelos específicos
DEMAND_PREDICTION_CONFIG = {
    'target': 'cantidad_vendida',
    'features': [
        'precio_unitario', 'descuento', 'stock_disponible',
        'categoria_producto', 'marca', 'region', 'temporada',
        'ventas_lag_7', 'ventas_lag_30', 'promedio_movil_7'
    ],
    'model_type': 'regression'
}

CUSTOMER_SEGMENTATION_CONFIG = {
    'features': [
        'total_compras', 'frecuencia_compra', 'valor_promedio_compra',
        'antiguedad_cliente', 'productos_unicos', 'region'
    ],
    'model_type': 'clustering',
    'n_clusters': 5
}

RECOMMENDATION_ENGINE_CONFIG = {
    'user_features': ['id_cliente', 'tipo_cliente', 'region'],
    'item_features': ['id_producto', 'categoria_producto', 'marca'],
    'interaction_features': ['rating', 'cantidad_comprada'],
    'model_type': 'collaborative_filtering'
}

# 🌍 Función para obtener configuración según ambiente
def get_config(environment: str = 'development') -> MLConfig:
    """
    Obtiene la configuración según el ambiente
    
    Args:
        environment: Ambiente de ejecución ('development' o 'production')
    
    Returns:
        Instancia de configuración correspondiente
    """
    configs = {
        'development': DevelopmentConfig(),
        'production': ProductionConfig()
    }
    
    return configs.get(environment, DevelopmentConfig())

# 📋 Crear directorios necesarios
def create_directories(config: MLConfig):
    """Crea los directorios necesarios para el pipeline"""
    directories = [
        config.DATA_DIR,
        config.RAW_DATA_DIR,
        config.PROCESSED_DATA_DIR,
        config.MODELS_DIR,
        config.REPORTS_DIR,
        config.LOGS_DIR
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)