# Documentación Técnica — Censo Iglesia Cristiana Echaurren 80

## 1. Descripción General

Aplicación web de registro (censo) para la **Iglesia Cristiana Echaurren 80** de Santiago, Chile. Permite a miembros y visitas registrar sus datos personales, de contacto, familiares y espirituales a través de un formulario multi-step. Los datos se almacenan en una hoja de cálculo de Google Sheets mediante Google Apps Script. Incluye un panel de administración protegido por contraseña para consultar, editar y eliminar registros.

---

## 2. Arquitectura

```
┌─────────────────────┐      HTTPS (fetch)       ┌──────────────────────────┐
│   Frontend (HTML/   │ ──────────────────────►   │   Google Apps Script     │
│   CSS / JavaScript) │ ◄──────────────────────   │   (Aplicación Web)       │
│   Servidor estático │      JSON responses       │                          │
└─────────────────────┘                           └────────────┬─────────────┘
                                                               │
                                                               ▼
                                                  ┌──────────────────────────┐
                                                  │   Google Sheets          │
                                                  │   (Base de Datos)        │
                                                  └──────────────────────────┘
```

- **Patrón**: MVC simplificado (Vista: HTML/CSS, Controlador: app.js, Modelo: Google Sheets)
- **Compatibilidad**: Java 8 / ES5 — se utiliza `var`, `function`, y se evitan arrow functions y template literals para máxima compatibilidad con navegadores antiguos
- **Hosting**: Servidor estático (ej. `python -m http.server 8080`) o cualquier hosting web

---

## 3. Estructura de Archivos

```
Censo Iglesia/
├── index.html                                    # Página principal — formulario de registro
├── admin.html                                    # Página de administración (URL separada)
├── css/
│   └── styles.css                                # Estilos completos
├── js/
│   └── app.js                                    # Lógica del frontend
├── google-apps-script.js                         # Código backend para Google Apps Script (212 líneas)
├── NEGRO Propuesta colores logo echaurren.png    # Logo de la iglesia
├── favicon.ico                                   # Favicon formato ICO
├── favicon.png                                   # Favicon formato PNG
├── banner.jpg                                    # Imagen de banner del header
└── DOCUMENTACION.md                              # Este archivo
```

---

## 4. Descripción de Archivos

### 4.1 `index.html`

Archivo HTML principal. Contiene el formulario de registro multi-step y la pantalla de bienvenida. El panel de administración fue separado a `admin.html`.

> **Nota**: El botón "Admin" fue removido de la pantalla de bienvenida. El acceso al panel admin es exclusivamente vía URL `/admin.html`.

#### Comportamiento del Paso 1:
Al iniciar el registro, el Paso 1 muestra **únicamente** la pregunta "¿Es miembro o visita?". Los demás campos (nombre, apellido, fecha de nacimiento, estado civil) aparecen con animación **solo después** de seleccionar una opción. Si se selecciona "Visita", también aparece el campo de iglesia de origen.

#### Secciones principales:

| Sección | ID | Descripción |
|---|---|---|
| Header | — | Barra superior con ícono de iglesia, título y subtítulo |
| Pantalla de Bienvenida | `stepWelcome` | Logo, mensaje y botón "Registrar" |
| Barra de Progreso | `progressContainer` | 3 pasos con íconos y barra de porcentaje |
| Paso 1 | `step1` | Información Personal |
| Paso 2 | `step2` | Contacto y Familia |
| Paso 3 | `step3` | Vida Espiritual |
| Estado de Carga | `stepLoading` | Spinner mientras se envían datos |
| Estado de Error | `stepError` | Mensaje de error con botón reintentar |
| Estado de Éxito | `stepSuccess` | Confirmación con auto-retorno (4s) |
| Campos condicionales Paso 1 | `step1Fields` | Campos que aparecen tras seleccionar tipo asistente |

#### Campos del formulario de registro:

