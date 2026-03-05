/**
 * =====================================================
 * GOOGLE APPS SCRIPT - Censo Iglesia Echaurren 80
 * =====================================================
 * 
 * INSTRUCCIONES DE INSTALACIÓN:
 * 
 * 1. Abra Google Sheets en https://sheets.google.com
 * 2. Cree una nueva hoja de cálculo dentro de la carpeta 
 *    "catastro Hermanos-Visitas"
 *    (o muévala allí después de crearla).
 *    Nómbrela: "Censo Iglesia Echaurren 80"
 * 
 * 3. En la fila 1, escriba estos encabezados (uno por celda, de A a M):
 *    A: Fecha Registro
 *    B: Tipo
 *    C: Iglesia Origen
 *    D: Nombre
 *    E: Apellido
 *    F: Fecha Nacimiento
 *    G: Estado Civil
 *    H: Dirección
 *    I: Comuna
 *    J: Profesión
 *    K: Hijos
 *    L: Bautizado
 *    M: Fecha Conversión
 * 
 * 4. Vaya a: Extensiones → Apps Script
 * 
 * 5. Borre todo el código que aparece y pegue TODO el código 
 *    que está debajo de esta sección de instrucciones 
 *    (desde la línea "function doPost(e)" en adelante).
 * 
 * 6. Guarde el proyecto (Ctrl+S). Nómbrelo "Censo API".
 * 
 * 7. Haga clic en "Implementar" → "Nueva implementación"
 *    - En el engranaje (⚙), seleccione tipo: "Aplicación web"
 *    - Ejecutar como: "Yo" (su cuenta contacto@icech80.cl)
 *    - Quién tiene acceso: "Cualquier persona"
 *    - Clic en "Implementar"
 * 
 * 8. Google le pedirá autorización:
 *    - Clic en "Autorizar acceso"
 *    - Seleccione su cuenta
 *    - Si dice "Esta aplicación no está verificada", clic en
 *      "Avanzado" → "Ir a Censo API (no seguro)"
 *    - Clic en "Permitir"
 * 
 * 9. Copie la URL que aparece (empieza con https://script.google.com/...)
 * 
 * 10. Pegue esa URL en el archivo js/app.js, en la variable
 *     GOOGLE_SCRIPT_URL (línea indicada al inicio del archivo).
 * 
 * ¡Listo! El formulario ya guardará los datos automáticamente.
 * 
 * =====================================================
 * CÓDIGO PARA PEGAR EN APPS SCRIPT (copiar desde aquí)
 * =====================================================
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.openById('1qYS5TvPPpKJPcFDgYRm81ja3GgtNDCpwIExAzQqN714');
    var sheet = ss.getSheets()[0];
    var data = JSON.parse(e.postData.contents);
    
    // ========== ACCIÓN: ELIMINAR REGISTRO ==========
    if (data.action === 'delete') {
      var rowToDelete = data.row; // número de fila (1-indexed)
      if (rowToDelete > 1 && rowToDelete <= sheet.getLastRow()) {
        sheet.deleteRow(rowToDelete);
        return ContentService
          .createTextOutput(JSON.stringify({ result: 'success', message: 'Registro eliminado' }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService
          .createTextOutput(JSON.stringify({ result: 'error', message: 'Fila inválida' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // ========== ACCIÓN: EDITAR REGISTRO ==========
    if (data.action === 'update') {
      var rowToUpdate = data.row;
      var values = data.values; // array con los 13 valores A-M
      if (rowToUpdate > 1 && rowToUpdate <= sheet.getLastRow()) {
        var range = sheet.getRange(rowToUpdate, 1, 1, values.length);
        range.setValues([values]);
        return ContentService
          .createTextOutput(JSON.stringify({ result: 'success', message: 'Registro actualizado' }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService
          .createTextOutput(JSON.stringify({ result: 'error', message: 'Fila inválida' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // ========== ACCIÓN: NUEVO REGISTRO (por defecto) ==========
    // Construir la fecha de conversión
    var fechaConversion = '';
    if (data.anioConversion) {
      fechaConversion = data.anioConversion;
      if (data.mesConversion) {
        var meses = {
          '01': 'Enero', '02': 'Febrero', '03': 'Marzo',
          '04': 'Abril', '05': 'Mayo', '06': 'Junio',
          '07': 'Julio', '08': 'Agosto', '09': 'Septiembre',
          '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
        };
        fechaConversion = meses[data.mesConversion] + ' ' + data.anioConversion;
      }
    }
    
    // Construir lista de hijos
    var hijos = '';
    if (data.hijos && data.hijos.length > 0) {
      hijos = data.hijos.join(', ');
    } else if (data.tieneHijos === false) {
      hijos = 'No tiene';
    }
    
    // Formatear bautizado
    var bautizado = '';
    if (data.bautizado === true) {
      bautizado = 'Sí';
    } else if (data.bautizado === false) {
      bautizado = 'No';
    }
    
    // Agregar fila
    sheet.appendRow([
      new Date(),              // A: Fecha Registro
      data.tipoAsistente,      // B: Tipo (MIEMBRO / VISITA)
      data.iglesiaOrigen || '',// C: Iglesia Origen
      data.nombre,             // D: Nombre
      data.apellido,           // E: Apellido
      data.fechaNacimiento,    // F: Fecha Nacimiento
      data.estadoCivil,        // G: Estado Civil
      data.direccion,          // H: Dirección
      data.comuna,             // I: Comuna
      data.profesion || '',    // J: Profesión
      hijos,                   // K: Hijos
      bautizado,               // L: Bautizado
      fechaConversion,         // M: Fecha Conversión
      data.telefono || '',     // N: Teléfono
      data.email || ''         // O: Email
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'status';
    
    // ========== ACCIÓN: OBTENER TODOS LOS REGISTROS ==========
    if (action === 'getAll') {
      var ss = SpreadsheetApp.openById('1qYS5TvPPpKJPcFDgYRm81ja3GgtNDCpwIExAzQqN714');
      var sheet = ss.getSheets()[0];
      var lastRow = sheet.getLastRow();
      
      if (lastRow < 2) {
        return ContentService
          .createTextOutput(JSON.stringify({ result: 'success', data: [], headers: [] }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var headers = sheet.getRange(1, 1, 1, 15).getValues()[0];
      var dataRange = sheet.getRange(2, 1, lastRow - 1, 15).getValues();
      
      var records = [];
      for (var i = 0; i < dataRange.length; i++) {
        var row = dataRange[i];
        // Formatear todas las celdas que sean Date a yyyy-MM-dd
        for (var j = 0; j < row.length; j++) {
          if (row[j] instanceof Date) {
            row[j] = Utilities.formatDate(row[j], Session.getScriptTimeZone(), 'yyyy-MM-dd');
          }
        }
        records.push({
          rowNumber: i + 2,
          values: row
        });
      }
      
      return ContentService
        .createTextOutput(JSON.stringify({ result: 'success', headers: headers, data: records }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ========== STATUS (por defecto) ==========
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', message: 'Censo API activa' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
