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

})();

