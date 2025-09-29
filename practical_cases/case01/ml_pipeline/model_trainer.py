# 🤖 Model Trainer - Entrenamiento y Evaluación de Modelos ML
"""
Clase para el entrenamiento, evaluación y selección de modelos de Machine Learning
"""

import pandas as pd
import numpy as np
import logging
import joblib
import json
from typing import Dict, List, Tuple, Any, Optional
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Modelos de ML
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.tree import DecisionTreeRegressor
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor

# Evaluación y validación
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV, cross_val_score
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    mean_absolute_percentage_error
)

# Utilidades
from sklearn.inspection import permutation_importance
import shap

class ModelTrainer:
    """
    Clase principal para el entrenamiento de modelos ML
    """
    
    def __init__(self, config):
        """
        Inicializa el entrenador de modelos
        
        Args:
            config: Configuración del pipeline ML
        """
        self.config = config
        self.logger = self._setup_logger()
        self.models = {}
        self.trained_models = {}
        self.model_results = {}
        self.best_model = None
        self.feature_importance = {}
        
        # Inicializar modelos disponibles
        self._initialize_models()
    
    def _setup_logger(self) -> logging.Logger:
        """Configura el logger"""
        logger = logging.getLogger(__name__)
        logger.setLevel(getattr(logging, self.config.LOG_LEVEL))
        
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(self.config.LOG_FORMAT)
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        
        return logger
    
    def _initialize_models(self):
        """Inicializa el diccionario de modelos disponibles"""
        self.models = {
            'linear_regression': LinearRegression(),
            'ridge_regression': Ridge(random_state=self.config.RANDOM_STATE),
            'lasso_regression': Lasso(random_state=self.config.RANDOM_STATE),
            'elastic_net': ElasticNet(random_state=self.config.RANDOM_STATE),
            'decision_tree': DecisionTreeRegressor(random_state=self.config.RANDOM_STATE),
            'random_forest': RandomForestRegressor(
                random_state=self.config.RANDOM_STATE,
                n_jobs=self.config.N_JOBS
            ),
            'gradient_boosting': GradientBoostingRegressor(random_state=self.config.RANDOM_STATE),
            'xgboost': XGBRegressor(
                random_state=self.config.RANDOM_STATE,
                n_jobs=self.config.N_JOBS
            ),
            'lightgbm': LGBMRegressor(
                random_state=self.config.RANDOM_STATE,
                n_jobs=self.config.N_JOBS,
                verbose=-1
            ),
            'svr': SVR(),
            'knn': KNeighborsRegressor(n_jobs=self.config.N_JOBS)
        }
    
    def calculate_metrics(self, y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
        """
        Calcula múltiples métricas de evaluación
        
        Args:
            y_true: Valores reales
            y_pred: Valores predichos
        
        Returns:
            Diccionario con métricas calculadas
        """
        metrics = {}
        
        # Métricas básicas
        metrics['mae'] = mean_absolute_error(y_true, y_pred)
        metrics['mse'] = mean_squared_error(y_true, y_pred)
        metrics['rmse'] = np.sqrt(metrics['mse'])
        metrics['r2'] = r2_score(y_true, y_pred)
        
        # MAPE (Mean Absolute Percentage Error)
        # Evitar división por cero
        mask = y_true != 0
        if mask.sum() > 0:
            metrics['mape'] = np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100
        else:
            metrics['mape'] = np.inf
        
        # Métricas adicionales
        metrics['max_error'] = np.max(np.abs(y_true - y_pred))
        metrics['mean_error'] = np.mean(y_true - y_pred)
        
        return metrics
    
    def train_single_model(self, 
                          model_name: str, 
                          X_train: pd.DataFrame, 
                          y_train: pd.Series,
                          X_val: pd.DataFrame = None, 
                          y_val: pd.Series = None,
                          hyperparameter_tuning: bool = None) -> Dict[str, Any]:
        """
        Entrena un modelo individual
        
        Args:
            model_name: Nombre del modelo a entrenar
            X_train: Features de entrenamiento
            y_train: Target de entrenamiento
            X_val: Features de validación
            y_val: Target de validación
            hyperparameter_tuning: Si realizar búsqueda de hiperparámetros
        
        Returns:
            Diccionario con resultados del entrenamiento
        """
        self.logger.info(f"🤖 Entrenando modelo: {model_name}")
        
        if hyperparameter_tuning is None:
            hyperparameter_tuning = self.config.HYPERPARAMETER_TUNING
        
        # Obtener modelo base
        if model_name not in self.models:
            raise ValueError(f"Modelo {model_name} no disponible")
        
        model = self.models[model_name]
        results = {'model_name': model_name}
        
        try:
            # Búsqueda de hiperparámetros si está habilitada
            if hyperparameter_tuning and model_name in self.config.MODELS_CONFIG:
                self.logger.info(f"🔍 Buscando mejores hiperparámetros para {model_name}")
                
                param_grid = self.config.MODELS_CONFIG[model_name].get('grid_search_params', {})
                
                if param_grid:
                    # Usar GridSearchCV o RandomizedSearchCV según el tamaño del grid
                    param_combinations = 1
                    for params in param_grid.values():
                        param_combinations *= len(params)
                    
                    if param_combinations <= 50:
                        search = GridSearchCV(
                            model,
                            param_grid,
                            cv=self.config.GRID_SEARCH_CV,
                            scoring=self.config.CV_SCORING,
                            n_jobs=self.config.N_JOBS,
                            verbose=0
                        )
                    else:
                        search = RandomizedSearchCV(
                            model,
                            param_grid,
                            n_iter=20,
                            cv=self.config.GRID_SEARCH_CV,
                            scoring=self.config.CV_SCORING,
                            n_jobs=self.config.N_JOBS,
                            random_state=self.config.RANDOM_STATE,
                            verbose=0
                        )
                    
                    search.fit(X_train, y_train)
                    model = search.best_estimator_
                    results['best_params'] = search.best_params_
                    results['cv_score'] = search.best_score_
                    
                    self.logger.info(f"✅ Mejores parámetros: {search.best_params_}")
                else:
                    # Entrenar con parámetros por defecto
                    model.fit(X_train, y_train)
                    results['best_params'] = model.get_params()
            else:
                # Entrenar sin búsqueda de hiperparámetros
                model.fit(X_train, y_train)
                results['best_params'] = model.get_params()
            
            # Predicciones en conjunto de entrenamiento
            y_train_pred = model.predict(X_train)
            train_metrics = self.calculate_metrics(y_train, y_train_pred)
            results['train_metrics'] = train_metrics
            
            # Predicciones en conjunto de validación (si existe)
            if X_val is not None and y_val is not None:
                y_val_pred = model.predict(X_val)
                val_metrics = self.calculate_metrics(y_val, y_val_pred)
                results['val_metrics'] = val_metrics
                results['val_predictions'] = y_val_pred
            
            # Validación cruzada
            cv_scores = cross_val_score(
                model, X_train, y_train,
                cv=self.config.CV_FOLDS,
                scoring=self.config.CV_SCORING,
                n_jobs=self.config.N_JOBS
            )
            results['cv_mean'] = cv_scores.mean()
            results['cv_std'] = cv_scores.std()
            
            # Guardar modelo entrenado
            self.trained_models[model_name] = model
            results['model'] = model
            results['training_time'] = datetime.now()
            results['success'] = True
            
            # Feature importance (si disponible)
            if hasattr(model, 'feature_importances_'):
                importance_df = pd.DataFrame({
                    'feature': X_train.columns,
                    'importance': model.feature_importances_
                }).sort_values('importance', ascending=False)
                
                self.feature_importance[model_name] = importance_df
                results['feature_importance'] = importance_df
            
            self.logger.info(f"✅ {model_name} entrenado exitosamente")
            
        except Exception as e:
            self.logger.error(f"❌ Error entrenando {model_name}: {e}")
            results['success'] = False
            results['error'] = str(e)
        
        return results
    
    def train_multiple_models(self, 
                             X_train: pd.DataFrame, 
                             y_train: pd.Series,
                             X_val: pd.DataFrame = None, 
                             y_val: pd.Series = None,
                             model_list: List[str] = None) -> Dict[str, Dict]:
        """
        Entrena múltiples modelos y compara resultados
        
        Args:
            X_train: Features de entrenamiento
            y_train: Target de entrenamiento
            X_val: Features de validación
            y_val: Target de validación
            model_list: Lista de modelos a entrenar (None para todos)
        
        Returns:
            Diccionario con resultados de todos los modelos
        """
        self.logger.info("🚀 Entrenando múltiples modelos...")
        
        if model_list is None:
            model_list = list(self.models.keys())
        
        results = {}
        
        for model_name in model_list:
            results[model_name] = self.train_single_model(
                model_name, X_train, y_train, X_val, y_val
            )
        
        self.model_results = results
        self._select_best_model()
        
        return results
    
    def _select_best_model(self):
        """Selecciona el mejor modelo basado en métricas de validación"""
        if not self.model_results:
            return
        
        best_score = float('inf')
        best_name = None
        
        for model_name, results in self.model_results.items():
            if not results.get('success', False):
                continue
            
            # Usar RMSE de validación como criterio principal
            if 'val_metrics' in results:
                score = results['val_metrics']['rmse']
            else:
                # Si no hay validación, usar CV score (negativo, por eso abs)
                score = abs(results.get('cv_mean', float('inf')))
            
            if score < best_score:
                best_score = score
                best_name = model_name
        
        if best_name:
            self.best_model = self.trained_models[best_name]
            self.logger.info(f"🏆 Mejor modelo seleccionado: {best_name} (RMSE: {best_score:.4f})")
    
    def evaluate_model(self, 
                      model, 
                      X_test: pd.DataFrame, 
                      y_test: pd.Series,
                      model_name: str = "model") -> Dict[str, Any]:
        """
        Evalúa un modelo en el conjunto de prueba
        
        Args:
            model: Modelo entrenado
            X_test: Features de prueba
            y_test: Target de prueba
            model_name: Nombre del modelo
        
        Returns:
            Diccionario con métricas de evaluación
        """
        self.logger.info(f"📊 Evaluando modelo: {model_name}")
        
        # Predicciones
        y_pred = model.predict(X_test)
        
        # Calcular métricas
        metrics = self.calculate_metrics(y_test, y_pred)
        
        # Crear reporte detallado
        evaluation_results = {
            'model_name': model_name,
            'test_metrics': metrics,
            'predictions': y_pred,
            'actual_values': y_test.values,
            'residuals': y_test.values - y_pred,
            'evaluation_time': datetime.now()
        }
        
        self.logger.info(f"✅ Evaluación completada para {model_name}")
        self.logger.info(f"  RMSE: {metrics['rmse']:.4f}")
        self.logger.info(f"  MAE: {metrics['mae']:.4f}")
        self.logger.info(f"  R²: {metrics['r2']:.4f}")
        self.logger.info(f"  MAPE: {metrics['mape']:.2f}%")
        
        return evaluation_results
    
    def create_model_comparison_report(self) -> pd.DataFrame:
        """
        Crea un reporte comparativo de todos los modelos entrenados
        
        Returns:
            DataFrame con métricas comparativas
        """
        if not self.model_results:
            return pd.DataFrame()
        
        comparison_data = []
        
        for model_name, results in self.model_results.items():
            if not results.get('success', False):
                continue
            
            row = {'modelo': model_name}
            
            # Métricas de entrenamiento
            if 'train_metrics' in results:
                train_metrics = results['train_metrics']
                row.update({
                    'train_rmse': train_metrics['rmse'],
                    'train_mae': train_metrics['mae'],
                    'train_r2': train_metrics['r2']
                })
            
            # Métricas de validación
            if 'val_metrics' in results:
                val_metrics = results['val_metrics']
                row.update({
                    'val_rmse': val_metrics['rmse'],
                    'val_mae': val_metrics['mae'],
                    'val_r2': val_metrics['r2'],
                    'val_mape': val_metrics['mape']
                })
            
            # Cross-validation
            row.update({
                'cv_score': results.get('cv_mean', np.nan),
                'cv_std': results.get('cv_std', np.nan)
            })
            
            comparison_data.append(row)
        
        comparison_df = pd.DataFrame(comparison_data)
        
        if not comparison_df.empty:
            # Ordenar por RMSE de validación
            if 'val_rmse' in comparison_df.columns:
                comparison_df = comparison_df.sort_values('val_rmse')
            else:
                comparison_df = comparison_df.sort_values('cv_score', ascending=False)
        
        return comparison_df
    
    def plot_model_comparison(self, save_path: str = None):
        """
        Crea visualizaciones comparativas de los modelos
        
        Args:
            save_path: Ruta para guardar las gráficas
        """
        comparison_df = self.create_model_comparison_report()
        
        if comparison_df.empty:
            self.logger.warning("⚠️ No hay resultados de modelos para visualizar")
            return
        
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle('Comparación de Modelos ML - MegaMercado', fontsize=16, fontweight='bold')
        
        # 1. RMSE de validación
        if 'val_rmse' in comparison_df.columns:
            axes[0, 0].barh(comparison_df['modelo'], comparison_df['val_rmse'])
            axes[0, 0].set_title('RMSE en Validación')
            axes[0, 0].set_xlabel('RMSE')
        
        # 2. R² de validación
        if 'val_r2' in comparison_df.columns:
            axes[0, 1].barh(comparison_df['modelo'], comparison_df['val_r2'])
            axes[0, 1].set_title('R² en Validación')
            axes[0, 1].set_xlabel('R²')
        
        # 3. Cross-validation scores
        if 'cv_score' in comparison_df.columns:
            axes[1, 0].barh(comparison_df['modelo'], comparison_df['cv_score'])
            axes[1, 0].set_title('Cross-Validation Score')
            axes[1, 0].set_xlabel('CV Score')
        
        # 4. MAPE
        if 'val_mape' in comparison_df.columns:
            axes[1, 1].barh(comparison_df['modelo'], comparison_df['val_mape'])
            axes[1, 1].set_title('MAPE en Validación (%)')
            axes[1, 1].set_xlabel('MAPE (%)')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            self.logger.info(f"📊 Gráfica guardada en: {save_path}")
        
        plt.show()
    
    def plot_predictions_vs_actual(self, 
                                  model, 
                                  X_test: pd.DataFrame, 
                                  y_test: pd.Series,
                                  model_name: str = "Modelo",
                                  save_path: str = None):
        """
        Crea gráfica de predicciones vs valores reales
        
        Args:
            model: Modelo entrenado
            X_test: Features de prueba
            y_test: Target de prueba
            model_name: Nombre del modelo
            save_path: Ruta para guardar la gráfica
        """
        y_pred = model.predict(X_test)
        
        fig, axes = plt.subplots(1, 2, figsize=(15, 6))
        
        # 1. Scatter plot predicciones vs reales
        axes[0].scatter(y_test, y_pred, alpha=0.6)
        axes[0].plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
        axes[0].set_xlabel('Valores Reales')
        axes[0].set_ylabel('Predicciones')
        axes[0].set_title(f'{model_name} - Predicciones vs Reales')
        
        # Añadir métricas al gráfico
        metrics = self.calculate_metrics(y_test, y_pred)
        textstr = f'R² = {metrics["r2"]:.3f}\nRMSE = {metrics["rmse"]:.3f}\nMAE = {metrics["mae"]:.3f}'
        props = dict(boxstyle='round', facecolor='wheat', alpha=0.5)
        axes[0].text(0.05, 0.95, textstr, transform=axes[0].transAxes, fontsize=10,
                    verticalalignment='top', bbox=props)
        
        # 2. Residuos
        residuals = y_test - y_pred
        axes[1].scatter(y_pred, residuals, alpha=0.6)
        axes[1].axhline(y=0, color='r', linestyle='--')
        axes[1].set_xlabel('Predicciones')
        axes[1].set_ylabel('Residuos')
        axes[1].set_title(f'{model_name} - Análisis de Residuos')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            self.logger.info(f"📊 Gráfica guardada en: {save_path}")
        
        plt.show()
    
    def save_model(self, model, filepath: str, model_info: Dict = None):
        """
        Guarda un modelo entrenado y su información
        
        Args:
            model: Modelo a guardar
            filepath: Ruta del archivo
            model_info: Información adicional del modelo
        """
        # Crear directorio si no existe
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)
        
        # Guardar modelo
        joblib.dump(model, filepath)
        
        # Guardar información del modelo
        if model_info:
            info_path = filepath.replace('.pkl', '_info.json')
            with open(info_path, 'w') as f:
                # Convertir valores no serializables
                serializable_info = {}
                for key, value in model_info.items():
                    if isinstance(value, (pd.DataFrame, np.ndarray)):
                        continue  # Skip non-serializable objects
                    elif isinstance(value, datetime):
                        serializable_info[key] = value.isoformat()
                    else:
                        try:
                            json.dumps(value)  # Test if serializable
                            serializable_info[key] = value
                        except:
                            serializable_info[key] = str(value)
                
                json.dump(serializable_info, f, indent=2)
        
        self.logger.info(f"💾 Modelo guardado en: {filepath}")
    
    def load_model(self, filepath: str):
        """
        Carga un modelo previamente guardado
        
        Args:
            filepath: Ruta del archivo del modelo
        
        Returns:
            Modelo cargado
        """
        model = joblib.load(filepath)
        self.logger.info(f"📂 Modelo cargado desde: {filepath}")
        return model
    
    def save_all_results(self, base_path: str):
        """
        Guarda todos los resultados y modelos entrenados
        
        Args:
            base_path: Directorio base para guardar
        """
        base_path = Path(base_path)
        base_path.mkdir(parents=True, exist_ok=True)
        
        # Guardar modelos entrenados
        models_dir = base_path / "trained_models"
        models_dir.mkdir(exist_ok=True)
        
        for model_name, model in self.trained_models.items():
            model_path = models_dir / f"{model_name}.pkl"
            model_info = self.model_results.get(model_name, {})
            self.save_model(model, str(model_path), model_info)
        
        # Guardar mejor modelo por separado
        if self.best_model:
            best_model_path = base_path / "best_model.pkl"
            joblib.dump(self.best_model, best_model_path)
        
        # Guardar reporte de comparación
        comparison_df = self.create_model_comparison_report()
        if not comparison_df.empty:
            comparison_df.to_csv(base_path / "model_comparison_report.csv", index=False)
        
        # Guardar feature importance
        if self.feature_importance:
            importance_dir = base_path / "feature_importance"
            importance_dir.mkdir(exist_ok=True)
            
            for model_name, importance_df in self.feature_importance.items():
                importance_path = importance_dir / f"{model_name}_importance.csv"
                importance_df.to_csv(importance_path, index=False)
        
        self.logger.info(f"💾 Todos los resultados guardados en: {base_path}")