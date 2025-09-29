"""
Pipeline de Limpieza de Datos para MegaMercado
============================================

Este módulo contiene funciones y clases para limpiar y procesar
datos de múltiples fuentes CSV del sistema MegaMercado.

Autor: AI Assistant
Fecha: 2025-09-28
Versión: 1.0
"""

import pandas as pd
import numpy as np
import os
import zipfile
import logging
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Union
import warnings

warnings.filterwarnings('ignore')

# Importar el detector de inconsistencias
try:
    from inconsistency_detector import (
        InconsistencyDetector, 
        MEGAMERCADO_BUSINESS_RULES, 
        MEGAMERCADO_REFERENCES
    )
    INCONSISTENCY_DETECTOR_AVAILABLE = True
except ImportError:
    INCONSISTENCY_DETECTOR_AVAILABLE = False


class DataCleaningPipeline:
    """
    Pipeline completo para la limpieza y procesamiento de datos.
    
    Esta clase maneja la extracción, limpieza y transformación de datos
    desde múltiples archivos CSV.
    """
    
    def __init__(self, base_path: str, log_level: str = 'INFO'):
        """
        Inicializa el pipeline de limpieza.
        
        Args:
            base_path (str): Ruta base donde se encuentran los archivos
            log_level (str): Nivel de logging ('DEBUG', 'INFO', 'WARNING', 'ERROR')
        """
        self.base_path = base_path
        self.logger = self._setup_logger(log_level)
        self.raw_data = {}
        self.clean_data = {}
        self.cleaning_report = {}
        self.inconsistency_detector = None
        self.inconsistencies_found = []
        
    def _setup_logger(self, level: str) -> logging.Logger:
        """
        Configura el sistema de logging.
        
        Args:
            level (str): Nivel de logging
            
        Returns:
            logging.Logger: Logger configurado
        """
        logger = logging.getLogger('DataCleaningPipeline')
        logger.setLevel(getattr(logging, level.upper()))
        
        # Evitar duplicar handlers
        if not logger.handlers:
            # Handler para consola
            console_handler = logging.StreamHandler()
            console_formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            console_handler.setFormatter(console_formatter)
            logger.addHandler(console_handler)
            
            # Handler para archivo
            file_handler = logging.FileHandler('data_cleaning.log')
            file_formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            file_handler.setFormatter(file_formatter)
            logger.addHandler(file_handler)
            
        return logger
    
    def extract_and_load_data(self, file_mapping: Dict[str, str]) -> Dict[str, pd.DataFrame]:
        """
        Extrae y carga datos desde archivos CSV.
        
        Args:
            file_mapping (Dict[str, str]): Mapeo de nombre_dataset -> nombre_archivo
            
        Returns:
            Dict[str, pd.DataFrame]: Diccionario con los DataFrames cargados
        """
        self.logger.info("🔄 Iniciando extracción de datos...")
        
        for dataset_name, filename in file_mapping.items():
            try:
                file_path = os.path.join(self.base_path, filename)
                
                # Manejar archivos ZIP
                if filename.endswith('.zip'):
                    file_path = self._extract_zip(file_path)
                
                # Cargar CSV
                df = pd.read_csv(file_path)
                self.raw_data[dataset_name] = df
                
                self.logger.info(
                    f"✅ {dataset_name}: {df.shape[0]} filas, {df.shape[1]} columnas cargadas"
                )
                
            except Exception as e:
                self.logger.error(f"❌ Error cargando {dataset_name}: {str(e)}")
                continue
        
        self.logger.info(f"🎉 Extracción completada: {len(self.raw_data)} datasets cargados")
        return self.raw_data
    
    def _extract_zip(self, zip_path: str) -> str:
        """
        Extrae archivos ZIP si es necesario.
        
        Args:
            zip_path (str): Ruta del archivo ZIP
            
        Returns:
            str: Ruta del archivo CSV extraído
        """
        csv_path = zip_path.replace('.zip', '.csv')
        
        if not os.path.exists(csv_path) and os.path.exists(zip_path):
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(os.path.dirname(zip_path))
            self.logger.info(f"📦 Archivo extraído: {csv_path}")
        
        return csv_path
    
    def analyze_data_quality(self, df: pd.DataFrame, dataset_name: str) -> Dict:
        """
        Analiza la calidad de los datos en un DataFrame.
        
        Args:
            df (pd.DataFrame): DataFrame a analizar
            dataset_name (str): Nombre del dataset
            
        Returns:
            Dict: Reporte de calidad de datos
        """
        report = {
            'dataset_name': dataset_name,
            'total_records': len(df),
            'total_columns': len(df.columns),
            'missing_values': {},
            'duplicates': df.duplicated().sum(),
            'data_types': df.dtypes.to_dict(),
            'memory_usage': df.memory_usage(deep=True).sum(),
            'numeric_columns': list(df.select_dtypes(include=[np.number]).columns),
            'categorical_columns': list(df.select_dtypes(include=['object']).columns),
            'datetime_columns': list(df.select_dtypes(include=['datetime64']).columns)
        }
        
        # Análisis de valores nulos
        for column in df.columns:
            null_count = df[column].isnull().sum()
            null_percentage = (null_count / len(df)) * 100
            report['missing_values'][column] = {
                'count': null_count,
                'percentage': round(null_percentage, 2)
            }
        
        # Estadísticas descriptivas para columnas numéricas
        if report['numeric_columns']:
            numeric_stats = df[report['numeric_columns']].describe()
            report['numeric_statistics'] = numeric_stats.to_dict()
        
        # Análisis de cardinalidad para columnas categóricas
        categorical_info = {}
        for col in report['categorical_columns']:
            unique_count = df[col].nunique()
            categorical_info[col] = {
                'unique_values': unique_count,
                'cardinality_ratio': unique_count / len(df),
                'most_frequent': df[col].mode().iloc[0] if not df[col].mode().empty else None
            }
        report['categorical_info'] = categorical_info
        
        return report
    
    def clean_missing_values(self, 
                           df: pd.DataFrame, 
                           strategy: str = 'drop_rows',
                           fill_values: Dict[str, Union[str, float, int]] = None,
                           threshold: float = 0.5) -> pd.DataFrame:
        """
        Limpia valores faltantes según la estrategia especificada.
        
        Args:
            df (pd.DataFrame): DataFrame a limpiar
            strategy (str): Estrategia de limpieza ('drop_rows', 'drop_columns', 'fill', 'smart')
            fill_values (Dict): Valores específicos para rellenar por columna
            threshold (float): Umbral para eliminar columnas (porcentaje de valores nulos)
            
        Returns:
            pd.DataFrame: DataFrame limpio
        """
        df_clean = df.copy()
        original_shape = df_clean.shape
        
        if strategy == 'drop_rows':
            # Eliminar filas con cualquier valor nulo
            df_clean = df_clean.dropna()
            
        elif strategy == 'drop_columns':
            # Eliminar columnas con muchos valores nulos
            null_percentages = df_clean.isnull().mean()
            columns_to_drop = null_percentages[null_percentages > threshold].index
            df_clean = df_clean.drop(columns=columns_to_drop)
            self.logger.info(f"Columnas eliminadas: {list(columns_to_drop)}")
            
        elif strategy == 'fill':
            # Rellenar valores según fill_values o estrategias por defecto
            if fill_values:
                df_clean = df_clean.fillna(fill_values)
            else:
                # Estrategias por defecto
                numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
                categorical_cols = df_clean.select_dtypes(include=['object']).columns
                
                # Rellenar numéricas con la mediana
                for col in numeric_cols:
                    df_clean[col] = df_clean[col].fillna(df_clean[col].median())
                
                # Rellenar categóricas con la moda
                for col in categorical_cols:
                    mode_value = df_clean[col].mode()
                    if not mode_value.empty:
                        df_clean[col] = df_clean[col].fillna(mode_value.iloc[0])
                    else:
                        df_clean[col] = df_clean[col].fillna('Desconocido')
                        
        elif strategy == 'smart':
            # Estrategia inteligente basada en el porcentaje de valores nulos
            null_percentages = df_clean.isnull().mean()
            
            # Eliminar columnas con más del threshold de valores nulos
            columns_to_drop = null_percentages[null_percentages > threshold].index
            if len(columns_to_drop) > 0:
                df_clean = df_clean.drop(columns=columns_to_drop)
                self.logger.info(f"Columnas eliminadas (>{threshold*100}% nulos): {list(columns_to_drop)}")
            
            # Para las columnas restantes, aplicar estrategias de relleno
            remaining_nulls = df_clean.isnull().sum()
            if remaining_nulls.sum() > 0:
                df_clean = self.clean_missing_values(df_clean, strategy='fill')
        
        rows_removed = original_shape[0] - df_clean.shape[0]
        cols_removed = original_shape[1] - df_clean.shape[1]
        
        self.logger.info(
            f"Limpieza completada: {rows_removed} filas y {cols_removed} columnas eliminadas"
        )
        
        return df_clean
    
    def remove_duplicates(self, df: pd.DataFrame, subset: List[str] = None) -> pd.DataFrame:
        """
        Elimina registros duplicados.
        
        Args:
            df (pd.DataFrame): DataFrame a limpiar
            subset (List[str]): Columnas específicas para considerar duplicados
            
        Returns:
            pd.DataFrame: DataFrame sin duplicados
        """
        original_count = len(df)
        
        if subset:
            df_clean = df.drop_duplicates(subset=subset)
        else:
            df_clean = df.drop_duplicates()
        
        duplicates_removed = original_count - len(df_clean)
        
        if duplicates_removed > 0:
            self.logger.info(f"Duplicados eliminados: {duplicates_removed}")
        
        return df_clean
    
    def standardize_data_types(self, df: pd.DataFrame, type_mapping: Dict[str, str] = None) -> pd.DataFrame:
        """
        Estandariza los tipos de datos de las columnas.
        
        Args:
            df (pd.DataFrame): DataFrame a estandarizar
            type_mapping (Dict[str, str]): Mapeo de columna -> tipo de dato
            
        Returns:
            pd.DataFrame: DataFrame con tipos estandarizados
        """
        df_clean = df.copy()
        
        if type_mapping:
            for column, dtype in type_mapping.items():
                if column in df_clean.columns:
                    try:
                        if dtype == 'datetime':
                            df_clean[column] = pd.to_datetime(df_clean[column])
                        elif dtype == 'category':
                            df_clean[column] = df_clean[column].astype('category')
                        else:
                            df_clean[column] = df_clean[column].astype(dtype)
                        
                        self.logger.debug(f"Columna {column} convertida a {dtype}")
                    except Exception as e:
                        self.logger.warning(f"No se pudo convertir {column} a {dtype}: {e}")
        
        return df_clean
    
    def detect_and_remove_outliers(self, 
                                 df: pd.DataFrame, 
                                 columns: List[str] = None,
                                 method: str = 'iqr',
                                 factor: float = 1.5) -> pd.DataFrame:
        """
        Detecta y elimina valores atípicos.
        
        Args:
            df (pd.DataFrame): DataFrame a limpiar
            columns (List[str]): Columnas numéricas a analizar
            method (str): Método de detección ('iqr', 'zscore')
            factor (float): Factor multiplicador para el umbral
            
        Returns:
            pd.DataFrame: DataFrame sin valores atípicos
        """
        df_clean = df.copy()
        
        if columns is None:
            columns = df_clean.select_dtypes(include=[np.number]).columns
        
        outliers_removed = 0
        
        for column in columns:
            if column in df_clean.columns:
                original_count = len(df_clean)
                
                if method == 'iqr':
                    Q1 = df_clean[column].quantile(0.25)
                    Q3 = df_clean[column].quantile(0.75)
                    IQR = Q3 - Q1
                    lower_bound = Q1 - factor * IQR
                    upper_bound = Q3 + factor * IQR
                    
                    mask = (df_clean[column] >= lower_bound) & (df_clean[column] <= upper_bound)
                    df_clean = df_clean[mask]
                    
                elif method == 'zscore':
                    from scipy import stats
                    z_scores = np.abs(stats.zscore(df_clean[column]))
                    mask = z_scores < factor
                    df_clean = df_clean[mask]
                
                column_outliers = original_count - len(df_clean)
                outliers_removed += column_outliers
                
                if column_outliers > 0:
                    self.logger.info(f"Outliers eliminados en {column}: {column_outliers}")
        
        if outliers_removed > 0:
            self.logger.info(f"Total de outliers eliminados: {outliers_removed}")
        
        return df_clean
    
    def clean_text_columns(self, df: pd.DataFrame, text_columns: List[str] = None) -> pd.DataFrame:
        """
        Limpia columnas de texto eliminando espacios extra y estandarizando formato.
        
        Args:
            df (pd.DataFrame): DataFrame a limpiar
            text_columns (List[str]): Columnas de texto a limpiar
            
        Returns:
            pd.DataFrame: DataFrame con texto limpio
        """
        df_clean = df.copy()
        
        if text_columns is None:
            text_columns = df_clean.select_dtypes(include=['object']).columns
        
        for column in text_columns:
            if column in df_clean.columns:
                # Convertir a string y eliminar espacios extra
                df_clean[column] = df_clean[column].astype(str).str.strip()
                
                # Reemplazar múltiples espacios con uno solo
                df_clean[column] = df_clean[column].str.replace(r'\s+', ' ', regex=True)
                
                # Reemplazar 'nan' string con NaN real
                df_clean[column] = df_clean[column].replace('nan', np.nan)
                
                self.logger.debug(f"Columna de texto limpiada: {column}")
        
        return df_clean
    
    def initialize_inconsistency_detector(self, business_rules: Dict = None, references: Dict = None):
        """
        Inicializa el detector de inconsistencias con reglas personalizadas.
        
        Args:
            business_rules (Dict): Reglas de negocio personalizadas
            references (Dict): Referencias de integridad entre tablas
        """
        if not INCONSISTENCY_DETECTOR_AVAILABLE:
            self.logger.warning("Detector de inconsistencias no disponible. Instale el módulo inconsistency_detector.py")
            return
        
        self.inconsistency_detector = InconsistencyDetector(self.logger)
        
        # Usar reglas predefinidas o personalizadas
        rules_to_use = business_rules or MEGAMERCADO_BUSINESS_RULES
        references_to_use = references or MEGAMERCADO_REFERENCES
        
        # Añadir reglas de negocio
        for table, table_rules in rules_to_use.items():
            for rule_name, rule_info in table_rules.items():
                self.inconsistency_detector.add_business_rule(
                    table, rule_name, rule_info['function'], rule_info['severity']
                )
        
        # Añadir referencias de integridad
        for child_ref, parent_info in references_to_use.items():
            child_table, child_key = child_ref.split('.')
            self.inconsistency_detector.add_reference_mapping(
                child_table, parent_info['parent_table'], 
                child_key, parent_info['parent_key']
            )
        
        self.logger.info("✅ Detector de inconsistencias inicializado")
    
    def detect_data_inconsistencies(self, datasets: Dict[str, pd.DataFrame] = None) -> Dict:
        """
        Detecta inconsistencias en los datos usando el detector avanzado.
        
        Args:
            datasets (Dict): Datasets a analizar (por defecto usa self.raw_data)
            
        Returns:
            Dict: Reporte de inconsistencias encontradas
        """
        if not self.inconsistency_detector:
            self.logger.warning("Detector de inconsistencias no inicializado. Llamar initialize_inconsistency_detector() primero")
            return {}
        
        datasets_to_analyze = datasets or self.raw_data
        
        if not datasets_to_analyze:
            self.logger.warning("No hay datasets para analizar")
            return {}
        
        self.logger.info("🔍 Iniciando detección de inconsistencias...")
        
        # Ejecutar detección completa
        inconsistencies_by_table = self.inconsistency_detector.run_full_inconsistency_detection(datasets_to_analyze)
        
        # Guardar inconsistencias encontradas
        self.inconsistencies_found = self.inconsistency_detector.inconsistencies
        
        # Generar resumen
        summary = self.inconsistency_detector.get_inconsistencies_summary()
        
        self.logger.info(f"🚨 Detección completada: {summary['total']} inconsistencias encontradas")
        
        # Log por severidad
        for severity, count in summary['by_severity'].items():
            icon = {'CRITICAL': '🔴', 'HIGH': '🟠', 'MEDIUM': '🟡', 'LOW': '🟢'}.get(severity, '⚪')
            self.logger.info(f"  {icon} {severity}: {count}")
        
        return {
            'inconsistencies_by_table': inconsistencies_by_table,
            'summary': summary,
            'detailed_report': self.inconsistency_detector.generate_inconsistency_report()
        }
    
    def run_complete_pipeline(self, 
                            file_mapping: Dict[str, str],
                            cleaning_config: Dict[str, Dict] = None,
                            detect_inconsistencies: bool = True,
                            business_rules: Dict = None,
                            references: Dict = None) -> Dict[str, pd.DataFrame]:
        """
        Ejecuta el pipeline completo de limpieza de datos.
        
        Args:
            file_mapping (Dict[str, str]): Mapeo de dataset -> archivo
            cleaning_config (Dict[str, Dict]): Configuración específica por dataset
            detect_inconsistencies (bool): Si detectar inconsistencias antes de limpiar
            business_rules (Dict): Reglas de negocio personalizadas para detección
            references (Dict): Referencias de integridad entre tablas
            
        Returns:
            Dict[str, pd.DataFrame]: Datasets limpios
        """
        self.logger.info("🚀 Iniciando pipeline completo de limpieza de datos")
        
        # 1. Extraer y cargar datos
        self.extract_and_load_data(file_mapping)
        
        # 2. Detectar inconsistencias si se solicita
        inconsistency_report = {}
        if detect_inconsistencies and INCONSISTENCY_DETECTOR_AVAILABLE:
            self.initialize_inconsistency_detector(business_rules, references)
            inconsistency_report = self.detect_data_inconsistencies()
            
            if inconsistency_report.get('summary', {}).get('total', 0) > 0:
                critical_count = inconsistency_report['summary']['by_severity'].get('CRITICAL', 0)
                high_count = inconsistency_report['summary']['by_severity'].get('HIGH', 0)
                
                if critical_count > 0:
                    self.logger.warning(f"🔴 {critical_count} inconsistencias CRÍTICAS encontradas")
                if high_count > 0:
                    self.logger.warning(f"🟠 {high_count} inconsistencias de severidad ALTA encontradas")
        elif detect_inconsistencies and not INCONSISTENCY_DETECTOR_AVAILABLE:
            self.logger.warning("Detección de inconsistencias solicitada pero módulo no disponible")
        
        # 3. Procesar cada dataset
        for dataset_name, df in self.raw_data.items():
            self.logger.info(f"🔧 Procesando dataset: {dataset_name}")
            
            # Generar reporte de calidad inicial
            quality_report = self.analyze_data_quality(df, dataset_name)
            self.cleaning_report[f"{dataset_name}_inicial"] = quality_report
            
            # Aplicar configuración específica si existe
            config = cleaning_config.get(dataset_name, {}) if cleaning_config else {}
            
            # Pipeline de limpieza
            df_clean = df.copy()
            
            # 1. Limpiar columnas de texto
            df_clean = self.clean_text_columns(df_clean, config.get('text_columns'))
            
            # 2. Estandarizar tipos de datos
            if 'type_mapping' in config:
                df_clean = self.standardize_data_types(df_clean, config['type_mapping'])
            
            # 3. Eliminar duplicados
            df_clean = self.remove_duplicates(df_clean, config.get('duplicate_subset'))
            
            # 4. Manejar valores faltantes
            missing_strategy = config.get('missing_strategy', 'drop_rows')
            df_clean = self.clean_missing_values(
                df_clean, 
                strategy=missing_strategy,
                fill_values=config.get('fill_values'),
                threshold=config.get('missing_threshold', 0.5)
            )
            
            # 5. Eliminar outliers si se especifica
            if config.get('remove_outliers', False):
                df_clean = self.detect_and_remove_outliers(
                    df_clean,
                    columns=config.get('outlier_columns'),
                    method=config.get('outlier_method', 'iqr'),
                    factor=config.get('outlier_factor', 1.5)
                )
            
            # Generar reporte de calidad final
            quality_report_final = self.analyze_data_quality(df_clean, dataset_name)
            self.cleaning_report[f"{dataset_name}_final"] = quality_report_final
            
            # Guardar dataset limpio
            self.clean_data[dataset_name] = df_clean
            
            # Log del resumen de limpieza
            original_records = len(df)
            final_records = len(df_clean)
            records_removed = original_records - final_records
            percentage_removed = (records_removed / original_records) * 100
            
            self.logger.info(
                f"✅ {dataset_name} completado: "
                f"{original_records} → {final_records} registros "
                f"({percentage_removed:.2f}% eliminado)"
            )
        
        self.logger.info(f"🎉 Pipeline completado: {len(self.clean_data)} datasets procesados")
        
        # Guardar reporte de inconsistencias en el cleaning report
        if inconsistency_report:
            self.cleaning_report['inconsistencies'] = inconsistency_report
        
        return self.clean_data
    
    def generate_cleaning_report(self) -> str:
        """
        Genera un reporte detallado del proceso de limpieza.
        
        Returns:
            str: Reporte formateado
        """
        report_lines = [
            "=" * 80,
            "📊 REPORTE DE LIMPIEZA DE DATOS",
            "=" * 80,
            f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"Datasets procesados: {len(self.clean_data)}",
            ""
        ]
        
        for dataset_name in self.clean_data.keys():
            initial_report = self.cleaning_report.get(f"{dataset_name}_inicial", {})
            final_report = self.cleaning_report.get(f"{dataset_name}_final", {})
            
            if initial_report and final_report:
                report_lines.extend([
                    f"📋 DATASET: {dataset_name.upper()}",
                    "-" * 50,
                    f"Registros iniciales: {initial_report.get('total_records', 0):,}",
                    f"Registros finales: {final_report.get('total_records', 0):,}",
                    f"Registros eliminados: {initial_report.get('total_records', 0) - final_report.get('total_records', 0):,}",
                    f"Duplicados iniciales: {initial_report.get('duplicates', 0):,}",
                    f"Duplicados finales: {final_report.get('duplicates', 0):,}",
                    ""
                ])
        
        # Añadir sección de inconsistencias si están disponibles
        if 'inconsistencies' in self.cleaning_report:
            inconsistency_summary = self.cleaning_report['inconsistencies'].get('summary', {})
            if inconsistency_summary.get('total', 0) > 0:
                report_lines.extend([
                    "",
                    "🚨 INCONSISTENCIAS DETECTADAS",
                    "-" * 50,
                    f"Total de inconsistencias: {inconsistency_summary.get('total', 0)}",
                    ""
                ])
                
                for severity, count in inconsistency_summary.get('by_severity', {}).items():
                    icon = {'CRITICAL': '🔴', 'HIGH': '🟠', 'MEDIUM': '🟡', 'LOW': '🟢'}.get(severity, '⚪')
                    report_lines.append(f"  {icon} {severity}: {count}")
                
                report_lines.extend([
                    "",
                    "💡 Revise el reporte detallado de inconsistencias para más información.",
                    ""
                ])
        
        report_lines.extend([
            "=" * 80,
            "✅ Proceso de limpieza completado exitosamente",
            "=" * 80
        ])
        
        return "\n".join(report_lines)
    
    def save_clean_data(self, output_path: str = None) -> None:
        """
        Guarda los datos limpios en archivos CSV.
        
        Args:
            output_path (str): Directorio de salida (por defecto: base_path/clean_data)
        """
        if output_path is None:
            output_path = os.path.join(self.base_path, "clean_data")
        
        # Crear directorio si no existe
        os.makedirs(output_path, exist_ok=True)
        
        for dataset_name, df in self.clean_data.items():
            file_path = os.path.join(output_path, f"{dataset_name}_clean.csv")
            df.to_csv(file_path, index=False)
            self.logger.info(f"💾 Dataset guardado: {file_path}")
        
        # Guardar reporte de limpieza
        report_path = os.path.join(output_path, "cleaning_report.txt")
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(self.generate_cleaning_report())
        
        self.logger.info(f"📄 Reporte de limpieza guardado: {report_path}")
        
        # Guardar reporte detallado de inconsistencias si existe
        if 'inconsistencies' in self.cleaning_report:
            inconsistency_report_path = os.path.join(output_path, "inconsistencies_report.txt")
            with open(inconsistency_report_path, 'w', encoding='utf-8') as f:
                f.write(self.cleaning_report['inconsistencies'].get('detailed_report', ''))
            
            self.logger.info(f"📄 Reporte de inconsistencias guardado: {inconsistency_report_path}")


