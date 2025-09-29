"""
Módulo de Detección de Inconsistencias en Datos
==============================================

Este módulo extiende la pipeline de limpieza con capacidades avanzadas
para detectar y reportar inconsistencias en los datos.

Tipos de inconsistencias detectadas:
- Inconsistencias de formato
- Valores fuera de rango esperado
- Inconsistencias de referencia entre tablas
- Patrones anómalos
- Inconsistencias temporales
- Violaciones de reglas de negocio
"""

import pandas as pd
import numpy as np
import re
from typing import Dict, List, Tuple, Any, Optional
from datetime import datetime, date
import logging
from dataclasses import dataclass
from collections import Counter
import warnings

warnings.filterwarnings('ignore')


@dataclass
class Inconsistency:
    """Clase para representar una inconsistencia encontrada."""
    type: str
    severity: str  # 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    table: str
    column: str
    description: str
    count: int
    examples: List[Any]
    suggested_action: str


class InconsistencyDetector:
    """
    Detector avanzado de inconsistencias en datos.
    """
    
    def __init__(self, logger: logging.Logger = None):
        """
        Inicializa el detector de inconsistencias.
        
        Args:
            logger: Logger para registrar hallazgos
        """
        self.logger = logger or logging.getLogger(__name__)
        self.inconsistencies = []
        self.business_rules = {}
        self.reference_mappings = {}
        
    def add_business_rule(self, table: str, rule_name: str, rule_function, severity: str = 'HIGH'):
        """
        Añade una regla de negocio personalizada.
        
        Args:
            table: Nombre de la tabla
            rule_name: Nombre de la regla
            rule_function: Función que valida la regla
            severity: Severidad de violaciones
        """
        if table not in self.business_rules:
            self.business_rules[table] = {}
        
        self.business_rules[table][rule_name] = {
            'function': rule_function,
            'severity': severity
        }
        
    def add_reference_mapping(self, child_table: str, parent_table: str, 
                            child_key: str, parent_key: str):
        """
        Define relaciones de integridad referencial entre tablas.
        
        Args:
            child_table: Tabla hija
            parent_table: Tabla padre
            child_key: Columna de clave foránea
            parent_key: Columna de clave primaria
        """
        self.reference_mappings[f"{child_table}.{child_key}"] = {
            'parent_table': parent_table,
            'parent_key': parent_key
        }
    
    def detect_format_inconsistencies(self, df: pd.DataFrame, table_name: str) -> List[Inconsistency]:
        """
        Detecta inconsistencias de formato en columnas de texto.
        """
        inconsistencies = []
        
        # Patrones comunes esperados
        patterns = {
            'email': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
            'phone': r'^[\+]?[0-9\-\(\)\s]{7,15}$',
            'postal_code': r'^[0-9]{5}(-[0-9]{4})?$',
            'date_iso': r'^\d{4}-\d{2}-\d{2}$',
            'currency': r'^\$?\d+(\.\d{2})?$',
            'percentage': r'^\d+(\.\d+)?%?$'
        }
        
        text_columns = df.select_dtypes(include=['object']).columns
        
        for column in text_columns:
            if df[column].isna().all():
                continue
                
            # Detectar formato probable basado en el nombre de la columna
            probable_format = None
            column_lower = column.lower()
            
            for format_name, pattern in patterns.items():
                if any(keyword in column_lower for keyword in format_name.split('_')):
                    probable_format = format_name
                    break
            
            if probable_format:
                # Verificar consistencia con el patrón
                valid_values = df[column].dropna()
                if len(valid_values) > 0:
                    pattern_matches = valid_values.str.match(patterns[probable_format])
                    invalid_count = (~pattern_matches).sum()
                    
                    if invalid_count > 0:
                        invalid_examples = valid_values[~pattern_matches].head(5).tolist()
                        
                        inconsistencies.append(Inconsistency(
                            type="FORMAT_INCONSISTENCY",
                            severity="MEDIUM",
                            table=table_name,
                            column=column,
                            description=f"Valores que no siguen el formato esperado de {probable_format}",
                            count=invalid_count,
                            examples=invalid_examples,
                            suggested_action=f"Estandarizar formato o validar valores en columna {column}"
                        ))
            
            # Detectar inconsistencias de capitalización
            if len(df[column].dropna()) > 10:
                text_values = df[column].dropna().astype(str)
                capitalization_patterns = {
                    'all_upper': text_values.str.isupper().sum(),
                    'all_lower': text_values.str.islower().sum(),
                    'title_case': text_values.str.istitle().sum(),
                    'mixed': len(text_values) - (text_values.str.isupper().sum() + 
                                                text_values.str.islower().sum() + 
                                                text_values.str.istitle().sum())
                }
                
                # Si hay múltiples patrones significativos, es inconsistente
                significant_patterns = sum(1 for count in capitalization_patterns.values() 
                                         if count > len(text_values) * 0.1)
                
                if significant_patterns > 2:
                    inconsistencies.append(Inconsistency(
                        type="CAPITALIZATION_INCONSISTENCY",
                        severity="LOW",
                        table=table_name,
                        column=column,
                        description="Inconsistencias en capitalización de texto",
                        count=capitalization_patterns['mixed'],
                        examples=text_values.head(3).tolist(),
                        suggested_action=f"Estandarizar capitalización en columna {column}"
                    ))
        
        return inconsistencies
    
    def detect_range_inconsistencies(self, df: pd.DataFrame, table_name: str) -> List[Inconsistency]:
        """
        Detecta valores fuera de rangos esperados.
        """
        inconsistencies = []
        
        # Rangos esperados comunes
        expected_ranges = {
            'age': (0, 120),
            'edad': (0, 120),
            'percentage': (0, 100),
            'porcentaje': (0, 100),
            'rating': (1, 5),
            'calificacion': (1, 5),
            'month': (1, 12),
            'mes': (1, 12),
            'day': (1, 31),
            'dia': (1, 31),
            'hour': (0, 23),
            'hora': (0, 23),
            'minute': (0, 59),
            'minuto': (0, 59)
        }
        
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        
        for column in numeric_columns:
            column_lower = column.lower()
            
            # Buscar rango esperado
            expected_range = None
            for range_key, range_values in expected_ranges.items():
                if range_key in column_lower:
                    expected_range = range_values
                    break
            
            if expected_range:
                min_val, max_val = expected_range
                out_of_range = df[(df[column] < min_val) | (df[column] > max_val)]
                
                if len(out_of_range) > 0:
                    examples = out_of_range[column].head(5).tolist()
                    
                    inconsistencies.append(Inconsistency(
                        type="RANGE_INCONSISTENCY",
                        severity="HIGH",
                        table=table_name,
                        column=column,
                        description=f"Valores fuera del rango esperado ({min_val}-{max_val})",
                        count=len(out_of_range),
                        examples=examples,
                        suggested_action=f"Verificar y corregir valores fuera de rango en {column}"
                    ))
            
            # Detectar valores negativos donde no deberían estar
            negative_keywords = ['price', 'cost', 'amount', 'quantity', 'stock', 
                               'precio', 'costo', 'cantidad', 'inventario']
            
            if any(keyword in column_lower for keyword in negative_keywords):
                negative_values = df[df[column] < 0]
                
                if len(negative_values) > 0:
                    examples = negative_values[column].head(5).tolist()
                    
                    inconsistencies.append(Inconsistency(
                        type="NEGATIVE_VALUE_INCONSISTENCY",
                        severity="MEDIUM",
                        table=table_name,
                        column=column,
                        description="Valores negativos en columna que debería ser positiva",
                        count=len(negative_values),
                        examples=examples,
                        suggested_action=f"Investigar valores negativos en {column}"
                    ))
        
        return inconsistencies
    
    def detect_temporal_inconsistencies(self, df: pd.DataFrame, table_name: str) -> List[Inconsistency]:
        """
        Detecta inconsistencias temporales y lógicas en fechas.
        """
        inconsistencies = []
        
        # Identificar columnas de fecha
        date_columns = []
        for column in df.columns:
            if df[column].dtype == 'datetime64[ns]' or 'fecha' in column.lower() or 'date' in column.lower():
                try:
                    # Intentar convertir a datetime si no lo es ya
                    if df[column].dtype != 'datetime64[ns]':
                        pd.to_datetime(df[column], errors='coerce')
                    date_columns.append(column)
                except:
                    continue
        
        for column in date_columns:
            # Convertir a datetime
            try:
                date_series = pd.to_datetime(df[column], errors='coerce')
            except:
                continue
            
            # Fechas futuras donde no deberían estar
            future_dates = date_series[date_series > pd.Timestamp.now()]
            if len(future_dates) > 0 and 'nacimiento' in column.lower():
                inconsistencies.append(Inconsistency(
                    type="FUTURE_DATE_INCONSISTENCY",
                    severity="HIGH",
                    table=table_name,
                    column=column,
                    description="Fechas futuras en campo que debería ser histórico",
                    count=len(future_dates),
                    examples=future_dates.head(3).tolist(),
                    suggested_action=f"Verificar fechas futuras en {column}"
                ))
            
            # Fechas muy antiguas (antes de 1900)
            very_old_dates = date_series[date_series < pd.Timestamp('1900-01-01')]
            if len(very_old_dates) > 0:
                inconsistencies.append(Inconsistency(
                    type="ANCIENT_DATE_INCONSISTENCY",
                    severity="MEDIUM",
                    table=table_name,
                    column=column,
                    description="Fechas anteriores a 1900 (posiblemente incorrectas)",
                    count=len(very_old_dates),
                    examples=very_old_dates.head(3).tolist(),
                    suggested_action=f"Verificar fechas muy antiguas en {column}"
                ))
        
        # Verificar lógica entre fechas relacionadas
        if len(date_columns) >= 2:
            for i, col1 in enumerate(date_columns):
                for col2 in date_columns[i+1:]:
                    # Verificar si una debería ser anterior a la otra
                    if self._should_be_chronological(col1, col2):
                        date1 = pd.to_datetime(df[col1], errors='coerce')
                        date2 = pd.to_datetime(df[col2], errors='coerce')
                        
                        # Encontrar casos donde el orden está invertido
                        invalid_order = (date1 > date2) & date1.notna() & date2.notna()
                        
                        if invalid_order.sum() > 0:
                            inconsistencies.append(Inconsistency(
                                type="CHRONOLOGICAL_INCONSISTENCY",
                                severity="HIGH",
                                table=table_name,
                                column=f"{col1} vs {col2}",
                                description=f"{col1} debería ser anterior a {col2}",
                                count=invalid_order.sum(),
                                examples=df[invalid_order][[col1, col2]].head(3).to_dict('records'),
                                suggested_action=f"Verificar orden cronológico entre {col1} y {col2}"
                            ))
        
        return inconsistencies
    
    def detect_referential_inconsistencies(self, datasets: Dict[str, pd.DataFrame]) -> List[Inconsistency]:
        """
        Detecta inconsistencias de integridad referencial entre tablas.
        """
        inconsistencies = []
        
        for child_ref, parent_info in self.reference_mappings.items():
            child_table, child_key = child_ref.split('.')
            parent_table = parent_info['parent_table']
            parent_key = parent_info['parent_key']
            
            if child_table in datasets and parent_table in datasets:
                child_df = datasets[child_table]
                parent_df = datasets[parent_table]
                
                # Encontrar valores en tabla hija que no existen en tabla padre
                if child_key in child_df.columns and parent_key in parent_df.columns:
                    child_values = set(child_df[child_key].dropna())
                    parent_values = set(parent_df[parent_key].dropna())
                    
                    orphaned_values = child_values - parent_values
                    
                    if orphaned_values:
                        inconsistencies.append(Inconsistency(
                            type="REFERENTIAL_INTEGRITY_VIOLATION",
                            severity="CRITICAL",
                            table=child_table,
                            column=child_key,
                            description=f"Referencias a {parent_table}.{parent_key} que no existen",
                            count=len(orphaned_values),
                            examples=list(orphaned_values)[:5],
                            suggested_action=f"Eliminar o corregir referencias huérfanas en {child_table}.{child_key}"
                        ))
        
        return inconsistencies
    
    def detect_statistical_inconsistencies(self, df: pd.DataFrame, table_name: str) -> List[Inconsistency]:
        """
        Detecta inconsistencias estadísticas y patrones anómalos.
        """
        inconsistencies = []
        
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        
        for column in numeric_columns:
            if df[column].isna().all():
                continue
                
            values = df[column].dropna()
            
            # Detectar valores que se repiten demasiado (posibles valores por defecto)
            value_counts = values.value_counts()
            most_common_value = value_counts.index[0]
            most_common_count = value_counts.iloc[0]
            
            # Si un valor representa más del 50% de los datos no nulos
            if most_common_count > len(values) * 0.5 and len(values) > 20:
                inconsistencies.append(Inconsistency(
                    type="EXCESSIVE_REPETITION_INCONSISTENCY",
                    severity="MEDIUM",
                    table=table_name,
                    column=column,
                    description=f"Valor {most_common_value} se repite excesivamente ({most_common_count}/{len(values)})",
                    count=most_common_count,
                    examples=[most_common_value],
                    suggested_action=f"Verificar si {most_common_value} es un valor por defecto en {column}"
                ))
            
            # Detectar secuencias sospechosas (como 1,2,3,4,5...)
            if len(values.unique()) > 5:
                sorted_unique = np.sort(values.unique())
                if len(sorted_unique) > 3:
                    # Verificar si es una secuencia consecutiva
                    differences = np.diff(sorted_unique)
                    if np.all(differences == differences[0]) and differences[0] == 1:
                        if len(sorted_unique) > len(values) * 0.8:  # Más del 80% son consecutivos
                            inconsistencies.append(Inconsistency(
                                type="SEQUENTIAL_PATTERN_INCONSISTENCY",
                                severity="LOW",
                                table=table_name,
                                column=column,
                                description="Valores siguen patrón secuencial sospechoso",
                                count=len(sorted_unique),
                                examples=sorted_unique[:10].tolist(),
                                suggested_action=f"Verificar si los valores secuenciales en {column} son correctos"
                            ))
            
            # Detectar distribuciones anómalas usando el coeficiente de variación
            if values.std() > 0:
                cv = values.std() / values.mean()
                if cv > 5:  # Coeficiente de variación muy alto
                    inconsistencies.append(Inconsistency(
                        type="HIGH_VARIABILITY_INCONSISTENCY",
                        severity="LOW",
                        table=table_name,
                        column=column,
                        description=f"Variabilidad extremadamente alta (CV={cv:.2f})",
                        count=len(values),
                        examples=[f"Mean: {values.mean():.2f}", f"Std: {values.std():.2f}"],
                        suggested_action=f"Revisar la distribución de valores en {column}"
                    ))
        
        return inconsistencies
    
    def detect_business_rule_violations(self, df: pd.DataFrame, table_name: str) -> List[Inconsistency]:
        """
        Detecta violaciones de reglas de negocio personalizadas.
        """
        inconsistencies = []
        
        if table_name in self.business_rules:
            for rule_name, rule_info in self.business_rules[table_name].items():
                try:
                    violations = rule_info['function'](df)
                    
                    if len(violations) > 0:
                        examples = violations.head(5).to_dict('records') if hasattr(violations, 'head') else violations[:5]
                        
                        inconsistencies.append(Inconsistency(
                            type="BUSINESS_RULE_VIOLATION",
                            severity=rule_info['severity'],
                            table=table_name,
                            column="multiple" if hasattr(violations, 'columns') else "unknown",
                            description=f"Violación de regla de negocio: {rule_name}",
                            count=len(violations),
                            examples=examples,
                            suggested_action=f"Corregir violaciones de la regla '{rule_name}'"
                        ))
                        
                except Exception as e:
                    self.logger.error(f"Error ejecutando regla de negocio {rule_name}: {e}")
        
        return inconsistencies
    
    def _should_be_chronological(self, col1: str, col2: str) -> bool:
        """
        Determina si dos columnas de fecha deberían seguir un orden cronológico.
        """
        chronological_pairs = [
            ('fecha_nacimiento', 'fecha_registro'),
            ('fecha_inicio', 'fecha_fin'),
            ('fecha_pedido', 'fecha_entrega'),
            ('fecha_creacion', 'fecha_modificacion'),
            ('start_date', 'end_date'),
            ('birth_date', 'registration_date')
        ]
        
        col1_lower = col1.lower()
        col2_lower = col2.lower()
        
        for first, second in chronological_pairs:
            if first in col1_lower and second in col2_lower:
                return True
            if first in col2_lower and second in col1_lower:
                return False  # Orden invertido
        
        return False
    
    def run_full_inconsistency_detection(self, datasets: Dict[str, pd.DataFrame]) -> Dict[str, List[Inconsistency]]:
        """
        Ejecuta detección completa de inconsistencias en todos los datasets.
        
        Args:
            datasets: Diccionario de datasets a analizar
            
        Returns:
            Dict con inconsistencias encontradas por tabla
        """
        all_inconsistencies = {}
        
        self.logger.info("🔍 Iniciando detección completa de inconsistencias...")
        
        # Detección por tabla individual
        for table_name, df in datasets.items():
            self.logger.info(f"Analizando inconsistencias en: {table_name}")
            
            table_inconsistencies = []
            
            # Diferentes tipos de detección
            table_inconsistencies.extend(self.detect_format_inconsistencies(df, table_name))
            table_inconsistencies.extend(self.detect_range_inconsistencies(df, table_name))
            table_inconsistencies.extend(self.detect_temporal_inconsistencies(df, table_name))
            table_inconsistencies.extend(self.detect_statistical_inconsistencies(df, table_name))
            table_inconsistencies.extend(self.detect_business_rule_violations(df, table_name))
            
            all_inconsistencies[table_name] = table_inconsistencies
        
        # Detección entre tablas
        referential_inconsistencies = self.detect_referential_inconsistencies(datasets)
        if referential_inconsistencies:
            all_inconsistencies['REFERENTIAL'] = referential_inconsistencies
        
        # Consolidar todas las inconsistencias
        self.inconsistencies = []
        for table_inconsistencies in all_inconsistencies.values():
            self.inconsistencies.extend(table_inconsistencies)
        
        self.logger.info(f"✅ Detección completada: {len(self.inconsistencies)} inconsistencias encontradas")
        
        return all_inconsistencies
    
    def generate_inconsistency_report(self) -> str:
        """
        Genera un reporte detallado de todas las inconsistencias encontradas.
        """
        if not self.inconsistencies:
            return "✅ No se encontraron inconsistencias en los datos."
        
        # Agrupar por severidad
        by_severity = {}
        for inc in self.inconsistencies:
            if inc.severity not in by_severity:
                by_severity[inc.severity] = []
            by_severity[inc.severity].append(inc)
        
        report_lines = [
            "🚨 REPORTE DE INCONSISTENCIAS EN DATOS",
            "=" * 80,
            f"Fecha de análisis: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"Total de inconsistencias: {len(self.inconsistencies)}",
            ""
        ]
        
        # Resumen por severidad
        report_lines.extend([
            "📊 RESUMEN POR SEVERIDAD:",
            "-" * 40
        ])
        
        severity_order = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
        for severity in severity_order:
            count = len(by_severity.get(severity, []))
            if count > 0:
                icon = {'CRITICAL': '🔴', 'HIGH': '🟠', 'MEDIUM': '🟡', 'LOW': '🟢'}[severity]
                report_lines.append(f"{icon} {severity}: {count} inconsistencias")
        
        report_lines.append("")
        
        # Detalle por severidad
        for severity in severity_order:
            inconsistencies = by_severity.get(severity, [])
            if not inconsistencies:
                continue
                
            report_lines.extend([
                f"{{'CRITICAL': '🔴', 'HIGH': '🟠', 'MEDIUM': '🟡', 'LOW': '🟢'}[severity]} INCONSISTENCIAS {severity}",
                "=" * 60
            ])
            
            for i, inc in enumerate(inconsistencies, 1):
                report_lines.extend([
                    f"{i}. {inc.type}",
                    f"   Tabla: {inc.table}",
                    f"   Columna: {inc.column}",
                    f"   Descripción: {inc.description}",
                    f"   Registros afectados: {inc.count:,}",
                    f"   Ejemplos: {inc.examples}",
                    f"   Acción sugerida: {inc.suggested_action}",
                    ""
                ])
        
        # Recomendaciones generales
        report_lines.extend([
            "💡 RECOMENDACIONES GENERALES:",
            "=" * 40,
            "1. Priorizar inconsistencias CRÍTICAS y ALTAS",
            "2. Implementar validaciones en el proceso de entrada de datos",
            "3. Establecer reglas de negocio claras",
            "4. Crear scripts de validación automática",
            "5. Documentar los estándares de calidad de datos",
            ""
        ])
        
        return "\n".join(report_lines)
    
    def get_inconsistencies_summary(self) -> Dict[str, int]:
        """
        Retorna un resumen numérico de inconsistencias por tipo y severidad.
        """
        summary = {
            'total': len(self.inconsistencies),
            'by_severity': {},
            'by_type': {},
            'by_table': {}
        }
        
        for inc in self.inconsistencies:
            # Por severidad
            if inc.severity not in summary['by_severity']:
                summary['by_severity'][inc.severity] = 0
            summary['by_severity'][inc.severity] += 1
            
            # Por tipo
            if inc.type not in summary['by_type']:
                summary['by_type'][inc.type] = 0
            summary['by_type'][inc.type] += 1
            
            # Por tabla
            if inc.table not in summary['by_table']:
                summary['by_table'][inc.table] = 0
            summary['by_table'][inc.table] += 1
        
        return summary


