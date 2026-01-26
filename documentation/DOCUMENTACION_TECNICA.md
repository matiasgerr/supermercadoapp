# Documentación Técnica: SupermercadoApp

Esta documentación detalla el funcionamiento interno de la aplicación, cómo se conecta con la base de datos (Supabase), cómo maneja las rutas y el flujo de datos.

## 1. ¿Cómo funciona la App? (Visión General)

La aplicación es un gestor de precios y productos construido con **Next.js** y **React**. Su objetivo es permitir al usuario comparar precios entre diferentes comercios (Supermercados, Farmacias, Mayoristas).

La app funciona como una **SPA (Single Page Application)** híbrida:
1.  **Next.js** carga la estructura inicial.
2.  **React Router** toma el control en el navegador para navegar entre pantallas sin recargar la página.
3.  **Supabase** actúa como el backend "en la nube" donde se guardan los datos reales.

---

## 2. Arquitectura de Rutas (Navegación)

La aplicación utiliza una técnica interesante para combinar Next.js con React Router.

### A. El Punto de Entrada (Next.js)
El archivo clave es `app/[[...slug]]/page.tsx`.
*   **¿Qué hace?**: Es una ruta "Catch-All" (Atrapar todo). Le dice a Next.js: *"No importa qué URL escriba el usuario (/inicio, /gestion/farmacia), mándalo siempre a este archivo"*.
*   **Código clave**:
    ```tsx
    const App = dynamic(() => import("../../app"), { ssr: false });
    ```
    Carga el componente principal `App` solo en el cliente (navegador), evitando errores de "hidratación".

### B. El Enrutador del Cliente (React Router)
Una vez cargada la página, el archivo `app/app.tsx` toma el control usando `BrowserRouter`.
*   Define las "páginas internas":
    *   `/` -> Muestra el **Selector** (Menú principal).
    *   `/gestion/:tipo` -> Muestra el **PanelGestion** (Tabla de precios).
        *   `:tipo` es una variable dinámica (ej: "farmacia", "supermercado").

---

## 3. Integración con Supabase (Base de Datos)

Supabase es nuestra base de datos en la nube (PostgreSQL).

### A. Conexión (`app/lib/superbaseClient.ts`)
Aquí se crea el "teléfono" para llamar a la base de datos.
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```
Usa las variables de entorno (`.env.local`) para saber a qué proyecto conectarse y tener permiso.

### B. ¿Cómo enviamos y recibimos datos?
Todo ocurre en `app/components/Gestion.tsx`.

#### 1. Leer Datos (SELECT)
Cuando entras a una categoría (ej: Farmacia), la app pregunta: *"¿Dame todos los locales de Farmacia y sus productos?"*.

```typescript
// 1. Busca el ID de la categoría 'Farmacia'
const { data: catData } = await supabase
    .from('categorias')
    .select('id')
    .ilike('nombre', tipo) // tipo viene de la URL
    .single();

// 2. Trae los comercios de esa categoría y sus productos anidados
const { data } = await supabase
    .from('comercios')
    .select('*, productos(*)') // <--- El asterisco mágico trae los productos hijos
    .eq('categoria_id', catData.id);
```

#### 2. Enviar Datos (INSERT)
Cuando creas un nuevo local:
```typescript
await supabase
    .from('comercios')
    .insert([{ nombre: "Nombre Local", categoria_id: ... }]);
```

---

## 4. Mapa Conceptual del Recorrido (Flujo de Usuario)

```mermaid
graph TD
    A[Inicio (Usuario entra a la web)] --> B(Selector.tsx);
    B --> |Clic en 'Farmacia'| C[URL cambia a /gestion/farmacia];
    B --> |Clic en 'Super'| D[URL cambia a /gestion/supermercado];
    
    C --> E(App.tsx detecta ruta);
    E --> F(PanelGestion.tsx);
    
    F --> |1. useEffect| G[Llama a Supabase: traerDatos()];
    G --> |2. Supabase responde| H[Se actualiza el estado 'comercios'];
    H --> I[Se dibuja la tabla en pantalla];
    
    I --> |Usuario agrega producto| J[Llama a Supabase: insert()];
    J --> |Éxito| G;
```

## 5. Estructura de Archivos Clave

*   📂 **app/**
    *   📄 `app.tsx`: El cerebro que decide qué componente mostrar según la URL.
    *   📂 **[[...slug]]/**: El puente entre Next.js y tu App React.
    *   📂 **components/**
        *   📄 `Selector.tsx`: Los botones grandes del inicio.
        *   📄 `Gestion.tsx`: La pantalla compleja con tablas y formularios.
    *   📂 **lib/**
        *   📄 `superbaseClient.ts`: Configuración de conexión.
