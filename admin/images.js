/* Administración: prepara las fotos que se suben para la web. Las reduce al tamaño que usa la web y las guarda en
   WebP (calidad 85), el formato de todas las imágenes de img/. Si el navegador no sabe guardar WebP (Safari), usa el
   codificador de vendor/webp, que sólo se descarga en ese caso. Las fotos nunca se amplían. */

const QUALITY=0.85;

/**
 * Prepara una foto.
 * @param {File} file Imagen elegida (JPG, PNG, WebP, HEIC si el navegador la abre…).
 * @param {{square?:boolean,size:number}} o square: recortar al cuadrado central (portadas); size: lado máximo del
 *   cuadrado o, si no es cuadrada, del lado corto.
 * @returns {Promise<{blob:Blob,width:number,height:number}>}
 */
export async function prepareImage(file,o){
 const img=await createImageBitmap(file).catch(()=>{throw new Error("No se puede abrir "+file.name+" (prueba con JPG o PNG).")});
 let sx=0,sy=0,sw=img.width,sh=img.height;
 if(o.square){const s=Math.min(sw,sh);sx=(sw-s)/2;sy=(sh-s)/2;sw=sh=s}
 const scale=Math.min(1,o.size/Math.min(sw,sh));
 const w=Math.round(sw*scale),h=Math.round(sh*scale);
 const c=document.createElement("canvas");c.width=w;c.height=h;
 const g=c.getContext("2d");g.imageSmoothingQuality="high";g.drawImage(img,sx,sy,sw,sh,0,0,w,h);
 img.close();
 let blob=await new Promise(ok=>c.toBlob(ok,"image/webp",QUALITY));
 if(!blob||blob.type!=="image/webp")blob=await encodeWasm(g.getImageData(0,0,w,h));
 return {blob,width:w,height:h};
}

let wasm;
/** Codifica en WebP con libwebp (WebAssembly). @param {ImageData} d @returns {Promise<Blob>} */
async function encodeWasm(d){
 if(!wasm)wasm=(async()=>{
  const [{default:factory},{initEmscriptenModule},{defaultOptions}]=await Promise.all([import("./vendor/webp/webp_enc.js"),import("./vendor/webp/utils.js"),import("./vendor/webp/meta.js")]);
  return {mod:await initEmscriptenModule(factory),opt:defaultOptions};
 })();
 const {mod,opt}=await wasm;
 const out=mod.encode(d.data,d.width,d.height,{...opt,quality:QUALITY*100});
 if(!out)throw new Error("No se ha podido convertir la foto a WebP.");
 return new Blob([out],{type:"image/webp"});
}
