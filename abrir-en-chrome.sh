#!/bin/bash

# Script para abrir la aplicación del asistente en Chrome
# Asegúrate de que el backend esté ejecutándose en el puerto 8080

echo "🚀 Abriendo Asistente de Proyectos en Chrome..."
echo "📡 Asegúrate de que el backend esté ejecutándose en http://localhost:8080"

# Verificar si Chrome está instalado
if [ -d "/Applications/Google Chrome.app" ]; then
    echo "✅ Chrome encontrado"
    
    # Abrir la aplicación en Chrome
    open -a "Google Chrome" "http://localhost:8080"
    
    echo "🌐 Aplicación abierta en Chrome"
    echo "💡 Si no se abre automáticamente, copia y pega esta URL en Chrome: http://localhost:8080"
else
    echo "❌ Chrome no está instalado"
    echo "📥 Descarga Chrome desde: https://www.google.com/chrome/"
    echo "🔄 Abriendo en el navegador predeterminado..."
    open "http://localhost:8080"
fi

echo ""
echo "🔧 Para cambiar el navegador predeterminado:"
echo "   Preferencias del Sistema > General > Navegador web predeterminado"

