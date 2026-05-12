# GDL Qué Hacer — Frontend

Frontend de React + TypeScript + Tailwind para la API de GDL Qué Hacer.

## Stack

- **React 18** + **TypeScript**
- **Tailwind CSS v3** — sistema de diseño oscuro con naranja
- **React Router v6** — navegación SPA
- **Axios** — cliente HTTP con interceptores JWT
- **date-fns** — formateo de fechas en español
- **Lucide React** — iconografía

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Correr en desarrollo (proxy automático a http://localhost:8000)
npm run dev

# Build de producción
npm run build
```

## Configuración

En desarrollo, Vite proxea `/api/*` a `http://localhost:8000` automáticamente.
No necesitas configurar nada si tu API corre en el puerto 8000.

Para producción, edita `.env`:
```
VITE_API_URL=https://tu-api.vercel.app
```

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Explorador de eventos con filtros |
| `/eventos/:id` | Detalle de evento + interacciones |
| `/recomendados` | Recomendaciones personalizadas (KNN+SVM) |
| `/login` | Inicio de sesión |
| `/registro` | Registro de usuario |
| `/perfil` | Perfil y actividad del usuario |
| `/admin` | Panel de administración (solo admins) |

## Funcionalidades

- **Auth JWT** — registro, login, persistencia en localStorage
- **Explorar eventos** — filtros por categoría, fechas, búsqueda textual
- **Detalle de evento** — imagen, descripción, precio, registro de interacciones
- **Recomendaciones** — personalizadas si hay sesión, cold start si no
- **Interacciones** — view, save, interested, uninterested (actualiza perfil ML)
- **Panel admin** — estadísticas, cola de revisión manual, crear eventos
- **Diseño dark** — tema nocturno con naranja GDL, fuentes Syne + DM Sans
