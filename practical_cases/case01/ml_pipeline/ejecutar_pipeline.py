# 🚀 Ejecución del Pipeline ML - MegaMercado
"""
Script simplificado para ejecutar el pipeline de ML
sin dependencias complejas
"""

import sys
import os
import pandas as pd
import numpy as np
from pathlib import Path
import json
from datetime import datetime

# Añadir el directorio del pipeline al path
pipeline_dir = Path(__file__).parent
sys.path.append(str(pipeline_dir))

def verificar_datos():
    """Verifica que los archivos de datos existan"""
    print("🔍 Verificando archivos de datos...")
    
    base_dir = Path(__file__).parent.parent  # Directorio del caso práctico
    
    archivos_esperados = {
        'ventas': 'ventas.csv',
        'productos': 'productos.csv', 
        'clientes': 'clientes.csv',
        'logistica': 'logistica.csv',
        'proveedores': 'proveedores.csv'
    }
    
    archivos_encontrados = {}
    
    for nombre, archivo in archivos_esperados.items():
        ruta_completa = base_dir / archivo
        if ruta_completa.exists():
            archivos_encontrados[nombre] = str(ruta_completa)
            print(f"✅ {nombre}: {archivo}")
        else:
            print(f"⚠️  {nombre}: {archivo} (no encontrado)")
    
    return archivos_encontrados

def cargar_y_explorar_datos(archivos):
    """Carga y explora los datos disponibles"""
    print("\n📊 Cargando y explorando datos...")
    
    datos = {}
    
    for nombre, ruta in archivos.items():
        try:
            df = pd.read_csv(ruta)
            datos[nombre] = df
            print(f"📈 {nombre}: {df.shape[0]} filas, {df.shape[1]} columnas")
            
            # Mostrar primeras columnas
            cols = list(df.columns)[:5]
            print(f"   Columnas: {cols}{'...' if len(df.columns) > 5 else ''}")
            
        except Exception as e:
            print(f"❌ Error cargando {nombre}: {e}")
    
    return datos

def analisis_basico_datos(datos):
    """Realiza un análisis básico de los datos"""
    print("\n🔬 Análisis básico de datos...")
    
    # Análisis de ventas (principal)
    if 'ventas' in datos:
        df_ventas = datos['ventas']
        print(f"\n📊 Análisis de VENTAS:")
        print(f"   Total de registros: {len(df_ventas):,}")
        
        # Buscar columnas numéricas para análisis
        cols_numericas = df_ventas.select_dtypes(include=[np.number]).columns
        if len(cols_numericas) > 0:
            print(f"   Columnas numéricas: {list(cols_numericas)[:3]}...")
            
            # Estadísticas básicas de la primera columna numérica
            primera_col = cols_numericas[0]
            print(f"   {primera_col} - Promedio: {df_ventas[primera_col].mean():.2f}")
            print(f"   {primera_col} - Mediana: {df_ventas[primera_col].median():.2f}")
            print(f"   Valores faltantes: {df_ventas[primera_col].isnull().sum()}")
        
        # Verificar columnas categóricas
        cols_categoricas = df_ventas.select_dtypes(include=['object']).columns
        if len(cols_categoricas) > 0:
            print(f"   Columnas categóricas: {list(cols_categoricas)[:3]}...")
    
    # Resumen de todos los datasets
    print(f"\n📋 Resumen general:")
    for nombre, df in datos.items():
        missing_pct = (df.isnull().sum().sum() / (df.shape[0] * df.shape[1])) * 100
        print(f"   {nombre}: {df.shape[0]} registros, {missing_pct:.1f}% datos faltantes")

def preparacion_datos_simple(datos):
    """Preparación simple de datos para ML"""
    print("\n🔧 Preparación simple de datos...")
    
    if 'ventas' not in datos:
        print("❌ No se encontró dataset de ventas")
        return None, None
    
    df_ventas = datos['ventas'].copy()
    
    # Buscar columna objetivo (cantidad o similar)
    posibles_targets = ['cantidad_vendida', 'cantidad', 'ventas', 'monto', 'total']
    target_col = None
    
    for col in posibles_targets:
        if col in df_ventas.columns:
            target_col = col
            break
    
    # Si no encuentra target específico, usar la primera columna numérica
    if target_col is None:
        cols_numericas = df_ventas.select_dtypes(include=[np.number]).columns
        if len(cols_numericas) > 0:
            target_col = cols_numericas[0]
    
    if target_col is None:
        print("❌ No se pudo identificar variable objetivo")
        return None, None
    
    print(f"🎯 Variable objetivo identificada: {target_col}")
    
    # Preparación básica
    # 1. Solo columnas numéricas para simplicidad
    df_numeric = df_ventas.select_dtypes(include=[np.number]).copy()
    
    # 2. Eliminar filas con valores faltantes en target
    df_clean = df_numeric.dropna(subset=[target_col])
    
    # 3. Rellenar otros valores faltantes con mediana
    for col in df_clean.columns:
        if col != target_col and df_clean[col].isnull().sum() > 0:
            df_clean[col].fillna(df_clean[col].median(), inplace=True)
    
    # 4. Separar X y y
    X = df_clean.drop(columns=[target_col])
    y = df_clean[target_col]
    
    print(f"✅ Datos preparados: {X.shape[0]} muestras, {X.shape[1]} features")
    print(f"   Features: {list(X.columns)[:3]}{'...' if len(X.columns) > 3 else ''}")
    
    return X, y

