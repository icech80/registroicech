/**
 * ========================================
 * CENSO IGLESIA CRISTIANA ECHAURREN 80
 * Lógica del formulario multi-step
 * ========================================
 */

// =============================================
// URL del Google Apps Script (PEGAR AQUÍ LA URL)
// =============================================
var GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxh8OdJZsbpFx2A6wN0aXNDLCzLG9BZJaFgzhA0ys4CInw19amjPKdTSnfIskmeATNf/exec';

// Estado actual del formulario
let currentStep = 1;
const totalSteps = 3;
let tieneHijos = null;
let esBautizado = null;
let tipoAsistente = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    initDateLimits();
    initInputListeners();
});

/**
 * Inicia el flujo de registro desde la pantalla de bienvenida.
 */
function startRegistration() {
    // Ocultar welcome
    document.getElementById('stepWelcome').classList.remove('active');
    document.getElementById('stepWelcome').style.display = 'none';

    // Mostrar progress bar y formulario
    document.getElementById('progressContainer').style.display = '';
    document.getElementById('formContainer').style.display = '';

    // Activar paso 1
    document.getElementById('step1').classList.add('active');
    document.querySelector('.progress-step[data-step="1"]').classList.add('active');
    currentStep = 1;
    updateProgressBar();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Sale del proceso de registro y regresa a la pantalla de bienvenida.
 */
function exitRegistration() {
    resetForm();
    goToWelcome();
}

/**
 * Regresa a la pantalla de bienvenida.
 */
function goToWelcome() {
    // Ocultar formulario y progress
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('formContainer').style.display = 'none';

    // Mostrar welcome
    var welcome = document.getElementById('stepWelcome');
    welcome.style.display = '';
    welcome.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Establece los límites de fecha para los campos de calendario.
 */
function initDateLimits() {
    const today = new Date().toISOString().split('T')[0];
    const fechaNac = document.getElementById('fechaNacimiento');
    if (fechaNac) {
        fechaNac.setAttribute('max', today);
    }
}

/**
 * Agrega listeners para limpiar errores al escribir.
 */
function initInputListeners() {
    var inputs = document.querySelectorAll('.form-input, .form-select');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('input', function () {
            clearFieldError(this);
        });
        inputs[i].addEventListener('change', function () {
            clearFieldError(this);
        });
    }
}

/**
 * Limpia el estado de error de un campo.
 * @param {HTMLElement} field - El campo del formulario.
 */
function clearFieldError(field) {
    field.classList.remove('error');
    var errorEl = document.getElementById(field.id + 'Error');
    if (errorEl) {
        errorEl.classList.remove('visible');
    }
}

/**
 * Muestra un error en un campo específico.
 * @param {string} fieldId - ID del campo.
 * @param {string} message - Mensaje de error (opcional).
 */
function showFieldError(fieldId, message) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById(fieldId + 'Error');
    if (field) {
        field.classList.add('error');
    }
    if (errorEl) {
        if (message) {
            errorEl.textContent = message;
        }
        errorEl.classList.add('visible');
    }
}

// ========================================
// NAVEGACIÓN ENTRE PASOS
// ========================================

/**
 * Avanza al paso indicado, validando el paso actual.
 * @param {number} step - Número del paso destino.
 */
function nextStep(step) {
    if (!validateCurrentStep()) {
        return;
    }
    goToStep(step);
}

/**
 * Retrocede al paso indicado sin validación.
 * @param {number} step - Número del paso destino.
 */
function prevStep(step) {
    goToStep(step);
}

/**
 * Navega al paso indicado y actualiza la UI.
 * @param {number} step - Número del paso destino.
 */
