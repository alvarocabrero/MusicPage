/* Modelo: colores de fondo/texto de las secciones del carrusel (paleta del manual de identidad). */
const STAGE=[["#000","#fff"],["#e22c14","#fff"],["#000","#fff"],["#b6bbbf","#000"]];

export function stageColors(index,n){
 const c=STAGE[(index%n)%4];
 return {bg:c[0],fg:c[1],dash:c[0]==="#e22c14"?c[1]:""};
}
