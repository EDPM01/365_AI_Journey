# Pipeline ML MegaMercado - Versión Optimizada para Memoria
"""
Pipeline optimizado que maneja datasets grandes con muestreo
"""

import pandas as pd
import numpy as np
from pathlib import Path
import json
from datetime import datetime

def ejecutar_pipeline_optimizado(sample_size=10000):
    """Ejecuta pipeline con muestreo para manejar memoria limitada"""
    
    print("=== PIPELINE ML MEGAMERCADO OPTIMIZADO ===")
    print(f"Usando muestra de {sample_size:,} registros para optimizar memoria")
    
    try:
        # 1. Cargar datos con muestreo
        base_dir = Path(__file__).parent.parent
        
        print("\nCargando datos con muestreo...")
        
        # Cargar ventas con muestreo
        df_ventas = pd.read_csv(base_dir / 'ventas.csv')
        print(f"Ventas originales: {len(df_ventas):,} registros")
        
        # Muestreo aleatorio
        if len(df_ventas) > sample_size:
            df_ventas = df_ventas.sample(n=sample_size, random_state=42)
            print(f"Muestra de ventas: {len(df_ventas):,} registros")
        
        # Cargar otros datasets
        df_productos = pd.read_csv(base_dir / 'productos.csv')
        df_clientes = pd.read_csv(base_dir / 'clientes.csv')
        
        print(f"Productos: {len(df_productos):,} registros")
        print(f"Clientes: {len(df_clientes):,} registros")
        
        # 2. Fusionar datos de forma eficiente
        print("\nFusionando datos...")
        
        # Solo fusionar productos (más pequeño)
        df_main = df_ventas.merge(
            df_productos[['producto_id', 'categoria', 'precio_base']], 
            on='producto_id', 
            how='left'
        )
        print(f"Después de fusionar productos: {df_main.shape}")
        
        # Fusionar solo información básica de clientes  
        df_clientes_small = df_clientes[['cliente_id', 'edad']].copy()
        df_main = df_main.merge(df_clientes_small, on='cliente_id', how='left')
        print(f"Después de fusionar clientes: {df_main.shape}")
        
        # 3. Ingeniería de características
        print("\nCreando características...")
        
        # Convertir fecha a características temporales
        df_main['fecha'] = pd.to_datetime(df_main['fecha'])
        df_main['mes'] = df_main['fecha'].dt.month
        df_main['dia_semana'] = df_main['fecha'].dt.dayofweek
        df_main['es_fin_semana'] = (df_main['dia_semana'] >= 5).astype(int)
        
        # Codificar categoría como numérico
        categoria_map = {cat: idx for idx, cat in enumerate(df_main['categoria'].unique())}
        df_main['categoria_encoded'] = df_main['categoria'].map(categoria_map)
        
        # Crear característica de margen
        df_main['margen'] = df_main['precio_unitario'] - df_main['precio_base']
        
        print("Características temporales y categóricas creadas")
        
        # 4. Preparar datos para ML
        print("\nPreparando datos para Machine Learning...")
        
        # Seleccionar características
        feature_cols = [
            'precio_unitario', 'precio_base', 'edad', 'mes', 'dia_semana', 
            'es_fin_semana', 'categoria_encoded', 'margen'
        ]
        
        target_col = 'cantidad'
        
        # Limpiar datos
        df_clean = df_main.dropna(subset=[target_col])
        
        # Imputar valores faltantes en características
        for col in feature_cols:
            if col in df_clean.columns:
                if df_clean[col].isnull().sum() > 0:
                    if df_clean[col].dtype in ['int64', 'float64']:
                        df_clean[col].fillna(df_clean[col].median(), inplace=True)
                    else:
                        df_clean[col].fillna(0, inplace=True)
        
        # Preparar X y y
        available_features = [col for col in feature_cols if col in df_clean.columns]
        X = df_clean[available_features].copy()
        y = df_clean[target_col].copy()
        
        print(f"Dataset final: {len(X):,} muestras, {len(available_features)} características")
        print(f"Características utilizadas: {available_features}")
        
        # 5. División y entrenamiento
        print("\nDividiendo datos y entrenando modelos...")
        
        from sklearn.model_selection import train_test_split
        from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
        from sklearn.linear_model import LinearRegression, Ridge
        from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
        
        # División de datos
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y, test_size=0.3, random_state=42
        )
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=0.5, random_state=42
        )
        
        print(f"Entrenamiento: {len(X_train):,} | Validación: {len(X_val):,} | Prueba: {len(X_test):,}")
        
        # Definir modelos
        modelos = {
            'Linear_Regression': LinearRegression(),
            'Ridge_Regression': Ridge(alpha=1.0),
            'Random_Forest': RandomForestRegressor(
                n_estimators=50,  # Reducido para velocidad
                max_depth=10,
                random_state=42,
                n_jobs=1  # Un solo core para evitar problemas de memoria
            ),
            'Gradient_Boosting': GradientBoostingRegressor(
                n_estimators=50,  # Reducido para velocidad
                max_depth=6,
                random_state=42
            )
        }
        
        resultados = {}
        
        # Entrenar cada modelo
        for nombre, modelo in modelos.items():
            print(f"\nEntrenando {nombre}...")
            
            try:
                # Entrenar
                modelo.fit(X_train, y_train)
                
                # Predicciones
                y_pred_val = modelo.predict(X_val)
                y_pred_test = modelo.predict(X_test)
                
                # Métricas
                val_rmse = np.sqrt(mean_squared_error(y_val, y_pred_val))
                val_mae = mean_absolute_error(y_val, y_pred_val)
                val_r2 = r2_score(y_val, y_pred_val)
                
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
                
                print(f"  RMSE: {val_rmse:.4f} | MAE: {val_mae:.4f} | R²: {val_r2:.4f}")
                
                # Feature importance si está disponible
                if hasattr(modelo, 'feature_importances_'):
                    importance = modelo.feature_importances_
                    feature_importance = list(zip(available_features, importance))
                    feature_importance.sort(key=lambda x: x[1], reverse=True)
                    resultados[nombre]['feature_importance'] = feature_importance
                    
                    print(f"  Top 3 características importantes:")
                    for feat, imp in feature_importance[:3]:
                        print(f"    {feat}: {imp:.4f}")
                
            except Exception as e:
                print(f"  ERROR: {e}")
        
        # 6. Resultados y selección del mejor modelo
        print("\n" + "="*50)
        print("RESULTADOS FINALES")
        print("="*50)
        
        if resultados:
            # Encontrar mejor modelo
            mejor_modelo = min(resultados.keys(), 
                             key=lambda x: resultados[x]['val_rmse'])
            
            print(f"\nMEJOR MODELO: {mejor_modelo}")
            
            # Tabla de comparación
            print(f"\n{'Modelo':<20} {'RMSE_Val':<10} {'MAE_Val':<10} {'R2_Val':<10}")
            print("-" * 50)
            
            for nombre, res in sorted(resultados.items(), 
                                    key=lambda x: x[1]['val_rmse']):
                es_mejor = " *" if nombre == mejor_modelo else "  "
                print(f"{nombre:<20} {res['val_rmse']:<10.4f} {res['val_mae']:<10.4f} {res['val_r2']:<10.4f}{es_mejor}")
            
            # Resultados del mejor modelo en test
            mejor_res = resultados[mejor_modelo]
            print(f"\nRESULTADOS EN CONJUNTO DE PRUEBA ({mejor_modelo}):")
            print(f"  RMSE: {mejor_res['test_rmse']:.4f}")
            print(f"  MAE:  {mejor_res['test_mae']:.4f}")  
            print(f"  R²:   {mejor_res['test_r2']:.4f}")
            
            # Feature importance del mejor modelo
            if 'feature_importance' in mejor_res:
                print(f"\nCARACTERÍSTICAS MÁS IMPORTANTES ({mejor_modelo}):")
                for feat, imp in mejor_res['feature_importance'][:5]:
                    print(f"  {feat}: {imp:.4f}")
            
            # 7. Guardar resultados
            print("\nGuardando resultados...")
            
            output_dir = Path("resultados_optimizado")
            output_dir.mkdir(exist_ok=True)
            
            # Resumen completo
            resumen = {
                'configuracion': {
                    'fecha_ejecucion': datetime.now().isoformat(),
                    'muestra_utilizada': sample_size,
                    'registros_procesados': len(X),
                    'caracteristicas': available_features
                },
                'mejor_modelo': mejor_modelo,
                'resultados_validacion': {
                    nombre: {
                        'rmse': float(res['val_rmse']),
                        'mae': float(res['val_mae']),
                        'r2': float(res['val_r2'])
                    } for nombre, res in resultados.items()
                },
                'resultado_test': {
                    'rmse': float(mejor_res['test_rmse']),
                    'mae': float(mejor_res['test_mae']),
                    'r2': float(mejor_res['test_r2'])
                },
                'feature_importance': mejor_res.get('feature_importance', [])
            }
            
            # Guardar JSON
            with open(output_dir / 'resumen_completo.json', 'w') as f:
                json.dump(resumen, f, indent=2, default=str)
            
            # Guardar modelo
            import joblib
            joblib.dump(mejor_res['modelo'], 
                       output_dir / f'modelo_{mejor_modelo.lower()}.pkl')
            
            # Guardar datos procesados para futuro uso
            X_test.to_csv(output_dir / 'X_test.csv', index=False)
            y_test.to_csv(output_dir / 'y_test.csv', index=False)
            
            print(f"Todos los resultados guardados en: {output_dir}/")
            
            # Análisis de predicciones
            print(f"\nANÁLISIS DE PREDICCIONES:")
            y_pred_final = mejor_res['modelo'].predict(X_test)
            
            # Estadísticas de errores
            errores = np.abs(y_test - y_pred_final)
            print(f"  Error promedio: {errores.mean():.4f}")
            print(f"  Error máximo: {errores.max():.4f}")
            print(f"  Error mínimo: {errores.min():.4f}")
            print(f"  90% de predicciones tienen error menor a: {np.percentile(errores, 90):.4f}")
            
            print("\n" + "="*50)
            print("PIPELINE COMPLETADO EXITOSAMENTE!")
            print("="*50)
            
            return resumen
            
        else:
            print("ERROR: No se pudieron entrenar modelos")
            return None
            
    except Exception as e:
        print(f"ERROR CRÍTICO: {e}")
        import traceback
        traceback.print_exc()
        return None

