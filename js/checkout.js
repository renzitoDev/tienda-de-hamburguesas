const BASE_URL = '/backend-apicrud/index.php?url=';

// =========== CARRITO LOGIC ===========
function getCart() { return JSON.parse(localStorage.getItem('cart')) || []; }
function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }
function clearCart() { localStorage.removeItem('cart'); updateCartBadge(); }
function addToCart(producto) {
  let cart = getCart();
  const idx = cart.findIndex(p => p.id === producto.id);
  if(idx > -1){
    cart[idx].cantidad += 1;
  } else {
    cart.push({...producto, cantidad: 1});
  }
  saveCart(cart);
  updateCartBadge();
}
function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((a,b)=>a+b.cantidad, 0);
  const badge = document.querySelector('.contar-pro');
  if(badge) badge.textContent = total;
}

// =========== LISTAR PRODUCTOS EN TARJETAS ===========
async function renderProductosCatalogo() {
  const cont = document.getElementById('productos-catalogo');
  if(!cont) return;
  cont.innerHTML = 'Cargando productos...';
  let res, productos;
  console.log('Llamando a:', BASE_URL + "productos");

  try {
    res = await fetch(BASE_URL + "productos");
    productos = await res.json();
    console.log('Respuesta productos fetch:', productos);
  } catch(e) {
    console.error('Error al fetch productos:', e);
    cont.innerHTML = 'Error al cargar los productos.';
    return;
  }
  if (!Array.isArray(productos) || productos.length === 0) {
    cont.innerHTML = '<p>No hay productos disponibles.</p>';
    return;
  }
  let html = '';
  productos.forEach(prod => {
    html += `
    <div class="card">
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <div class="card-img-overlay">
        <h3>${prod.nombre}</h3>
        <p>${prod.descripcion || ''}</p>
        <p class="card-precio">$${parseFloat(prod.precio).toLocaleString('es-CO')}</p>
        <button class="order-btn" onclick='addToCartBtn(${prod.id},"${prod.nombre.replace(/"/g,"&quot;")}",${prod.precio})'>
          <i class="fa-solid fa-cart-plus"></i> Agregar al carrito
        </button>
      </div>
    </div>
    `;
  });
  cont.innerHTML = html;
}

window.addToCartBtn = function(id, nombre, precio){
  addToCart({id, nombre, precio: Number(precio)});
  alert("¡Producto agregado al carrito!");
}
window.addEventListener('DOMContentLoaded', function(){
  updateCartBadge();
  renderProductosCatalogo();
});
window.addEventListener('storage', updateCartBadge);
