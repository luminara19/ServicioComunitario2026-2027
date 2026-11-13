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
NAVEGACIÓN ENTRE BLOQUES Y SWIPE
========================================================= */

(function initNavegacionBloques() {
  
  // Navegación con botones Anterior/Siguiente
  document.querySelectorAll("[data-ir-a]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-ir-a");
      var drawer = btn.closest(".drawer");
      if (!drawer) return;

      // Desactivar todas las pestañas y paneles
      drawer.querySelectorAll(".drawer__tab").forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      drawer.querySelectorAll(".drawer__panel").forEach(function (p) {
        p.classList.remove("is-active");
      });

      // Activar el panel target
      var panel = drawer.querySelector("#" + targetId);
      if (panel) {
        panel.classList.add("is-active");
        
        // Activar la pestaña correspondiente
        var tab = drawer.querySelector('[data-tab="' + targetId + '"]');
        if (tab) {
          tab.classList.add("is-active");
          tab.setAttribute("aria-selected", "true");
        }

        // Scroll al tope
        var cuerpo = drawer.querySelector(".drawer__cuerpo");
        if (cuerpo) cuerpo.scrollTop = 0;
      }
    });
  });

  // SWIPE en móvil para navegar entre bloques
  var drawers = document.querySelectorAll(".drawer");
  drawers.forEach(function (drawer) {
    var touchStartX = 0;
    var touchEndX = 0;
    var minSwipeDistance = 50;

    drawer.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    drawer.addEventListener("touchend", function (e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      var diff = touchStartX - touchEndX;
      var panelActivo = drawer.querySelector(".drawer__panel.is-active");
      if (!panelActivo) return;

      var tabs = Array.from(drawer.querySelectorAll(".drawer__tab"));
      var indiceActual = tabs.findIndex(function (t) {
        return t.getAttribute("data-tab") === panelActivo.id;
      });

      if (Math.abs(diff) < minSwipeDistance) return;

      // Swipe izquierda (siguiente)
      if (diff > 0 && indiceActual < tabs.length - 1) {
        var siguienteTab = tabs[indiceActual + 1];
        var siguienteId = siguienteTab.getAttribute("data-tab");
        var btnSiguiente = drawer.querySelector('[data-ir-a="' + siguienteId + '"]');
        if (btnSiguiente) btnSiguiente.click();
      }
      // Swipe derecha (anterior)
      else if (diff < 0 && indiceActual > 0) {
        var anteriorTab = tabs[indiceActual - 1];
        var anteriorId = anteriorTab.getAttribute("data-tab");
        var btnAnterior = drawer.querySelector('[data-ir-a="' + anteriorId + '"]');
        if (btnAnterior) btnAnterior.click();
      }
    }
  });

  // Navegación con teclado (flechas izquierda/derecha)
  document.addEventListener("keydown", function (e) {
    var drawerAbierto = document.querySelector(".drawer.is-open");
    if (!drawerAbierto) return;

    var panelActivo = drawerAbierto.querySelector(".drawer__panel.is-active");
    if (!panelActivo) return;

    var tabs = Array.from(drawerAbierto.querySelectorAll(".drawer__tab"));
    var indiceActual = tabs.findIndex(function (t) {
      return t.getAttribute("data-tab") === panelActivo.id;
    });

    if (e.key === "ArrowRight" && indiceActual < tabs.length - 1) {
      var siguienteTab = tabs[indiceActual + 1];
      var siguienteId = siguienteTab.getAttribute("data-tab");
      var btnSiguiente = drawerAbierto.querySelector('[data-ir-a="' + siguienteId + '"]');
      if (btnSiguiente) btnSiguiente.click();
    } else if (e.key === "ArrowLeft" && indiceActual > 0) {
      var anteriorTab = tabs[indiceActual - 1];
      var anteriorId = anteriorTab.getAttribute("data-tab");
      var btnAnterior = drawerAbierto.querySelector('[data-ir-a="' + anteriorId + '"]');
      if (btnAnterior) btnAnterior.click();
    }
  });

})();

})();


