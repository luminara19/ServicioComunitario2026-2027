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
VALIDACIÓN DE CAMPOS Y CARACTERES REQUERIDOS - AGREMIADOS
========================================================= */

// Claves de almacenamiento para cada tipo de registro
var CLAVES_STORAGE = {
empresa: "agremiados_empresa_constructora",
profesional: "agremiados_profesional_independiente",
proveedor: "agremiados_proveedor"
};

// Reglas de validación comunes
var reglasComunes = {
nombre: {
selector: "[name='nombre']",
requerido: true,
min: 3,
max: 80,
patron: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
mensajeError: "Ingrese nombre y apellido válidos (solo letras, mínimo 3 caracteres)."
},
cedula: {
selector: "[name='cedula']",
requerido: true,
min: 6,
max: 10,
patron: /^[0-9]+$/,
mensajeError: "La cédula debe contener solo números (entre 6 y 10 dígitos)."
},
fecha: {
selector: "[name='fecha_nacimiento']",
requerido: true,
mensajeError: "Ingrese una fecha de nacimiento válida."
},
correo: {
selector: "[name='correo']",
requerido: true,
min: 5,
max: 120,
patron: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
mensajeError: "Ingrese un correo electrónico válido."
}
};

// Reglas específicas para cada tipo de formulario
var reglasEspecificas = {
empresa: {
rif: {
selector: "[name='rif_empresarial']",
requerido: true,
patron: /^[JVE]-\d{8,9}$/,
mensajeError: "RIF inválido. Formato: J-123456789, V-123456789 o E-123456789."
},
registro_mercantil: {
selector: "[name='registro_mercantil']",
requerido: true,
min: 5,
max: 200,
mensajeError: "Ingrese los datos del registro mercantil (mínimo 5 caracteres)."
}
},
profesional: {
rif: {
selector: "[name='rif_personal']",
requerido: true,
patron: /^[VE]-\d{8,9}$/,
mensajeError: "RIF inválido. Formato: V-123456789 o E-123456789."
},
profesion: {
selector: "[name='profesion']",
requerido: true,
min: 3,
max: 100,
mensajeError: "Ingrese su profesión (mínimo 3 caracteres)."
},
institucion: {
selector: "[name='institucion']",
requerido: true,
min: 3,
max: 150,
mensajeError: "Ingrese el nombre de la institución universitaria (mínimo 3 caracteres)."
},
anio_graduacion: {
selector: "[name='anio_graduacion']",
requerido: true,
patron: /^(19|20)\d{2}$/,
mensajeError: "Año de graduación inválido (formato: YYYY, entre 1900 y 2099)."
}
},
proveedor: {
rif: {
selector: "[name='rif_negocio']",
requerido: true,
patron: /^J-\d{8,9}$/,
mensajeError: "RIF inválido. Formato: J-123456789."
},
registro_mercantil: {
selector: "[name='registro_mercantil']",
requerido: true,
min: 5,
max: 200,
mensajeError: "Ingrese los datos del registro mercantil (mínimo 5 caracteres)."
}
}
};

