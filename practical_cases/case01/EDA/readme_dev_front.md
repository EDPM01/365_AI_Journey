# 📊 Dashboard MegaMercado - Guía de Instalación Frontend

## 🚀 Instalación y Dependencias

Esta sección proporciona instrucciones completas para instalar y configurar el dashboard de MegaMercado con Streamlit.

---

## 📋 **REQUISITOS DEL SISTEMA**

### **💻 Requisitos Mínimos**
- **Python**: 3.9 o superior
- **RAM**: 4 GB (recomendado 8 GB)
- **Espacio en disco**: 2 GB libres
- **Sistema operativo**: Windows 10/11, macOS 10.14+, Ubuntu 18.04+
- **Navegador web**: Chrome 90+, Firefox 88+, Safari 14+

### **🌐 Requisitos de Red**
- **Conexión a internet** para instalación de dependencias
- **Puerto 8501** disponible (configurable)
- **Acceso a APIs externas** (opcional para integraciones)

---

## 🔧 **INSTALACIÓN PASO A PASO**

### **1️⃣ Preparación del Entorno**

#### **Windows**
```powershell
# Verificar versión de Python
python --version

# Si no tienes Python, descarga desde python.org
# Asegúrate de marcar "Add Python to PATH"

# Actualizar pip
python -m pip install --upgrade pip

# Instalar virtualenv (si no lo tienes)
pip install virtualenv
```

#### **macOS**
```bash
# Instalar Python con Homebrew (recomendado)
brew install python

# O verificar versión existente
python3 --version

# Actualizar pip
python3 -m pip install --upgrade pip

# Instalar virtualenv
pip3 install virtualenv
```

#### **Linux (Ubuntu/Debian)**
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Python y pip
sudo apt install python3 python3-pip python3-venv -y

# Verificar instalación
python3 --version
pip3 --version
```

### **2️⃣ Clonación del Repositorio**

```bash
# Clonar el repositorio
git clone https://github.com/megamercado/dashboard.git
cd dashboard

# O descargar ZIP desde GitHub si no tienes Git
# Extraer en carpeta dashboard/
```

### **3️⃣ Configuración del Entorno Virtual**

#### **Crear Entorno Virtual**
```bash
# Windows
python -m venv dashboard_env

# macOS/Linux  
python3 -m venv dashboard_env
```

#### **Activar Entorno Virtual**
```bash
# Windows (PowerShell)
dashboard_env\Scripts\Activate.ps1

# Windows (Command Prompt)
dashboard_env\Scripts\activate.bat

# macOS/Linux
source dashboard_env/bin/activate

# Verificar activación (debe aparecer (dashboard_env) en el prompt)
which python  # macOS/Linux
where python   # Windows
```

### **4️⃣ Instalación de Dependencias**

#### **Instalación Básica**
```bash
# Instalar todas las dependencias
pip install -r requirements.txt

# Verificar instalación
pip list
```

#### **Instalación Manual (Alternativa)**
```bash
# Core dependencies
pip install streamlit==1.28.0
pip install pandas==2.0.3
pip install numpy==1.24.3
pip install plotly==5.15.0

# Machine Learning
pip install scikit-learn==1.3.0
pip install xgboost==1.7.4

# Data processing
pip install openpyxl==3.1.2
pip install python-dateutil==2.8.2

# Visualization
pip install seaborn==0.12.2
pip install matplotlib==3.7.1