# Funciones auxiliares para uso independiente

def quick_clean_dataframe(df: pd.DataFrame, 
                         strategy: str = 'drop_rows',
                         remove_duplicates: bool = True) -> pd.DataFrame:
    """
    Función rápida para limpiar un DataFrame individual.
    
    Args:
        df (pd.DataFrame): DataFrame a limpiar
        strategy (str): Estrategia para valores nulos ('drop_rows', 'fill', 'smart')
        remove_duplicates (bool): Si eliminar duplicados
        
    Returns:
        pd.DataFrame: DataFrame limpio
    """
    pipeline = DataCleaningPipeline(".")
    
    df_clean = df.copy()
    
    # Limpiar texto
    df_clean = pipeline.clean_text_columns(df_clean)
    
    # Eliminar duplicados
    if remove_duplicates:
        df_clean = pipeline.remove_duplicates(df_clean)
    
    # Manejar valores nulos
    df_clean = pipeline.clean_missing_values(df_clean, strategy=strategy)
    
    return df_clean


def analyze_dataset_quality(df: pd.DataFrame, dataset_name: str = "Dataset") -> None:
    """
    Función rápida para analizar la calidad de un dataset.
    
    Args:
        df (pd.DataFrame): DataFrame a analizar
        dataset_name (str): Nombre del dataset
    """
    pipeline = DataCleaningPipeline(".")
    report = pipeline.analyze_data_quality(df, dataset_name)
    
    print(f"\n📊 REPORTE DE CALIDAD: {dataset_name}")
    print("=" * 50)
    print(f"Registros: {report['total_records']:,}")
    print(f"Columnas: {report['total_columns']}")
    print(f"Duplicados: {report['duplicates']:,}")
    print(f"Memoria: {report['memory_usage'] / 1024 / 1024:.2f} MB")
    
    print(f"\nColumnas por tipo:")
    print(f"  Numéricas: {len(report['numeric_columns'])}")
    print(f"  Categóricas: {len(report['categorical_columns'])}")
    print(f"  Fechas: {len(report['datetime_columns'])}")
    
    print(f"\nValores faltantes:")
    for col, info in report['missing_values'].items():
        if info['count'] > 0:
            print(f"  {col}: {info['count']:,} ({info['percentage']:.1f}%)")