// Obtiene o crea el contenedor de error junto al campo
function obtenerContenedorError(campo) {
var contenedor = campo.parentElement.querySelector(".error-msg");
if (!contenedor) {
contenedor = document.createElement("span");
contenedor.className = "error-msg";
contenedor.setAttribute("role", "alert");
contenedor.style.color = "#c0392b";
contenedor.style.fontSize = "0.85rem";
contenedor.style.marginTop = "4px";
contenedor.style.display = "block";
campo.parentElement.appendChild(contenedor);
}
return contenedor;
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

// Valida un campo según sus reglas; retorna true si es válido
function validarCampo(campo, regla) {
var valor = (campo.value || "").trim();

// Campo vacío
if (regla.requerido && valor.length === 0) {
mostrarError(campo, "Este campo es obligatorio.");
return false;
}
if (!regla.requerido && valor.length === 0) {
mostrarError(campo, "");
return true;
}

// Longitud mínima
if (regla.min && valor.length < regla.min) {
mostrarError(campo, "Mínimo " + regla.min + " caracteres.");
return false;
}
// Longitud máxima
if (regla.max && valor.length > regla.max) {
mostrarError(campo, "Máximo " + regla.max + " caracteres.");
return false;
}
// Patrón (regex)
if (regla.patron && !regla.patron.test(valor)) {
mostrarError(campo, regla.mensajeError);
return false;
}

// Validación especial para fecha: no puede ser futura
if (regla === reglasComunes.fecha) {
var fechaIngresada = new Date(valor);
var hoy = new Date();
if (isNaN(fechaIngresada.getTime()) || fechaIngresada > hoy) {
mostrarError(campo, "La fecha no puede ser futura.");
return false;
}
}

mostrarError(campo, "");
return true;
}

// Determina el tipo de formulario basado en su ID o campos
function determinarTipoFormulario(form) {
if (form.querySelector("[name='rif_empresarial']")) return "empresa";
if (form.querySelector("[name='rif_personal']")) return "profesional";
if (form.querySelector("[name='rif_negocio']")) return "proveedor";
return null;
}

// Valida todo el formulario; retorna true si todos los campos son válidos
function validarFormulario(form, tipo) {
var todoValido = true;
var camposInvalidos = [];

// Validar campos comunes
Object.keys(reglasComunes).forEach(function (clave) {
var regla = reglasComunes[clave];
var campo = form.querySelector(regla.selector);
if (!campo) return;
var esValido = validarCampo(campo, regla);
if (!esValido) {
todoValido = false;
camposInvalidos.push(campo);
}
});

// Validar campos específicos según el tipo
if (tipo && reglasEspecificas[tipo]) {
Object.keys(reglasEspecificas[tipo]).forEach(function (clave) {
var regla = reglasEspecificas[tipo][clave];
var campo = form.querySelector(regla.selector);
if (!campo) return;
var esValido = validarCampo(campo, regla);
if (!esValido) {
todoValido = false;
camposInvalidos.push(campo);
}
});
}

// Enfocar el primer campo inválido para mejor UX
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

// Campos comunes
Object.keys(reglasComunes).forEach(function (clave) {
var regla = reglasComunes[clave];
var campo = form.querySelector(regla.selector);
if (campo) {
datos[clave] = campo.value.trim();
}
});

// Campos específicos según el tipo
if (tipo && reglasEspecificas[tipo]) {
Object.keys(reglasEspecificas[tipo]).forEach(function (clave) {
var regla = reglasEspecificas[tipo][clave];
var campo = form.querySelector(regla.selector);
if (campo) {
datos[clave] = campo.value.trim();
}
});
}

return datos;
}

// Validación en tiempo real (al salir del campo)
document.querySelectorAll("[data-formulario]").forEach(function (form) {
var tipo = determinarTipoFormulario(form);
if (!tipo) return;

// Validar campos comunes
Object.keys(reglasComunes).forEach(function (clave) {
var regla = reglasComunes[clave];
var campo = form.querySelector(regla.selector);
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

// Validar campos específicos
if (reglasEspecificas[tipo]) {
Object.keys(reglasEspecificas[tipo]).forEach(function (clave) {
var regla = reglasEspecificas[tipo][clave];
var campo = form.querySelector(regla.selector);
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
}
});

/* =========================================================
ENVÍO DEL FORMULARIO CON VALIDACIÓN + LOCALSTORAGE
========================================================= */
document.querySelectorAll("[data-formulario]").forEach(function (form) {
form.addEventListener("submit", function (e) {
e.preventDefault();

// 1) Validación nativa HTML5 (required, type=email, etc.)
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

// 3) Validación personalizada de campos y caracteres
if (!validarFormulario(form, tipo)) {
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
