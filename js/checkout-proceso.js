const BASE_URL = '/backend-apicrud/index.php?url=';

// ============ UTILIDADES DE CARRITO ============
function getCart() { return JSON.parse(localStorage.getItem('cart')) || []; }
function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }
function clearCart() { localStorage.removeItem('cart'); }

// ============ Renderiza productos resumen =============
function renderSummaryProducts() {
  const cont = document.getElementById('summary-products');
  const cart = getCart();
  if (!cont) return;
  let html = '';
  let subtotal = 0;
  cart.forEach(p => {
    html += `
      <div class="summary-row">
        <p class="lead color-black">${p.nombre}${p.cantidad > 1 ? ' x'+p.cantidad : ''}</p>
        <p class="lead color-black">$${parseFloat(p.precio * p.cantidad).toLocaleString('es-CO')}</p>
      </div>
    `;
    subtotal += p.precio * p.cantidad;
  });
  cont.innerHTML = html;
  document.getElementById('summary-subtotal').innerText = `$${subtotal.toLocaleString('es-CO')}`;
  calcularTotal(subtotal);
}

function calcularTotal(subtotal) {
  let total = subtotal;
  const domicilio = 5; // Puedes hacerlo dinámico
  const descuento = 5;
  total += domicilio;
  total -= descuento;
  let aumento = 0;
  let metodo = getPagoSeleccionado();
  if(metodo === 'Contraentrega') aumento = Math.round(total * 0.05);
  total += aumento;
  document.getElementById('summary-total').innerText = `$${total.toLocaleString('es-CO')}`;
  // Guardar en window para acceso fácil al submit
  window.checkoutValores = {total, subtotal, domicilio, descuento, aumento, metodo_pago: metodo};
  return window.checkoutValores;
}
function getPagoSeleccionado(){
  const pago = document.querySelector('input[type="radio"][name="radio"]:checked');
  return pago ? pago.value : "Contraentrega";
}

// ==================== Mostrar u ocultar comprobante según método ====================
document.addEventListener('DOMContentLoaded', function(){
  renderSummaryProducts();
  const radios = document.querySelectorAll('input[type="radio"][name="radio"]');
  const compDiv = document.querySelector('.summary-comprobante');
  radios.forEach(r=>{
    r.addEventListener('change', function(){
      renderSummaryProducts();
      if (this.value === 'Transferencia') {
        compDiv.style.display = "flex";
      } else {
        compDiv.style.display = "none";
      }
    });
    // Estado por defecto
    if (r.checked && r.value === 'Transferencia') compDiv.style.display = "flex";
  });
});

// ============ ENVÍO DEL PEDIDO =============
document.querySelector('.place-order-btn').addEventListener('click', async function(e){
  e.preventDefault();
  const form = document.querySelector('.checkout-form');
  const nombres = form.querySelector('input[name="f-name"]').value.trim();
  const apellidos = form.querySelector('input[name="l-name"]').value.trim();
  const email = form.querySelector('input[name="email"]').value.trim();
  const celular = form.querySelector('input[name="phone"]').value.trim();
  const direccion = form.querySelector('input[name="address"]').value.trim();
  const direccion2 = form.querySelector('input[name="address2"]').value.trim();
  let descripcion = form.querySelector('textarea[name="noe"]').value.trim();

  if(!nombres || !apellidos || !email || !celular || !direccion){
    alert('Completa todos los datos requeridos.');
    return;
  }

  // Se asegura cargar los totales
  const valores = calcularTotal(getCart().reduce((a,p)=>a+p.precio*p.cantidad,0));
  const productos = getCart().map(prod => ({
    id_producto: prod.id,
    precio: prod.precio,
    cantidad: prod.cantidad
  }));

  // 📸 Si método Transferencia, obtiene la imagen
  let comprobanteData = null;
  if(valores.metodo_pago==='Transferencia'){
    const fileInput = document.getElementById('comprobanteTransferInput');
    if(!fileInput.files.length){
      alert("Adjunta la foto del comprobante de transferencia.");
      return;
    }
    comprobanteData = await toBase64(fileInput.files[0]);
    descripcion += "\n[comprobante]:\n" + comprobanteData;
  }

  // == 1. Crea cliente
  let id_cliente;
  try {
    const clienteRes = await fetch(BASE_URL + 'clientes', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        nombre: nombres,
        apellido: apellidos,
        email: email,
        celular: celular,
        direccion: direccion,
        direccion2: direccion2,
        descripcion: descripcion
      })
    });
    const dataCliente = await clienteRes.json();
    if (!dataCliente.id) throw new Error("Error al crear el cliente.");
    id_cliente = dataCliente.id;
  } catch(err){
    alert("Error al crear cliente: "+err);
    return;
  }

  // == 2. Crea pedido
  try {
    const pedidoRes = await fetch(BASE_URL + 'pedidos', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        id_cliente: id_cliente,
        descuento: valores.descuento,
        metodo_pago: valores.metodo_pago,
        aumento: valores.aumento,
        productos
      })
    });
    const dataPedido = await pedidoRes.json();
    if (!dataPedido.id) throw new Error("Error al registrar pedido.");
    alert("¡Pedido realizado con éxito! Nº "+dataPedido.id);
    clearCart();
    window.location.href = "index.html";
  } catch(err){
    alert('Error registrando tu pedido. Intenta más tarde. '+err);
  }
});

// ============ BASE64 DE ARCHIVO ============
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}
