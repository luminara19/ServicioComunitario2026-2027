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
// Modal listo para un nuevo envío: formulario vacío y aviso oculto
var restaurarModal = function (modal) {
var form = modal.querySelector("[data-formulario]");
if (form) {
form.reset();
form.style.display = "";
form.querySelectorAll(".error-msg").forEach(function (el) { el.textContent = ""; });
form.querySelectorAll(".input-invalido").forEach(function (campo) {
campo.classList.remove("input-invalido");
campo.removeAttribute("aria-invalid");
});
form.querySelectorAll("[aria-invalid]").forEach(function (campo) {
campo.removeAttribute("aria-invalid");
});
}
var aviso = modal.querySelector(".aviso-exito");
if (aviso) aviso.classList.remove("is-visible");
var cuerpo = modal.querySelector(".modal__cuerpo");
if (cuerpo) cuerpo.scrollTop = 0;
};
var cerrarModal = function () {
if (!modalAbierto) return;
restaurarModal(modalAbierto);
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

// Patrones reutilizables
var PATRONES = {
nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/,
cedula: /^[VEJPvejp]?-?[0-9]{6,10}$/,
telefono: /^[0-9+\-\s()]{7,20}$/,
texto: /^[0-9A-Za-zÁÉÍÓÚáéíóúÑÑüÜ.,'()\/\-\s]+$/,
numeros: /^[0-9]+$/
};

// Reglas por formulario
var reglasFormulario = {
diagnostico: {
campos: [
{ name: "diag-sector", min: 3, max: 150, patron: PATRONES.texto, mensajeError: "Indique el sector (mínimo 3 caracteres)." },
{ name: "diag-problema", min: 10, max: 1000 },
{ name: "diag-propuesta", min: 10, max: 1000 }
],
radios: [
"diag-parroquia",
"diag-edad",
"diag-ocupacion",
"diag-aportantes",
"diag-habitantes",
"diag-calidad",
"diag-perfil",
"diag-estilo"
],
limitesCheckbox: {
"diag-cualidades": 2,
"diag-prioridades": 3
}
},
postulacion: {
campos: [
{ name: "post-parroquia", tipo: "select" },
{ name: "post-fecha", tipo: "fecha" },
{ name: "post-sector", min: 3, max: 150, patron: PATRONES.texto, mensajeError: "Indique el sector (mínimo 3 caracteres)." },
{ name: "post-direccion", min: 5, max: 250 },
{ name: "post-familias", min: 1, max: 6, patron: PATRONES.numeros, mensajeError: "Ingrese un número válido de familias." },
{ name: "post-enlace-nombre", min: 3, max: 80, patron: PATRONES.nombre, mensajeError: "Solo letras y espacios (mínimo 3 caracteres)." },
{ name: "post-enlace-cedula", min: 6, max: 12, patron: PATRONES.cedula, mensajeError: "Cédula inválida. Formato: V-12345678." },
{ name: "post-enlace-telefono", min: 7, max: 20, patron: PATRONES.telefono, mensajeError: "Formato de teléfono inválido." },
{ name: "post-enlace-cargo", min: 3, max: 100, patron: PATRONES.texto, mensajeError: "Indique el cargo (mínimo 3 caracteres)." },
{ name: "post-suplente-nombre", min: 3, max: 80, patron: PATRONES.nombre, mensajeError: "Solo letras y espacios (mínimo 3 caracteres)." },
{ name: "post-suplente-cedula", min: 6, max: 12, patron: PATRONES.cedula, mensajeError: "Cédula inválida. Formato: V-12345678." },
{ name: "post-suplente-telefono", min: 7, max: 20, patron: PATRONES.telefono, mensajeError: "Formato de teléfono inválido." },
{ name: "post-descripcion", min: 10, max: 1000 },
{ name: "post-voluntarios-cantidad", min: 1, max: 6, patron: PATRONES.numeros, mensajeError: "Ingrese un número válido de voluntarios." },
{ name: "post-espacio-cual", min: 3, max: 200, patron: PATRONES.texto, mensajeError: "Indique el espacio (mínimo 3 caracteres)." }
],
radios: ["post-voluntarios", "post-espacio"],
limitesCheckbox: {}
}
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

// Valida un campo de texto, select o fecha
function validarCampo(campo, regla) {
var valor = (campo.value || "").trim();

if (valor.length === 0) {
mostrarError(campo, regla.tipo === "select" ? "Debe seleccionar una opción." : "Este campo es obligatorio.");
return false;
}

// Fecha: debe ser válida
if (regla.tipo === "fecha") {
var partes = valor.split("-");
var fecha = new Date(valor + "T00:00:00");
if (partes.length !== 3 || isNaN(fecha.getTime())) {
mostrarError(campo, "Ingrese una fecha válida.");
return false;
}
mostrarError(campo, "");
return true;
}

if (regla.min && valor.length < regla.min) {
mostrarError(campo, "Mínimo " + regla.min + " caracteres.");
return false;
}
if (regla.max && valor.length > regla.max) {
mostrarError(campo, "Máximo " + regla.max + " caracteres.");
return false;
}
if (regla.patron && !regla.patron.test(valor)) {
mostrarError(campo, regla.mensajeError || "Formato inválido.");
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

// Determina el tipo de formulario según el prefijo de sus campos
function determinarTipoFormulario(form) {
if (form.querySelector("[name^='diag-']")) return "diagnostico";
if (form.querySelector("[name^='post-']")) return "postulacion";
return null;
}

// Valida el formulario según las reglas de su tipo
function validarFormulario(form, tipo) {
var reglas = reglasFormulario[tipo];
if (!reglas) return false;

var todoValido = true;
var primerInvalido = null;
var marcarInvalido = function (campo) {
todoValido = false;
if (!primerInvalido) primerInvalido = campo;
};

(reglas.campos || []).forEach(function (regla) {
var campo = form.querySelector("[name='" + regla.name + "']");
if (!campo) return;
if (!validarCampo(campo, regla)) marcarInvalido(campo);
});

(reglas.radios || []).forEach(function (name) {
if (!validarRadioGrupo(name, form)) {
marcarInvalido(form.querySelector("input[type='radio'][name='" + name + "']"));
}
});

Object.keys(reglas.limitesCheckbox || {}).forEach(function (name) {
if (!validarCheckboxGrupo(name, form, reglas.limitesCheckbox[name])) {
marcarInvalido(form.querySelector("input[type='checkbox'][name='" + name + "']"));
}
});

// Enfocar primer campo inválido
if (primerInvalido) primerInvalido.focus();

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
function recopilarDatos(form) {
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
function limitarSeleccionCheckboxes(form, limites) {
Object.keys(limites).forEach(function (name) {
form.querySelectorAll("input[type='checkbox'][name='" + name + "']").forEach(function (cb) {
cb.addEventListener("change", function () {
var seleccionados = form.querySelectorAll("input[type='checkbox'][name='" + name + "']:checked");
if (seleccionados.length > limites[name]) {
cb.checked = false;
mostrarError(cb, "Máximo " + limites[name] + " opciones permitidas.");
} else {
mostrarError(cb, "");
}
});
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
var limites = (reglasFormulario[tipo] || {}).limitesCheckbox || {};
if (Object.keys(limites).length) limitarSeleccionCheckboxes(form, limites);
});

/* =========================================================
ENVÍO DEL FORMULARIO CON VALIDACIÓN + LOCALSTORAGE
========================================================= */
document.querySelectorAll("[data-formulario]").forEach(function (form) {
form.addEventListener("submit", function (e) {
e.preventDefault();

// 1) Determinar tipo de formulario
var tipo = determinarTipoFormulario(form);
if (!tipo) {
console.warn("No se pudo determinar el tipo de formulario");
return;
}

// 2) Validación personalizada según el tipo
if (!validarFormulario(form, tipo)) {
return; // NO procesa si falta o hay error en algún campo
}

// 3) Validación nativa (required, selects, etc.)
if (!form.checkValidity()) {
form.reportValidity();
return;
}

// 4) Recopilar datos y guardar en memoria local
var datos = recopilarDatos(form);
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