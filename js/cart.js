function getCart() { return JSON.parse(localStorage.getItem('cart')) || []; }
function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }
function clearCart() { localStorage.removeItem('cart'); renderCarrito(); }

function eliminarProdCart(id) {
  let cart = getCart().filter(p => p.id !== id);
  saveCart(cart); renderCarrito();
}

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
    <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th><th></th></tr></thead><tbody>`;
  let total = 0;
  cart.forEach(p => {
    html += `<tr>
      <td>${p.nombre}</td>
      <td>${p.cantidad}</td>
      <td>$${parseFloat(p.precio).toLocaleString('es-CO')}</td>
      <td>$${(p.precio*p.cantidad).toLocaleString('es-CO')}</td>
      <td><button class="eliminar-prod" onclick="eliminarProdCart(${p.id})">x</button></td>
    </tr>`;
    total += p.precio * p.cantidad;
  });
  html += `</tbody></table>`;
  wrapper.innerHTML = html;
  totalDiv.innerHTML = `<h3>Total a pagar: $${total.toLocaleString('es-CO')}</h3>`;
  document.getElementById("ir-checkout").style.display = "inline-block";
}
window.eliminarProdCart = eliminarProdCart;

window.addEventListener('DOMContentLoaded', function(){
  renderCarrito();
  document.getElementById("ir-checkout").onclick = function(){
    window.location.href = "checkout.html";
  }
});
