"""
Configuración de Detección de Inconsistencias
===========================================

Este archivo contiene configuraciones específicas para la detección
de inconsistencias en diferentes tipos de datasets.
"""

from typing import Dict, Callable, List
import pandas as pd
import re
from datetime import datetime, timedelta

# ============================================================================
# REGLAS DE NEGOCIO PREDEFINIDAS
# ============================================================================

def validate_email_format(df: pd.DataFrame) -> pd.DataFrame:
    """Valida que los emails tengan formato correcto."""
    if 'email' in df.columns:
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        invalid_emails = df[~df['email'].str.match(email_pattern, na=False)]
        return invalid_emails
    return pd.DataFrame()

def validate_phone_format(df: pd.DataFrame) -> pd.DataFrame:
    """Valida que los teléfonos tengan formato correcto."""
    phone_columns = [col for col in df.columns if 'telefono' in col.lower() or 'phone' in col.lower()]
    
    violations = pd.DataFrame()
    for col in phone_columns:
        if col in df.columns:
            # Patrón flexible para teléfonos
            phone_pattern = r'^[\+]?[0-9\-\(\)\s]{7,15}$'
            invalid_phones = df[~df[col].astype(str).str.match(phone_pattern, na=False)]
            violations = pd.concat([violations, invalid_phones])
    
    return violations.drop_duplicates()

def validate_positive_amounts(df: pd.DataFrame) -> pd.DataFrame:
    """Valida que los montos sean positivos."""
    amount_columns = ['precio', 'costo', 'monto', 'total', 'subtotal', 'amount', 'cost', 'price']
    violations = pd.DataFrame()
    
    for col in amount_columns:
        if col in df.columns and df[col].dtype in ['int64', 'float64']:
            negative_amounts = df[df[col] < 0]
            violations = pd.concat([violations, negative_amounts])
    
    return violations.drop_duplicates()

def validate_percentage_range(df: pd.DataFrame) -> pd.DataFrame:
    """Valida que los porcentajes estén entre 0 y 100."""
    percentage_columns = [col for col in df.columns if 'porcentaje' in col.lower() or 'percentage' in col.lower()]
    violations = pd.DataFrame()
    
    for col in percentage_columns:
        if col in df.columns and df[col].dtype in ['int64', 'float64']:
            invalid_percentages = df[(df[col] < 0) | (df[col] > 100)]
            violations = pd.concat([violations, invalid_percentages])
    
    return violations.drop_duplicates()

def validate_age_range(df: pd.DataFrame) -> pd.DataFrame:
    """Valida que las edades estén en rango válido."""
    age_columns = ['edad', 'age', 'anos', 'years']
    violations = pd.DataFrame()
    
    for col in age_columns:
        if col in df.columns and df[col].dtype in ['int64', 'float64']:
            invalid_ages = df[(df[col] < 0) | (df[col] > 150)]
            violations = pd.concat([violations, invalid_ages])
    
    return violations.drop_duplicates()

def validate_future_dates(df: pd.DataFrame) -> pd.DataFrame:
    """Valida que las fechas de nacimiento no sean futuras."""
    birth_columns = ['fecha_nacimiento', 'birth_date', 'nacimiento', 'fecha_nac']
    violations = pd.DataFrame()
    
    for col in birth_columns:
        if col in df.columns:
            try:
                dates = pd.to_datetime(df[col], errors='coerce')
                future_dates = df[dates > pd.Timestamp.now()]
                violations = pd.concat([violations, future_dates])
            except:
                continue
    
    return violations.drop_duplicates()

def validate_stock_non_negative(df: pd.DataFrame) -> pd.DataFrame:
    """Valida que el stock no sea negativo."""
    stock_columns = ['stock', 'inventory', 'inventario', 'cantidad_disponible']
    violations = pd.DataFrame()
    
    for col in stock_columns:
        if col in df.columns and df[col].dtype in ['int64', 'float64']:
            negative_stock = df[df[col] < 0]
            violations = pd.concat([violations, negative_stock])
    
    return violations.drop_duplicates()

