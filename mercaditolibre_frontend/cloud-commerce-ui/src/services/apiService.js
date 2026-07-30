// URL apuntando directamente al puerto 8085 del host actual para no requerir proxy de Nginx.
const API_URL = "http://" + window.location.hostname + ":8085/api/v1/"

// Cabeceras con el token JWT si hay sesión. json=true añade Content-Type.
const authHeaders = (json = false) => {
    const headers = json ? { 'Content-Type': 'application/json' } : {};
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

// Cabeceras para login y registro.
const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Lanza Error si la respuesta no es ok; si lo es, devuelve su JSON.
const handleResponse = async (response) =>{
    if(!response.ok){
        // El 401 cierra sesión. El 403 no: hay sesión, falta permiso.
        if (response.status === 401) {
            window.dispatchEvent(new CustomEvent('sesion-expirada'));
        }
        // El backend manda { message, error, errores }; saca un mensaje legible.
        const texto = await response.text();
        let mensaje = 'Error en la red';
        if (texto) {
            try {
                const data = JSON.parse(texto);
                mensaje = data.message || data.error || texto;
                // Errores de validación por campo (@Valid): se añaden al mensaje.
                if (data.errores) {
                    const detalles = Object.values(data.errores).join(' · ');
                    if (detalles) mensaje += `: ${detalles}`;
                }
            } catch {
                mensaje = texto; // no era JSON: mostramos el texto crudo
            }
        }
        throw new Error(mensaje);
    }
    if(response.status === 204) return null;
    return await response.json();
};

export const apiService = {

    isAuthenticated: () => {
        return localStorage.getItem('token');
    },
    getToken: () => localStorage.getItem('token'),

    //autenticación (login / registro / logout)
    login: async (credenciales) => {
        const response = await fetch(API_URL + "auth/login", {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify(credenciales),
        });
        const data = await handleResponse(response);
        if (data && data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username ?? '');
            localStorage.setItem('nombre', data.nombre ?? '');
            localStorage.setItem('role', data.role ?? '');
        }
        return data;
    },
    registro: async (datos) => {
        const response = await fetch(API_URL + "auth/registro", {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify(datos),
        });
        return await handleResponse(response);
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('nombre');
        localStorage.removeItem('role');
    },

    //perfil del usuario en sesion
    getMiPerfil: async()=>{
        const response = await fetch(API_URL+ "usuarios/perfil", { headers: authHeaders() });
        return await handleResponse(response);
    },
    actualizarMiPerfil: async(datos)=>{
        const response = await fetch(API_URL+ "usuarios/perfil", {
            method:'PUT',
            headers: authHeaders(true),
            body: JSON.stringify(datos),
        });
        return await handleResponse(response);
    },
    cambiarMiPassword: async(datos)=>{
        const response = await fetch(API_URL+ "usuarios/perfil/password", {
            method:'PUT',
            headers: authHeaders(true),
            body: JSON.stringify(datos),
        });
        return await handleResponse(response);
    },

    //gestion de usuarios (solo admin)
    getUsuarios: async()=>{
        const response = await fetch(API_URL+ "usuarios", { headers: authHeaders() });
        return await handleResponse(response);
    },
    crearUsuario: async(usuario)=>{
        const response = await fetch(API_URL+ "usuarios", {
            method:'POST',
            headers: authHeaders(true),
            body: JSON.stringify(usuario),
        });
        return await handleResponse(response);
    },

    //estadisticas del panel admin
    getEstadisticas: async()=>{
        const response = await fetch(API_URL+ "estadisticas", { headers: authHeaders() });
        return await handleResponse(response);
    },

    //peticiones productos
    getProductos: async()=>{
        const response  = await fetch(API_URL+ "productos", { headers: authHeaders() });
        return await handleResponse(response);
    },
    getProductoPorId: async(id)=>{
        const response  = await fetch(API_URL+ "productos/" +id, { headers: authHeaders() });
        return await handleResponse(response);
    },
    crearProducto: async (producto)=>{
        const response = await fetch(API_URL+ "productos", {
            method:'POST',
            headers: authHeaders(true),
            body: JSON.stringify(producto),
        });
        return await handleResponse(response);
    },
    actualizarProducto: async (id, producto)=>{
        const response = await fetch(API_URL+ "productos/" +id, {
            method:'PUT',
            headers: authHeaders(true),
            body: JSON.stringify(producto),
        });
        return await handleResponse(response);
    },
    eliminarProducto: async(id)=>{
        const response = await fetch(API_URL+ "productos/" +id, {
            method:'DELETE',
            headers: authHeaders(),
        });
        return await handleResponse(response);
    },
    // Sube la imagen del producto. Sin Content-Type: el navegador pone el boundary del multipart.
    subirImagenProducto: async(id, archivo)=>{
        const datos = new FormData();
        datos.append('archivo', archivo);
        const response = await fetch(API_URL+ "productos/" +id+ "/imagen", {
            method:'POST',
            headers: authHeaders(),
            body: datos,
        });
        return await handleResponse(response);
    },
    eliminarImagenProducto: async(id)=>{
        const response = await fetch(API_URL+ "productos/" +id+ "/imagen", {
            method:'DELETE',
            headers: authHeaders(),
        });
        return await handleResponse(response);
    },
    reactivarProducto: async(id)=>{
        const response = await fetch(API_URL+ "productos/" +id+ "/activar", {
            method:'PUT',
            headers: authHeaders(),
        });
        return await handleResponse(response);
    },

    //categorias
    getCategorias: async()=>{
        const response = await fetch(API_URL+ "categorias", { headers: authHeaders() });
        return await handleResponse(response);
    },
    getCategoriaPorId: async(id)=>{
        const response = await fetch(API_URL+ "categorias/"+id, { headers: authHeaders() });
        return await handleResponse(response);
    },
    crearCategoria: async(categoria)=>{
        const response = await fetch(API_URL+ "categorias", {
            method:'POST',
            headers: authHeaders(true),
            body: JSON.stringify(categoria),
        });
        return await handleResponse(response);
    },
    actualizarCategoria: async(id, categoria)=>{
        const response = await fetch(API_URL+ "categorias/"+id, {
            method:'PUT',
            headers: authHeaders(true),
            body: JSON.stringify(categoria),
        });
        return await handleResponse(response);
    },
    eliminarCategoria: async(id)=>{
        const response = await fetch(API_URL+ "categorias/"+id, {
            method:'DELETE',
            headers: authHeaders(),
        });
        return await handleResponse(response);
    },

    //clientes
    getClientes: async()=>{
        const response = await fetch(API_URL+ "clientes", { headers: authHeaders() });
        return await handleResponse(response);
    },
    getClientePorId: async(id)=>{
        const response = await fetch(API_URL+ "clientes/" +id, { headers: authHeaders() });
        return await handleResponse(response);
    },
    crearCliente: async(cliente)=>{
        const response = await fetch(API_URL+ "clientes", {
            method:'POST',
            headers: authHeaders(true),
            body: JSON.stringify(cliente),
        });
        return await handleResponse(response);
    },
    actualizarCliente: async(id, cliente)=>{
        const response = await fetch(API_URL+ "clientes/" +id, {
            method:'PUT',
            headers: authHeaders(true),
            body: JSON.stringify(cliente),
        });
        return await handleResponse(response);
    },
    eliminarCliente: async(id)=>{
        const response = await fetch(API_URL+ "clientes/" +id, {
            method:'DELETE',
            headers: authHeaders(),
        });
        return await handleResponse(response);
    },

    //proveedores
    getProveedores: async()=>{
        const response = await fetch(API_URL+ "proveedores", { headers: authHeaders() });
        return await handleResponse(response);
    },
    getProveedorPorId: async(id)=>{
        const response = await fetch(API_URL+ "proveedores/" +id, { headers: authHeaders() });
        return await handleResponse(response);
    },
    crearProveedor: async(proveedor)=>{
        const response = await fetch(API_URL+ "proveedores", {
            method:'POST',
            headers: authHeaders(true),
            body: JSON.stringify(proveedor),
        });
        return await handleResponse(response);
    },
    actualizarProveedor: async(id, proveedor)=>{
        const response = await fetch(API_URL+ "proveedores/" +id, {
            method:'PUT',
            headers: authHeaders(true),
            body: JSON.stringify(proveedor),
        });
        return await handleResponse(response);
    },
    eliminarProveedor: async(id)=>{
        const response = await fetch(API_URL+ "proveedores/" +id, {
            method:'DELETE',
            headers: authHeaders(),
        });
        return await handleResponse(response);
    },

    //ventas
    getVentas: async()=>{
        const response = await fetch(API_URL+ "ventas", { headers: authHeaders() });
        return await handleResponse(response);
    },
    getMisVentas: async()=>{
        const response = await fetch(API_URL+ "ventas/mias", { headers: authHeaders() });
        return await handleResponse(response);
    },
    getVentaPorId: async(id)=>{
        const response = await fetch(API_URL+ "ventas/" +id, { headers: authHeaders() });
        return await handleResponse(response);
    },
    crearVenta: async(venta)=>{
        const response = await fetch(API_URL+ "ventas", {
            method:'POST',
            headers: authHeaders(true),
            body: JSON.stringify(venta),
        });
        return await handleResponse(response);
    },
    actualizarVenta: async(id, venta)=>{
        const response = await fetch(API_URL+ "ventas/" +id, {
            method:'PUT',
            headers: authHeaders(true),
            body: JSON.stringify(venta),
        });
        return await handleResponse(response);
    },
    procesarVenta: async(venta)=>{
        const response = await fetch(API_URL+ "ventas/procesar", {
            method:'POST',
            headers: authHeaders(true),
            body: JSON.stringify(venta),
        });
        return await handleResponse(response);
    },
    getMisCompras: async()=>{
        const response = await fetch(API_URL+ "ventas/mis-compras", { headers: authHeaders() });
        return await handleResponse(response);
    },

    //pagos con Stripe
    // Clave publicable y flags. Las manda el backend para no hardcodearlas aquí.
    getConfigPagos: async()=>{
        const response = await fetch(API_URL+ "pagos/config", { headers: authHeaders() });
        return await handleResponse(response);
    },
    crearIntencionPago: async(idVenta)=>{
        const response = await fetch(API_URL+ "pagos/crear-intencion", {
            method:'POST',
            headers: authHeaders(true),
            body: JSON.stringify({idVenta, moneda: 'mxn'}),
        });
        return await handleResponse(response);
    },
    // El backend verifica el paymentIntentId contra Stripe antes de marcar la venta como pagada.
    confirmarPagoVenta: async(idVenta, paymentIntentId)=>{
        const response = await fetch(API_URL+ "pagos/confirmar-pago/" +idVenta, {
            method:'POST',
            headers: authHeaders(true),
            body: JSON.stringify({paymentIntentId}),
        });
        return await handleResponse(response);
    },
    // Solo responde si el backend tiene el simulador encendido; si no, 403.
    simularPago: async(idVenta)=>{
        const response = await fetch(API_URL+ "pagos/simular-pago/" +idVenta, {
            method:'POST',
            headers: authHeaders(),
        });
        return await handleResponse(response);
    }
};