# Funciones auxiliares para definir reglas de negocio comunes

def edad_coherente(df: pd.DataFrame) -> pd.DataFrame:
    """Regla: La edad debe ser coherente con la fecha de nacimiento."""
    if 'edad' in df.columns and 'fecha_nacimiento' in df.columns:
        try:
            nacimiento = pd.to_datetime(df['fecha_nacimiento'], errors='coerce')
            edad_calculada = (pd.Timestamp.now() - nacimiento).dt.days / 365.25
            diferencia = abs(df['edad'] - edad_calculada)
            return df[diferencia > 2]  # Diferencia mayor a 2 años
        except:
            pass
    return pd.DataFrame()

def precio_mayor_que_costo(df: pd.DataFrame) -> pd.DataFrame:
    """Regla: El precio debe ser mayor que el costo."""
    if 'precio' in df.columns and 'costo' in df.columns:
        return df[df['precio'] <= df['costo']]
    return pd.DataFrame()

def stock_coherente_con_ventas(df: pd.DataFrame) -> pd.DataFrame:
    """Regla: No puede haber stock negativo."""
    if 'stock' in df.columns:
        return df[df['stock'] < 0]
    return pd.DataFrame()

def email_unico_por_cliente(df: pd.DataFrame) -> pd.DataFrame:
    """Regla: Cada email debe pertenecer a un único cliente."""
    if 'email' in df.columns and 'id_cliente' in df.columns:
        email_counts = df.groupby('email')['id_cliente'].nunique()
        emails_duplicados = email_counts[email_counts > 1].index
        return df[df['email'].isin(emails_duplicados)]
    return pd.DataFrame()