function goToStep(step) {
    // Ocultar paso actual
    var currentEl = document.getElementById('step' + currentStep);
    if (currentEl) {
        currentEl.classList.remove('active');
    }

    // Mostrar nuevo paso
    var nextEl = document.getElementById('step' + step);
    if (nextEl) {
        nextEl.classList.add('active');
    }

    // Actualizar estado de pasos completados
    var progressSteps = document.querySelectorAll('.progress-step');
    for (var i = 0; i < progressSteps.length; i++) {
        var stepNum = parseInt(progressSteps[i].getAttribute('data-step'));
        progressSteps[i].classList.remove('active', 'completed');

        if (stepNum === step) {
            progressSteps[i].classList.add('active');
        } else if (stepNum < step) {
            progressSteps[i].classList.add('completed');
            // Cambiar icono a check
            var circle = progressSteps[i].querySelector('.progress-step__circle .material-icons-outlined');
            circle.textContent = 'check';
        }
    }

    currentStep = step;
    updateProgressBar();

    // Scroll suave hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Actualiza el ancho de la barra de progreso.
 */
function updateProgressBar() {
    var fill = document.getElementById('progressFill');
    if (fill) {
        var percentage = (currentStep / totalSteps) * 100;
        fill.style.width = percentage + '%';
    }
}

// ========================================
// VALIDACIONES
// ========================================

/**
 * Valida los campos del paso actual.
 * @returns {boolean} true si todos los campos requeridos son válidos.
 */
function validateCurrentStep() {
    var isValid = true;

    if (currentStep === 1) {
        isValid = validateStep1();
    } else if (currentStep === 2) {
        isValid = validateStep2();
    } else if (currentStep === 3) {
        isValid = validateStep3();
    }

    return isValid;
}

/**
 * Valida los campos del Paso 1: Información Personal.
 */
function validateStep1() {
    var isValid = true;

    if (tipoAsistente === null) {
        showFieldError('tipoAsistente');
        isValid = false;
    }

    var nombre = document.getElementById('nombre');
    if (!nombre.value.trim()) {
        showFieldError('nombre');
        isValid = false;
    }

    var apellido = document.getElementById('apellido');
    if (!apellido.value.trim()) {
        showFieldError('apellido');
        isValid = false;
    }

    var fechaNac = document.getElementById('fechaNacimiento');
    if (!fechaNac.value) {
        showFieldError('fechaNacimiento');
        isValid = false;
    }

    var estadoCivil = document.getElementById('estadoCivil');
    if (!estadoCivil.value) {
        showFieldError('estadoCivil');
        isValid = false;
    }

    return isValid;
}

/**
 * Valida los campos del Paso 2: Contacto y Familia.
 */
function validateStep2() {
    var isValid = true;

    var direccion = document.getElementById('direccion');
    if (!direccion.value.trim()) {
        showFieldError('direccion');
        isValid = false;
    }

    var comuna = document.getElementById('comuna');
    if (!comuna.value) {
        showFieldError('comuna');
        isValid = false;
    }

    // Validar teléfono (opcional pero si se ingresa debe ser válido)
    var telefono = document.getElementById('telefono');
    if (telefono.value.trim()) {
        var telefonoClean = telefono.value.trim().replace(/[\s\-\(\)]/g, '');
        if (!/^\d{7,15}$/.test(telefonoClean)) {
            showFieldError('telefono');
            isValid = false;
        }
    }

    // Validar email con expresión regular
    var email = document.getElementById('email');
    if (email.value.trim()) {
        var emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email.value.trim())) {
            showFieldError('email');
            isValid = false;
        }
    }

    return isValid;
}

/**
 * Valida los campos del Paso 3: Vida Espiritual.
 */
function validateStep3() {
    var isValid = true;

    if (esBautizado === null) {
        showFieldError('bautizado');
        isValid = false;
    }

    return isValid;
}

// ========================================
// TOGGLE: TIPO ASISTENTE (MIEMBRO / VISITA)
// ========================================

/**
 * Activa/desactiva el tipo de asistente y muestra el campo de iglesia de origen si es visita.
 * @param {string} value - 'MIEMBRO' o 'VISITA'.
 */
function toggleTipoAsistente(value) {
    tipoAsistente = value;
    var btnMiembro = document.getElementById('tipoMiembro');
    var btnVisita = document.getElementById('tipoVisita');
    var container = document.getElementById('iglesiaOrigenContainer');
    var step1Fields = document.getElementById('step1Fields');
    var hidden = document.getElementById('tipoAsistente');
    var errorEl = document.getElementById('tipoAsistenteError');

    btnMiembro.classList.remove('active', 'active-yes');
    btnVisita.classList.remove('active', 'active-yes');

    // Mostrar los campos restantes del paso 1
    step1Fields.style.display = '';
    step1Fields.style.animation = 'none';
    step1Fields.offsetHeight;
    step1Fields.style.animation = '';

    if (value === 'MIEMBRO') {
        btnMiembro.classList.add('active-yes');
        container.style.display = 'none';
    } else {
        btnVisita.classList.add('active-yes');
        container.style.display = 'block';
        container.style.animation = 'none';
        container.offsetHeight;
        container.style.animation = '';
    }

    hidden.value = value;

    if (errorEl) {
        errorEl.classList.remove('visible');
    }
}