# Utilities
pip install Pillow==10.0.0
pip install requests==2.31.0
```

---

## 📦 **DEPENDENCIAS DETALLADAS**

### **🔧 Core Framework**
```txt
streamlit>=1.28.0          # Framework principal del dashboard
streamlit-authenticator    # Sistema de autenticación (opcional)
streamlit-option-menu     # Menús de navegación avanzados
```

### **📊 Análisis de Datos**
```txt
pandas>=2.0.0             # Manipulación de datos
numpy>=1.24.0             # Operaciones numéricas
scipy>=1.10.0             # Estadísticas avanzadas
```

### **📈 Visualización**
```txt
plotly>=5.15.0            # Gráficos interactivos principales
matplotlib>=3.7.0         # Gráficos básicos
seaborn>=0.12.0           # Visualizaciones estadísticas
folium>=0.14.0            # Mapas interactivos (opcional)
```

### **🤖 Machine Learning**
```txt
scikit-learn>=1.3.0       # Algoritmos ML básicos
xgboost>=1.7.0            # Algoritmos de boosting
joblib>=1.3.0             # Serialización de modelos
```

### **💾 Almacenamiento y I/O**
```txt
openpyxl>=3.1.0           # Lectura/escritura Excel
xlsxwriter>=3.1.0         # Creación de archivos Excel
PyPDF2>=3.0.0             # Generación de PDFs
python-dateutil>=2.8.0    # Manejo de fechas
```

### **🔌 Conectividad**
```txt
requests>=2.31.0          # APIs HTTP
sqlalchemy>=2.0.0         # Conexiones a BD (opcional)
psycopg2-binary>=2.9.0    # PostgreSQL (opcional)
```

### **🎨 UI/UX Enhancement**
```txt
Pillow>=9.5.0             # Procesamiento de imágenes
streamlit-aggrid          # Tablas avanzadas (opcional)
streamlit-elements        # Componentes web (opcional)
```

---

## ⚙️ **CONFIGURACIÓN INICIAL**

### **1️⃣ Variables de Entorno**

Crear archivo `.env` en la raíz del proyecto:

```bash
# .env
# =====

# Configuración del Dashboard
DASHBOARD_TITLE="MegaMercado Dashboard"
DASHBOARD_ICON="🏪"
DASHBOARD_LAYOUT="wide"

# Configuración de datos
DATA_PATH="./data/"
MODELS_PATH="./models/"
CACHE_DIR="./cache/"

# Configuración de Streamlit
STREAMLIT_SERVER_PORT=8501
STREAMLIT_SERVER_ADDRESS="localhost"
STREAMLIT_SERVER_HEADLESS=false

# Base de datos (opcional)
DATABASE_URL="sqlite:///megamercado.db"
# DATABASE_URL="postgresql://user:password@localhost/megamercado"

# APIs externas (opcional)
API_KEY="your-api-key-here"
API_ENDPOINT="https://api.megamercado.com"

# Configuración de cache
CACHE_TTL=3600
MAX_CACHE_ENTRIES=100

# Logging
LOG_LEVEL="INFO"
LOG_FILE="dashboard.log"

# Seguridad (si usas autenticación)
SECRET_KEY="your-secret-key-here"
SESSION_TIMEOUT=3600
```

### **2️⃣ Configuración de Streamlit**

Crear carpeta `.streamlit/` y archivo `config.toml`:

```bash
# Crear directorio de configuración
mkdir .streamlit
```

```toml
# .streamlit/config.toml
# =====================

[global]
# Configuración global
dataFrameSerialization = "arrow"
developmentMode = false
logLevel = "info"

[server]
# Configuración del servidor
port = 8501
address = "localhost"
baseUrlPath = ""
enableCORS = false
enableXsrfProtection = false
maxUploadSize = 200
maxMessageSize = 200
enableWebsocketCompression = false
headless = false

[browser]
# Configuración del navegador
serverAddress = "localhost"
gatherUsageStats = false
serverPort = 8501

[theme]
# Tema visual del dashboard
primaryColor = "#FF6B6B"
backgroundColor = "#FFFFFF"
secondaryBackgroundColor = "#F0F2F6"
textColor = "#262730"
font = "sans serif"

[client]
# Configuración del cliente
caching = true
displayEnabled = true
showErrorDetails = true

[runner]
# Configuración del ejecutor
magicEnabled = true
installTracer = false
fixMatplotlib = true
postScriptGC = true
fastReruns = true
enforceSerializableSessionState = true

[mapbox]
# Configuración de Mapbox (opcional)
token = "your-mapbox-token-here"
```

### **3️⃣ Configuración de Logging**

Crear archivo `logging.conf`:

```ini
# logging.conf
# ============

[loggers]
keys=root,dashboard

[handlers]
keys=consoleHandler,fileHandler

[formatters]
keys=simpleFormatter,detailedFormatter

[logger_root]
level=INFO
handlers=consoleHandler,fileHandler

[logger_dashboard]
level=DEBUG
handlers=consoleHandler,fileHandler
qualname=dashboard
propagate=0

[handler_consoleHandler]
class=StreamHandler
level=INFO
formatter=simpleFormatter
args=(sys.stdout,)

[handler_fileHandler]
class=FileHandler
level=DEBUG
formatter=detailedFormatter
args=('dashboard.log', 'a')

[formatter_simpleFormatter]
format=%(asctime)s - %(name)s - %(levelname)s - %(message)s