if __name__ == "__main__":
    """
    Ejemplo de uso del pipeline de limpieza
    """
    
    # Configurar rutas
    BASE_PATH = r"C:\Users\emili\OneDrive\Desktop\Hola Mundo\365_AI_Journey\practical_cases\case01"
    
    # Mapeo de archivos
    FILE_MAPPING = {
        'clientes': 'clientes.csv',
        'productos': 'productos.csv', 
        'proveedores': 'proveedores.csv',
        'logistica': 'logistica.csv',
        'ventas': 'ventas.csv.zip'  # Archivo comprimido
    }
    
    # Configuración específica por dataset
    CLEANING_CONFIG = {
        'clientes': {
            'missing_strategy': 'smart',
            'missing_threshold': 0.7,
            'remove_outliers': False
        },
        'productos': {
            'missing_strategy': 'fill',
            'remove_outliers': True,
            'outlier_columns': ['precio', 'costo'],
            'outlier_method': 'iqr'
        },
        'ventas': {
            'missing_strategy': 'drop_rows',
            'remove_outliers': True,
            'outlier_columns': ['cantidad', 'precio_unitario'],
            'type_mapping': {
                'fecha': 'datetime'
            }
        },
        'logistica': {
            'missing_strategy': 'smart',
            'missing_threshold': 0.5
        },
        'proveedores': {
            'missing_strategy': 'fill'
        }
    }
    
    try:
        # Crear pipeline
        pipeline = DataCleaningPipeline(BASE_PATH, log_level='INFO')
        
        # Ejecutar pipeline completo
        clean_datasets = pipeline.run_complete_pipeline(FILE_MAPPING, CLEANING_CONFIG)
        
        # Mostrar reporte
        print(pipeline.generate_cleaning_report())
        
        # Guardar datos limpios
        pipeline.save_clean_data()
        
        print("\n🎉 Pipeline de limpieza ejecutado exitosamente!")
        
    except Exception as e:
        print(f"❌ Error ejecutando pipeline: {e}")