def validate_delivery_after_order(df: pd.DataFrame) -> pd.DataFrame:
    """Valida que la fecha de entrega sea posterior al pedido."""
    date_pairs = [
        ('fecha_pedido', 'fecha_entrega'),
        ('order_date', 'delivery_date'),
        ('fecha_orden', 'fecha_entrega'),
        ('created_date', 'shipped_date')
    ]
    
    violations = pd.DataFrame()
    
    for order_col, delivery_col in date_pairs:
        if order_col in df.columns and delivery_col in df.columns:
            try:
                order_dates = pd.to_datetime(df[order_col], errors='coerce')
                delivery_dates = pd.to_datetime(df[delivery_col], errors='coerce')
                
                invalid_order = df[
                    (delivery_dates < order_dates) & 
                    order_dates.notna() & 
                    delivery_dates.notna()
                ]
                violations = pd.concat([violations, invalid_order])
            except:
                continue
    
    return violations.drop_duplicates()

def validate_price_greater_than_cost(df: pd.DataFrame) -> pd.DataFrame:
    """Valida que el precio sea mayor que el costo."""
    price_cost_pairs = [
        ('precio', 'costo'),
        ('price', 'cost'),
        ('precio_venta', 'precio_costo'),
        ('sale_price', 'cost_price')
    ]
    
    violations = pd.DataFrame()
    
    for price_col, cost_col in price_cost_pairs:
        if price_col in df.columns and cost_col in df.columns:
            invalid_pricing = df[df[price_col] <= df[cost_col]]
            violations = pd.concat([violations, invalid_pricing])
    
    return violations.drop_duplicates()

def validate_unique_emails_per_customer(df: pd.DataFrame) -> pd.DataFrame:
    """Valida que cada email pertenezca a un único cliente."""
    if 'email' in df.columns and 'id_cliente' in df.columns:
        email_customer_counts = df.groupby('email')['id_cliente'].nunique()
        duplicate_emails = email_customer_counts[email_customer_counts > 1].index
        return df[df['email'].isin(duplicate_emails)]
    return pd.DataFrame()

def validate_consistent_customer_data(df: pd.DataFrame) -> pd.DataFrame:
    """Valida consistencia en datos del mismo cliente."""
    if 'id_cliente' in df.columns:
        # Verificar que el mismo cliente tenga datos consistentes
        inconsistent_data = pd.DataFrame()
        
        for customer_id in df['id_cliente'].unique():
            customer_data = df[df['id_cliente'] == customer_id]
            
            # Verificar campos que deberían ser únicos por cliente
            unique_fields = ['email', 'telefono', 'documento', 'dni']
            
            for field in unique_fields:
                if field in df.columns:
                    unique_values = customer_data[field].dropna().unique()
                    if len(unique_values) > 1:
                        inconsistent_data = pd.concat([inconsistent_data, customer_data])
        
        return inconsistent_data.drop_duplicates()
    return pd.DataFrame()

# ============================================================================
# CONFIGURACIONES POR DOMINIO
# ============================================================================

# Configuración para E-commerce
ECOMMERCE_INCONSISTENCY_RULES = {
    'clientes': {
        'email_format': {
            'function': validate_email_format,
            'severity': 'HIGH'
        },
        'phone_format': {
            'function': validate_phone_format,
            'severity': 'MEDIUM'
        },
        'age_range': {
            'function': validate_age_range,
            'severity': 'HIGH'
        },
        'future_birth_dates': {
            'function': validate_future_dates,
            'severity': 'HIGH'
        },
        'unique_emails': {
            'function': validate_unique_emails_per_customer,
            'severity': 'CRITICAL'
        },
        'consistent_data': {
            'function': validate_consistent_customer_data,
            'severity': 'MEDIUM'
        }
    },
    'productos': {
        'positive_amounts': {
            'function': validate_positive_amounts,
            'severity': 'HIGH'
        },
        'price_vs_cost': {
            'function': validate_price_greater_than_cost,
            'severity': 'HIGH'
        },
        'non_negative_stock': {
            'function': validate_stock_non_negative,
            'severity': 'MEDIUM'
        }
    },
    'ventas': {
        'positive_amounts': {
            'function': validate_positive_amounts,
            'severity': 'HIGH'
        },
        'delivery_dates': {
            'function': validate_delivery_after_order,
            'severity': 'HIGH'
        }
    },
    'logistica': {
        'delivery_dates': {
            'function': validate_delivery_after_order,
            'severity': 'HIGH'
        }
    }
}