**Paso 1 — Información Personal:**
| Campo | ID | Tipo | Requerido |
|---|---|---|---|
| Tipo asistente | `tipoAsistente` | Toggle (MIEMBRO/VISITA) | Sí |
| Iglesia de origen | `iglesiaOrigen` | Texto (condicional: solo visitas) | No |
| Nombre | `nombre` | Texto | Sí |
| Apellido | `apellido` | Texto | Sí |
| Fecha de nacimiento | `fechaNacimiento` | Date | Sí |
| Estado civil | `estadoCivil` | Select | Sí |

**Paso 2 — Contacto y Familia:**
| Campo | ID | Tipo | Requerido |
|---|---|---|---|
| Dirección | `direccion` | Texto | Sí |
| Comuna | `comuna` | Select (34 comunas de Santiago) | Sí |
| Profesión | `profesion` | Texto | No |
| Teléfono | `telefono` + `codigoPais` | Tel + Select (código país con bandera) | No* |
| Email | `email` | Email | No* |
| ¿Tiene hijos? | Toggle Sí/No | Toggle | No |
| Nombres de hijos | `hijosFields` | Campos dinámicos (agregar/quitar) | No |

> \* Opcionales, pero si se completan se validan con regex.

**Paso 3 — Vida Espiritual:**
| Campo | ID | Tipo | Requerido |
|---|---|---|---|
| ¿Ha sido bautizado? | `bautizado` | Toggle Sí/No | Sí |
| Mes de conversión | `mesConversion` | Select | No |
| Año de conversión | `anioConversion` | Number (1950-2026) | No |

#### Dependencias externas:
- **Google Fonts**: `Inter` (sans-serif) + `Playfair Display` (display)
- **Material Icons Outlined**: Iconografía de la interfaz

---

### 4.2 `admin.html`

Página independiente para el panel de administración. Accesible vía URL `/admin.html`. No tiene enlace visible desde la página principal (seguridad por oscuridad).

#### Contenido:
- **Login**: Formulario de contraseña centrado en pantalla. Al autenticarse correctamente muestra el dashboard.
- **Dashboard**: Estadísticas, tabla CRUD con búsqueda, edición y eliminación de registros.
- **Modales**: Editar registro y confirmar eliminación.
- **Botones "Cancelar" y "Salir"**: Redirigen a `index.html`.

Comparte el mismo `css/styles.css` y `js/app.js` que `index.html`.

---

### 4.3 `css/styles.css`

Hoja de estilos completa con diseño responsivo. Organizada en secciones:

#### Variables CSS (`:root`):
| Variable | Valor | Uso |
|---|---|---|
| `--color-primary` | `#1a3a5c` | Azul oscuro principal |
| `--color-accent` | `#c8a84e` | Dorado de acentos |
| `--color-success` | `#2e7d4f` | Verde de éxito |
| `--color-error` | `#c0392b` | Rojo de errores |
| `--color-bg` | `#f0f2f5` | Fondo general |
| `--color-bg-card` | `#ffffff` | Fondo de tarjetas |
| `--radius-md` | `12px` | Radio de bordes estándar |
| `--transition` | `0.3s cubic-bezier(...)` | Transición suave |

#### Secciones del CSS:
1. Reset y variables globales
2. Header con overlay y gradiente
3. Pantalla de bienvenida (centrado flexbox)
4. Barra de progreso (3 pasos con fill animado)
5. Formulario (grid, inputs, selects, toggles)
6. Input de teléfono (grupo select + input combinado)
7. Campos dinámicos de hijos
8. Estados de carga, error y éxito
9. Botones (primary, secondary, exit, admin, danger)
10. Panel de administración (overlay, login, dashboard, stats cards)
11. Tabla de administración (con divisiones verticales entre columnas)
12. Modales (editar, eliminar)
13. Footer
14. Media queries (`max-width: 768px`, `480px`)

---

### 4.4 `js/app.js`

Lógica completa del frontend. Compatible con ES5 (sin arrow functions ni template literals).

#### Constantes y Estado Global:

```javascript
var GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/.../exec';  // URL del Web App
var ADMIN_PASSWORD = 'Echaurren2026!';  // Contraseña del panel admin

let currentStep = 1;       // Paso actual del formulario (1-3)
const totalSteps = 3;      // Total de pasos
let tieneHijos = null;     // Estado del toggle hijos
let esBautizado = null;    // Estado del toggle bautizado
let tipoAsistente = null;  // 'MIEMBRO' o 'VISITA'

var adminData = [];        // Registros del admin
var adminHeaders = [];     // Encabezados de columnas
var editingRow = null;     // Fila en edición
var deletingRow = null;    // Fila a eliminar
```

#### Funciones — Flujo de Navegación:

| Función | Descripción |
|---|---|
| `startRegistration()` | Oculta bienvenida, muestra formulario en paso 1 |
| `exitRegistration()` | Resetea formulario y regresa a bienvenida |
| `goToWelcome()` | Muestra pantalla de bienvenida |
| `nextStep(step)` | Valida paso actual y avanza al siguiente |
| `prevStep(step)` | Retrocede sin validación |
| `goToStep(step)` | Navega al paso indicado, actualiza progress bar |
| `updateProgressBar()` | Actualiza el ancho de la barra de progreso |

#### Funciones — Inicialización:

| Función | Descripción |
|---|---|
| `initDateLimits()` | Establece fecha máxima (hoy) en campo de nacimiento |
| `initInputListeners()` | Agrega listeners para limpiar errores al escribir |

#### Funciones — Validación:

| Función | Descripción |
|---|---|
| `validateCurrentStep()` | Router de validación según `currentStep` |
| `validateStep1()` | Valida: tipoAsistente, nombre, apellido, fechaNacimiento, estadoCivil |
| `validateStep2()` | Valida: dirección, comuna, teléfono (regex: 7-15 dígitos), email (regex) |
| `validateStep3()` | Valida: bautizado |
| `showFieldError(fieldId, message)` | Muestra error visual en un campo |
| `clearFieldError(field)` | Limpia error visual de un campo |

**Regex de validación de email:**
```
/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
```

**Regex de validación de teléfono (limpio):**
```
/^\d{7,15}$/
```

#### Funciones — Toggles:

| Función | Descripción |
|---|---|
| `toggleTipoAsistente(value)` | Alterna MIEMBRO/VISITA, muestra campos del paso 1 y muestra/oculta iglesia origen |
| `toggleHijos(value)` | Alterna Sí/No hijos, muestra/oculta campos dinámicos |
| `toggleBautizado(value)` | Alterna Sí/No bautizado |
| `addHijo()` | Agrega campo nuevo para nombre de hijo |
| `removeHijo(btn)` | Elimina campo de hijo (mínimo 1) |

#### Funciones — Envío de Datos:

| Función | Descripción |
|---|---|
| `submitForm()` | Valida, recopila datos, muestra loading, envía |
| `collectFormData()` | Retorna objeto con todos los datos del formulario |
| `sendToGoogleSheets(formData)` | Envía vía fetch, con fallback a `no-cors` |
| `showSuccessScreen()` | Muestra éxito, auto-retorno a bienvenida en 4s |
| `showErrorScreen(detalle)` | Muestra error con detalle opcional |
| `retrySubmit()` | Reintenta envío |
| `resetForm()` | Limpia todo el formulario y estados |

#### Estructura del objeto `collectFormData()`:

```javascript
{
    tipoAsistente: 'MIEMBRO' | 'VISITA',
    iglesiaOrigen: '',           // Solo si es VISITA
    nombre: '',
    apellido: '',
    fechaNacimiento: '',         // formato yyyy-MM-dd
    estadoCivil: '',             // SOLTERO | CASADO | DIVORCIADO | VIUDO
    direccion: '',
    comuna: '',
    profesion: '',
    tieneHijos: true | false | null,
    hijos: [],                   // Array de nombres
    bautizado: true | false | null,
    mesConversion: '',           // '01'-'12'
    anioConversion: '',          // ej: '2010'
    telefono: '',                // ej: '+56 912345678'
    email: ''                    // ej: 'usuario@correo.com'
}
```

#### Funciones — Panel de Administración:

| Función | Descripción |
|---|---|
| `showAdminLogin()` | Muestra modal de login |
| `adminLogin()` | Valida contraseña y carga datos |
| `closeAdmin()` | Cierra panel y limpia datos |
| `loadAdminData()` | GET al API, carga datos en memoria |
| `renderAdminStats()` | Renderiza tarjetas: Total, Miembros, Visitas |
| `renderAdminTable()` | Renderiza tabla con todos los registros |
| `filterAdminTable()` | Filtra tabla por texto de búsqueda |
| `openEditModal(index)` | Abre modal de edición con datos precargados |
| `closeEditModal()` | Cierra modal de edición |
| `saveEditedRecord()` | POST de actualización al API |
| `openDeleteModal(index)` | Abre modal de confirmación de eliminación |
| `closeDeleteModal()` | Cierra modal de eliminación |
| `confirmDelete()` | POST de eliminación al API |

#### Funciones Auxiliares:

| Función | Descripción |
|---|---|
| `formatDateCell(val)` | Convierte `2026-02-25T18:05:12.000Z` → `2026-02-25` |
| `escapeHtml(str)` | Escapa caracteres HTML para prevenir XSS |

---

### 4.5 `google-apps-script.js`

Código backend para Google Apps Script. Contiene instrucciones de instalación (líneas 1-61) y el código ejecutable (líneas 62-212).

#### Configuración:
- **Spreadsheet ID**: `1qYS5TvPPpKJPcFDgYRm81ja3GgtNDCpwIExAzQqN714`
- **Hoja**: Primera hoja del spreadsheet (`getSheets()[0]`)

#### Estructura de columnas en Google Sheets:

| Columna | Letra | Header | Tipo de dato |
|---|---|---|---|
| 1 | A | Fecha Registro | Date (auto-generada) |
| 2 | B | Tipo | Texto (MIEMBRO/VISITA) |
| 3 | C | Iglesia Origen | Texto |
| 4 | D | Nombre | Texto |
| 5 | E | Apellido | Texto |
| 6 | F | Fecha Nacimiento | Texto (yyyy-MM-dd) |
| 7 | G | Estado Civil | Texto |
| 8 | H | Dirección | Texto |
| 9 | I | Comuna | Texto |
| 10 | J | Profesión | Texto |
| 11 | K | Hijos | Texto (nombres separados por coma) |
| 12 | L | Bautizado | Texto (Sí/No) |
| 13 | M | Fecha Conversión | Texto (ej: "Enero 2010") |
| 14 | N | Teléfono | Texto (ej: "+56 912345678") |
| 15 | O | Email | Texto |

#### Función `doPost(e)`:

Maneja 3 tipos de acciones según el campo `action` del JSON recibido:

| Acción | Campo `action` | Parámetros | Descripción |
|---|---|---|---|
| Eliminar | `'delete'` | `row` (número de fila) | Elimina la fila indicada |
| Editar | `'update'` | `row`, `values` (array) | Reemplaza los valores de la fila |
| Crear | (ninguno/defecto) | Todos los campos del formulario | Agrega nueva fila con `appendRow` |

**Proceso de creación de registro:**
1. Construye `fechaConversion` combinando mes (nombre) + año
2. Construye `hijos` como string separado por comas, o "No tiene"
3. Formatea `bautizado` como "Sí" o "No"
4. Ejecuta `appendRow` con 15 valores (A-O)

**Respuesta JSON:**
```javascript
{ result: 'success' }                          // Éxito
{ result: 'success', message: '...' }          // Éxito con mensaje
{ result: 'error', message: '...' }            // Error con detalle
```

#### Función `doGet(e)`:

Maneja 2 acciones según el parámetro `action` de la URL:

| Acción | URL | Descripción |
|---|---|---|
| `getAll` | `?action=getAll` | Retorna todos los registros con headers |
| `status` | (defecto) | Retorna `{ status: 'ok', message: 'Censo API activa' }` |

**Formato de respuesta `getAll`:**
```javascript
{
    result: 'success',
    headers: ['Fecha Registro', 'Tipo', ...],    // Array de 15 strings
    data: [
        {
            rowNumber: 2,                         // Número de fila en la hoja (1-indexed)
            values: ['2026-02-25', 'MIEMBRO', ...] // Array de 15 valores
        },
        // ...
    ]
}
```