def ejemplo_prediccion():
    """Ejemplo de cómo usar el modelo entrenado para predicciones"""
    
    print("\n=== EJEMPLO DE PREDICCIÓN ===")
    
    try:
        import joblib
        
        # Buscar modelo guardado
        models_dir = Path("resultados_optimizado")
        if not models_dir.exists():
            print("No se encontraron modelos entrenados. Ejecuta primero el pipeline.")
            return
        
        # Cargar modelo
        model_files = list(models_dir.glob("modelo_*.pkl"))
        if not model_files:
            print("No se encontró archivo de modelo.")
            return
            
        modelo = joblib.load(model_files[0])
        print(f"Modelo cargado: {model_files[0].name}")
        
        # Crear datos de ejemplo
        ejemplo_data = pd.DataFrame({
            'precio_unitario': [25.5],
            'precio_base': [20.0],
            'edad': [35],
            'mes': [6],
            'dia_semana': [2],
            'es_fin_semana': [0],
            'categoria_encoded': [1],
            'margen': [5.5]
        })
        
        # Predicción
        prediccion = modelo.predict(ejemplo_data)[0]
        
        print("Datos de entrada:")
        for col, val in ejemplo_data.iloc[0].items():
            print(f"  {col}: {val}")
        
        print(f"\nPredicción de demanda: {prediccion:.2f} unidades")
        
    except Exception as e:
        print(f"Error en predicción: {e}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "predict":
            ejemplo_prediccion()
        elif sys.argv[1] == "small":
            ejecutar_pipeline_optimizado(sample_size=5000)
        else:
            try:
                sample_size = int(sys.argv[1])
                ejecutar_pipeline_optimizado(sample_size=sample_size)
            except:
                print("Uso: python script.py [tamaño_muestra|predict|small]")
    else:
        # Ejecución por defecto
        ejecutar_pipeline_optimizado(sample_size=10000)