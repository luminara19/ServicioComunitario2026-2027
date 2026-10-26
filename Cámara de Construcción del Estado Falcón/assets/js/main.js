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

  /* ---------- Filtros de noticias ---------- */
  var botonesFiltro = document.querySelectorAll(".filtro-btn");
  if (botonesFiltro.length) {
    var noticias = document.querySelectorAll("[data-categoria]");
    botonesFiltro.forEach(function (boton) {
      boton.addEventListener("click", function () {
        var categoria = boton.dataset.filtro;
        botonesFiltro.forEach(function (b) {
          b.setAttribute("aria-pressed", String(b === boton));
        });
        noticias.forEach(function (n) {
          var coincide =
            categoria === "todas" || n.dataset.categoria === categoria;
          n.hidden = !coincide;
        });
      });
    });
  }

  /* ---------- Formularios: validación + anti-spam + confirmación ---------- */
  var correoRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

  function mostrarError(campo, mensaje) {
    campo.setAttribute("aria-invalid", "true");
    var contenedor = campo.closest(".campo") || campo.parentElement;
    var error = contenedor.querySelector(".error-msg");
    if (error) {
      error.textContent = mensaje;
      error.classList.add("is-visible");
    }
  }

  function limpiarErrores(form) {
    form.querySelectorAll("[aria-invalid]").forEach(function (campo) {
      campo.removeAttribute("aria-invalid");
    });
    form.querySelectorAll(".error-msg.is-visible").forEach(function (error) {
      error.classList.remove("is-visible");
      error.textContent = "";
    });
  }

  // Desafío matemático sencillo: los bots que no ejecutan JS no pueden responderlo.
  function prepararVerificacion(form) {
    var contenedor = form.querySelector(".verificacion");
    if (!contenedor) return null;
    var a = Math.floor(Math.random() * 8) + 2;
    var b = Math.floor(Math.random() * 8) + 1;
    var pregunta = contenedor.querySelector(".verificacion__pregunta");
    var entrada = contenedor.querySelector("input");
    if (pregunta) pregunta.textContent = a + " + " + b + " =";
    if (entrada) entrada.value = "";
    return { a: a, b: b, campo: entrada };
  }

  document.querySelectorAll("form[data-formulario]").forEach(function (form) {
    var verificacion = prepararVerificacion(form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      limpiarErrores(form);

      // Trampa anti-spam: si un robot la rellena, se ignora el envío en silencio.
      var trampa = form.querySelector(".trampa-antispam input");
      if (trampa && trampa.value.trim() !== "") {
        return;
      }

      var primerError = null;

      // Campos obligatorios
      form.querySelectorAll("[required]").forEach(function (campo) {
        if (campo.type === "checkbox") {
          if (!campo.checked) {
            mostrarError(campo, "Debes aceptar esta condición para continuar.");
            primerError = primerError || campo;
          }
          return;
        }
        var valor = campo.value.trim();
        if (!valor) {
          mostrarError(campo, "Este campo es obligatorio.");
          primerError = primerError || campo;
          return;
        }
        if (campo.type === "email" && !correoRegex.test(valor)) {
          mostrarError(campo, "Ingresa un correo electrónico válido.");
          primerError = primerError || campo;
        }
      });

      // Verificación matemática
      if (verificacion && verificacion.campo) {
        var respuesta = verificacion.campo.value.trim();
        var esperado = verificacion.a + verificacion.b;
        if (respuesta === "" || Number(respuesta) !== esperado) {
          mostrarError(
            verificacion.campo,
            "Respuesta incorrecta. Intenta de nuevo."
          );
          primerError = primerError || verificacion.campo;
        }
      }

      if (primerError) {
        primerError.focus();
        primerError.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        return;
      }

      // Confirmación (aquí se conectaría el envío real por correo / backend / CMS)
      var aviso = form.querySelector(".aviso-exito");
      if (aviso) {
        aviso.classList.add("is-visible");
        aviso.setAttribute("tabindex", "-1");
        aviso.focus();
        aviso.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }
      form.reset();
      verificacion = prepararVerificacion(form);
    });

    // Quitar el error en cuanto el usuario corrige un campo
    form.addEventListener("input", function (e) {
      var campo = e.target;
      if (campo.hasAttribute("aria-invalid")) {
        campo.removeAttribute("aria-invalid");
        var contenedor = campo.closest(".campo") || campo.parentElement;
        var error = contenedor && contenedor.querySelector(".error-msg");
        if (error) error.classList.remove("is-visible");
      }
    });
  });

  /* ---------- Año del pie de página ---------- */
  var anio = document.querySelector("[data-anio]");
  if (anio) anio.textContent = new Date().getFullYear();
})();
