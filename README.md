# Fichas de mates y lengua

Generador de fichas en PDF para niños de 7 a 10 años (mates por niveles y lengua con pictogramas).
Web estática, sin servidor: funciona sin conexión tras la primera visita.

- **Mates:** sumas, restas, tablas, división en caja (japonesa o española), fracciones, problemas...
- **Lengua:** letras, sílabas, ortografía, acentuación, vocabulario, verbo, oración y comprensión lectora, con pictogramas.

Los PDF llevan hoja de soluciones opcional y una semilla para repetir la misma ficha.

## Pictogramas
Los pictogramas utilizados son propiedad del Gobierno de Aragón y han sido creados por Sergio Palao para ARASAAC
(http://www.arasaac.org), que los distribuye bajo licencia Creative Commons BY-NC-SA. Uso no comercial.
Ver `ATRIBUCION.md`.

## Desarrollo
Código en `js/` y `levels/`. Tests con Node: `node test/check_new.js`, `node test/check_lengua_words.js`, etc.