// ========================================
// TOGGLE: HIJOS
// ========================================

/**
 * Activa/desactiva la sección de hijos.
 * @param {boolean} value - true si tiene hijos, false si no.
 */
function toggleHijos(value) {
    tieneHijos = value;
    var container = document.getElementById('hijosContainer');
    var btnSi = document.getElementById('hijosSi');
    var btnNo = document.getElementById('hijosNo');

    btnSi.classList.remove('active', 'active-yes');
    btnNo.classList.remove('active');

    if (value) {
        btnSi.classList.add('active-yes');
        container.style.display = 'block';
        container.style.animation = 'none';
        // Forzar reflow para reiniciar la animación
        container.offsetHeight;
        container.style.animation = '';
    } else {
        btnNo.classList.add('active');
        container.style.display = 'none';
    }
}

/**
 * Agrega un campo nuevo para ingresar nombre de hijo.
 */
function addHijo() {
    var container = document.getElementById('hijosFields');
    var count = container.querySelectorAll('.hijo-field').length + 1;

    var div = document.createElement('div');
    div.className = 'hijo-field';
    div.innerHTML =
        '<input type="text" name="hijo_' + count + '" class="form-input" placeholder="Nombre del hijo/a">' +
        '<button type="button" class="btn-icon btn-icon--remove" onclick="removeHijo(this)" title="Eliminar">' +
        '<span class="material-icons-outlined">remove_circle</span>' +
        '</button>';

    container.appendChild(div);
    // Focus en el nuevo campo
    div.querySelector('input').focus();
}

/**
 * Elimina un campo de hijo.
 * @param {HTMLElement} btn - Botón que disparó la acción.
 */
function removeHijo(btn) {
    var container = document.getElementById('hijosFields');
    var fields = container.querySelectorAll('.hijo-field');

    // Mantener al menos un campo
    if (fields.length > 1) {
        btn.closest('.hijo-field').remove();
    } else {
        // Si es el último, solo limpiar el input
        fields[0].querySelector('input').value = '';
    }
}

// ========================================
// TOGGLE: BAUTIZADO
// ========================================

/**
 * Activa/desactiva el estado de bautizado.
 * @param {boolean} value - true si es bautizado, false si no.
 */
function toggleBautizado(value) {
    esBautizado = value;
    var btnSi = document.getElementById('bautizadoSi');
    var btnNo = document.getElementById('bautizadoNo');
    var hidden = document.getElementById('bautizado');
    var errorEl = document.getElementById('bautizadoError');

    btnSi.classList.remove('active', 'active-yes');
    btnNo.classList.remove('active');

    if (value) {
        btnSi.classList.add('active-yes');
        hidden.value = 'SI';
    } else {
        btnNo.classList.add('active');
        hidden.value = 'NO';
    }

    // Limpiar error
    if (errorEl) {
        errorEl.classList.remove('visible');
    }
}

// ========================================
// ENVÍO DEL FORMULARIO
// ========================================

/**
 * Recopila y envía los datos del formulario a Google Sheets.
 */
function submitForm() {
    if (!validateCurrentStep()) {
        return;
    }

    // Recopilar datos
    var formData = collectFormData();
    console.log('Datos del Censo:', formData);

    // Mostrar pantalla de carga
    document.getElementById('step' + currentStep).classList.remove('active');
    document.getElementById('stepLoading').classList.add('active');

    // Enviar a Google Sheets
    sendToGoogleSheets(formData);
}

/**
 * Envía los datos a Google Sheets vía Apps Script.
 * Usa fetch con redirect: follow para capturar errores correctamente.
 * @param {Object} formData - Datos recopilados del formulario.
 */