[formatter_detailedFormatter]
format=%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(funcName)s - %(message)s
```

---

## 🧪 **VERIFICACIÓN DE LA INSTALACIÓN**

### **1️⃣ Test de Dependencias**

Crear archivo `test_installation.py`:

```python
#!/usr/bin/env python3
# test_installation.py
# ===================

"""
Script para verificar que todas las dependencias estén correctamente instaladas.
"""

import sys
import importlib
import subprocess

def test_python_version():
    """Verifica la versión de Python"""
    print("🐍 Verificando versión de Python...")
    version = sys.version_info
    print(f"   Versión: Python {version.major}.{version.minor}.{version.micro}")
    
    if version.major >= 3 and version.minor >= 9:
        print("   ✅ Versión de Python OK")
        return True
    else:
        print("   ❌ Se requiere Python 3.9 o superior")
        return False

def test_dependencies():
    """Verifica las dependencias principales"""
    print("\n📦 Verificando dependencias...")
    
    dependencies = {
        'streamlit': 'Framework del dashboard',
        'pandas': 'Análisis de datos',
        'numpy': 'Operaciones numéricas',
        'plotly': 'Visualizaciones interactivas',
        'sklearn': 'Machine Learning',
        'xgboost': 'Algoritmos avanzados',
        'openpyxl': 'Archivos Excel',
        'PIL': 'Procesamiento de imágenes'
    }
    
    failed = []
    
    for package, description in dependencies.items():
        try:
            importlib.import_module(package)
            print(f"   ✅ {package:<12} - {description}")
        except ImportError:
            print(f"   ❌ {package:<12} - {description} (FALTANTE)")
            failed.append(package)
    
    return len(failed) == 0, failed

