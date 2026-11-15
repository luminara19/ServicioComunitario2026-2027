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
// Deja el modal listo para una nueva inscripción: formulario vacío y aviso oculto
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
VALIDACIÓN DE CAMPOS Y CARACTERES REQUERIDOS - AGREMIADOS
========================================================= */

// Claves de almacenamiento para cada tipo de registro
var CLAVES_STORAGE = {
empresa: "agremiados_empresa_constructora",
profesional: "agremiados_profesional_independiente",
proveedor: "agremiados_proveedor"
};

// Patrones reutilizables
var PATRONES = {
nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/,
cedula: /^[VEJPvejp]?-?[0-9]{6,10}$/,
correo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
rifEmpresa: /^[JVEjve]-?[0-9]{8,9}-?[0-9]?$/,
rifNegocio: /^[Jj]-?[0-9]{8,9}-?[0-9]?$/,
rifPersonal: /^[VEve]-?[0-9]{8,9}-?[0-9]?$/,
registro: /^[0-9A-Za-zÁÉÍÓÚáéíóúÑÑüÜ][0-9A-Za-zÁÉÍÓÚáéíóúÑÑüÜ\-\/.\s]{3,39}$/,
texto: /^[0-9A-Za-zÁÉÍÓÚáéíóúÑÑüÜ.,'()\/\-\s]+$/,
anio: /^(19|20)[0-9]{2}$/
};

// Reglas por formulario, usando los atributos name reales del HTML
var reglasFormulario = {
empresa: [
{ name: "emp-nombre", min: 3, max: 80, patron: PATRONES.nombre, mensajeError: "Ingrese nombre y apellido válidos (solo letras, mínimo 3 caracteres)." },
{ name: "emp-cedula", min: 6, max: 12, patron: PATRONES.cedula, mensajeError: "Cédula inválida. Formato: V-12345678." },
{ name: "emp-nacimiento", tipo: "fecha" },
{ name: "emp-correo", min: 5, max: 120, patron: PATRONES.correo, mensajeError: "Ingrese un correo electrónico válido." },
{ name: "emp-rif", min: 5, max: 15, patron: PATRONES.rifEmpresa, mensajeError: "RIF inválido. Formato: J-12345678-9." },
{ name: "emp-registro", min: 5, max: 40, patron: PATRONES.registro, mensajeError: "Ingrese un registro mercantil válido (mínimo 5 caracteres)." }
],
profesional: [
{ name: "pro-nombre", min: 3, max: 80, patron: PATRONES.nombre, mensajeError: "Ingrese nombre y apellido válidos (solo letras, mínimo 3 caracteres)." },
{ name: "pro-cedula", min: 6, max: 12, patron: PATRONES.cedula, mensajeError: "Cédula inválida. Formato: V-12345678." },
{ name: "pro-nacimiento", tipo: "fecha" },
{ name: "pro-correo", min: 5, max: 120, patron: PATRONES.correo, mensajeError: "Ingrese un correo electrónico válido." },
{ name: "pro-rif", min: 5, max: 15, patron: PATRONES.rifPersonal, mensajeError: "RIF inválido. Formato: V-12345678-9." },
{ name: "pro-profesion", min: 3, max: 100, patron: PATRONES.texto, mensajeError: "Ingrese su profesión (mínimo 3 caracteres)." },
{ name: "pro-institucion", min: 3, max: 150, patron: PATRONES.texto, mensajeError: "Ingrese el nombre de la institución universitaria." },
{ name: "pro-anio-graduacion", min: 4, max: 4, patron: PATRONES.anio, mensajeError: "Año de graduación inválido (formato: YYYY)." }
],
proveedor: [
{ name: "prov-nombre", min: 3, max: 80, patron: PATRONES.nombre, mensajeError: "Ingrese nombre y apellido válidos (solo letras, mínimo 3 caracteres)." },
{ name: "prov-cedula", min: 6, max: 12, patron: PATRONES.cedula, mensajeError: "Cédula inválida. Formato: V-12345678." },
{ name: "prov-nacimiento", tipo: "fecha" },
{ name: "prov-correo", min: 5, max: 120, patron: PATRONES.correo, mensajeError: "Ingrese un correo electrónico válido." },
{ name: "prov-rif", min: 5, max: 15, patron: PATRONES.rifNegocio, mensajeError: "RIF inválido. Formato: J-12345678-9." },
{ name: "prov-registro", min: 5, max: 40, patron: PATRONES.registro, mensajeError: "Ingrese un registro mercantil válido (mínimo 5 caracteres)." }
]
};

// Obtiene o crea el contenedor de error junto al campo
function obtenerContenedorError(campo) {
var contenedor = campo.closest(".campo") || campo.parentElement;
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

// Valida un campo según su regla; retorna true si es válido
function validarCampo(campo, regla) {
var valor = (regla.tipo === "fecha" ? campo.value : (campo.value || "").trim()) || "";

if (valor.length === 0) {
mostrarError(campo, "Este campo es obligatorio.");
return false;
}

// Fecha: debe ser válida y no futura
if (regla.tipo === "fecha") {
var partes = valor.split("-");
var fechaIngresada = new Date(valor + "T00:00:00");
var hoy = new Date();
hoy.setHours(23, 59, 59, 999);
if (partes.length !== 3 || isNaN(fechaIngresada.getTime())) {
mostrarError(campo, "Ingrese una fecha de nacimiento válida.");
return false;
}
if (fechaIngresada > hoy) {
mostrarError(campo, "La fecha no puede ser futura.");
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

// Determina el tipo de formulario según el prefijo de sus campos
function determinarTipoFormulario(form) {
if (form.querySelector("[name^='emp-']")) return "empresa";
if (form.querySelector("[name^='pro-']")) return "profesional";
if (form.querySelector("[name^='prov-']")) return "proveedor";
return null;
}

// Valida todo el formulario; retorna true si todos los campos son válidos
function validarFormulario(form, tipo) {
var todoValido = true;
var primerInvalido = null;

(reglasFormulario[tipo] || []).forEach(function (regla) {
var campo = form.querySelector("[name='" + regla.name + "']");
if (!campo) return;
if (!validarCampo(campo, regla)) {
todoValido = false;
if (!primerInvalido) primerInvalido = campo;
}
});

// Enfocar el primer campo inválido para mejor UX
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
Array.prototype.forEach.call(form.elements, function (campo) {
if (!campo.name) return;
if (campo.type === "checkbox" || campo.type === "radio") {
if (campo.checked) datos[campo.name] = campo.value;
return;
}
datos[campo.name] = (campo.value || "").trim();
});
return datos;
}

// Validación en tiempo real (al salir del campo)
document.querySelectorAll("[data-formulario]").forEach(function (form) {
var tipo = determinarTipoFormulario(form);
if (!tipo) return;

(reglasFormulario[tipo] || []).forEach(function (regla) {
var campo = form.querySelector("[name='" + regla.name + "']");
if (!campo) return;

campo.addEventListener("blur", function () {
validarCampo(campo, regla);
});
campo.addEventListener("input", function () {
if (campo.classList.contains("input-invalido")) {
mostrarError(campo, "");
}
});
});
});

/* =========================================================
ENVÍO DEL FORMULARIO CON VALIDACIÓN + LOCALSTORAGE
========================================================= */
document.querySelectorAll("[data-formulario]").forEach(function (form) {
form.addEventListener("submit", function (e) {
e.preventDefault();

// 1) Validación personalizada de campos y caracteres
var tipo = determinarTipoFormulario(form);
if (!tipo) {
console.warn("No se pudo determinar el tipo de formulario");
return;
}

if (!validarFormulario(form, tipo)) {
return; // NO procesa si falta o hay error en algún campo
}

// 2) Validación nativa HTML5 (required, type=email, etc.)
if (!form.checkValidity()) {
form.reportValidity();
return;
}

// 3) Recopilar datos y guardar en memoria local
var datos = recopilarDatos(form);
var guardado = guardarEnMemoriaLocal(tipo, datos);

if (!guardado) {
alert("No se pudieron guardar los datos. Intente nuevamente.");
return;
}

// 4) Confirmar éxito en pantalla
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
window.AgremiadosStorage = {
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
