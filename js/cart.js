function getCart() { return JSON.parse(localStorage.getItem('cart')) || []; }
function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }
function clearCart() { localStorage.removeItem('cart'); renderCarrito(); }

function eliminarProdCart(id) {
  let cart = getCart().filter(p => p.id !== id);
  saveCart(cart); renderCarrito();
}

// Haz funciones GLOBALES con window. para poder llamarlas por onclick
window.sumarCantidad = function(id){
  let cart = getCart();
  let idx = cart.findIndex(p => p.id === id);
  if(idx > -1){
    cart[idx].cantidad = (cart[idx].cantidad||1) + 1;
    saveCart(cart); renderCarrito();
  }
}
window.restarCantidad = function(id){
  let cart = getCart();
  let idx = cart.findIndex(p => p.id === id);
  if(idx > -1 && cart[idx].cantidad > 1){
    cart[idx].cantidad--;
    saveCart(cart); renderCarrito();
  }
}
window.eliminarProdCart = eliminarProdCart;

function renderCarrito() {
  const wrapper = document.getElementById('carrito-lista');
  const totalDiv = document.getElementById('total-pagar');
  const cart = getCart();
  if(!wrapper) return;
  if(cart.length === 0){
    wrapper.innerHTML = "<p>Tu carrito está vacío.</p>";
    totalDiv.innerHTML = "";
    document.getElementById("ir-checkout").style.display = "none";
    return;
  }
  let html = `<table>
    <thead><tr>
      <th>Producto</th>
      <th>Cantidad</th>
      <th>Precio</th>
      <th>Subtotal</th>
      <th></th></tr></thead><tbody>`;
  let total = 0;
  cart.forEach(p => {
    html += `<tr>
      <td>${p.nombre}</td>
      <td>
        <button type="button" class="btn-cantidad" onclick="restarCantidad(${p.id})">-</button>
        <span style="padding:0 8px">${p.cantidad}</span>
        <button type="button" class="btn-cantidad" onclick="sumarCantidad(${p.id})">+</button>
      </td>
      <td>$${parseFloat(p.precio).toLocaleString('es-CO')}</td>
      <td>$${(p.precio*p.cantidad).toLocaleString('es-CO')}</td>
      <td><button type="button" class="eliminar-prod" onclick="eliminarProdCart(${p.id})">x</button></td>
    </tr>`;
    total += p.precio * p.cantidad;
  });
  html += `</tbody></table>`;
  wrapper.innerHTML = html;
  totalDiv.innerHTML = `<h3>Total a pagar: $${total.toLocaleString('es-CO')}</h3>`;
  document.getElementById("ir-checkout").style.display = "inline-block";
}

// Hacemos funciones globales
window.eliminarProdCart = eliminarProdCart;
window.sumarCantidad = sumarCantidad;
window.restarCantidad = restarCantidad;

window.eliminarProdCart = eliminarProdCart;
window.addEventListener('DOMContentLoaded', function(){
  renderCarrito();
  document.getElementById("ir-checkout").onclick = function(){
    window.location.href = "checkout.html";
  }
});