function sendToGoogleSheets(formData) {
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(formData),
        redirect: 'follow'
    })
    .then(function (response) {
        // Intentar leer la respuesta como texto
        return response.text().then(function (text) {
            console.log('Respuesta del servidor:', text);
            try {
                var result = JSON.parse(text);
                if (result.result === 'success') {
                    showSuccessScreen();
                } else {
                    console.error('Error del servidor:', result.message);
                    showErrorScreen('Error del servidor: ' + (result.message || 'Respuesta inesperada'));
                }
            } catch (e) {
                // Si no es JSON válido pero la respuesta fue OK, considerar éxito
                if (response.ok) {
                    showSuccessScreen();
                } else {
                    showErrorScreen('Error HTTP ' + response.status + ': La respuesta no es válida.');
                }
            }
        });
    })
    .catch(function (error) {
        console.error('Error al enviar:', error);
        // Si falla por CORS, intentar con no-cors como respaldo
        console.log('Intentando envío alternativo (no-cors)...');
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(formData),
            redirect: 'follow'
        })
        .then(function () {
            // Con no-cors no podemos verificar — mostrar éxito con advertencia
            console.warn('Envío realizado en modo no-cors. No se puede verificar el resultado.');
            showSuccessScreen();
        })
        .catch(function (error2) {
            console.error('Error en envío alternativo:', error2);
            showErrorScreen('No se pudo conectar con el servidor. Verifique su conexión a internet.');
        });
    });
}

/**
 * Muestra la pantalla de éxito tras enviar correctamente.
 */
function showSuccessScreen() {
    document.getElementById('stepLoading').classList.remove('active');
    document.getElementById('stepSuccess').classList.add('active');

    // Actualizar progress bar a 100%
    var fill = document.getElementById('progressFill');
    if (fill) {
        fill.style.width = '100%';
    }

    // Marcar todos los pasos como completados
    var progressSteps = document.querySelectorAll('.progress-step');
    for (var i = 0; i < progressSteps.length; i++) {
        progressSteps[i].classList.remove('active');
        progressSteps[i].classList.add('completed');
        var circle = progressSteps[i].querySelector('.progress-step__circle .material-icons-outlined');
        circle.textContent = 'check';
    }

    // Auto-retorno a la pantalla de bienvenida después de 4 segundos
    setTimeout(function () {
        resetForm();
        goToWelcome();
    }, 4000);
}

/**
 * Muestra la pantalla de error si falla el envío.
 * @param {string} [detalle] - Mensaje de detalle opcional para mostrar al usuario.
 */
function showErrorScreen(detalle) {
    document.getElementById('stepLoading').classList.remove('active');
    document.getElementById('stepError').classList.add('active');

    // Mostrar detalle del error si se proporcionó
    var errorDetail = document.getElementById('errorDetail');
    if (errorDetail && detalle) {
        errorDetail.textContent = detalle;
        errorDetail.style.display = 'block';
    } else if (errorDetail) {
        errorDetail.style.display = 'none';
    }
}

/**
 * Reintenta el envío del formulario.
 */
function retrySubmit() {
    document.getElementById('stepError').classList.remove('active');
    document.getElementById('stepLoading').classList.add('active');
    var formData = collectFormData();
    sendToGoogleSheets(formData);
}

/**
 * Recopila todos los datos del formulario en un objeto.
 * @returns {Object} Datos del formulario.
 */
function collectFormData() {
    var hijos = [];
    if (tieneHijos) {
        var inputs = document.querySelectorAll('#hijosFields .hijo-field input');
        for (var i = 0; i < inputs.length; i++) {
            var val = inputs[i].value.trim();
            if (val) {
                hijos.push(val);
            }
        }
    }

    // Construir teléfono completo con código de país
    var codigoPais = document.getElementById('codigoPais').value;
    var telefonoRaw = document.getElementById('telefono').value.trim();
    var telefonoCompleto = telefonoRaw ? (codigoPais + ' ' + telefonoRaw) : '';

    return {
        tipoAsistente: tipoAsistente,
        iglesiaOrigen: tipoAsistente === 'VISITA' ? document.getElementById('iglesiaOrigen').value.trim() : '',
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        estadoCivil: document.getElementById('estadoCivil').value,
        direccion: document.getElementById('direccion').value.trim(),
        comuna: document.getElementById('comuna').value,
        profesion: document.getElementById('profesion').value.trim(),
        tieneHijos: tieneHijos,
        hijos: hijos,
        bautizado: esBautizado,
        mesConversion: document.getElementById('mesConversion').value,
        anioConversion: document.getElementById('anioConversion').value,
        telefono: telefonoCompleto,
        email: document.getElementById('email').value.trim()
    };
}

/**
 * Reinicia el formulario para un nuevo registro.
 */