# Configuración para sector Financiero
FINANCIAL_INCONSISTENCY_RULES = {
    'transacciones': {
        'positive_amounts': {
            'function': validate_positive_amounts,
            'severity': 'CRITICAL'
        }
    },
    'cuentas': {
        'email_format': {
            'function': validate_email_format,
            'severity': 'HIGH'
        },
        'phone_format': {
            'function': validate_phone_format,
            'severity': 'MEDIUM'
        }
    }
}

# Configuración para sector Salud
HEALTHCARE_INCONSISTENCY_RULES = {
    'pacientes': {
        'age_range': {
            'function': validate_age_range,
            'severity': 'HIGH'
        },
        'future_birth_dates': {
            'function': validate_future_dates,
            'severity': 'CRITICAL'
        },
        'phone_format': {
            'function': validate_phone_format,
            'severity': 'MEDIUM'
        }
    },
    'consultas': {
        'future_dates': {
            'function': validate_future_dates,
            'severity': 'MEDIUM'
        }
    }
}

# ============================================================================
# REFERENCIAS DE INTEGRIDAD POR DOMINIO
# ============================================================================

# Referencias para E-commerce
ECOMMERCE_REFERENCES = {
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
    },
    'productos.id_categoria': {
        'parent_table': 'categorias',
        'parent_key': 'id_categoria'
    }
}

# Referencias para sector Financiero
FINANCIAL_REFERENCES = {
    'transacciones.id_cuenta_origen': {
        'parent_table': 'cuentas',
        'parent_key': 'id_cuenta'
    },
    'transacciones.id_cuenta_destino': {
        'parent_table': 'cuentas',
        'parent_key': 'id_cuenta'
    },
    'cuentas.id_cliente': {
        'parent_table': 'clientes',
        'parent_key': 'id_cliente'
    }
}

# Referencias para sector Salud
HEALTHCARE_REFERENCES = {
    'consultas.id_paciente': {
        'parent_table': 'pacientes',
        'parent_key': 'id_paciente'
    },
    'consultas.id_medico': {
        'parent_table': 'medicos',
        'parent_key': 'id_medico'
    },
    'tratamientos.id_consulta': {
        'parent_table': 'consultas',
        'parent_key': 'id_consulta'
    }
}

# ============================================================================
# UMBRALES DE CALIDAD
# ============================================================================

QUALITY_THRESHOLDS = {
    'max_critical_inconsistencies': 0,     # Cero tolerancia para críticas
    'max_high_inconsistencies': 10,        # Máximo 10 inconsistencias altas
    'max_medium_inconsistencies': 50,      # Máximo 50 inconsistencias medias
    'max_total_inconsistencies': 100,      # Máximo 100 inconsistencias totales
    
    # Umbrales por porcentaje del dataset
    'max_critical_percentage': 0.0,        # 0% de registros con problemas críticos
    'max_high_percentage': 1.0,            # 1% de registros con problemas altos
    'max_medium_percentage': 5.0,          # 5% de registros con problemas medios
    'max_total_percentage': 10.0           # 10% de registros con algún problema
}

# ============================================================================
# CONFIGURACIONES ESPECÍFICAS POR COLUMNA
# ============================================================================

COLUMN_SPECIFIC_VALIDATIONS = {
    'email': {
        'pattern': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
        'severity': 'HIGH',
        'description': 'Formato de email inválido'
    },
    'telefono': {
        'pattern': r'^[\+]?[0-9\-\(\)\s]{7,15}$',
        'severity': 'MEDIUM',
        'description': 'Formato de teléfono inválido'
    },
    'codigo_postal': {
        'pattern': r'^[0-9]{5}(-[0-9]{4})?$',
        'severity': 'LOW',
        'description': 'Formato de código postal inválido'
    },
    'dni': {
        'pattern': r'^[0-9]{8}[A-Z]$',
        'severity': 'HIGH',
        'description': 'Formato de DNI inválido'
    },
    'nif': {
        'pattern': r'^[0-9]{8}[A-Z]$|^[XYZ][0-9]{7}[A-Z]$',
        'severity': 'HIGH',
        'description': 'Formato de NIF inválido'
    }
}

# ============================================================================
# FUNCIONES DE CONFIGURACIÓN
# ============================================================================

