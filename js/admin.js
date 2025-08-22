const BASE_URL = "http://localhost/backend-apicrud/index.php?url=";

// UTILIDAD: verifica si está logueado
function isLoggedAdmin() {
  return !!localStorage.getItem("adminUser");
}
function setAdminUser(user) {
  localStorage.setItem("adminUser", JSON.stringify(user));
}
function clearAdminUser() {
  localStorage.removeItem("adminUser");
}

// ========== LOGIN ==========
document.getElementById('admin-login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  let msj = document.getElementById("admin-login-message");
  msj.innerText = "Validando...";
  const usuario = document.getElementById('admin-usuario').value;
  const contrasena = document.getElementById('admin-password').value;
  try {
    const res = await fetch(BASE_URL + 'login', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, contrasena })
    });

    if (res.status === 401) {
      msj.innerHTML = '<span style="color:red;">Usuario o contraseña incorrectos</span>';
      return;
    }
    if (!res.ok) {
      msj.innerHTML = '<span style="color:red;">Error en el servidor</span>';
      return;
    }
    const data = await res.json();
    setAdminUser(data);
    document.getElementById("admin-login-section").style.display = "none";
    document.getElementById("admin-panel-section").style.display = "block";
    msj.innerHTML = "";
    loadPedidos();
  } catch (err) {
    msj.innerHTML = '<span style="color:red;">No se pudo conectar al backend</span>';
  }
});

// ========== LOGOUT ==========
document.getElementById("logout-admin").addEventListener("click", function() {
  clearAdminUser();
  document.location.reload();
});

// ========== CARGAR PEDIDOS ==========
async function loadPedidos() {
  const listaDiv = document.getElementById("admin-pedidos-lista");
  listaDiv.innerHTML = "Cargando pedidos...";
  try {
    const res = await fetch(BASE_URL + "pedidos");
    const pedidos = await res.json();
    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      listaDiv.innerHTML = "<p>No hay pedidos registrados.</p>";
      return;
    }

    let html = `<table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Cliente</th>
          <th>Email</th>
          <th>Pago</th>
          <th>Fecha</th>
          <th>Opciones</th>
        </tr>
      </thead>
      <tbody>
    `;

    pedidos.forEach(p => {
      html += `<tr>
        <td>${p.id}</td>
        <td>${p.nombre} ${p.apellido}</td>
        <td>${p.email}</td>
        <td>${p.metodo_pago}</td>
        <td>${p.fecha ? p.fecha.substring(0,16).replace("T", " ") : ""}</td>
        <td>
          <button class="btn-ver-detalle" data-id="${p.id}">Ver Detalle</button>
          <button class="btn-delete-pedido" data-id="${p.id}">Eliminar</button>
        </td>
      </tr>`;
    });
    html += "</tbody></table>";
    listaDiv.innerHTML = html;

    // Asignar eventos a botones
    document.querySelectorAll(".btn-ver-detalle").forEach(btn => {
      btn.onclick = () => verDetallePedido(btn.getAttribute("data-id"));
    });
    document.querySelectorAll(".btn-delete-pedido").forEach(btn=>{
      btn.onclick = () => deletePedido(btn.getAttribute("data-id"));
    });
  } catch {
    listaDiv.innerHTML = "<p>Error cargando pedidos.</p>";
  }
}

// ========== DETALLE PEDIDO ==========
async function verDetallePedido(pedidoId) {
  const detalleDiv = document.getElementById("admin-detalle-pedido");
  detalleDiv.style.display="block";
  detalleDiv.innerHTML = "<span>Cargando detalle...</span>";
  try {
    const res = await fetch(BASE_URL + "detalle-pedido&id_pedido=" + pedidoId);
    const detalles = await res.json();

    // Info del pedido general
    const pedidoRes = await fetch(BASE_URL + "pedidos&id=" + pedidoId);
    const pedido = await pedidoRes.json();

    let html = `<h3>Pedido #${pedidoId}</h3>
      <b>Cliente:</b> ${pedido.nombre} ${pedido.apellido}<br>
      <b>Email:</b> ${pedido.email}<br>
      <b>Pago:</b> ${pedido.metodo_pago}<br>
      <b>Dirección:</b> ${pedido.direccion || ""}, ${pedido.direccion2 || ""}<br>
      <b>Comentario:</b> ${pedido.descripcion ? pedido.descripcion.replace(/\n/g, "<br>") : "-"}<br>
      <b>Fecha:</b> ${pedido.fecha ? pedido.fecha.substring(0,16).replace("T", " ") : ""}<br>
      <hr>
      <b>Productos pedidos:</b>
      <ul>`;
       // ----- 🔽 AGREGA ESTE BLOQUE AQUÍ PARA EL COMENTARIO/IMAGEN -----
      let descripcionFinal = pedido.descripcion ? pedido.descripcion.replace(/\n/g, "<br>") : "-";
        // Busca si tiene base64:
      const match = descripcionFinal.match(/data:image\/[a-z]+;base64,[^\s<]+/);
      if(match){
        descripcionFinal += '<br><img src="'+match[0]+'" style="max-width:220px;display:block;margin:10px auto;" />';
     }
      html += `<b>Comentario:</b> ${descripcionFinal}<br>`;
          // ----- 🔼 FIN BLOQUE ------

        html += `<b>Fecha:</b> ${pedido.fecha ? pedido.fecha.substring(0,16).replace("T", " ") : ""}<br>
           <hr>
            <b>Productos pedidos:</b>
           <ul>`;

    if(Array.isArray(detalles) && detalles.length>0){
      detalles.forEach(d=>{
        html += `<li><img src="${d.imagen}" alt="" style="width:38px;border-radius:4px;vertical-align:middle"> <b>${d.producto_nombre}</b> x ${d.cantidad} &nbsp; <span style="color:#5a5a5a">($${parseFloat(d.precio).toLocaleString('es-CO')})</span></li>`;
    });
    } else {
    html += "<li>No hay productos.</li>";
  }
    html += "</ul>";
    detalleDiv.innerHTML = html;
  } catch {
    detalleDiv.innerHTML = "<span style='color:red'>Error cargando detalle</span>";
  }
}

// ========== ELIMINAR PEDIDO ==========
async function deletePedido(pedidoId) {
  if (!confirm("¿Seguro que deseas eliminar el pedido #" + pedidoId+"?")) return;
  try {
    const res = await fetch(BASE_URL + "pedidos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pedidoId })
    });
    const data = await res.json();
    alert(data.message || "Eliminado.");
    loadPedidos();
  } catch {
    alert("Error eliminando pedido.");
  }
}

// ========== AUTOLOGIN SI YA HAY SESIÓN ==========
window.onload = function(){
  if(isLoggedAdmin()){
    document.getElementById("admin-login-section").style.display = "none";
    document.getElementById("admin-panel-section").style.display = "block";
    loadPedidos();
  }
};