def entrenar_modelo_simple(X, y):
    """Entrenamiento simple con modelos básicos"""
    print("\n🤖 Entrenamiento de modelos simples...")
    
    from sklearn.model_selection import train_test_split
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.linear_model import LinearRegression
    from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
    
    # División de datos
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"📊 División de datos:")
    print(f"   Entrenamiento: {X_train.shape[0]} muestras")
    print(f"   Prueba: {X_test.shape[0]} muestras")
    
    # Modelos a probar
    modelos = {
        'Linear Regression': LinearRegression(),
        'Random Forest': RandomForestRegressor(n_estimators=50, random_state=42)
    }
    
    resultados = {}
    
    for nombre, modelo in modelos.items():
        try:
            print(f"\n🔄 Entrenando {nombre}...")
            
            # Entrenar
            modelo.fit(X_train, y_train)
            
            # Predecir
            y_pred = modelo.predict(X_test)
            
            # Métricas
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            resultados[nombre] = {
                'modelo': modelo,
                'rmse': rmse,
                'mae': mae,
                'r2': r2,
                'predicciones': y_pred
            }
            
            print(f"   ✅ RMSE: {rmse:.4f}")
            print(f"   ✅ MAE: {mae:.4f}")
            print(f"   ✅ R²: {r2:.4f}")
            
        except Exception as e:
            print(f"   ❌ Error entrenando {nombre}: {e}")
    
    return resultados, y_test

def mostrar_resultados_finales(resultados):
    """Muestra un resumen final de resultados"""
    print("\n🏆 === RESULTADOS FINALES ===")
    
    if not resultados:
        print("❌ No se obtuvieron resultados")
        return
    
    # Encontrar mejor modelo (menor RMSE)
    mejor_modelo = None
    mejor_rmse = float('inf')
    
    for nombre, resultado in resultados.items():
        rmse = resultado['rmse']
        if rmse < mejor_rmse:
            mejor_rmse = rmse
            mejor_modelo = nombre
    
    print(f"🥇 Mejor modelo: {mejor_modelo}")
    print(f"📊 Comparación de modelos:")
    
    for nombre, resultado in resultados.items():
        es_mejor = "🏆" if nombre == mejor_modelo else "  "
        print(f"{es_mejor} {nombre}:")
        print(f"     RMSE: {resultado['rmse']:.4f}")
        print(f"     MAE:  {resultado['mae']:.4f}")
        print(f"     R²:   {resultado['r2']:.4f}")

def guardar_resultados(resultados, directorio_salida="resultados"):
    """Guarda los resultados del pipeline"""
    print(f"\n💾 Guardando resultados en '{directorio_salida}'...")
    
    # Crear directorio
    Path(directorio_salida).mkdir(exist_ok=True)
    
    # Resumen de resultados
    resumen = {
        'fecha_ejecucion': datetime.now().isoformat(),
        'modelos_ejecutados': list(resultados.keys()),
        'metricas': {}
    }
    
    for nombre, resultado in resultados.items():
        resumen['metricas'][nombre] = {
            'rmse': resultado['rmse'],
            'mae': resultado['mae'],
            'r2': resultado['r2']
        }
    
    # Guardar resumen
    with open(Path(directorio_salida) / 'resumen_ejecucion.json', 'w') as f:
        json.dump(resumen, f, indent=2, default=str)
    
    print(f"✅ Resultados guardados en '{directorio_salida}/resumen_ejecucion.json'")

def main():
    """Función principal del pipeline simplificado"""
    print("🏪 === PIPELINE ML MEGAMERCADO (Versión Simplificada) ===")
    print("🚀 Iniciando ejecución del pipeline...")
    
    try:
        # 1. Verificar datos
        archivos = verificar_datos()
        
        if not archivos:
            print("❌ No se encontraron archivos de datos")
            return
        
        # 2. Cargar y explorar datos
        datos = cargar_y_explorar_datos(archivos)
        
        if not datos:
            print("❌ No se pudieron cargar los datos")
            return
        
        # 3. Análisis básico
        analisis_basico_datos(datos)
        
        # 4. Preparación de datos
        X, y = preparacion_datos_simple(datos)
        
        if X is None or y is None:
            print("❌ No se pudieron preparar los datos para ML")
            return
        
        # 5. Entrenamiento de modelos
        resultados, y_test = entrenar_modelo_simple(X, y)
        
        # 6. Mostrar resultados
        mostrar_resultados_finales(resultados)
        
        # 7. Guardar resultados
        guardar_resultados(resultados)
        
        print("\n🎉 ¡Pipeline ejecutado exitosamente!")
        print("📋 Revisa el archivo 'resultados/resumen_ejecucion.json' para más detalles")
        
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()