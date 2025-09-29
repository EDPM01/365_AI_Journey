# 🤖 Automatización del Pipeline ML - MegaMercado
"""
Script de automatización para ejecutar el pipeline de ML
con diferentes configuraciones y casos de uso
"""

import argparse
import json
import logging
from pathlib import Path
from datetime import datetime
import sys
import os

# Añadir el directorio del pipeline al path
sys.path.append(str(Path(__file__).parent))

from pipeline import MLPipeline, create_demand_prediction_pipeline
from config import get_config

class PipelineAutomation:
    """
    Clase para automatizar la ejecución del pipeline ML
    """
    
    def __init__(self):
        self.logger = self._setup_logger()
        self.results_history = []
        
    def _setup_logger(self):
        """Configura logging para automatización"""
        logger = logging.getLogger('PipelineAutomation')
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        
        return logger
    
    def validate_data_files(self, file_paths: dict) -> dict:
        """
        Valida que los archivos de datos existan
        
        Args:
            file_paths: Diccionario con rutas de archivos
            
        Returns:
            Diccionario con archivos válidos
        """
        valid_files = {}
        
        for name, path in file_paths.items():
            if os.path.exists(path):
                valid_files[name] = path
                self.logger.info(f"✅ {name}: {path}")
            else:
                self.logger.warning(f"⚠️  {name}: {path} (no encontrado)")
        
        if not valid_files:
            raise FileNotFoundError("No se encontraron archivos de datos válidos")
        
        return valid_files
    
    def run_demand_prediction(self, 
                            data_dir: str,
                            output_dir: str = "results",
                            environment: str = "development",
                            models: list = None) -> dict:
        """
        Ejecuta pipeline de predicción de demanda
        
        Args:
            data_dir: Directorio con archivos de datos
            output_dir: Directorio de salida
            environment: Ambiente de configuración
            models: Lista de modelos a entrenar
            
        Returns:
            Diccionario con resultados
        """
        self.logger.info("🚀 Iniciando pipeline de predicción de demanda")
        
        # Configurar rutas de datos
        data_path = Path(data_dir)
        file_paths = {
            'ventas': str(data_path / 'ventas.csv'),
            'productos': str(data_path / 'productos.csv'),
            'clientes': str(data_path / 'clientes.csv'),
            'logistica': str(data_path / 'logistica.csv'),
            'proveedores': str(data_path / 'proveedores.csv')
        }
        
        # Validar archivos
        valid_files = self.validate_data_files(file_paths)
        
        # Crear pipeline
        pipeline = create_demand_prediction_pipeline(valid_files, environment)
        
        # Configurar directorio de salida
        pipeline.config.MODELS_DIR = str(Path(output_dir) / "models")
        pipeline.config.REPORTS_DIR = str(Path(output_dir) / "reports")
        pipeline.config.LOGS_DIR = str(Path(output_dir) / "logs")
        
        # Ejecutar pipeline
        results = pipeline.run_full_pipeline(
            valid_files,
            target_column='cantidad_vendida',
            models_to_train=models
        )
        
        # Guardar información de ejecución
        execution_info = {
            'timestamp': datetime.now().isoformat(),
            'environment': environment,
            'data_files': list(valid_files.keys()),
            'models_trained': models,
            'output_directory': output_dir,
            'success': True
        }
        
        self.results_history.append(execution_info)
        
        return results
    
    def run_batch_experiments(self, 
                            data_dir: str,
                            experiments_config: dict,
                            base_output_dir: str = "experiments") -> list:
        """
        Ejecuta múltiples experimentos en lote
        
        Args:
            data_dir: Directorio de datos
            experiments_config: Configuración de experimentos
            base_output_dir: Directorio base de salida
            
        Returns:
            Lista con resultados de todos los experimentos
        """
        self.logger.info("🧪 Iniciando experimentos en lote")
        
        all_results = []
        
        for exp_name, exp_config in experiments_config.items():
            self.logger.info(f"🔬 Ejecutando experimento: {exp_name}")
            
            try:
                # Crear directorio específico para el experimento
                exp_output_dir = Path(base_output_dir) / exp_name
                
                # Ejecutar experimento
                results = self.run_demand_prediction(
                    data_dir=data_dir,
                    output_dir=str(exp_output_dir),
                    environment=exp_config.get('environment', 'development'),
                    models=exp_config.get('models', None)
                )
                
                results['experiment_name'] = exp_name
                results['experiment_config'] = exp_config
                all_results.append(results)
                
                self.logger.info(f"✅ Experimento {exp_name} completado")
                
            except Exception as e:
                self.logger.error(f"❌ Error en experimento {exp_name}: {e}")
                all_results.append({
                    'experiment_name': exp_name,
                    'error': str(e),
                    'success': False
                })
        
        # Generar reporte comparativo
        self._generate_experiments_report(all_results, base_output_dir)
        
        return all_results
    
    def _generate_experiments_report(self, results: list, output_dir: str):
        """Genera reporte comparativo de experimentos"""
        report_data = []
        
        for result in results:
            if result.get('success', False):
                experiment_summary = {
                    'experimento': result.get('experiment_name'),
                    'mejor_modelo': result.get('training', {}).get('best_model'),
                    'modelos_entrenados': len(result.get('training', {}).get('successful_models', [])),
                }
                
                # Añadir métricas si están disponibles
                if 'evaluation' in result and 'test_metrics' in result['evaluation']:
                    metrics = result['evaluation']['test_metrics']
                    experiment_summary.update({
                        'rmse': metrics.get('rmse'),
                        'mae': metrics.get('mae'),
                        'r2': metrics.get('r2'),
                        'mape': metrics.get('mape')
                    })
                
                report_data.append(experiment_summary)
        
        # Guardar reporte
        if report_data:
            report_path = Path(output_dir) / "experiments_comparison.json"
            with open(report_path, 'w') as f:
                json.dump(report_data, f, indent=2, default=str)
            
            self.logger.info(f"📊 Reporte de experimentos guardado: {report_path}")
    
    def schedule_periodic_training(self, 
                                 data_dir: str,
                                 schedule_config: dict):
        """
        Programa entrenamiento periódico (para uso futuro con scheduler)
        
        Args:
            data_dir: Directorio de datos
            schedule_config: Configuración de programación
        """
        self.logger.info("⏰ Configurando entrenamiento periódico")
        
        # Este método sería implementado con una librería como APScheduler
        # para entrenamientos automáticos periódicos
        
        schedule_info = {
            'data_directory': data_dir,
            'frequency': schedule_config.get('frequency', 'daily'),
            'models': schedule_config.get('models', ['random_forest', 'xgboost']),
            'notification_email': schedule_config.get('email'),
            'configured_at': datetime.now().isoformat()
        }
        
        # Guardar configuración de programación
        config_path = Path("scheduled_training_config.json")
        with open(config_path, 'w') as f:
            json.dump(schedule_info, f, indent=2)
        
        self.logger.info(f"📅 Configuración de programación guardada: {config_path}")
        
    def monitor_model_performance(self, 
                                model_path: str,
                                new_data_path: str,
                                threshold_config: dict):
        """
        Monitorea performance del modelo con nuevos datos
        
        Args:
            model_path: Ruta del modelo
            new_data_path: Ruta de nuevos datos
            threshold_config: Configuración de umbrales
        """
        self.logger.info("📈 Monitoreando performance del modelo")
        
        # En implementación completa, evaluaría el modelo contra nuevos datos
        # y alertaría si la performance cae por debajo de umbrales
        
        monitoring_result = {
            'model_path': model_path,
            'evaluation_date': datetime.now().isoformat(),
            'data_source': new_data_path,
            'thresholds': threshold_config,
            'status': 'monitored'
        }
        
        # Guardar resultado de monitoreo
        monitor_path = Path("model_monitoring.json")
        
        # Cargar historial si existe
        monitoring_history = []
        if monitor_path.exists():
            with open(monitor_path, 'r') as f:
                monitoring_history = json.load(f)
        
        monitoring_history.append(monitoring_result)
        
        # Guardar historial actualizado
        with open(monitor_path, 'w') as f:
            json.dump(monitoring_history, f, indent=2, default=str)
        
        self.logger.info("✅ Monitoreo completado")

