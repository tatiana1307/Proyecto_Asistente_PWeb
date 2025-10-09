#!/bin/bash

# Script completo para iniciar el desarrollo del Asistente de Proyectos
# Inicia el backend y abre la aplicación en Chrome

echo "🚀 Iniciando Asistente de Proyectos..."
echo "=================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si Java está instalado
if ! command -v java &> /dev/null; then
    print_error "Java no está instalado. Por favor instala Java 17 o superior."
    exit 1
fi

# Verificar si Maven está instalado
if ! command -v mvn &> /dev/null; then
    print_error "Maven no está instalado. Por favor instala Maven."
    exit 1
fi

# Verificar si Chrome está instalado
if [ ! -d "/Applications/Google Chrome.app" ]; then
    print_warning "Chrome no está instalado. Se abrirá en el navegador predeterminado."
    CHROME_AVAILABLE=false
else
    print_success "Chrome encontrado"
    CHROME_AVAILABLE=true
fi

# Navegar al directorio del backend
BACKEND_DIR="/Users/tatianamontenegro/Downloads/Proyecto_Asistente_PWeb-main/ASISTENTE/backend"
if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Directorio del backend no encontrado: $BACKEND_DIR"
    exit 1
fi

print_status "Navegando al directorio del backend..."
cd "$BACKEND_DIR"

# Verificar si PostgreSQL está ejecutándose
print_status "Verificando conexión a PostgreSQL..."
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    print_warning "PostgreSQL no está ejecutándose. Iniciando PostgreSQL..."
    brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || {
        print_error "No se pudo iniciar PostgreSQL. Por favor inicia PostgreSQL manualmente."
        exit 1
    }
    sleep 3
fi

print_success "PostgreSQL está ejecutándose"

# Compilar y ejecutar el backend
print_status "Compilando el proyecto..."
mvn clean compile

if [ $? -ne 0 ]; then
    print_error "Error al compilar el proyecto"
    exit 1
fi

print_success "Proyecto compilado exitosamente"

# Iniciar el backend en segundo plano
print_status "Iniciando el backend en el puerto 8080..."
mvn spring-boot:run > backend.log 2>&1 &
BACKEND_PID=$!

# Esperar a que el backend esté listo
print_status "Esperando a que el backend esté listo..."
for i in {1..30}; do
    if curl -s http://localhost:8080 > /dev/null 2>&1; then
        print_success "Backend iniciado exitosamente en http://localhost:8080"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "El backend no se inició en el tiempo esperado"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    sleep 2
    echo -n "."
done

# Abrir la aplicación en Chrome
print_status "Abriendo la aplicación..."
if [ "$CHROME_AVAILABLE" = true ]; then
    open -a "Google Chrome" "http://localhost:8080"
    print_success "Aplicación abierta en Chrome"
else
    open "http://localhost:8080"
    print_success "Aplicación abierta en el navegador predeterminado"
fi

echo ""
echo "=================================="
print_success "🎉 Asistente de Proyectos iniciado exitosamente!"
echo ""
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Backend PID: $BACKEND_PID"
echo "📋 Logs del backend: $BACKEND_DIR/backend.log"
echo ""
echo "🛑 Para detener el backend, ejecuta: kill $BACKEND_PID"
echo "📖 Para ver los logs: tail -f $BACKEND_DIR/backend.log"
echo ""
echo "💡 Consejos:"
echo "   - Si cambias el código, reinicia el backend"
echo "   - Los logs se guardan en backend.log"
echo "   - Para cambiar a Chrome como predeterminado:"
echo "     Preferencias del Sistema > General > Navegador web predeterminado"

