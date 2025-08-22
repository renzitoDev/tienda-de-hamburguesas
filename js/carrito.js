const BASE_URL = "/backend-apicrud/index.php?url=";

// ----------------- CARRITO EN LOCALSTORAGE -----------------
function getCart() { return JSON.parse(localStorage.getItem('cart')) || []; }
function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }
function clearCart() { localStorage.removeItem('cart'); renderCarrito(); }

// Añadir producto a carrito (usar desde vista de productos)
function addToCart(producto) {
  let cart = getCart();
  // Si ya existe, suma cantidad; si no, lo crea
  const idx = cart.findIndex(p=>p.id === producto.id);
  if(idx>-1){
    cart[idx].cantidad += 1;
  } else {
    cart.push({...producto, cantidad:1});
  }
  saveCart(cart);
  renderCarrito();
}

// Quitar producto
function eliminarProdCart(id){
  let cart = getCart().filter(p=>p.id !== id);
  saveCart(cart); renderCarrito();
}

// Mostrar carrito en #carrito-lista
function renderCarrito(){
  const wrapper = document.getElementById('carrito-lista');
  const cart = getCart();
  if(!wrapper) return;
  if(cart.length===0){
    wrapper.innerHTML = "<p>Tu carrito está vacío.</p>";
    return;
  }
  
  let html = `<table>
  <thead><tr>
    <th>Producto</th><th>Cantidad</th><th>Precio Und.</th><th>Subtotal</th><th></th>
  </tr></thead><tbody>`;
  let total=0;
  cart.forEach(p=>{
    html += `<tr>
      <td>${p.nombre}</td>
      <td>${p.cantidad}</td>
      <td>$${parseFloat(p.precio).toLocaleString('es-CO')}</td>
      <td>$${(p.precio*p.cantidad).toLocaleString('es-CO')}</td>
      <td><button class="eliminar-prod" onclick="eliminarProdCart(${p.id})">X</button></td>
    </tr>`;
    total += p.precio*p.cantidad;
  });
  html += `</tbody><tfoot><tr><td colspan="3"><b>Total</b></td><td colspan="2"><b>$${total.toLocaleString('es-CO')}</b></td></tr></tfoot></table>`;
  wrapper.innerHTML = html;
}
window.renderCarrito = renderCarrito; // para poder llamarlo global

document.getElementById("vaciar-carrito").onclick = clearCart;

window.eliminarProdCart = eliminarProdCart; // permite uso desde html

// --------------- PRODUCTOS: cargar y mostrar (ejemplo para home/cards) ---------------
async function cargarProductosYRenderizar() {
  // Llama a tu endpoint para productos
  const res = await fetch(BASE_URL+"productos");
  const productos = await res.json();
  // Supón que tienes un div id="productos-catalogo"
  const contenedor = document.getElementById("productos-catalogo");
  if(!contenedor) return;
  let html = "";
  productos.forEach(p=>{
    html += `<div class="product-card">
      <img src="${p.imagen}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p>${p.descripcion}</p>
      <p><b>$${parseFloat(p.precio).toLocaleString('es-CO')}</b></p>
      <button onclick='addToCart(${JSON.stringify({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio
      }).replace(/"/g,"&quot;")})'>Agregar al Carrito</button>
    </div>`;
  });
  contenedor.innerHTML = html;
}
document.addEventListener("DOMContentLoaded", cargarfns);
function cargarfns(){
  renderCarrito();
  if(document.getElementById("productos-catalogo")){
    cargarProductosYRenderizar();
  }
}

document.addEventListener('DOMContentLoaded', function(){
  renderCarrito();
});

// ------------------- CHECKOUT.JS (funciona igual que el código que ya tienes, solo cambia BASE_URL) -------------------

// ...aquí puedes reutilizar el checkout.js dado antes,
// solo asegúrate de que use BASE_URL = "/backend-apicrud/index.php?url="