def test_streamlit():
    """Verifica que Streamlit funcione correctamente"""
    print("\n🚀 Verificando Streamlit...")
    
    try:
        result = subprocess.run(
            ['streamlit', '--version'], 
            capture_output=True, 
            text=True, 
            timeout=10
        )
        
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"   ✅ {version}")
            return True
        else:
            print(f"   ❌ Error ejecutando Streamlit: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_data_files():
    """Verifica que los archivos de datos existan"""
    print("\n📁 Verificando archivos de datos...")
    
    import os
    
    data_files = [
        'data/clientes.csv',
        'data/productos.csv', 
        'data/ventas.csv',
        'data/logistica.csv',
        'data/proveedores.csv'
    ]
    
    missing = []
    
    for file_path in data_files:
        if os.path.exists(file_path):
            size = os.path.getsize(file_path) / 1024  # KB
            print(f"   ✅ {file_path:<20} ({size:.1f} KB)")
        else:
            print(f"   ⚠️  {file_path:<20} (NO ENCONTRADO)")
            missing.append(file_path)
    
    return len(missing) == 0, missing

def main():
    """Función principal de verificación"""
    print("🔍 VERIFICACIÓN DE INSTALACIÓN - DASHBOARD MEGAMERCADO")
    print("=" * 60)
    
    tests_passed = 0
    total_tests = 4
    
    # Test 1: Versión de Python
    if test_python_version():
        tests_passed += 1
    
    # Test 2: Dependencias
    deps_ok, failed_deps = test_dependencies()
    if deps_ok:
        tests_passed += 1
    
    # Test 3: Streamlit
    if test_streamlit():
        tests_passed += 1
    
    # Test 4: Archivos de datos
    data_ok, missing_files = test_data_files()
    if data_ok:
        tests_passed += 1
    
    # Resumen final
    print("\n" + "=" * 60)
    print(f"📊 RESUMEN: {tests_passed}/{total_tests} tests pasaron")
    
    if tests_passed == total_tests:
        print("🎉 ¡INSTALACIÓN COMPLETA Y FUNCIONAL!")
        print("\n🚀 Para ejecutar el dashboard:")
        print("   streamlit run dashboard.py")
    else:
        print("❌ INSTALACIÓN INCOMPLETA")
        
        if not deps_ok:
            print(f"\n📦 Instalar dependencias faltantes:")
            for dep in failed_deps:
                print(f"   pip install {dep}")
        
        if not data_ok:
            print(f"\n📁 Archivos de datos faltantes:")
            for file in missing_files:
                print(f"   {file}")
    
    return tests_passed == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
```

### **2️⃣ Ejecutar Verificación**

```bash
# Ejecutar test de instalación
python test_installation.py

# Salida esperada:
# 🔍 VERIFICACIÓN DE INSTALACIÓN - DASHBOARD MEGAMERCADO
# ============================================================
# 🐍 Verificando versión de Python...
#    Versión: Python 3.9.7
#    ✅ Versión de Python OK
# 
# 📦 Verificando dependencias...
#    ✅ streamlit    - Framework del dashboard
#    ✅ pandas       - Análisis de datos
#    ✅ numpy        - Operaciones numéricas
#    ✅ plotly       - Visualizaciones interactivas
#    ✅ sklearn      - Machine Learning
#    ✅ xgboost      - Algoritmos avanzados
#    ✅ openpyxl     - Archivos Excel
#    ✅ PIL          - Procesamiento de imágenes
# 
# 🚀 Verificando Streamlit...
#    ✅ Streamlit, version 1.28.0
# 
# 📁 Verificando archivos de datos...
#    ✅ data/clientes.csv     (245.3 KB)
#    ✅ data/productos.csv    (87.2 KB)
#    ✅ data/ventas.csv       (1240.8 KB)
#    ✅ data/logistica.csv    (156.4 KB)
#    ✅ data/proveedores.csv  (23.1 KB)
# 
# ============================================================
# 📊 RESUMEN: 4/4 tests pasaron
# 🎉 ¡INSTALACIÓN COMPLETA Y FUNCIONAL!
# 
# 🚀 Para ejecutar el dashboard:
#    streamlit run dashboard.py
```

---

## 🚀 **EJECUCIÓN DEL DASHBOARD**

### **1️⃣ Ejecución Básica**

```bash
# Activar entorno virtual (si no está activo)
source dashboard_env/bin/activate  # macOS/Linux
dashboard_env\Scripts\activate     # Windows

# Ejecutar dashboard
streamlit run dashboard.py

# Salida esperada:
#   You can now view your Streamlit app in your browser.
#   
#   Local URL: http://localhost:8501
#   Network URL: http://192.168.1.100:8501
```

### **2️⃣ Ejecución con Configuración Personalizada**

```bash
# Con puerto personalizado
streamlit run dashboard.py --server.port 8502

# Con configuración específica
streamlit run dashboard.py --server.headless true --server.enableCORS false

# Con variables de entorno
STREAMLIT_SERVER_PORT=8503 streamlit run dashboard.py

# En modo desarrollo (auto-reload)
streamlit run dashboard.py --server.runOnSave true
```

### **3️⃣ Ejecución en Background**

```bash
# Linux/macOS - ejecutar en background
nohup streamlit run dashboard.py > dashboard.log 2>&1 &

# Verificar proceso
ps aux | grep streamlit

# Detener proceso
kill $(ps aux | grep 'streamlit run' | awk '{print $2}')
```

---

## 🐛 **TROUBLESHOOTING**

### **❌ Problemas Comunes**

#### **Error: Command 'streamlit' not found**
```bash
# Solución 1: Reinstalar Streamlit
pip uninstall streamlit
pip install streamlit

# Solución 2: Verificar PATH
echo $PATH  # Linux/macOS
echo $env:PATH  # Windows PowerShell

# Solución 3: Usar ruta completa
python -m streamlit run dashboard.py
```

#### **Error: ModuleNotFoundError**
```bash
# Verificar entorno virtual activo
which python  # Debe mostrar ruta del venv

# Reinstalar dependencia específica
pip install --upgrade pandas

# Limpiar cache de pip
pip cache purge
```

#### **Error: Port already in use**
```bash
# Verificar qué proceso usa el puerto 8501
netstat -tlnp | grep :8501  # Linux
netstat -ano | findstr :8501  # Windows

# Usar puerto diferente
streamlit run dashboard.py --server.port 8502

# O detener el proceso que usa el puerto
kill -9 <PID>  # Linux/macOS
taskkill /F /PID <PID>  # Windows
```

#### **Error: Memory/Performance Issues**
```python
# Optimizar configuración de Streamlit
# En .streamlit/config.toml:
[global]
dataFrameSerialization = "arrow"

[runner]
fastReruns = true
postScriptGC = true

# Limpiar cache manualmente
import streamlit as st
st.cache_data.clear()
```

### **🔧 Logs de Debug**

```bash
# Habilitar logs detallados
streamlit run dashboard.py --logger.level debug

# Ver logs en tiempo real
tail -f dashboard.log

# Buscar errores específicos
grep "ERROR" dashboard.log
```

---

## 📊 **MONITOREO DE RECURSOS**

### **💾 Uso de Memoria**

```python
# Agregar al dashboard para monitorear recursos
import psutil
import streamlit as st

def show_system_stats():
    """Muestra estadísticas del sistema"""
    st.sidebar.markdown("---")
    st.sidebar.markdown("📊 **Recursos del Sistema**")
    
    # Memoria
    memory = psutil.virtual_memory()
    st.sidebar.markdown(f"💾 RAM: {memory.percent}% usado")
    
    # CPU
    cpu = psutil.cpu_percent(interval=1)
    st.sidebar.markdown(f"⚡ CPU: {cpu}%")
    
    # Procesos Python
    python_processes = []
    for proc in psutil.process_iter(['pid', 'name', 'memory_percent']):
        if 'python' in proc.info['name'].lower():
            python_processes.append(proc.info)
    
    st.sidebar.markdown(f"🐍 Procesos Python: {len(python_processes)}")
```

---

## 🎯 **OPTIMIZACIÓN DE PERFORMANCE**

### **⚡ Configuración Optimizada**

```python
# dashboard.py - Configuraciones de performance
import streamlit as st

# Configuración de página optimizada
st.set_page_config(
    page_title="MegaMercado Dashboard",
    page_icon="🏪",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={
        'Get Help': 'https://docs.streamlit.io',
        'Report a bug': "https://github.com/megamercado/issues",
        'About': "MegaMercado Dashboard v2.0"
    }
)

# Cache optimizado para datos
@st.cache_data(ttl=3600, max_entries=100)
def load_data():
    """Carga datos con cache optimizado"""
    pass

# Cache para recursos costosos
@st.cache_resource
def load_ml_models():
    """Carga modelos ML una sola vez"""
    pass

# Fragmentos para mejor performance
@st.fragment(run_every=30)
def update_kpis():
    """Actualiza KPIs cada 30 segundos"""
    pass
```

---

## ✅ **CHECKLIST DE INSTALACIÓN**

### **📋 Pre-instalación**
- [ ] ✅ Python 3.9+ instalado
- [ ] ✅ pip actualizado
- [ ] ✅ Git disponible (opcional)
- [ ] ✅ 4GB+ RAM disponible
- [ ] ✅ 2GB+ espacio en disco
- [ ] ✅ Puerto 8501 libre

### **📦 Instalación**
- [ ] ✅ Repositorio clonado/descargado
- [ ] ✅ Entorno virtual creado
- [ ] ✅ Entorno virtual activado
- [ ] ✅ Dependencias instaladas
- [ ] ✅ Test de instalación ejecutado

### **⚙️ Configuración**
- [ ] ✅ Archivo .env configurado
- [ ] ✅ Streamlit config.toml creado
- [ ] ✅ Logs configurados
- [ ] ✅ Archivos de datos disponibles
- [ ] ✅ Variables de entorno verificadas

### **🚀 Ejecución**
- [ ] ✅ Dashboard ejecuta sin errores
- [ ] ✅ Interfaz carga correctamente
- [ ] ✅ Gráficos se renderizan
- [ ] ✅ Navegación funciona
- [ ] ✅ Datos se cargan correctamente

### **🔧 Optimización**
- [ ] ✅ Performance aceptable (<3s carga)
- [ ] ✅ Memoria bajo control (<2GB)
- [ ] ✅ Cache funcionando
- [ ] ✅ Logs sin errores críticos
- [ ] ✅ Responsive design activo

---

## 📞 **SOPORTE TÉCNICO**

### **🆘 Obtener Ayuda**

1. **📚 Documentación**: Revisar este README completo
2. **🐛 Issues**: Crear issue en GitHub con logs de error
3. **💬 Comunidad**: Unirse al canal Slack #dashboard-support
4. **📧 Email**: Contactar a tech-support@megamercado.com

### **📋 Información para Reportes**

Al reportar un problema, incluir:

```bash
# Información del sistema
python --version
pip list | grep streamlit
uname -a  # Linux/macOS
systeminfo  # Windows

# Logs de error
tail -n 50 dashboard.log

# Variables de entorno (sin datos sensibles)
env | grep STREAMLIT
```

---

**🎉 ¡Instalación Completa! El dashboard está listo para usar.**

**🚀 Siguiente paso**: [Guía de Uso del Dashboard](dashboard_usage_guide.md)