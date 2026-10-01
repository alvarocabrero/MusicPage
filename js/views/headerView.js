/* Vista: cabecera fija (transparente arriba del todo).
   Con la clase .at-top la cabecera no tiene fondo ni borde y oculta el logotipo, que ya se ve grande en la portada;
   al bajar aparece con fondo y el logotipo horizontal (ver header.css). */
export const headerView={
 /**
  * @param {boolean} atTop true si la página está arriba del todo.
  */
 setAtTop(atTop){document.getElementById("top-bar").classList.toggle("at-top",atTop)}
};