function resetForm() {
    // Reset del form HTML
    document.getElementById('censoForm').reset();

    // Reset de estados
    tieneHijos = null;
    esBautizado = null;
    tipoAsistente = null;
    currentStep = 1;

    // Reset de toggles
    var toggleBtns = document.querySelectorAll('.toggle-btn');
    for (var i = 0; i < toggleBtns.length; i++) {
        toggleBtns[i].classList.remove('active', 'active-yes');
    }

    // Ocultar campos condicionales
    document.getElementById('step1Fields').style.display = 'none';
    document.getElementById('hijosContainer').style.display = 'none';
    document.getElementById('iglesiaOrigenContainer').style.display = 'none';
    document.getElementById('iglesiaOrigen').value = '';

    // Reset teléfono y email
    document.getElementById('codigoPais').value = '+56';
    document.getElementById('telefono').value = '';
    document.getElementById('email').value = '';

    // Reset campos hijos (dejar solo uno)
    var hijosFields = document.getElementById('hijosFields');
    hijosFields.innerHTML =
        '<div class="hijo-field">' +
        '<input type="text" name="hijo_1" class="form-input" placeholder="Nombre del hijo/a">' +
        '<button type="button" class="btn-icon btn-icon--remove" onclick="removeHijo(this)" title="Eliminar">' +
        '<span class="material-icons-outlined">remove_circle</span>' +
        '</button>' +
        '</div>';

    // Limpiar errores
    var errors = document.querySelectorAll('.form-error');
    for (var j = 0; j < errors.length; j++) {
        errors[j].classList.remove('visible');
    }
    var errorInputs = document.querySelectorAll('.error');
    for (var k = 0; k < errorInputs.length; k++) {
        errorInputs[k].classList.remove('error');
    }

    // Ocultar todas las secciones
    var steps = document.querySelectorAll('.form-step');
    for (var l = 0; l < steps.length; l++) {
        steps[l].classList.remove('active');
    }

    // Ocultar paso 1 (se mostrará al iniciar registro)
    // No activar step1 aquí, se activa en startRegistration()

    // Reset progress
    var progressSteps = document.querySelectorAll('.progress-step');
    var icons = ['person', 'family_restroom', 'auto_stories'];
    for (var m = 0; m < progressSteps.length; m++) {
        progressSteps[m].classList.remove('active', 'completed');
        var circle = progressSteps[m].querySelector('.progress-step__circle .material-icons-outlined');
        circle.textContent = icons[m];
    }

    updateProgressBar();
}

// ========================================
// PANEL DE ADMINISTRACIÓN
// ========================================

var ADMIN_PASSWORD = 'Echaurren2026!';
var adminData = [];       // registros cargados
var adminHeaders = [];    // encabezados
var editingRow = null;    // fila que se está editando
var deletingRow = null;   // fila que se va a eliminar

/**
 * Muestra el modal de login de administrador.
 */
function showAdminLogin() {
    document.getElementById('adminOverlay').style.display = '';
    document.getElementById('adminLogin').style.display = '';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminPasswordError').classList.remove('visible');
    document.getElementById('adminPassword').focus();
}

/**
 * Valida la contraseña e ingresa al panel admin.
 */
function adminLogin() {
    var pwd = document.getElementById('adminPassword').value;
    if (pwd === ADMIN_PASSWORD) {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminDashboard').style.display = '';
        loadAdminData();
    } else {
        document.getElementById('adminPasswordError').classList.add('visible');
        document.getElementById('adminPassword').classList.add('error');
        document.getElementById('adminPassword').focus();
    }
}

/**
 * Cierra el panel de admin y regresa a la página principal.
 */
function closeAdmin() {
    window.location.href = 'index.html';
}

/**
 * Carga todos los registros desde Google Sheets.
 */
function loadAdminData() {
    var tableBody = document.getElementById('adminTableBody');
    var tableHead = document.getElementById('adminTableHead');
    var loading = document.getElementById('adminLoading');
    var empty = document.getElementById('adminEmpty');

    tableBody.innerHTML = '';
    tableHead.innerHTML = '';
    loading.style.display = '';
    empty.style.display = 'none';

    var url = GOOGLE_SCRIPT_URL + '?action=getAll';

    fetch(url, { redirect: 'follow' })
        .then(function (response) { return response.text(); })
        .then(function (text) {
            console.log('Admin data response:', text);
            var json = JSON.parse(text);
            loading.style.display = 'none';

            if (json.result === 'success') {
                adminHeaders = json.headers || [];
                adminData = json.data || [];
                renderAdminStats();
                renderAdminTable();
            } else {
                empty.style.display = '';
                empty.querySelector('p').textContent = 'Error al cargar: ' + (json.message || 'desconocido');
            }
        })
        .catch(function (error) {
            console.error('Error cargando datos admin:', error);
            loading.style.display = 'none';
            empty.style.display = '';
            empty.querySelector('p').textContent = 'Error de conexión. Verifique la URL del script.';
        });
}

