# 🔄 Preprocessor - Pipeline de Preprocesamiento de Datos
"""
Clase para el preprocesamiento completo de datos de MegaMercado
Incluye limpieza, transformación y feature engineering
"""

import pandas as pd
import numpy as np
import logging
from typing import Dict, List, Tuple, Any, Optional
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class DataPreprocessor:
    """
    Clase principal para el preprocesamiento de datos
    """
    
    def __init__(self, config):
        """
        Inicializa el preprocesador
        
        Args:
            config: Configuración del pipeline ML
        """
        self.config = config
        self.logger = self._setup_logger()
        self.scalers = {}
        self.encoders = {}
        self.imputers = {}
        self.preprocessor_pipeline = None
        
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
    
    def load_data(self, file_paths: Dict[str, str]) -> Dict[str, pd.DataFrame]:
        """
        Carga múltiples archivos de datos
        
        Args:
            file_paths: Diccionario con nombres y rutas de archivos
        
        Returns:
            Diccionario con DataFrames cargados
        """
        self.logger.info("🔄 Cargando datos...")
        data = {}
        
        for name, path in file_paths.items():
            try:
                if path.endswith('.csv'):
                    df = pd.read_csv(path)
                elif path.endswith('.xlsx'):
                    df = pd.read_excel(path)
                else:
                    raise ValueError(f"Formato de archivo no soportado: {path}")
                
                data[name] = df
                self.logger.info(f"✅ {name}: {df.shape[0]} filas, {df.shape[1]} columnas")
                
            except Exception as e:
                self.logger.error(f"❌ Error cargando {name}: {e}")
                raise
        
        return data
    
    def merge_datasets(self, datasets: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """
        Une múltiples datasets en uno principal
        
        Args:
            datasets: Diccionario con DataFrames a unir
        
        Returns:
            DataFrame unificado
        """
        self.logger.info("🔗 Uniendo datasets...")
        
        # Estrategia de unión basada en las tablas disponibles
        if 'ventas' in datasets and 'productos' in datasets:
            main_df = datasets['ventas'].merge(
                datasets['productos'], 
                on='id_producto', 
                how='left'
            )
            
            if 'clientes' in datasets:
                main_df = main_df.merge(
                    datasets['clientes'], 
                    on='id_cliente', 
                    how='left'
                )
            
            if 'proveedores' in datasets:
                main_df = main_df.merge(
                    datasets['proveedores'], 
                    on='id_proveedor', 
                    how='left'
                )
            
            if 'logistica' in datasets:
                main_df = main_df.merge(
                    datasets['logistica'], 
                    on=['id_producto', 'fecha_venta'], 
                    how='left'
                )
        else:
            # Si solo hay un dataset, usarlo directamente
            main_df = list(datasets.values())[0]
        
        self.logger.info(f"✅ Dataset unificado: {main_df.shape[0]} filas, {main_df.shape[1]} columnas")
        return main_df
    
    def handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Maneja valores faltantes
        
        Args:
            df: DataFrame a procesar
        
        Returns:
            DataFrame sin valores faltantes
        """
        self.logger.info("🔍 Manejando valores faltantes...")
        
        df_clean = df.copy()
        missing_report = df_clean.isnull().sum()
        missing_pct = (missing_report / len(df_clean)) * 100
        
        # Reportar valores faltantes
        if missing_report.sum() > 0:
            self.logger.info("📊 Valores faltantes encontrados:")
            for col, count in missing_report[missing_report > 0].items():
                self.logger.info(f"  {col}: {count} ({missing_pct[col]:.2f}%)")
        
        # Estrategias por tipo de columna
        for col in df_clean.columns:
            if df_clean[col].isnull().sum() > 0:
                if df_clean[col].dtype in ['int64', 'float64']:
                    # Variables numéricas: imputar con mediana
                    median_val = df_clean[col].median()
                    df_clean[col].fillna(median_val, inplace=True)
                else:
                    # Variables categóricas: imputar con moda
                    mode_val = df_clean[col].mode().iloc[0] if not df_clean[col].mode().empty else 'Unknown'
                    df_clean[col].fillna(mode_val, inplace=True)
        
        self.logger.info("✅ Valores faltantes procesados")
        return df_clean
    
    def remove_outliers(self, df: pd.DataFrame, method: str = 'iqr') -> pd.DataFrame:
        """
        Remueve outliers de variables numéricas
        
        Args:
            df: DataFrame a procesar
            method: Método para detectar outliers ('iqr', 'zscore')
        
        Returns:
            DataFrame sin outliers
        """
        self.logger.info(f"🎯 Removiendo outliers usando método: {method}")
        
        df_clean = df.copy()
        numerical_cols = df_clean.select_dtypes(include=[np.number]).columns
        
        for col in numerical_cols:
            if col == self.config.TARGET_COLUMN:
                continue  # No remover outliers de la variable objetivo
                
            if method == 'iqr':
                Q1 = df_clean[col].quantile(0.25)
                Q3 = df_clean[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                outliers_mask = (df_clean[col] < lower_bound) | (df_clean[col] > upper_bound)
                
            elif method == 'zscore':
                z_scores = np.abs((df_clean[col] - df_clean[col].mean()) / df_clean[col].std())
                outliers_mask = z_scores > 3
            
            outliers_count = outliers_mask.sum()
            if outliers_count > 0:
                self.logger.info(f"  {col}: {outliers_count} outliers removidos")
                df_clean = df_clean[~outliers_mask]
        
        self.logger.info(f"✅ Outliers removidos. Filas restantes: {len(df_clean)}")
        return df_clean
    
    def create_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Crea features temporales desde la columna de fecha
        
        Args:
            df: DataFrame con columna de fecha
        
        Returns:
            DataFrame con features temporales
        """
        self.logger.info("📅 Creando features temporales...")
        
        df_temporal = df.copy()
        
        if self.config.DATE_COLUMN in df_temporal.columns:
            # Asegurar que la columna sea datetime
            df_temporal[self.config.DATE_COLUMN] = pd.to_datetime(df_temporal[self.config.DATE_COLUMN])
            
            # Features básicas de tiempo
            df_temporal['año'] = df_temporal[self.config.DATE_COLUMN].dt.year
            df_temporal['mes'] = df_temporal[self.config.DATE_COLUMN].dt.month
            df_temporal['dia'] = df_temporal[self.config.DATE_COLUMN].dt.day
            df_temporal['dia_semana'] = df_temporal[self.config.DATE_COLUMN].dt.dayofweek
            df_temporal['semana_año'] = df_temporal[self.config.DATE_COLUMN].dt.isocalendar().week
            df_temporal['trimestre'] = df_temporal[self.config.DATE_COLUMN].dt.quarter
            
            # Features cíclicas
            df_temporal['mes_sin'] = np.sin(2 * np.pi * df_temporal['mes'] / 12)
            df_temporal['mes_cos'] = np.cos(2 * np.pi * df_temporal['mes'] / 12)
            df_temporal['dia_sin'] = np.sin(2 * np.pi * df_temporal['dia'] / 31)
            df_temporal['dia_cos'] = np.cos(2 * np.pi * df_temporal['dia'] / 31)
            
            # Features de estacionalidad
            df_temporal['es_fin_semana'] = df_temporal['dia_semana'].isin([5, 6]).astype(int)
            df_temporal['es_inicio_mes'] = (df_temporal['dia'] <= 5).astype(int)
            df_temporal['es_fin_mes'] = (df_temporal['dia'] >= 26).astype(int)
            
            self.logger.info("✅ Features temporales creadas")
        else:
            self.logger.warning(f"⚠️ Columna de fecha '{self.config.DATE_COLUMN}' no encontrada")
        
        return df_temporal
    
    def create_lag_features(self, df: pd.DataFrame, group_cols: List[str] = None) -> pd.DataFrame:
        """
        Crea features de lag (valores históricos)
        
        Args:
            df: DataFrame a procesar
            group_cols: Columnas para agrupar (ej: por producto)
        
        Returns:
            DataFrame con features de lag
        """
        if not self.config.FEATURE_ENGINEERING_CONFIG['create_lag_features']:
            return df
        
        self.logger.info("🔄 Creando features de lag...")
        
        df_lag = df.copy()
        target_col = self.config.TARGET_COLUMN
        lag_periods = self.config.FEATURE_ENGINEERING_CONFIG['lag_periods']
        
        if target_col not in df_lag.columns:
            self.logger.warning(f"⚠️ Columna objetivo '{target_col}' no encontrada para lag features")
            return df_lag
        
        # Ordenar por fecha
        if self.config.DATE_COLUMN in df_lag.columns:
            df_lag = df_lag.sort_values(self.config.DATE_COLUMN)
        
        # Crear lags por grupo si se especifica
        if group_cols:
            for period in lag_periods:
                df_lag[f'{target_col}_lag_{period}'] = df_lag.groupby(group_cols)[target_col].shift(period)
        else:
            for period in lag_periods:
                df_lag[f'{target_col}_lag_{period}'] = df_lag[target_col].shift(period)
        
        # Rolling features
        rolling_windows = self.config.FEATURE_ENGINEERING_CONFIG['rolling_windows']
        for window in rolling_windows:
            if group_cols:
                df_lag[f'{target_col}_rolling_mean_{window}'] = (
                    df_lag.groupby(group_cols)[target_col]
                    .rolling(window=window, min_periods=1)
                    .mean()
                    .reset_index(0, drop=True)
                )
                df_lag[f'{target_col}_rolling_std_{window}'] = (
                    df_lag.groupby(group_cols)[target_col]
                    .rolling(window=window, min_periods=1)
                    .std()
                    .reset_index(0, drop=True)
                )
            else:
                df_lag[f'{target_col}_rolling_mean_{window}'] = (
                    df_lag[target_col].rolling(window=window, min_periods=1).mean()
                )
                df_lag[f'{target_col}_rolling_std_{window}'] = (
                    df_lag[target_col].rolling(window=window, min_periods=1).std()
                )
        
        self.logger.info("✅ Features de lag creadas")
        return df_lag
    
    def encode_categorical_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Codifica variables categóricas
        
        Args:
            df: DataFrame a procesar
        
        Returns:
            DataFrame con variables categóricas codificadas
        """
        self.logger.info("🏷️ Codificando variables categóricas...")
        
        df_encoded = df.copy()
        categorical_cols = df_encoded.select_dtypes(include=['object']).columns
        
        for col in categorical_cols:
            if col == self.config.DATE_COLUMN:
                continue
                
            # Usar Label Encoding para variables con muchas categorías
            n_unique = df_encoded[col].nunique()
            
            if n_unique > 10:
                le = LabelEncoder()
                df_encoded[f'{col}_encoded'] = le.fit_transform(df_encoded[col].astype(str))
                self.encoders[col] = le
                self.logger.info(f"  {col}: Label Encoding ({n_unique} categorías)")
            else:
                # One-Hot Encoding para pocas categorías
                encoded_cols = pd.get_dummies(df_encoded[col], prefix=col)
                df_encoded = pd.concat([df_encoded, encoded_cols], axis=1)
                self.logger.info(f"  {col}: One-Hot Encoding ({n_unique} categorías)")
        
        self.logger.info("✅ Variables categóricas codificadas")
        return df_encoded
    
    def scale_numerical_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Escala variables numéricas
        
        Args:
            df: DataFrame a procesar
        
        Returns:
            DataFrame con variables numéricas escaladas
        """
        self.logger.info("📊 Escalando variables numéricas...")
        
        df_scaled = df.copy()
        numerical_cols = df_scaled.select_dtypes(include=[np.number]).columns
        
        # Excluir columnas que no deben escalarse
        exclude_cols = [self.config.TARGET_COLUMN] + ['año', 'mes', 'dia']
        numerical_cols = [col for col in numerical_cols if col not in exclude_cols]
        
        if numerical_cols:
            scaler = StandardScaler()
            df_scaled[numerical_cols] = scaler.fit_transform(df_scaled[numerical_cols])
            self.scalers['numerical'] = scaler
            self.logger.info(f"  Escaladas {len(numerical_cols)} variables numéricas")
        
        self.logger.info("✅ Variables numéricas escaladas")
        return df_scaled
    
    def split_data(self, df: pd.DataFrame, target_col: str) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Series]:
        """
        Divide los datos en conjuntos de entrenamiento, validación y prueba
        
        Args:
            df: DataFrame completo
            target_col: Nombre de la columna objetivo
        
        Returns:
            Tupla con X_train, X_val, X_test, y_train, y_val, y_test
        """
        self.logger.info("✂️ Dividiendo datos...")
        
        # Separar features y target
        X = df.drop(columns=[target_col])
        y = df[target_col]
        
        # Primera división: train + val vs test
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y, 
            test_size=self.config.TEST_SIZE,
            random_state=self.config.RANDOM_STATE,
            stratify=None  # Para regresión no usar stratify
        )
        
        # Segunda división: train vs val
        val_size_adjusted = self.config.VALIDATION_SIZE / (self.config.TRAIN_SIZE + self.config.VALIDATION_SIZE)
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp,
            test_size=val_size_adjusted,
            random_state=self.config.RANDOM_STATE
        )
        
        self.logger.info(f"  Train: {len(X_train)} muestras ({len(X_train)/len(df)*100:.1f}%)")
        self.logger.info(f"  Val: {len(X_val)} muestras ({len(X_val)/len(df)*100:.1f}%)")
        self.logger.info(f"  Test: {len(X_test)} muestras ({len(X_test)/len(df)*100:.1f}%)")
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    
    def save_preprocessor(self, filepath: str):
        """Guarda el preprocesador entrenado"""
        preprocessing_objects = {
            'scalers': self.scalers,
            'encoders': self.encoders,
            'config': self.config
        }
        joblib.dump(preprocessing_objects, filepath)
        self.logger.info(f"💾 Preprocesador guardado en: {filepath}")
    
    def load_preprocessor(self, filepath: str):
        """Carga un preprocesador previamente entrenado"""
        preprocessing_objects = joblib.load(filepath)
        self.scalers = preprocessing_objects['scalers']
        self.encoders = preprocessing_objects['encoders']
        self.logger.info(f"📂 Preprocesador cargado desde: {filepath}")
    
    def full_preprocessing_pipeline(self, file_paths: Dict[str, str], target_col: str) -> Tuple:
        """
        Pipeline completo de preprocesamiento
        
        Args:
            file_paths: Rutas de archivos de datos
            target_col: Columna objetivo
        
        Returns:
            Tupla con datos procesados y divididos
        """
        self.logger.info("🚀 Iniciando pipeline completo de preprocesamiento")
        
        # 1. Cargar datos
        datasets = self.load_data(file_paths)
        
        # 2. Unir datasets
        df = self.merge_datasets(datasets)
        
        # 3. Manejar valores faltantes
        df = self.handle_missing_values(df)
        
        # 4. Crear features temporales
        df = self.create_temporal_features(df)
        
        # 5. Crear features de lag
        df = self.create_lag_features(df, group_cols=['id_producto'])
        
        # 6. Remover outliers
        df = self.remove_outliers(df)
        
        # 7. Codificar variables categóricas
        df = self.encode_categorical_features(df)
        
        # 8. Escalar variables numéricas
        df = self.scale_numerical_features(df)
        
        # 9. Dividir datos
        X_train, X_val, X_test, y_train, y_val, y_test = self.split_data(df, target_col)
        
        self.logger.info("✅ Pipeline de preprocesamiento completado")
        
        return X_train, X_val, X_test, y_train, y_val, y_test, df