> Los valores `Date` se formatean automáticamente a `yyyy-MM-dd` usando `Utilities.formatDate()`.

---

## 5. Flujos de la Aplicación

### 5.1 Flujo de Registro

```
Bienvenida → [Clic "Registrar"]
    → Paso 1 (Info Personal) → [Validar] → [Siguiente]
    → Paso 2 (Contacto y Familia) → [Validar] → [Siguiente]
    → Paso 3 (Vida Espiritual) → [Validar] → [Enviar]
    → Loading → fetch POST a Google Apps Script
        → Éxito: Pantalla de éxito → Auto-retorno a Bienvenida (4s)
        → Error: Pantalla de error → [Reintentar] o [Volver]
```

### 5.2 Flujo de Administración

El panel de administración se encuentra en una **URL separada**: `/admin.html`

```
Navegar a /admin.html
    → Pantalla de Login (centrada) → [Ingresar contraseña]
        → Incorrecto: Mensaje de error
        → Correcto: Dashboard
            → Carga datos vía GET ?action=getAll
            → Renderiza estadísticas (Total / Miembros / Visitas)
            → Renderiza tabla con todos los registros
            → [Buscar]: Filtra tabla en tiempo real
            → [Editar]: Modal con campos editables → POST action=update
            → [Eliminar]: Modal confirmación → POST action=delete
            → [Actualizar]: Recarga datos
            → [Salir]: Redirige a index.html
        → [Cancelar]: Redirige a index.html
```

### 5.3 Estrategia de Envío (Fetch)

1. **Intento 1**: `fetch` normal con `redirect: 'follow'`
   - Si la respuesta es JSON válida con `result: 'success'` → éxito
   - Si es JSON con error → muestra error
   - Si no es JSON pero `response.ok` → éxito

2. **Intento 2 (fallback)**: Si el intento 1 falla por CORS, reintenta con `mode: 'no-cors'`
   - No se puede verificar la respuesta → asume éxito

---

## 6. Configuración e Instalación

### 6.1 Requisitos del Frontend

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Servidor HTTP para servir los archivos estáticos

### 6.2 Levantar el servidor local

```bash
cd "Censo Iglesia"
python -m http.server 8080
```

Acceder a: `http://localhost:8080`

### 6.3 Configuración de Google Apps Script

1. Abrir la hoja de cálculo en Google Sheets
2. Ir a **Extensiones → Apps Script**
3. Pegar el código desde `google-apps-script.js` (desde la línea `function doPost(e)` en adelante)
4. Guardar (Ctrl+S)
5. **Implementar → Nueva implementación**:
   - Tipo: Aplicación web
   - Ejecutar como: Tu cuenta
   - Acceso: Cualquier persona
6. Copiar la URL generada
7. Pegarla en `js/app.js` → variable `GOOGLE_SCRIPT_URL`

### 6.4 Encabezados de la Hoja de Cálculo (Fila 1)

```
A: Fecha Registro    F: Fecha Nacimiento   K: Hijos
B: Tipo              G: Estado Civil       L: Bautizado
C: Iglesia Origen    H: Dirección          M: Fecha Conversión
D: Nombre            I: Comuna             N: Teléfono
E: Apellido          J: Profesión          O: Email
```

---

## 7. Seguridad

| Aspecto | Implementación |
|---|---|
| Contraseña Admin | Almacenada en `app.js` como texto plano (`Echaurren2026!`) |
| Prevención XSS | `escapeHtml()` en todas las inserciones dinámicas de HTML |
| CORS | Google Apps Script maneja CORS; fallback a `no-cors` si falla |
| Validación de email | Regex del lado del cliente |
| Validación de teléfono | Regex del lado del cliente (7-15 dígitos) |
| Google Apps Script | Validación de rango de filas antes de editar/eliminar |

> **Nota**: La contraseña del panel admin se encuentra en el código fuente del frontend. Para mayor seguridad en producción, se recomienda implementar autenticación del lado del servidor.

---

## 8. Guía para Agregar un Nuevo Campo

Para agregar un nuevo campo al formulario, se deben modificar 4 archivos:

### Paso 1: `index.html`
Agregar el HTML del campo dentro del paso correspondiente (`step1`, `step2` o `step3`), dentro de `<div class="form-grid">`.

### Paso 2: `css/styles.css`
Agregar estilos si el campo tiene un diseño especial (ej: grupo de inputs combinados).

### Paso 3: `js/app.js`
1. Agregar validación en `validateStepN()` si el campo es requerido
2. Agregar el campo en `collectFormData()`
3. Agregar limpieza en `resetForm()`
4. Actualizar los índices de `dateColumns` en `openEditModal()` si cambia el orden de columnas

### Paso 4: `google-apps-script.js`
1. Agregar el campo en el `appendRow` de la sección "NUEVO REGISTRO"
2. Actualizar el número de columnas en `getRange` de `doGet` (actualmente 15)
3. Actualizar las instrucciones de encabezados en los comentarios

### Paso 5: Google Sheets
1. Agregar el encabezado en la fila 1, en la nueva columna
2. Reimplementar el Apps Script como **nueva versión**

---

## 9. Códigos de País Disponibles (Teléfono)

| Bandera | País | Código |
|---|---|---|
| 🇨🇱 | Chile | +56 |
| 🇦🇷 | Argentina | +54 |
| 🇧🇴 | Bolivia | +591 |
| 🇧🇷 | Brasil | +55 |
| 🇨🇴 | Colombia | +57 |
| 🇪🇨 | Ecuador | +593 |
| 🇲🇽 | México | +52 |
| 🇵🇪 | Perú | +51 |
| 🇵🇾 | Paraguay | +595 |
| 🇺🇾 | Uruguay | +598 |
| 🇻🇪 | Venezuela | +58 |
| 🇭🇹 | Haití | +509 |
| 🇺🇸 | Estados Unidos | +1 |
| 🇪🇸 | España | +34 |

---

## 10. Comunas Disponibles

Santiago, Providencia, Las Condes, Ñuñoa, Macul, La Florida, Puente Alto, Maipú, San Bernardo, La Granja, San Ramón, La Pintana, El Bosque, San Miguel, La Cisterna, Pedro Aguirre Cerda, Lo Espejo, Cerrillos, Estación Central, Quinta Normal, Lo Prado, Pudahuel, Cerro Navia, Renca, Quilicura, Independencia, Recoleta, Conchalí, Huechuraba, Vitacura, Lo Barnechea, La Reina, Peñalolén, San Joaquín, **Otra**.

---

## 11. Tecnologías Utilizadas

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura de la aplicación |
| CSS3 | Estilos, animaciones, diseño responsivo |
| JavaScript (ES5) | Lógica del frontend |
| Google Apps Script | Backend (API REST) |
| Google Sheets | Base de datos |
| Google Fonts | Tipografías (Inter, Playfair Display) |
| Material Icons | Iconografía |
| Fetch API | Comunicación HTTP con el backend |

---

## 12. Historial de Versiones

| Fecha | Cambio |
|---|---|
| 2026-02-26 | Versión inicial con formulario 3 pasos, 13 columnas (A-M) |
| 2026-02-26 | Pantalla de bienvenida con logo y botón "Registrar" |
| 2026-02-26 | Botón "Salir" durante el registro |
| 2026-02-26 | Favicon con fondo blanco, título "Registro ICECH" |
| 2026-02-26 | Panel de administración con login, estadísticas, tabla CRUD |
| 2026-02-26 | Formato de fechas yyyy-MM-dd con date picker en edición |
| 2026-02-26 | Campos Teléfono (con código de país y bandera) y Email (con validación regex) |
| 2026-02-26 | Divisiones verticales entre columnas en la tabla admin |
| 2026-02-26 | Documentación técnica completa |
| 2026-03-05 | Panel admin movido a URL separada (`admin.html`), botón "Admin" eliminado de bienvenida |
| 2026-03-05 | Paso 1: campos aparecen condicionalmente tras seleccionar Miembro/Visita |

---

*Documento actualizado el 5 de marzo de 2026.*
*Iglesia Cristiana Echaurren 80 — Santiago, Chile.*