/**
 * Renderiza las estadísticas (total, miembros, visitas).
 */
function renderAdminStats() {
    var total = adminData.length;
    var miembros = 0;
    var visitas = 0;
    for (var i = 0; i < adminData.length; i++) {
        var tipo = (adminData[i].values[1] || '').toString().toUpperCase();
        if (tipo === 'MIEMBRO') miembros++;
        else if (tipo === 'VISITA') visitas++;
    }

    document.getElementById('adminStats').innerHTML =
        '<div class="stat-card">' +
          '<div class="stat-card__icon stat-card__icon--total"><span class="material-icons-outlined">groups</span></div>' +
          '<div><div class="stat-card__value">' + total + '</div><div class="stat-card__label">Total Registros</div></div>' +
        '</div>' +
        '<div class="stat-card">' +
          '<div class="stat-card__icon stat-card__icon--miembro"><span class="material-icons-outlined">church</span></div>' +
          '<div><div class="stat-card__value">' + miembros + '</div><div class="stat-card__label">Miembros</div></div>' +
        '</div>' +
        '<div class="stat-card">' +
          '<div class="stat-card__icon stat-card__icon--visita"><span class="material-icons-outlined">person_add</span></div>' +
          '<div><div class="stat-card__value">' + visitas + '</div><div class="stat-card__label">Visitas</div></div>' +
        '</div>';
}

/**
 * Renderiza la tabla de registros.
 */
function renderAdminTable() {
    var thead = document.getElementById('adminTableHead');
    var tbody = document.getElementById('adminTableBody');
    var empty = document.getElementById('adminEmpty');

    // Header
    var headerRow = '<tr>';
    headerRow += '<th>#</th>';
    for (var h = 0; h < adminHeaders.length; h++) {
        headerRow += '<th>' + escapeHtml(adminHeaders[h]) + '</th>';
    }
    headerRow += '<th>Acciones</th>';
    headerRow += '</tr>';
    thead.innerHTML = headerRow;

    // Body
    if (adminData.length === 0) {
        empty.style.display = '';
        return;
    }
    empty.style.display = 'none';

    var html = '';
    for (var i = 0; i < adminData.length; i++) {
        var record = adminData[i];
        html += '<tr data-row="' + record.rowNumber + '" data-index="' + i + '">';
        html += '<td>' + (i + 1) + '</td>';
        for (var j = 0; j < record.values.length; j++) {
            var cellVal = formatDateCell(String(record.values[j] || ''));
            html += '<td title="' + escapeHtml(cellVal) + '">' + escapeHtml(cellVal) + '</td>';
        }
        html += '<td class="actions-cell">';
        html += '<button class="btn-icon--edit" title="Editar" onclick="openEditModal(' + i + ')"><span class="material-icons-outlined">edit</span></button>';
        html += '<button class="btn-icon--delete" title="Eliminar" onclick="openDeleteModal(' + i + ')"><span class="material-icons-outlined">delete</span></button>';
        html += '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

/**
 * Si el valor es una fecha ISO (ej: 2026-02-25T18:05:12.000Z), retorna solo yyyy-MM-dd.
 * @param {string} val
 * @returns {string}
 */
function formatDateCell(val) {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(val)) {
        return val.substring(0, 10);
    }
    return val;
}

/**
 * Filtra la tabla según el texto de búsqueda.
 */
function filterAdminTable() {
    var query = document.getElementById('adminSearch').value.toLowerCase().trim();
    var rows = document.querySelectorAll('#adminTableBody tr');

    for (var i = 0; i < rows.length; i++) {
        var text = rows[i].textContent.toLowerCase();
        rows[i].style.display = text.indexOf(query) !== -1 ? '' : 'none';
    }
}

/**
 * Escapa caracteres HTML para prevenir inyección.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// ========================================
// MODAL EDITAR
// ========================================

/**
 * Abre el modal de edición con los datos del registro seleccionado.
 * @param {number} index - Índice en adminData.
 */
function openEditModal(index) {
    var record = adminData[index];
    editingRow = { rowNumber: record.rowNumber, index: index };

    var body = document.getElementById('editModalBody');
    var html = '';

    // Índices de columnas que contienen fechas (Fecha Registro=0, Fecha Nacimiento=5)
    // Columnas: 0-FechaReg, 1-Tipo, 2-IglesiaOrigen, 3-Nombre, 4-Apellido, 5-FechaNac,
    //           6-EstadoCivil, 7-Dirección, 8-Comuna, 9-Profesión, 10-Hijos, 11-Bautizado,
    //           12-FechaConversión, 13-Teléfono, 14-Email
    var dateColumns = [0, 5];

    for (var i = 0; i < adminHeaders.length; i++) {
        var readOnly = (i === 0) ? ' readonly style="background:#f5f5f5; cursor:not-allowed;"' : '';
        var cellValue = formatDateCell(String(record.values[i] || ''));
        var inputType = (dateColumns.indexOf(i) !== -1) ? 'date' : 'text';
        html += '<div class="edit-field">';
        html += '<label>' + escapeHtml(adminHeaders[i]) + '</label>';
        html += '<input type="' + inputType + '" id="editField_' + i + '" value="' + escapeHtml(cellValue) + '"' + readOnly + '>';
        html += '</div>';
    }
    body.innerHTML = html;

    document.getElementById('editModal').style.display = '';
}

/**
 * Cierra el modal de edición.
 */
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingRow = null;
}

