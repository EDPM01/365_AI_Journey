# 🧹 Pipeline de Limpieza de Datos

Una pipeline completa y flexible para la limpieza y procesamiento de datos CSV, diseñada específicamente para el análisis de datos de MegaMercado.

## 📁 Estructura de Archivos

```
EDA/
├── data_cleaning_pipeline.py    # Clase principal de la pipeline
├── config.py                   # Configuraciones predefinidas
├── ejemplo_uso_pipeline.py      # Ejemplos de uso
├── README.md                   # Esta documentación
├── data_cleaning.log           # Log de ejecución (generado)
└── datos_limpios/              # Datos procesados (generado)
    ├── clientes_clean.csv
    ├── productos_clean.csv
    ├── ventas_clean.csv
    ├── logistica_clean.csv
    ├── proveedores_clean.csv
    └── cleaning_report.txt
```

## 🚀 Características Principales

### ✨ Funcionalidades

- **Extracción automática**: Maneja archivos CSV y ZIP
- **Limpieza inteligente**: Múltiples estrategias para valores faltantes
- **Detección de outliers**: Métodos IQR y Z-Score
- **Eliminación de duplicados**: Con opciones de subset personalizado
- **Estandarización**: Tipos de datos y formato de texto
- **🔍 Detección de inconsistencias**: Sistema avanzado de validación
- **Logging completo**: Seguimiento detallado del proceso
- **Reportes automáticos**: Análisis de calidad antes y después
- **Configuración flexible**: Fácil personalización por dataset

### 🚨 Detección de Inconsistencias

La pipeline incluye un **sistema avanzado de detección de inconsistencias** que identifica:

#### 📝 Tipos de Inconsistencias Detectadas

1. **Inconsistencias de Formato**
   - Emails inválidos
   - Teléfonos mal formateados
   - Fechas con formato incorrecto
   - Inconsistencias de capitalización

2. **Inconsistencias de Rango**
   - Valores fuera de rangos esperados (edades negativas, etc.)
   - Valores negativos donde deberían ser positivos
   - Rangos lógicos violados

3. **Inconsistencias Temporales**
   - Fechas futuras en campos históricos
   - Fechas muy antiguas (posibles errores)
   - Orden cronológico incorrecto entre fechas relacionadas

4. **Inconsistencias de Integridad Referencial**
   - Referencias a registros que no existen
   - Claves foráneas huérfanas
   - Violaciones de integridad entre tablas

5. **Inconsistencias Estadísticas**
   - Valores que se repiten excesivamente
   - Patrones secuenciales sospechosos
   - Distribuciones anómalas

6. **Violaciones de Reglas de Negocio**
   - Reglas personalizadas por dominio
   - Validaciones específicas del negocio
   - Restricciones lógicas del sistema

#### 🎯 Severidad de Inconsistencias

- **🔴 CRÍTICAS**: Problemas que impiden el procesamiento (ej: referencias huérfanas)
- **🟠 ALTAS**: Problemas importantes que afectan la calidad (ej: rangos inválidos)
- **🟡 MEDIAS**: Problemas moderados que requieren atención (ej: formatos inconsistentes)
- **🟢 BAJAS**: Problemas menores de estandarización (ej: capitalización)

### 🛠️ Estrategias de Limpieza

1. **`drop_rows`**: Elimina filas con valores nulos (más estricta)
2. **`drop_columns`**: Elimina columnas con muchos nulos
3. **`fill`**: Rellena valores faltantes con estrategias inteligentes
4. **`smart`**: Combina múltiples estrategias según el contexto

## 📖 Uso Rápido

### Ejemplo Básico

```python
from data_cleaning_pipeline import DataCleaningPipeline
from config import MEGAMERCADO_FILES, ECOMMERCE_CONFIG

# Configurar paths
BASE_PATH = "ruta/a/tus/datos"

# Crear pipeline
pipeline = DataCleaningPipeline(BASE_PATH)

# Ejecutar limpieza completa CON detección de inconsistencias
clean_data = pipeline.run_complete_pipeline(
    MEGAMERCADO_FILES, 
    ECOMMERCE_CONFIG,
    detect_inconsistencies=True  # ¡Activar detección!
)

# Guardar resultados
pipeline.save_clean_data()
```

### Detección de Inconsistencias Independiente

```python
from inconsistency_detector import InconsistencyDetector
import pandas as pd

# Crear detector
detector = InconsistencyDetector()

# Cargar datos
df = pd.read_csv('mi_dataset.csv')

# Detectar inconsistencias
inconsistencies = detector.detect_format_inconsistencies(df, 'mi_tabla')
inconsistencies.extend(detector.detect_range_inconsistencies(df, 'mi_tabla'))

# Ver resultados
for inc in inconsistencies:
    print(f"🚨 {inc.type}: {inc.description}")
    print(f"   Casos: {inc.count}, Severidad: {inc.severity}")
```

### Configuración de Reglas de Negocio