def create_cli_parser():
    """Crea parser para interfaz de línea de comandos"""
    parser = argparse.ArgumentParser(
        description="Pipeline ML Automatizado - MegaMercado",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  
  # Ejecutar pipeline básico
  python automation.py run --data-dir ../data --models random_forest xgboost
  
  # Ejecutar experimentos en lote
  python automation.py batch --data-dir ../data --config experiments.json
  
  # Configurar monitoreo
  python automation.py monitor --model best_model.pkl --data new_data.csv
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Comandos disponibles')
    
    # Comando 'run'
    run_parser = subparsers.add_parser('run', help='Ejecutar pipeline único')
    run_parser.add_argument('--data-dir', required=True, help='Directorio de datos')
    run_parser.add_argument('--output-dir', default='results', help='Directorio de salida')
    run_parser.add_argument('--environment', choices=['development', 'production'], 
                          default='development', help='Ambiente de configuración')
    run_parser.add_argument('--models', nargs='*', 
                          help='Modelos a entrenar (ej: random_forest xgboost)')
    
    # Comando 'batch'
    batch_parser = subparsers.add_parser('batch', help='Ejecutar experimentos en lote')
    batch_parser.add_argument('--data-dir', required=True, help='Directorio de datos')
    batch_parser.add_argument('--config', required=True, help='Archivo de configuración JSON')
    batch_parser.add_argument('--output-dir', default='experiments', help='Directorio base de salida')
    
    # Comando 'monitor'
    monitor_parser = subparsers.add_parser('monitor', help='Monitorear modelo')
    monitor_parser.add_argument('--model', required=True, help='Ruta del modelo')
    monitor_parser.add_argument('--data', required=True, help='Datos para evaluación')
    monitor_parser.add_argument('--thresholds', help='Archivo JSON con umbrales')
    
    # Comando 'schedule'
    schedule_parser = subparsers.add_parser('schedule', help='Programar entrenamiento')
    schedule_parser.add_argument('--data-dir', required=True, help='Directorio de datos')
    schedule_parser.add_argument('--frequency', default='daily', help='Frecuencia de entrenamiento')
    schedule_parser.add_argument('--models', nargs='*', help='Modelos a entrenar')
    
    return parser

def main():
    """Función principal del CLI"""
    parser = create_cli_parser()
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    automation = PipelineAutomation()
    
    try:
        if args.command == 'run':
            # Ejecutar pipeline único
            results = automation.run_demand_prediction(
                data_dir=args.data_dir,
                output_dir=args.output_dir,
                environment=args.environment,
                models=args.models
            )
            
            print("✅ Pipeline ejecutado exitosamente")
            if 'training' in results:
                print(f"🏆 Mejor modelo: {results['training'].get('best_model')}")
        
        elif args.command == 'batch':
            # Cargar configuración de experimentos
            with open(args.config, 'r') as f:
                experiments_config = json.load(f)
            
            # Ejecutar experimentos
            results = automation.run_batch_experiments(
                data_dir=args.data_dir,
                experiments_config=experiments_config,
                base_output_dir=args.output_dir
            )
            
            successful = sum(1 for r in results if r.get('success', False))
            print(f"✅ Experimentos completados: {successful}/{len(results)}")
        
        elif args.command == 'monitor':
            # Configurar umbrales
            thresholds = {}
            if args.thresholds and os.path.exists(args.thresholds):
                with open(args.thresholds, 'r') as f:
                    thresholds = json.load(f)
            
            # Ejecutar monitoreo
            automation.monitor_model_performance(
                model_path=args.model,
                new_data_path=args.data,
                threshold_config=thresholds
            )
            
            print("✅ Monitoreo configurado")
        
        elif args.command == 'schedule':
            # Configurar programación
            schedule_config = {
                'frequency': args.frequency,
                'models': args.models or ['random_forest', 'xgboost']
            }
            
            automation.schedule_periodic_training(
                data_dir=args.data_dir,
                schedule_config=schedule_config
            )
            
            print("✅ Entrenamiento programado configurado")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())