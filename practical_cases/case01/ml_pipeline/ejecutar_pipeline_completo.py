# Pipeline de Machine Learning - MegaMercado (Sin emojis)
"""
Pipeline completo de ML adaptado para Windows PowerShell
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

def ejecutar_pipeline_completo():
    """Ejecuta el pipeline completo de ML"""
    print("=== PIPELINE ML MEGAMERCADO ===")
    print("Iniciando pipeline completo de prediccion de demanda...")
    
    try:
        # 1. Verificar y cargar datos
        base_dir = Path(__file__).parent.parent
        
        file_paths = {
            'ventas': str(base_dir / 'ventas.csv'),
            'productos': str(base_dir / 'productos.csv'),
            'clientes': str(base_dir / 'clientes.csv'),
            'logistica': str(base_dir / 'logistica.csv'),
            'proveedores': str(base_dir / 'proveedores.csv')
        }
        
        # Verificar archivos
        archivos_validos = {}
        for nombre, ruta in file_paths.items():
            if os.path.exists(ruta):
                archivos_validos[nombre] = ruta
                print(f"[OK] {nombre}: {ruta}")
        
        # 2. Cargar y fusionar datos
        print("\nCargando datos...")
        
        # Cargar ventas (principal)
        df_ventas = pd.read_csv(archivos_validos['ventas'])
        print(f"Ventas cargadas: {df_ventas.shape[0]} filas, {df_ventas.shape[1]} columnas")
        
        # Fusionar con productos
        if 'productos' in archivos_validos:
            df_productos = pd.read_csv(archivos_validos['productos'])
            df_main = df_ventas.merge(df_productos, on='producto_id', how='left')
            print(f"Fusionado con productos: {df_main.shape}")
        else:
            df_main = df_ventas
        
        # Fusionar con clientes
        if 'clientes' in archivos_validos:
            df_clientes = pd.read_csv(archivos_validos['clientes'])
            df_main = df_main.merge(df_clientes, on='cliente_id', how='left')
            print(f"Fusionado con clientes: {df_main.shape}")
        
        # 3. Preprocesamiento
        print("\nPreprocesando datos...")
        
        # Seleccionar target
        target_col = 'cantidad'
        print(f"Variable objetivo: {target_col}")
        
        # Seleccionar features numéricas relevantes
        numeric_features = ['precio_unitario', 'precio_base', 'edad']
        available_numeric = [col for col in numeric_features if col in df_main.columns]
        
        print(f"Features numericas disponibles: {available_numeric}")
        
        # Crear dataset para ML
        ml_features = available_numeric + ['producto_id', 'cliente_id', 'sucursal_id']
        available_features = [col for col in ml_features if col in df_main.columns]
        
        # Preparar datos
        X_cols = available_features
        X = df_main[X_cols].copy()
        y = df_main[target_col].copy()
        
        # Limpiar datos
        # Eliminar filas con target faltante
        mask = ~y.isnull()
        X = X[mask]
        y = y[mask]
        
        # Imputar valores faltantes en features
        for col in X.columns:
            if X[col].dtype in ['int64', 'float64']:
                X[col].fillna(X[col].median(), inplace=True)
            else:
                X[col].fillna('Unknown', inplace=True)
        
        print(f"Datos preparados: {X.shape[0]} muestras, {X.shape[1]} features")
        print(f"Features finales: {list(X.columns)}")
        
        # 4. División de datos
        from sklearn.model_selection import train_test_split
        
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y, test_size=0.3, random_state=42
        )
        
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=0.5, random_state=42
        )
        
        print(f"\nDivision de datos:")
        print(f"  Entrenamiento: {X_train.shape[0]} muestras")
        print(f"  Validacion: {X_val.shape[0]} muestras")  
        print(f"  Prueba: {X_test.shape[0]} muestras")
        
        # 5. Entrenamiento de modelos
        print("\nEntrenando modelos...")
        
        from sklearn.ensemble import RandomForestRegressor
        from sklearn.linear_model import LinearRegression
        from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
        
        modelos = {
            'Linear_Regression': LinearRegression(),
            'Random_Forest': RandomForestRegressor(n_estimators=100, random_state=42)
        }
        
        resultados = {}
        
        for nombre, modelo in modelos.items():
            print(f"\nEntrenando {nombre}...")
            
            try:
                # Entrenar
                modelo.fit(X_train, y_train)
                
                # Predicciones
                y_pred_val = modelo.predict(X_val)
                y_pred_test = modelo.predict(X_test)
                
                # Métricas en validación
                val_rmse = np.sqrt(mean_squared_error(y_val, y_pred_val))
                val_mae = mean_absolute_error(y_val, y_pred_val)
                val_r2 = r2_score(y_val, y_pred_val)
                
                # Métricas en test
                test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
                test_mae = mean_absolute_error(y_test, y_pred_test)
                test_r2 = r2_score(y_test, y_pred_test)
                
                resultados[nombre] = {
                    'modelo': modelo,
                    'val_rmse': val_rmse,
                    'val_mae': val_mae,
                    'val_r2': val_r2,
                    'test_rmse': test_rmse,
                    'test_mae': test_mae,
                    'test_r2': test_r2
                }
                
                print(f"  Validacion - RMSE: {val_rmse:.4f}, MAE: {val_mae:.4f}, R2: {val_r2:.4f}")
                print(f"  Prueba     - RMSE: {test_rmse:.4f}, MAE: {test_mae:.4f}, R2: {test_r2:.4f}")
                
            except Exception as e:
                print(f"  ERROR entrenando {nombre}: {e}")
        
        # 6. Selección del mejor modelo
        print("\n=== RESULTADOS FINALES ===")
        
        if resultados:
            # Encontrar mejor modelo por RMSE de validación
            mejor_modelo = min(resultados.keys(), 
                             key=lambda x: resultados[x]['val_rmse'])
            
            print(f"\nMEJOR MODELO: {mejor_modelo}")
            print("\nComparacion de modelos (Validacion):")
            
            for nombre, res in resultados.items():
                es_mejor = "[MEJOR]" if nombre == mejor_modelo else "      "
                print(f"{es_mejor} {nombre}:")
                print(f"         RMSE: {res['val_rmse']:.4f}")
                print(f"         MAE:  {res['val_mae']:.4f}")
                print(f"         R2:   {res['val_r2']:.4f}")
            
            print("\nResultados en conjunto de PRUEBA:")
            mejor_res = resultados[mejor_modelo]
            print(f"  RMSE: {mejor_res['test_rmse']:.4f}")
            print(f"  MAE:  {mejor_res['test_mae']:.4f}")
            print(f"  R2:   {mejor_res['test_r2']:.4f}")
            
            # 7. Guardar resultados
            print("\nGuardando resultados...")
            
            # Crear directorio de salida
            output_dir = Path("resultados_pipeline")
            output_dir.mkdir(exist_ok=True)
            
            # Resumen de resultados
            resumen = {
                'fecha_ejecucion': datetime.now().isoformat(),
                'mejor_modelo': mejor_modelo,
                'datos_procesados': {
                    'total_muestras': len(X),
                    'features_utilizadas': list(X.columns),
                    'target': target_col
                },
                'resultados_validacion': {
                    nombre: {
                        'rmse': res['val_rmse'],
                        'mae': res['val_mae'], 
                        'r2': res['val_r2']
                    }
                    for nombre, res in resultados.items()
                },
                'resultado_final_prueba': {
                    'rmse': mejor_res['test_rmse'],
                    'mae': mejor_res['test_mae'],
                    'r2': mejor_res['test_r2']
                }
            }
            
            # Guardar JSON
            with open(output_dir / 'resumen_pipeline.json', 'w') as f:
                json.dump(resumen, f, indent=2, default=str)
            
            # Guardar modelo
            import joblib
            joblib.dump(resultados[mejor_modelo]['modelo'], 
                       output_dir / f'mejor_modelo_{mejor_modelo}.pkl')
            
            print(f"Resultados guardados en: {output_dir}")
            print("\n=== PIPELINE EJECUTADO EXITOSAMENTE ===")
            
        else:
            print("ERROR: No se pudieron entrenar modelos")
    
    except Exception as e:
        print(f"ERROR en pipeline: {e}")
        import traceback
        traceback.print_exc()

def mostrar_info_datos():
    """Muestra información de los datos disponibles"""
    print("=== INFORMACION DE DATOS ===")
    
    base_dir = Path(__file__).parent.parent
    archivos = ['ventas.csv', 'productos.csv', 'clientes.csv', 'logistica.csv', 'proveedores.csv']
    
    for archivo in archivos:
        ruta = base_dir / archivo
        if ruta.exists():
            try:
                df = pd.read_csv(ruta, nrows=5)
                print(f"\n{archivo.upper()}:")
                print(f"  Columnas: {list(df.columns)}")
                print(f"  Primeras filas:")
                print(df.head(2).to_string())
            except Exception as e:
                print(f"  Error leyendo {archivo}: {e}")
        else:
            print(f"\n{archivo}: NO ENCONTRADO")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "info":
        mostrar_info_datos()
    else:
        ejecutar_pipeline_completo()