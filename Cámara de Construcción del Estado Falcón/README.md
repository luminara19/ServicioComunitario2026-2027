# Sitio web — Cámara de Construcción Falcón

Sitio institucional estático (HTML + CSS + JavaScript) para la Asociación Civil Cámara de
Construcción Falcón. Paleta obligatoria: **blanco, gris y azul**. Tipografía: Montserrat
(títulos) y Open Sans (cuerpo), con fallback a fuentes del sistema.

## Estructura

```
index.html            Inicio: hero, estadísticas, servicios, cursos, aliados, CTA
quienes-somos.html    Historia (timeline), misión, visión, valores, junta directiva
asociados.html        Beneficios, categorías, requisitos y formulario de pre-inscripción
servicios.html        Capacitaciones, certificaciones, asesorías, bolsa de empleo + FAQ
contacto.html         Formulario general, datos de contacto, mapa interactivo y redes
assets/css/styles.css Sistema de diseño completo (variables, componentes, responsive)
assets/js/main.js     Menú móvil, animaciones, filtros y validación de formularios
assets/img/logo.svg   Logo vectorial de la Cámara
robots.txt            Reglas para buscadores
sitemap.xml           Mapa del sitio para SEO
```

## Cómo ver el sitio localmente

No requiere compilación. Basta con servir la carpeta con cualquier servidor estático:

```bash
python3 -m http.server 8080
# o: npx serve .
```

Luego abrir http://localhost:8080

## Funcionalidad incluida

- **Responsive**: escritorio, tablet y móvil (menú hamburguesa con `aria-expanded`).
- **Accesibilidad**: enlace "saltar al contenido", `lang="es"`, landmarks, labels asociados,
  contraste alto, foco visible y soporte de `prefers-reduced-motion`.
- **SEO on-page**: títulos y meta descripciones únicos, Open Graph, canonical, datos
  estructurados (schema.org NGO) y `sitemap.xml`/`robots.txt`.
- **Formularios**: validación en cliente con mensajes accesibles (`role="alert"`,
  `aria-invalid`), trampa anti-spam oculta y verificación matemática generada por JavaScript.

## Notas para producción (pendientes del cliente)

1. **Envío de formularios**: los formularios son una demostración de interfaz; conecta el
   `submit` con el CMS (WordPress + WPForms/Contact Form 7), con un servicio tipo Formspree
   o con un endpoint propio. El punto de conexión está marcado con comentarios `Nota técnica`
   en `asociados.html` y `contacto.html`, y la lógica vive en `assets/js/main.js`.
2. **Contenido de ejemplo**: nombres de la junta directiva, direcciones, teléfonos, RIF,
   cifras y noticias son datos de muestra — reemplazar por los reales antes de publicar.
3. **Redes sociales**: los enlaces `href="#"` del pie de página deben apuntar a los perfiles
   oficiales; el botón flotante de WhatsApp usa el número de ejemplo.
4. **Dominio y SSL**: publicar en el dominio oficial con certificado SSL activo.
5. **Backups**: configurar copias de seguridad del alojamiento y del CMS si se migra.
6. **Mapa**: el iframe usa OpenStreetMap centrado en Coro; ajustar coordenadas a la sede exacta.

## Migración a WordPress (opcional)

El sitio está pensado para migrarse fácilmente a WordPress: cada página corresponde a una
plantilla y las noticias a un tipo de contenido propio ("Noticia"), permitiendo que el equipo
edite textos, suba imágenes y publique comunicados sin programar.