```python
from inconsistency_detector import InconsistencyDetector

# Crear detector
detector = InconsistencyDetector()

# Definir regla personalizada
def precio_valido(df):
    """El precio debe ser mayor a cero y menor a 10000"""
    return df[(df['precio'] <= 0) | (df['precio'] > 10000)]

# Añadir regla
detector.add_business_rule('productos', 'precio_valido', precio_valido, 'HIGH')

# Definir integridad referencial
detector.add_reference_mapping('ventas', 'clientes', 'id_cliente', 'id_cliente')
```

### Limpieza Rápida de un DataFrame

```python
from data_cleaning_pipeline import quick_clean_dataframe
import pandas as pd

# Cargar datos
df = pd.read_csv('datos_sucios.csv')

# Limpiar rápidamente
df_clean = quick_clean_dataframe(
    df, 
    strategy='smart',
    remove_duplicates=True
)
```

### Análisis de Calidad

```python
from data_cleaning_pipeline import analyze_dataset_quality
import pandas as pd

df = pd.read_csv('mi_dataset.csv')
analyze_dataset_quality(df, "Mi Dataset")
```

## ⚙️ Configuración

### Configuración por Dataset

```python
mi_config = {
    'clientes': {
        'missing_strategy': 'smart',
        'missing_threshold': 0.7,
        'remove_outliers': True,
        'outlier_columns': ['edad', 'ingresos'],
        'outlier_method': 'iqr',
        'text_columns': ['nombre', 'email', 'direccion'],
        'type_mapping': {
            'fecha_registro': 'datetime',
            'activo': 'bool'
        },
        'fill_values': {
            'telefono': 'No disponible'
        },
        'duplicate_subset': ['id_cliente']
    }
}
```

### Configuraciones Predefinidas

```python
from config import (
    ECOMMERCE_CONFIG,     # Para datos de e-commerce
    FINANCIAL_CONFIG,     # Para datos financieros
    HEALTHCARE_CONFIG,    # Para datos de salud
    STRICT_CLEANING,      # Limpieza estricta
    PERMISSIVE_CLEANING,  # Limpieza permisiva
    BALANCED_CLEANING     # Limpieza balanceada
)
```

## 🔧 Parámetros de Configuración

### Estrategias de Valores Faltantes

| Parámetro | Descripción | Valores |
|-----------|-------------|---------|
| `missing_strategy` | Estrategia para valores nulos | `'drop_rows'`, `'drop_columns'`, `'fill'`, `'smart'` |
| `missing_threshold` | Umbral para eliminar columnas | `0.0` - `1.0` |
| `fill_values` | Valores específicos para rellenar | `Dict[str, Any]` |

### Detección de Outliers

| Parámetro | Descripción | Valores |
|-----------|-------------|---------|
| `remove_outliers` | Activar detección de outliers | `True`, `False` |
| `outlier_columns` | Columnas a analizar | `List[str]` |
| `outlier_method` | Método de detección | `'iqr'`, `'zscore'` |
| `outlier_factor` | Factor multiplicador | `float` (ej: 1.5, 2.0, 3.0) |

### Procesamiento de Texto

| Parámetro | Descripción | Valores |
|-----------|-------------|---------|
| `text_columns` | Columnas de texto a limpiar | `List[str]` |

### Tipos de Datos

| Parámetro | Descripción | Valores |
|-----------|-------------|---------|
| `type_mapping` | Mapeo de tipos por columna | `Dict[str, str]` |

### Duplicados

| Parámetro | Descripción | Valores |
|-----------|-------------|---------|
| `duplicate_subset` | Columnas para detectar duplicados | `List[str]` |

## 📊 Métricas de Calidad

La pipeline proporciona métricas automáticas de calidad:

- **Completitud**: Porcentaje de valores no nulos
- **Consistencia**: Detección de duplicados y formato
- **Validez**: Detección de outliers y tipos incorrectos
- **Integridad**: Verificación de referencias y restricciones

## 🎯 Casos de Uso

### 1. E-commerce (MegaMercado)
```python
from config import ECOMMERCE_CONFIG, MEGAMERCADO_FILES

pipeline = DataCleaningPipeline(BASE_PATH)
clean_data = pipeline.run_complete_pipeline(MEGAMERCADO_FILES, ECOMMERCE_CONFIG)
```

### 2. Datos Financieros
```python
from config import FINANCIAL_CONFIG

config = FINANCIAL_CONFIG
# Personalizar según necesidades específicas
```

### 3. Limpieza Estricta
```python
from config import apply_strategy_to_all_datasets, STRICT_CLEANING

datasets = ['ventas', 'clientes', 'productos']
config = apply_strategy_to_all_datasets(datasets, STRICT_CLEANING)
```

## 🚨 Manejo de Errores

La pipeline incluye manejo robusto de errores:

- **Archivos faltantes**: Continúa con otros datasets
- **Formato incorrecto**: Registra error y salta el archivo
- **Memoria insuficiente**: Optimización automática de tipos
- **Codificación**: Detección automática de encoding

