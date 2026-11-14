/* =========================================================
Cámara de Construcción Falcón — Interacciones del sitio
========================================================= */
(function () {
"use strict";
/* ---------- Menú móvil ---------- */
var toggle = document.querySelector(".nav-toggle");
var nav = document.querySelector(".main-nav");
if (toggle  && nav) {
toggle.addEventListener( "click ", function () {
var abierto = toggle.getAttribute( "aria-expanded ") ===  "true ";
toggle.setAttribute( "aria-expanded ", String(!abierto));
toggle.setAttribute( "aria-label ", abierto ?  "Abrir menú " :  "Cerrar menú ");
nav.classList.toggle( "is-open ", !abierto);
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
if (overlay  && modales.length) {
var abrirModal = function (id) {
var m = document.getElementById(id);
if (!m) return;
if (modalAbierto  && modalAbierto !== m) {
modalAbierto.classList.remove( "is-open ");
modalAbierto.setAttribute( "aria-hidden ",  "true ");
}
modalAbierto = m;
m.classList.add( "is-open ");
m.setAttribute( "aria-hidden ",  "false ");
overlay.classList.add( "is-visible ");
document.body.classList.add( "modal-abierto ");
var btn = m.querySelector( "[data-modal-cerrar] ");
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
 VALIDACIÓN DE CAMPOS Y CARACTERES REQUERIDOS
 ========================================================= */
 var CLAVE_STORAGE = "convenios_registros_falcon";

 // Reglas de validación por campo (nombre, longitud, patrón, mensaje)
 var reglasValidacion = {
   nombre: {
     selector: "[name='nombre'], [name='nombre_apellido']",
     requerido: true,
     min: 3,
     max: 80,
     patron: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
     mensajeError: "Ingrese nombre y apellido válidos (solo letras, mínimo 3 caracteres)."
   },
   cedula: {
     selector: "[name='cedula'], [name='cedula_identidad']",
     requerido: true,
     min: 6,
     max: 10,
     patron: /^[0-9]+$/,
     mensajeError: "La cédula debe contener solo números (entre 6 y 10 dígitos)."
   },
   fecha: {
     selector: "[name='fecha_nacimiento'], [name='fecha']",
     requerido: true,
     min: 10,
     max: 10,
     mensajeError: "Ingrese una fecha de nacimiento válida."
   },
   correo: {
     selector: "[name='correo'], [name='email'], [name='correo_electronico']",
     requerido: true,
     min: 5,
     max: 120,
     patron: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
     mensajeError: "Ingrese un correo electrónico válido."
   },
   curso: {
     selector: "[name='curso'], [name='tipo_curso']",
     requerido: true,
     min: 1,
     max: 50,
     mensajeError: "Seleccione un tipo de curso."
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
   if (regla === reglasValidacion.fecha) {
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

 // Valida todo el formulario; retorna true si todos los campos son válidos
 function validarFormulario(form) {
   var todoValido = true;
   var camposInvalidos = [];

   Object.keys(reglasValidacion).forEach(function (clave) {
     var regla = reglasValidacion[clave];
     var campo = form.querySelector(regla.selector);
     if (!campo) return;
     var esValido = validarCampo(campo, regla);
     if (!esValido) {
       todoValido = false;
       camposInvalidos.push(campo);
     }
   });

   // Enfocar el primer campo inválido para mejor UX
   if (camposInvalidos.length > 0) {
     camposInvalidos[0].focus();
   }

   return todoValido;
 }

 // Guarda los datos del formulario en localStorage
 function guardarEnMemoriaLocal(datos) {
   var registros = [];
   try {
     var almacenado = localStorage.getItem(CLAVE_STORAGE);
     if (almacenado) {
       registros = JSON.parse(almacenado);
     }
   } catch (err) {
     console.warn("No se pudo leer localStorage:", err);
   }

   // Agregar metadatos al registro
   datos.id = Date.now();
   datos.fechaRegistro = new Date().toISOString();
   datos.estado = "pendiente"; // pendiente de enviar a BD
   registros.push(datos);

   try {
     localStorage.setItem(CLAVE_STORAGE, JSON.stringify(registros));
     return true;
   } catch (err) {
     console.error("No se pudo guardar en localStorage:", err);
     return false;
   }
 }

 // Recopila los valores del formulario en un objeto
 function recopilarDatos(form) {
   var datos = {};
   Object.keys(reglasValidacion).forEach(function (clave) {
     var regla = reglasValidacion[clave];
     var campo = form.querySelector(regla.selector);
     if (campo) {
       datos[clave] = campo.value.trim();
     }
   });
   return datos;
 }

 // Validación en tiempo real (al salir del campo)
 document.querySelectorAll("[data-formulario]").forEach(function (form) {
   Object.keys(reglasValidacion).forEach(function (clave) {
     var regla = reglasValidacion[clave];
     var campo = form.querySelector(regla.selector);
     if (!campo) return;

     campo.addEventListener("blur", function () {
       validarCampo(campo, regla);
     });
     campo.addEventListener("input", function () {
       // Limpiar error mientras escribe
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

     // 1) Validación nativa HTML5 (required, type=email, etc.)
     if (!form.checkValidity()) {
       form.reportValidity();
       return;
     }

     // 2) Validación personalizada de campos y caracteres
     if (!validarFormulario(form)) {
       return; // NO procesa si falta o hay error en algún campo
     }

     // 3) Recopilar datos y guardar en memoria local
     var datos = recopilarDatos(form);
     var guardado = guardarEnMemoriaLocal(datos);

     if (!guardado) {
       alert("No se pudieron guardar los datos. Intente nuevamente.");
       return;
     }

     // 4) Confirmar éxito en pantalla (tu lógica original)
     var caja = form.closest(".modal");
     var aviso = caja && caja.querySelector(".aviso-exito");
     form.style.display = "none";
     if (aviso) aviso.classList.add("is-visible");
     var cuerpo = caja && caja.querySelector(".modal__cuerpo");
     if (cuerpo) cuerpo.scrollTop = 0;

     console.log("Registro guardado en localStorage:", datos);
   });
 });

 /* =========================================================
 FUNCIONES AUXILIARES PARA RECUPERAR DATOS (para futura BD)
 ========================================================= */
 // Expone funciones en el objeto window para uso futuro
 window.ConveniosStorage = {
   obtenerRegistros: function () {
     try {
       var data = localStorage.getItem(CLAVE_STORAGE);
       return data ? JSON.parse(data) : [];
     } catch (err) {
       return [];
     }
   },
   obtenerPendientes: function () {
     return this.obtenerRegistros().filter(function (r) {
       return r.estado === "pendiente";
     });
   },
   marcarComoEnviado: function (id) {
     var registros = this.obtenerRegistros();
     registros.forEach(function (r) {
       if (r.id === id) r.estado = "enviado";
     });
     localStorage.setItem(CLAVE_STORAGE, JSON.stringify(registros));
   },
   limpiar: function () {
     localStorage.removeItem(CLAVE_STORAGE);
   }
 };
}
})();