/**
 * Guarda los cambios del registro editado.
 */
function saveEditedRecord() {
    if (!editingRow) return;

    var values = [];
    for (var i = 0; i < adminHeaders.length; i++) {
        values.push(document.getElementById('editField_' + i).value);
    }

    var payload = {
        action: 'update',
        row: editingRow.rowNumber,
        values: values
    };

    // Deshabilitar botón
    var saveBtn = document.querySelector('#editModal .btn--primary');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="material-icons-outlined">hourglass_top</span> Guardando...';

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        redirect: 'follow'
    })
    .then(function (r) { return r.text(); })
    .then(function (text) {
        console.log('Update response:', text);
        var json = JSON.parse(text);
        if (json.result === 'success') {
            closeEditModal();
            loadAdminData();
        } else {
            alert('Error al guardar: ' + (json.message || 'desconocido'));
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<span class="material-icons-outlined">save</span> Guardar';
        }
    })
    .catch(function (error) {
        console.error('Error guardando:', error);
        // Intentar con no-cors como respaldo
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        }).then(function () {
            closeEditModal();
            setTimeout(loadAdminData, 1500);
        }).catch(function () {
            alert('Error de conexión al guardar.');
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<span class="material-icons-outlined">save</span> Guardar';
        });
    });
}

// ========================================
// MODAL ELIMINAR
// ========================================

/**
 * Abre el modal de confirmación de eliminación.
 * @param {number} index - Índice en adminData.
 */
function openDeleteModal(index) {
    var record = adminData[index];
    deletingRow = { rowNumber: record.rowNumber, index: index };

    var nombre = (record.values[3] || '') + ' ' + (record.values[4] || '');
    document.getElementById('deleteRecordName').textContent = nombre.trim() || 'Registro #' + (index + 1);

    document.getElementById('deleteModal').style.display = '';
}

/**
 * Cierra el modal de eliminación.
 */
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deletingRow = null;
}

/**
 * Confirma y ejecuta la eliminación del registro.
 */
function confirmDelete() {
    if (!deletingRow) return;

    var payload = {
        action: 'delete',
        row: deletingRow.rowNumber
    };

    var deleteBtn = document.querySelector('#deleteModal .btn--danger');
    deleteBtn.disabled = true;
    deleteBtn.innerHTML = '<span class="material-icons-outlined">hourglass_top</span> Eliminando...';

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        redirect: 'follow'
    })
    .then(function (r) { return r.text(); })
    .then(function (text) {
        console.log('Delete response:', text);
        var json = JSON.parse(text);
        if (json.result === 'success') {
            closeDeleteModal();
            loadAdminData();
        } else {
            alert('Error al eliminar: ' + (json.message || 'desconocido'));
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = '<span class="material-icons-outlined">delete</span> Eliminar';
        }
    })
    .catch(function (error) {
        console.error('Error eliminando:', error);
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        }).then(function () {
            closeDeleteModal();
            setTimeout(loadAdminData, 1500);
        }).catch(function () {
            alert('Error de conexión al eliminar.');
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = '<span class="material-icons-outlined">delete</span> Eliminar';
        });
    });
}