def fecha_entrega_posterior_a_pedido(df: pd.DataFrame) -> pd.DataFrame:
    """Regla: La fecha de entrega debe ser posterior a la fecha de pedido."""
    if 'fecha_pedido' in df.columns and 'fecha_entrega' in df.columns:
        try:
            pedido = pd.to_datetime(df['fecha_pedido'], errors='coerce')
            entrega = pd.to_datetime(df['fecha_entrega'], errors='coerce')
            return df[(entrega < pedido) & pedido.notna() & entrega.notna()]
        except:
            pass
    return pd.DataFrame()


# Reglas de negocio predefinidas para MegaMercado
MEGAMERCADO_BUSINESS_RULES = {
    'clientes': {
        'edad_coherente': {
            'function': edad_coherente,
            'severity': 'MEDIUM'
        },
        'email_unico': {
            'function': email_unico_por_cliente,
            'severity': 'HIGH'
        }
    },
    'productos': {
        'precio_vs_costo': {
            'function': precio_mayor_que_costo,
            'severity': 'HIGH'
        },
        'stock_positivo': {
            'function': stock_coherente_con_ventas,
            'severity': 'MEDIUM'
        }
    },
    'ventas': {
        'fecha_entrega_logica': {
            'function': fecha_entrega_posterior_a_pedido,
            'severity': 'HIGH'
        }
    }
}

# Referencias de integridad para MegaMercado
MEGAMERCADO_REFERENCES = {
    'ventas.id_cliente': {
        'parent_table': 'clientes',
        'parent_key': 'id_cliente'
    },
    'ventas.id_producto': {
        'parent_table': 'productos',
        'parent_key': 'id_producto'
    },
    'logistica.id_venta': {
        'parent_table': 'ventas',
        'parent_key': 'id_venta'
    },
    'productos.id_proveedor': {
        'parent_table': 'proveedores',
        'parent_key': 'id_proveedor'
    }
}