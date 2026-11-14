/* =========================================================
Cámara de Construcción Falcón — Interacciones del sitio
========================================================= */
(function () {
"use strict";
/* ---------- Menú móvil ---------- */
var toggle = document.querySelector(".nav-toggle");
var nav = document.querySelector(".main-nav");
if (toggle && nav) {
toggle.addEventListener("click", function () {
var abierto = toggle.getAttribute("aria-expanded") === "true";
toggle.setAttribute("aria-expanded", String(!abierto));
toggle.setAttribute("aria-label", abierto ? "Abrir menú" : "Cerrar menú");
nav.classList.toggle("is-open", !abierto);
});
// Cerrar al pulsar Escape
document.addEventListener("keydown", function (e) {
if (e.key === "Escape" && nav.classList.contains("is-open")) {
nav.classList.remove("is-open");
toggle.setAttribute("aria-expanded", "false");
toggle.focus();
}
});
// Cerrar al pulsar fuera del menú
document.addEventListener("click", function (e) {
if (
nav.classList.contains("is-open") &&
!nav.contains(e.target) &&
!toggle.contains(e.target)
) {
nav.classList.remove("is-open");
toggle.setAttribute("aria-expanded", "false");
}
});
// Cerrar al cambiar a escritorio
var mq = window.matchMedia("(min-width: 901px)");
mq.addEventListener("change", function (e) {
if (e.matches) {
nav.classList.remove("is-open");
toggle.setAttribute("aria-expanded", "false");
}
});
}
/* ---------- Sombra del encabezado al desplazar ---------- */
var header = document.querySelector(".site-header");
if (header) {
var alDesplazar = function () {
header.classList.toggle("is-scrolled", window.scrollY > 8);
};
alDesplazar();
window.addEventListener("scroll", alDesplazar, { passive: true });
}
/* ---------- Animaciones de entrada (respetan movimiento reducido) ---------- */
var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var elementos = document.querySelectorAll(".reveal");
if (elementos.length) {
if (reduceMotion || !("IntersectionObserver" in window)) {
elementos.forEach(function (el) { el.classList.add("is-visible"); });
} else {
var observador = new IntersectionObserver(
function (entradas) {
entradas.forEach(function (entrada) {
if (entrada.isIntersecting) {
entrada.target.classList.add("is-visible");
observador.unobserve(entrada.target);
}
});
},
{ threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
elementos.forEach(function (el) { observador.observe(el); });
}
}
/* ---------- Año del pie de página ---------- */
var anio = document.querySelector("[data-anio]");
if (anio) anio.textContent = new Date().getFullYear();
/* =========================================================
VENTANAS FLOTANTES DE FORMULARIOS
========================================================= */
var overlay = document.querySelector("[data-modal-overlay]");
var modales = document.querySelectorAll(".modal");
var modalAbierto = null;
if (overlay && modales.length) {
var abrirModal = function (id) {
var m = document.getElementById(id);
if (!m) return;
if (modalAbierto && modalAbierto !== m) {
modalAbierto.classList.remove("is-open");
modalAbierto.setAttribute("aria-hidden", "true");
}
modalAbierto = m;
m.classList.add("is-open");
m.setAttribute("aria-hidden", "false");
overlay.classList.add("is-visible");
document.body.classList.add("modal-abierto");
var btn = m.querySelector("[data-modal-cerrar]");
if (btn) btn.focus();
};
var cerrarModal = function () {
if (!modalAbierto) return;
modalAbierto.classList.remove("is-open");
modalAbierto.setAttribute("aria-hidden", "true");
modalAbierto = null;
overlay.classList.remove("is-visible");
document.body.classList.remove("modal-abierto");
};
document.querySelectorAll("[data-modal-abrir]").forEach(function (btn) {
btn.addEventListener("click", function () {
abrirModal(btn.getAttribute("data-modal-abrir"));
});
});
document.querySelectorAll("[data-modal-cerrar]").forEach(function (btn) {
btn.addEventListener("click", cerrarModal);
});
overlay.addEventListener("click", cerrarModal);
document.addEventListener("keydown", function (e) {
if (e.key === "Escape") cerrarModal();
});

/* =========================================================
VALIDACIÓN DE CAMPOS Y CARACTERES REQUERIDOS - PROGRAMAS
========================================================= */

// Claves de almacenamiento para cada formulario
var CLAVES_STORAGE = {
diagnostico: "programas_cuestionario_diagnostico",
postulacion: "programas_planilla_postulacion"
};

// Obtiene o crea el contenedor de error junto al campo
function obtenerContenedorError(campo) {
var contenedor = campo.closest(".campo, .form-group, .form-field");
if (!contenedor) contenedor = campo.parentElement;
var errorEl = contenedor.querySelector(".error-msg");
if (!errorEl) {
errorEl = document.createElement("span");
errorEl.className = "error-msg";
errorEl.setAttribute("role", "alert");
errorEl.style.color = "#c0392b";
errorEl.style.fontSize = "0.85rem";
errorEl.style.marginTop = "4px";
errorEl.style.display = "block";
contenedor.appendChild(errorEl);
}
return errorEl;
}

// Muestra u oculta el error de un campo
function mostrarError(campo, mensaje) {
var cont = obtenerContenedorError(campo);
cont.textContent = mensaje || "";
if (mensaje) {
campo.classList.add("input-invalido");
campo.setAttribute("aria-invalid", "true");
} else {
campo.classList.remove("input-invalido");
campo.removeAttribute("aria-invalid");
}
}

// Valida un campo de texto
function validarCampoTexto(campo, min, max, patron, mensajeError) {
var valor = (campo.value || "").trim();
if (valor.length === 0) {
mostrarError(campo, "Este campo es obligatorio.");
return false;
}
if (min && valor.length < min) {
mostrarError(campo, "Mínimo " + min + " caracteres.");
return false;
}
if (max && valor.length > max) {
mostrarError(campo, "Máximo " + max + " caracteres.");
return false;
}
if (patron && !patron.test(valor)) {
mostrarError(campo, mensajeError || "Formato inválido.");
return false;
}
mostrarError(campo, "");
return true;
}

// Valida un grupo de radio buttons (al menos uno seleccionado)
function validarRadioGrupo(name, form) {
var radios = form.querySelectorAll("input[type='radio'][name='" + name + "']");
if (radios.length === 0) return true;
var seleccionado = false;
radios.forEach(function (r) {
if (r.checked) seleccionado = true;
});
if (!seleccionado) {
var primerRadio = radios[0];
mostrarError(primerRadio, "Debe seleccionar una opción.");
return false;
}
radios.forEach(function (r) { mostrarError(r, ""); });
return true;
}

// Valida un grupo de checkboxes con límite de selección
function validarCheckboxGrupo(name, form, maxSelecciones) {
var checkboxes = form.querySelectorAll("input[type='checkbox'][name='" + name + "']");
if (checkboxes.length === 0) return true;
var seleccionados = [];
checkboxes.forEach(function (cb) {
if (cb.checked) seleccionados.push(cb);
});
if (seleccionados.length === 0) {
mostrarError(checkboxes[0], "Debe seleccionar al menos una opción.");
return false;
}
if (maxSelecciones && seleccionados.length > maxSelecciones) {
mostrarError(checkboxes[0], "Máximo " + maxSelecciones + " opciones permitidas.");
return false;
}
checkboxes.forEach(function (cb) { mostrarError(cb, ""); });
return true;
}

// Valida un select
function validarSelect(campo) {
var valor = (campo.value || "").trim();
if (!valor || valor === "" || valor === "Selecciona una opción") {
mostrarError(campo, "Debe seleccionar una opción.");
return false;
}
mostrarError(campo, "");
return true;
}

// Determina el tipo de formulario
function determinarTipoFormulario(form) {
if (form.querySelector("[name='parroquia_diagnostico']") || 
    form.querySelector("[name='edad_encuestado']")) {
return "diagnostico";
}
if (form.querySelector("[name='nombre_sector']") || 
    form.querySelector("[name='enlace_principal_nombre']")) {
return "postulacion";
}
return null;
}

// Valida el formulario de diagnóstico participativo
function validarFormularioDiagnostico(form) {
var todoValido = true;
var camposInvalidos = [];

// Bloque I - Campos de texto y selects
var camposTexto = [
{ name: "sector_comunidad", min: 3, max: 150 },
{ name: "problema_grave", min: 10, max: 500 },
{ name: "propuesta_obra", min: 10, max: 500 }
];

camposTexto.forEach(function (cfg) {
var campo = form.querySelector("[name='" + cfg.name + "']");
if (campo) {
if (!validarCampoTexto(campo, cfg.min, cfg.max)) {
todoValido = false;
camposInvalidos.push(campo);
}
}
});

// Selects
var selects = ["parroquia_diagnostico"];
selects.forEach(function (name) {
var campo = form.querySelector("[name='" + name + "']");
if (campo) {
if (!validarSelect(campo)) {
todoValido = false;
camposInvalidos.push(campo);
}
}
});

// Radio groups (todos requeridos)
var radios = [
"edad_encuestado",
"ocupacion_principal",
"personas_aportan",
"personas_viven",
"calidad_vida",
"agua_potable",
"aseo_urbano",
"alumbrado",
"vialidad",
"transporte_publico",
"seguridad_ciudadana",
"mantenimiento_areas",
"perfil_alcalde",
"estilo_gestion",
"iniciativa_economia",
"via_participacion"
];

radios.forEach(function (name) {
if (!validarRadioGrupo(name, form)) {
todoValido = false;
}
});

// Checkbox groups con límites específicos
// Fuentes de ingresos: sin límite (puede marcar varias)
if (!validarCheckboxGrupo("fuentes_ingresos", form, null)) {
todoValido = false;
}

// Cualidad del líder: máximo 2
if (!validarCheckboxGrupo("cualidad_lider", form, 2)) {
todoValido = false;
}

// Tres áreas prioritarias: máximo 3
if (!validarCheckboxGrupo("areas_prioritarias", form, 3)) {
todoValido = false;
}

// Proyectos juventud: sin límite
if (!validarCheckboxGrupo("proyectos_juventud", form, null)) {
todoValido = false;
}

// Enfocar primer campo inválido
if (camposInvalidos.length > 0) {
camposInvalidos[0].focus();
}

return todoValido;
}

// Valida el formulario de planilla de postulación
function validarFormularioPostulacion(form) {
var todoValido = true;
var camposInvalidos = [];

// Campos de texto
var camposTexto = [
{ name: "nombre_sector", min: 3, max: 150 },
{ name: "direccion_sector", min: 5, max: 300 },
{ name: "cantidad_familias", min: 1, max: 10, patron: /^[0-9]+$/, mensajeError: "Ingrese un número válido." },
{ name: "enlace_principal_nombre", min: 3, max: 80, patron: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, mensajeError: "Solo letras y espacios." },
{ name: "enlace_principal_cedula", min: 6, max: 10, patron: /^[0-9]+$/, mensajeError: "Solo números (6-10 dígitos)." },
{ name: "enlace_principal_telefono", min: 10, max: 15, patron: /^[0-9+\-\s()]+$/, mensajeError: "Formato de teléfono inválido." },
{ name: "enlace_principal_cargo", min: 3, max: 100 },
{ name: "enlace_suplente_nombre", min: 3, max: 80, patron: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, mensajeError: "Solo letras y espacios." },
{ name: "enlace_suplente_cedula", min: 6, max: 10, patron: /^[0-9]+$/, mensajeError: "Solo números (6-10 dígitos)." },
{ name: "enlace_suplente_telefono", min: 10, max: 15, patron: /^[0-9+\-\s()]+$/, mensajeError: "Formato de teléfono inválido." },
{ name: "problematica_descripcion", min: 10, max: 1000 },
{ name: "cantidad_voluntarios", min: 1, max: 10, patron: /^[0-9]+$/, mensajeError: "Ingrese un número válido." },
{ name: "espacio_disponible", min: 3, max: 200 }
];

camposTexto.forEach(function (cfg) {
var campo = form.querySelector("[name='" + cfg.name + "']");
if (campo) {
if (!validarCampoTexto(campo, cfg.min, cfg.max, cfg.patron, cfg.mensajeError)) {
todoValido = false;
camposInvalidos.push(campo);
}
}
});

// Selects
var selects = ["parroquia_postulacion", "fecha_solicitud"];
selects.forEach(function (name) {
var campo = form.querySelector("[name='" + name + "']");
if (campo) {
if (!validarSelect(campo)) {
todoValido = false;
camposInvalidos.push(campo);
}
}
});

// Radio groups
var radios = ["voluntarios_disponibles", "espacio_fisico"];
radios.forEach(function (name) {
if (!validarRadioGrupo(name, form)) {
todoValido = false;
}
});

// Checkbox groups - Áreas de atención (3 ejes, sin límite)
if (!validarCheckboxGrupo("areas_atencion", form, null)) {
todoValido = false;
}

// Enfocar primer campo inválido
if (camposInvalidos.length > 0) {
camposInvalidos[0].focus();
}

return todoValido;
}

// Guarda los datos del formulario en localStorage
function guardarEnMemoriaLocal(tipo, datos) {
var clave = CLAVES_STORAGE[tipo];
if (!clave) return false;

var registros = [];
try {
var almacenado = localStorage.getItem(clave);
if (almacenado) {
registros = JSON.parse(almacenado);
}
} catch (err) {
console.warn("No se pudo leer localStorage:", err);
}

// Agregar metadatos al registro
datos.id = Date.now();
datos.fechaRegistro = new Date().toISOString();
datos.estado = "pendiente";
datos.tipo = tipo;
registros.push(datos);

try {
localStorage.setItem(clave, JSON.stringify(registros));
return true;
} catch (err) {
console.error("No se pudo guardar en localStorage:", err);
return false;
}
}

// Recopila los valores del formulario en un objeto
function recopilarDatos(form, tipo) {
var datos = {};

// Campos de texto, selects y radios
form.querySelectorAll("input[type='text'], input[type='number'], input[type='date'], select, textarea").forEach(function (campo) {
if (campo.name) {
datos[campo.name] = (campo.value || "").trim();
}
});

// Radio buttons (guardar el valor seleccionado)
form.querySelectorAll("input[type='radio']:checked").forEach(function (radio) {
if (radio.name) {
datos[radio.name] = radio.value;
}
});

// Checkboxes (guardar como array)
var checkboxesAgrupados = {};
form.querySelectorAll("input[type='checkbox']:checked").forEach(function (cb) {
if (cb.name) {
if (!checkboxesAgrupados[cb.name]) {
checkboxesAgrupados[cb.name] = [];
}
checkboxesAgrupados[cb.name].push(cb.value);
}
});
Object.keys(checkboxesAgrupados).forEach(function (name) {
datos[name] = checkboxesAgrupados[name];
});

return datos;
}

// Limitar selección de checkboxes en tiempo real
function limitarSeleccionCheckboxes(form) {
// Cualidad del líder: máximo 2
var cualidadLider = form.querySelectorAll("input[type='checkbox'][name='cualidad_lider']");
cualidadLider.forEach(function (cb) {
cb.addEventListener("change", function () {
var seleccionados = form.querySelectorAll("input[type='checkbox'][name='cualidad_lider']:checked");
if (seleccionados.length > 2) {
cb.checked = false;
mostrarError(cb, "Máximo 2 opciones permitidas.");
} else {
mostrarError(cb, "");
}
});
});

// Áreas prioritarias: máximo 3
var areasPrioritarias = form.querySelectorAll("input[type='checkbox'][name='areas_prioritarias']");
areasPrioritarias.forEach(function (cb) {
cb.addEventListener("change", function () {
var seleccionados = form.querySelectorAll("input[type='checkbox'][name='areas_prioritarias']:checked");
if (seleccionados.length > 3) {
cb.checked = false;
mostrarError(cb, "Máximo 3 opciones permitidas.");
} else {
mostrarError(cb, "");
}
});
});
}

// Validación en tiempo real para campos de texto
function agregarValidacionTiempoReal(form) {
form.querySelectorAll("input[type='text'], input[type='number'], input[type='date'], textarea").forEach(function (campo) {
campo.addEventListener("blur", function () {
var valor = (campo.value || "").trim();
if (valor.length === 0) {
mostrarError(campo, "Este campo es obligatorio.");
} else {
mostrarError(campo, "");
}
});
campo.addEventListener("input", function () {
if (campo.classList.contains("input-invalido")) {
mostrarError(campo, "");
}
});
});

form.querySelectorAll("select").forEach(function (campo) {
campo.addEventListener("change", function () {
if (campo.value && campo.value !== "Selecciona una opción") {
mostrarError(campo, "");
}
});
});
}

// Configurar validación para cada formulario
document.querySelectorAll("[data-formulario]").forEach(function (form) {
var tipo = determinarTipoFormulario(form);
if (!tipo) return;

agregarValidacionTiempoReal(form);
if (tipo === "diagnostico") {
limitarSeleccionCheckboxes(form);
}
});

/* =========================================================
ENVÍO DEL FORMULARIO CON VALIDACIÓN + LOCALSTORAGE
========================================================= */
document.querySelectorAll("[data-formulario]").forEach(function (form) {
form.addEventListener("submit", function (e) {
e.preventDefault();

// 1) Validación nativa HTML5
if (!form.checkValidity()) {
form.reportValidity();
return;
}

// 2) Determinar tipo de formulario
var tipo = determinarTipoFormulario(form);
if (!tipo) {
console.warn("No se pudo determinar el tipo de formulario");
return;
}

// 3) Validación personalizada según el tipo
var esValido = false;
if (tipo === "diagnostico") {
esValido = validarFormularioDiagnostico(form);
} else if (tipo === "postulacion") {
esValido = validarFormularioPostulacion(form);
}

if (!esValido) {
return; // NO procesa si falta o hay error en algún campo
}

// 4) Recopilar datos y guardar en memoria local
var datos = recopilarDatos(form, tipo);
var guardado = guardarEnMemoriaLocal(tipo, datos);

if (!guardado) {
alert("No se pudieron guardar los datos. Intente nuevamente.");
return;
}

// 5) Confirmar éxito en pantalla
var caja = form.closest(".modal");
var aviso = caja && caja.querySelector(".aviso-exito");
form.style.display = "none";
if (aviso) aviso.classList.add("is-visible");
var cuerpo = caja && caja.querySelector(".modal__cuerpo");
if (cuerpo) cuerpo.scrollTop = 0;

console.log("Registro guardado en localStorage:", tipo, datos);
});
});

/* =========================================================
FUNCIONES AUXILIARES PARA RECUPERAR DATOS (para futura BD)
========================================================= */
window.ProgramasStorage = {
obtenerRegistros: function (tipo) {
var clave = tipo ? CLAVES_STORAGE[tipo] : null;
if (!clave) return [];
try {
var data = localStorage.getItem(clave);
return data ? JSON.parse(data) : [];
} catch (err) {
return [];
}
},
obtenerTodos: function () {
var todos = [];
Object.keys(CLAVES_STORAGE).forEach(function (tipo) {
todos = todos.concat(this.obtenerRegistros(tipo));
}.bind(this));
return todos;
},
obtenerPendientes: function (tipo) {
var registros = tipo ? this.obtenerRegistros(tipo) : this.obtenerTodos();
return registros.filter(function (r) {
return r.estado === "pendiente";
});
},
marcarComoEnviado: function (tipo, id) {
var clave = CLAVES_STORAGE[tipo];
if (!clave) return;
var registros = this.obtenerRegistros(tipo);
registros.forEach(function (r) {
if (r.id === id) r.estado = "enviado";
});
localStorage.setItem(clave, JSON.stringify(registros));
},
limpiar: function (tipo) {
if (tipo) {
localStorage.removeItem(CLAVES_STORAGE[tipo]);
} else {
Object.keys(CLAVES_STORAGE).forEach(function (t) {
localStorage.removeItem(CLAVES_STORAGE[t]);
});
}
}
};
}
})();