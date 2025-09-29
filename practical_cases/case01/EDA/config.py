"""
Configuración para el Pipeline de Limpieza de Datos
================================================

Este archivo contiene configuraciones predefinidas para diferentes
escenarios de limpieza de datos.
"""

from typing import Dict, List, Union

# Configuraciones predefinidas por tipo de dataset

ECOMMERCE_CONFIG = {
    'clientes': {
        'missing_strategy': 'smart',
        'missing_threshold': 0.7,
        'remove_outliers': False,
        'text_columns': ['nombre', 'email', 'direccion', 'ciudad'],
        'type_mapping': {
            'fecha_registro': 'datetime',
            'activo': 'bool'
        },
        'fill_values': {
            'telefono': 'No disponible',
            'edad': 0
        }
    },
    'productos': {
        'missing_strategy': 'fill',
        'remove_outliers': True,
        'outlier_columns': ['precio', 'costo', 'stock'],
        'outlier_method': 'iqr',
        'outlier_factor': 1.5,
        'text_columns': ['nombre', 'categoria', 'marca', 'descripcion'],
        'type_mapping': {
            'activo': 'bool',
            'fecha_creacion': 'datetime'
        }
    },
    'ventas': {
        'missing_strategy': 'drop_rows',
        'remove_outliers': True,
        'outlier_columns': ['cantidad', 'precio_unitario', 'total'],
        'outlier_method': 'iqr',
        'duplicate_subset': ['id_venta'],
        'type_mapping': {
            'fecha': 'datetime',
            'fecha_entrega': 'datetime'
        }
    },
    'logistica': {
        'missing_strategy': 'smart',
        'missing_threshold': 0.5,
        'text_columns': ['transportista', 'estado', 'direccion_entrega'],
        'type_mapping': {
            'fecha_envio': 'datetime',
            'fecha_entrega': 'datetime'
        }
    },
    'proveedores': {
        'missing_strategy': 'fill',
        'text_columns': ['nombre', 'contacto', 'email', 'direccion'],
        'fill_values': {
            'telefono': 'No disponible',
            'email': 'sin-email@empresa.com'
        }
    }
}

FINANCIAL_CONFIG = {
    'transacciones': {
        'missing_strategy': 'drop_rows',
        'remove_outliers': True,
        'outlier_columns': ['monto', 'comision'],
        'outlier_method': 'zscore',
        'outlier_factor': 3,
        'duplicate_subset': ['id_transaccion'],
        'type_mapping': {
            'fecha': 'datetime',
            'hora': 'datetime'
        }
    },
    'clientes': {
        'missing_strategy': 'smart',
        'missing_threshold': 0.8,
        'text_columns': ['nombre', 'documento', 'direccion'],
        'remove_outliers': True,
        'outlier_columns': ['ingresos', 'patrimonio']
    }
}

HEALTHCARE_CONFIG = {
    'pacientes': {
        'missing_strategy': 'fill',
        'text_columns': ['nombre', 'direccion', 'telefono'],
        'type_mapping': {
            'fecha_nacimiento': 'datetime',
            'genero': 'category'
        },
        'fill_values': {
            'telefono': 'No registrado',
            'seguro': 'Sin seguro'
        }
    },
    'consultas': {
        'missing_strategy': 'drop_rows',
        'type_mapping': {
            'fecha': 'datetime',
            'hora': 'datetime'
        },
        'duplicate_subset': ['id_consulta']
    }
}

# Estrategias comunes
STRICT_CLEANING = {
    'missing_strategy': 'drop_rows',
    'remove_outliers': True,
    'outlier_method': 'iqr',
    'outlier_factor': 1.5
}

PERMISSIVE_CLEANING = {
    'missing_strategy': 'fill',
    'remove_outliers': False,
    'missing_threshold': 0.9
}

BALANCED_CLEANING = {
    'missing_strategy': 'smart',
    'missing_threshold': 0.7,
    'remove_outliers': True,
    'outlier_method': 'iqr',
    'outlier_factor': 2.0
}

# Mapeos de archivos comunes
MEGAMERCADO_FILES = {
    'clientes': 'clientes.csv',
    'productos': 'productos.csv', 
    'proveedores': 'proveedores.csv',
    'logistica': 'logistica.csv',
    'ventas': 'ventas.csv.zip'
}

SALES_FILES = {
    'customers': 'customers.csv',
    'products': 'products.csv',
    'orders': 'orders.csv',
    'order_items': 'order_items.csv'
}

# Funciones de configuración

def get_config_by_domain(domain: str) -> Dict:
    """
    Obtiene configuración predefinida por dominio.
    
    Args:
        domain (str): Dominio ('ecommerce', 'financial', 'healthcare')
        
    Returns:
        Dict: Configuración del dominio
    """
    configs = {
        'ecommerce': ECOMMERCE_CONFIG,
        'financial': FINANCIAL_CONFIG,
        'healthcare': HEALTHCARE_CONFIG
    }
    
    return configs.get(domain, {})

def apply_strategy_to_all_datasets(datasets: List[str], strategy: Dict) -> Dict:
    """
    Aplica la misma estrategia a todos los datasets.
    
    Args:
        datasets (List[str]): Lista de nombres de datasets
        strategy (Dict): Estrategia de limpieza
        
    Returns:
        Dict: Configuración para todos los datasets
    """
    return {dataset: strategy.copy() for dataset in datasets}

def merge_configs(base_config: Dict, custom_config: Dict) -> Dict:
    """
    Combina configuración base con personalizada.
    
    Args:
        base_config (Dict): Configuración base
        custom_config (Dict): Configuración personalizada
        
    Returns:
        Dict: Configuración combinada
    """
    merged = base_config.copy()
    
    for dataset, config in custom_config.items():
        if dataset in merged:
            merged[dataset].update(config)
        else:
            merged[dataset] = config
    
    return merged

# Validadores de calidad de datos
QUALITY_THRESHOLDS = {
    'max_missing_percentage': 50,  # Máximo % de valores faltantes aceptable
    'max_duplicate_percentage': 10,  # Máximo % de duplicados aceptable
    'min_records': 100,  # Mínimo número de registros
    'max_cardinality_ratio': 0.95  # Máxima cardinalidad para categóricas
}

DATA_TYPE_PATTERNS = {
    'email': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    'phone': r'^[\+]?[1-9][\d]{0,15}$',
    'date': r'^\d{4}-\d{2}-\d{2}$',
    'datetime': r'^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$',
    'currency': r'^\$?[\d,]+\.?\d{0,2}$'
}

COLUMN_NAME_STANDARDIZATION = {
    'id_cliente': ['customer_id', 'clientId', 'client_id', 'id_customer'],
    'id_producto': ['product_id', 'productId', 'id_product'],
    'fecha': ['date', 'fecha_venta', 'sale_date', 'timestamp'],
    'precio': ['price', 'cost', 'amount', 'total', 'valor'],
    'cantidad': ['quantity', 'qty', 'count', 'units'],
    'nombre': ['name', 'title', 'description', 'desc']
}