# 📦 Archivos Estáticos - Backend

## 📋 Propósito

Este directorio contiene los archivos estáticos que **Spring Boot sirve automáticamente** cuando la aplicación está corriendo.

## 🎯 ¿Qué son estos archivos?

Estos son los archivos del frontend que se sirven en:
- `http://localhost:8080/` → `index.html`
- `http://localhost:8080/app.js` → `app.js`
- `http://localhost:8080/Styles.css` → `Styles.css`
- `http://localhost:8080/*.jpg, *.png` → Imágenes

## 🔄 Origen de los Archivos

**Estos archivos provienen de `/ASISTENTE/frontend/`**

- **Código fuente**: `/ASISTENTE/frontend/` (aquí editas)
- **Archivos servidos**: `/ASISTENTE/backend/src/main/resources/static/` (este directorio)

## 📝 Flujo de Trabajo

1. **Edita** los archivos en `/ASISTENTE/frontend/`
2. **Copia** los cambios a este directorio (`/backend/src/main/resources/static/`)
3. **Reinicia** el backend para ver los cambios

### Sincronización Rápida

```bash
# Desde /ASISTENTE/
./sync-frontend.sh
```

## ⚠️ Importante

- **NO edites directamente aquí** si trabajas en `/frontend/`
- **SÍ edita aquí** si prefieres trabajar directamente en los archivos servidos
- Spring Boot **sirve automáticamente** todos los archivos de este directorio
- Los cambios requieren **reiniciar el backend** para verse

## 📁 Archivos en este Directorio

- `index.html` - Página principal
- `app.js` - Lógica JavaScript
- `Styles.css` - Estilos CSS
- `*.jpg, *.png` - Imágenes y recursos

## 🔗 Ver También

- `/ASISTENTE/frontend/README.md` - Documentación del código fuente
- `/ASISTENTE/ESTRUCTURA.md` - Estructura completa del proyecto