def get_inconsistency_config_by_domain(domain: str) -> Dict:
    """
    Obtiene la configuración de inconsistencias por dominio.
    
    Args:
        domain (str): Dominio ('ecommerce', 'financial', 'healthcare')
        
    Returns:
        Dict: Configuración de reglas e integridad referencial
    """
    configs = {
        'ecommerce': {
            'rules': ECOMMERCE_INCONSISTENCY_RULES,
            'references': ECOMMERCE_REFERENCES
        },
        'financial': {
            'rules': FINANCIAL_INCONSISTENCY_RULES,
            'references': FINANCIAL_REFERENCES
        },
        'healthcare': {
            'rules': HEALTHCARE_INCONSISTENCY_RULES,
            'references': HEALTHCARE_REFERENCES
        }
    }
    
    return configs.get(domain, {})

def create_custom_validation_rule(column_name: str, 
                                validation_function: Callable,
                                severity: str = 'MEDIUM',
                                description: str = '') -> Dict:
    """
    Crea una regla de validación personalizada.
    
    Args:
        column_name (str): Nombre de la columna a validar
        validation_function (Callable): Función que valida la regla
        severity (str): Severidad de la regla
        description (str): Descripción de la regla
        
    Returns:
        Dict: Configuración de la regla
    """
    return {
        'function': validation_function,
        'severity': severity,
        'description': description or f'Validación personalizada para {column_name}'
    }

def evaluate_data_quality(inconsistency_summary: Dict) -> Dict:
    """
    Evalúa la calidad de los datos basado en las inconsistencias encontradas.
    
    Args:
        inconsistency_summary (Dict): Resumen de inconsistencias
        
    Returns:
        Dict: Evaluación de calidad y recomendaciones
    """
    total = inconsistency_summary.get('total', 0)
    by_severity = inconsistency_summary.get('by_severity', {})
    
    critical = by_severity.get('CRITICAL', 0)
    high = by_severity.get('HIGH', 0)
    medium = by_severity.get('MEDIUM', 0)
    low = by_severity.get('LOW', 0)
    
    # Determinar nivel de calidad
    if critical > QUALITY_THRESHOLDS['max_critical_inconsistencies']:
        quality_level = 'INACEPTABLE'
        quality_score = 0
        recommendation = 'RECHAZAR: Problemas críticos que impiden el procesamiento'
        action = 'STOP'
    elif high > QUALITY_THRESHOLDS['max_high_inconsistencies']:
        quality_level = 'POBRE'
        quality_score = 25
        recommendation = 'REVISAR: Demasiados problemas de alta severidad'
        action = 'MANUAL_REVIEW'
    elif medium > QUALITY_THRESHOLDS['max_medium_inconsistencies']:
        quality_level = 'REGULAR'
        quality_score = 50
        recommendation = 'PROCESAR CON PRECAUCIÓN: Problemas moderados detectados'
        action = 'CLEAN_AND_PROCESS'
    elif total > QUALITY_THRESHOLDS['max_total_inconsistencies']:
        quality_level = 'BUENA'
        quality_score = 75
        recommendation = 'ACEPTABLE: Pocos problemas menores'
        action = 'PROCESS'
    else:
        quality_level = 'EXCELENTE'
        quality_score = 100
        recommendation = 'ÓPTIMO: Datos de alta calidad'
        action = 'PROCESS'
    
    return {
        'quality_level': quality_level,
        'quality_score': quality_score,
        'recommendation': recommendation,
        'action': action,
        'details': {
            'critical_issues': critical,
            'high_issues': high,
            'medium_issues': medium,
            'low_issues': low,
            'total_issues': total
        }
    }

# ============================================================================
# PLANTILLAS DE REPORTES
# ============================================================================

INCONSISTENCY_REPORT_TEMPLATE = """
🚨 REPORTE DE INCONSISTENCIAS - {dataset_name}
{'=' * 60}
Fecha: {date}
Total de registros analizados: {total_records:,}
Total de inconsistencias: {total_inconsistencies:,}

📊 RESUMEN POR SEVERIDAD:
{severity_summary}

🎯 EVALUACIÓN DE CALIDAD:
Nivel: {quality_level}
Puntuación: {quality_score}/100
Recomendación: {recommendation}

📋 DETALLE DE INCONSISTENCIAS:
{inconsistency_details}

💡 ACCIONES RECOMENDADAS:
{recommended_actions}
"""