# NexBoards Analytics — Frontend

Dashboard de estadísticas operativas portuarias. Construido con React + Chart.js.

## Stack

- **React 19** con Create React App
- **Chart.js 4** + react-chartjs-2 (barras, líneas, dona, torta)
- **Nginx** (producción, vía Docker)
- **FastAPI** como backend (ver `/backend`)

## Configuración rápida

```bash
npm install
npm start          # dev en http://localhost:3000
```

### Variables de entorno

| Variable              | Default              | Descripción                   |
|-----------------------|----------------------|-------------------------------|
| `REACT_APP_API_URL`   | `http://localhost:8000` | URL del backend FastAPI    |

Crear `.env.local` para sobreescribir localmente:
```
REACT_APP_API_URL=http://localhost:8000
```

## Estructura

```
src/
  App.js                  # Shell principal + routing + estado global
  api.js                  # Llamadas HTTP al backend
  constants.js            # LOGO_SRC y otras constantes globales
  context/AuthContext.js  # Autenticación JWT (localStorage)
  utils/filters.js        # Motor de filtros client-side
  components/
    Login.js
    LoadingScreen.js
    Filtros.js
    Resumen.js
    Buques.js
    Cargas.js
    Comparativo.js
    Permisionarios.js
    Admin.js
```

## Logo

Reemplazar `public/logo-placeholder.png` con el logo institucional.
Actualizar `src/constants.js` → `LOGO_SRC` con el nuevo nombre de archivo.

## Build para producción

```bash
npm run build
```

O via Docker:

```bash
docker build -t nexboards-frontend .
docker run -p 3000:3000 -e PORT=3000 nexboards-frontend
```
