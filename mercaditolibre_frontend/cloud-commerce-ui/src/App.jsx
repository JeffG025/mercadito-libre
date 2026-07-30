import { useEffect, useState } from 'react';
import Footer from './components/Footer';
import { Catalogo } from './components/Catalogo';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { Registro } from './components/Registro';
import { apiService } from './services/apiService';
import { MisCompras } from './components/MisCompras';
import { AdminDashboard } from './components/AdminDashboard';
import { Carrito } from './components/Carrito';
import { CheckoutForm } from './components/CheckoutForm';
import { Perfil } from './components/Perfil';

function App() {
  const [vistaActual, setVistaActual] = useState('catalogo');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [ventaActiva, setVentaActiva] = useState(null);

  useEffect(() => {
    if (apiService.isAuthenticated()) {
      setUser({
        username: localStorage.getItem('username'),
        nombre: localStorage.getItem('nombre'),
        role: localStorage.getItem('role'),
      });
    }
  }, []);

  useEffect(() => {
    const onExpirada = () => {
      apiService.logout();
      setUser(null);
      setCart([]);
      setVistaActual('login');
    };
    window.addEventListener('sesion-expirada', onExpirada);
    return () => window.removeEventListener('sesion-expirada', onExpirada);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser({
      username: userData.username,
      nombre: userData.nombre,
      role: userData.role,
    });
    setVistaActual(userData.role === 'ROLE_ADMIN' ? 'admin' : 'catalogo');
  };

  // El perfil puede cambiar el nombre: se refleja en la navbar y en localStorage.
  const handleNombreCambiado = (nombre) => {
    localStorage.setItem('nombre', nombre ?? '');
    setUser((prev) => (prev ? { ...prev, nombre } : prev));
  };

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
    setCart([]);
    setVistaActual('login');
  };

  // Añade N unidades al carrito (o las suma si el producto ya estaba), sin pasar del stock.
  const addToCart = (producto, cantidad = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.producto.id === producto.id);
      if (existing) {
        const nueva = Math.min(existing.cantidad + cantidad, producto.stock);
        return prevCart.map((item) =>
          item.producto.id === producto.id ? { ...item, cantidad: nueva } : item
        );
      }
      return [...prevCart, { producto, cantidad: Math.min(cantidad, producto.stock) }];
    });
    setIsCartOpen(true);
  };

  // Fija la cantidad de un producto; a 0 o menos lo elimina.
  const updateQuantity = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      removeFromCart(productoId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.producto.id === productoId) {
          if (nuevaCantidad > item.producto.stock) {
            alert('No hay suficiente stock disponible: ' + item.producto.stock);
            return item;
          }
          return { ...item, cantidad: nuevaCantidad };
        }
        return item;
      }));
  };

  const removeFromCart = (productoId) => {
    setCart((prevCart) => prevCart.filter((item) => item.producto.id !== productoId));
  };

  const clearCart = () => setCart([]);

  // Crea la venta con los items del carrito y pasa al checkout.
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const venta = {
        detalles: cart.map((item) => ({
          producto: { id: item.producto.id },
          cantidad: item.cantidad,
        })),
      };
      const creada = await apiService.procesarVenta(venta);
      setVentaActiva(creada);
      clearCart();
      setIsCartOpen(false);
      setVistaActual('checkout');
    } catch (e) {
      alert('No se pudo procesar la compra: ' + e.message);
    }
  };

  const cartCount = cart.reduce((n, item) => n + item.cantidad, 0);
  const esAdmin = user?.role === 'ROLE_ADMIN';

  const vistaContenido = () => {
    switch (vistaActual) {
      case 'catalogo':
        return <Catalogo setVistaActual={setVistaActual} usuario={user} addToCart={addToCart} />;
      case 'registro':
        return (
          <Registro
            onRegistroSuccess={() => setVistaActual('login')}
            onGoToLogin={() => setVistaActual('login')}
            onGoToCatalogo={() => setVistaActual('catalogo')}
          />
        );
      case 'admin':
        return esAdmin ? (
          <AdminDashboard />
        ) : (
          <Catalogo setVistaActual={setVistaActual} usuario={user} addToCart={addToCart} />
        );
      case 'login':
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onGoToRegister={() => setVistaActual('registro')}
            onGoToCatalogo={() => setVistaActual('catalogo')}
          />
        );
      case 'miscompras':
        return <MisCompras />;
      case 'perfil':
        // Sin sesión no hay perfil que mostrar: manda al login.
        return user ? <Perfil onNombreCambiado={handleNombreCambiado} /> : (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onGoToRegister={() => setVistaActual('registro')}
            onGoToCatalogo={() => setVistaActual('catalogo')}
          />
        );
      case 'checkout':
        return (
          <CheckoutForm
            ventaActiva={ventaActiva}
            setCurrentTab={(tab) =>
              setVistaActual(tab === 'catalog' ? 'catalogo' : tab === 'purchases' ? 'miscompras' : tab)
            }
          />
        );
      default:
        return <Catalogo setVistaActual={setVistaActual} usuario={user} addToCart={addToCart} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 antialiased">
      <Navbar
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
        user={user}
        onLogout={handleLogout}
        cartCount={cartCount}
        openCart={() => setIsCartOpen(true)}
      />
      <main className="flex-grow pb-12">
        {vistaContenido()}
      </main>

      <Carrito
        abierto={isCartOpen}
        items={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onClear={clearCart}
        onCheckout={handleCheckout}
      />
      <Footer />
    </div>
  );
}
export default App;