## 📈 Optimización de Performance

### Para Datasets Grandes

```python
# Configuración optimizada para datasets grandes
config_optimizada = {
    'mi_dataset': {
        'missing_strategy': 'drop_columns',  # Más rápido
        'missing_threshold': 0.8,
        'remove_outliers': False,  # Desactivar si es muy lento
        'type_mapping': {
            'fecha': 'datetime64[ns]'  # Más eficiente
        }
    }
}
```

### Monitoreo de Memoria

```python
# La pipeline automáticamente reporta uso de memoria
pipeline = DataCleaningPipeline(BASE_PATH, log_level='DEBUG')
```

## 🔍 Debugging

### Logs Detallados

```python
# Activar logging detallado
pipeline = DataCleaningPipeline(BASE_PATH, log_level='DEBUG')
```

### Revisión Manual

```python
# Verificar datos antes de guardar
clean_data = pipeline.run_complete_pipeline(files, config)

for name, df in clean_data.items():
    print(f"{name}: {df.shape}")
    print(df.head())
    print(df.info())
```

## 📝 Ejemplos Completos

Ejecutar los ejemplos incluidos:

```bash
# Ejecutar todos los ejemplos de limpieza
python ejemplo_uso_pipeline.py

# Ejecutar ejemplos de detección de inconsistencias
python ejemplo_deteccion_inconsistencias.py

# Solo ejemplo específico (modificar el main())
python -c "from ejemplo_uso_pipeline import ejemplo_pipeline_completo; ejemplo_pipeline_completo()"
```

## 🤝 Contribución

Para extender la pipeline:

1. **Nuevas estrategias**: Añadir métodos a `DataCleaningPipeline`
2. **Configuraciones**: Agregar a `config.py`
3. **Validadores**: Implementar en `analyze_data_quality`
4. **Tipos de datos**: Extender `standardize_data_types`

## 📋 Checklist de Limpieza

- [ ] ✅ Valores faltantes manejados
- [ ] ✅ Duplicados eliminados
- [ ] ✅ Outliers detectados y tratados
- [ ] ✅ Tipos de datos correctos
- [ ] ✅ Texto estandarizado
- [ ] 🔍 **Inconsistencias detectadas y reportadas**
- [ ] 🚨 **Reglas de negocio validadas**
- [ ] 🔗 **Integridad referencial verificada**
- [ ] ✅ Calidad validada
- [ ] ✅ Reporte generado
- [ ] ✅ Datos guardados

## 📁 Archivos Generados

Después de ejecutar la pipeline con detección de inconsistencias:

```
datos_limpios/
├── clientes_clean.csv           # Datos limpios
├── productos_clean.csv
├── ventas_clean.csv
├── logistica_clean.csv
├── proveedores_clean.csv
├── cleaning_report.txt          # Reporte de limpieza
├── inconsistencies_report.txt   # 🆕 Reporte detallado de inconsistencias
└── data_cleaning.log           # Log completo del proceso
```

## 🎯 Ejemplos de Inconsistencias Detectadas

### 📧 Formato de Email Inválido
```
🚨 FORMAT_INCONSISTENCY
   Tabla: clientes
   Columna: email  
   Descripción: Valores que no siguen el formato esperado de email
   Casos: 3
   Ejemplos: ['pedro@invalid', 'jose@', 'ana@']
   Acción sugerida: Estandarizar formato o validar valores en columna email
```

### 🔢 Edad Fuera de Rango
```
🚨 RANGE_INCONSISTENCY
   Tabla: clientes
   Columna: edad
   Descripción: Valores fuera del rango esperado (0-120)
   Casos: 2  
   Ejemplos: [-5, 200]
   Acción sugerida: Verificar y corregir valores fuera de rango en edad
```

### 🔗 Referencia Huérfana
```
🚨 REFERENTIAL_INTEGRITY_VIOLATION
   Tabla: ventas
   Columna: id_cliente
   Descripción: Referencias a clientes.id_cliente que no existen
   Casos: 2
   Ejemplos: [99, 88]
   Acción sugerida: Eliminar o corregir referencias huérfanas en ventas.id_cliente
```

### ⏰ Orden Cronológico Incorrecto
```
🚨 CHRONOLOGICAL_INCONSISTENCY  
   Tabla: ventas
   Columna: fecha_pedido vs fecha_entrega
   Descripción: fecha_pedido debería ser anterior a fecha_entrega
   Casos: 2
   Ejemplos: [{'fecha_pedido': '2024-01-15', 'fecha_entrega': '2024-01-10'}]
   Acción sugerida: Verificar orden cronológico entre fecha_pedido y fecha_entrega
```

## 🎉 ¡Listo!

Tu pipeline de limpieza está configurada y lista para usar. Los datos limpios estarán en `datos_limpios/` junto con un reporte detallado del proceso.

---
*Desarrollado para el proyecto 365_AI_Journey - Caso MegaMercado*