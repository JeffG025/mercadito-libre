import { apiService } from '../services/apiService';
import { ShoppingCart, LogOut, User, ListOrdered, ShoppingBag } from 'lucide-react';

export const Navbar = ({vistaActual, setVistaActual, user,
    onLogout, cartCount, openCart}) => {
    const handleLogout = () => {
        apiService.logout();
        onLogout();
        setVistaActual('catalogo');
    };

// El campo es role, no rol: es lo que devuelve el backend y guarda apiService.
const isClient = user && user.role === 'ROLE_CLIENTE';
const isAdmin = user && user.role === 'ROLE_ADMIN';
return (
    <nav className="sticky top-0 z-50 bg-brand-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* flex-wrap + min-h en vez de h-16 fijo: en móvil la barra baja a dos filas en lugar de desbordar la pantalla. */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 min-h-16 py-2">
                {/* Logo y links */}
                <div className="flex items-center cursor-pointer min-w-0"
                onClick={() => setVistaActual('catalogo')}>
                    <ShoppingBag className="h-8 w-8 text-brand-400 animate-pulse flex-shrink-0" />
                    <span className="ml-2 font-extrabold text-xl tracking-tight truncate
                    bg-gradient-to-r from-brand-200 via-brand-400 to-white bg-clip-text
                    text-transparent">Mercadito Libre</span>
                </div>
                {/* Links de navegación */}
                <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-4 min-w-0">
                    <button onClick={() => setVistaActual('catalogo')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all
                    duration-200 hover:bg-brand-800
                    ${vistaActual === 'catalogo' ?
                    'bg-brand-800 font-bold border-b-2 border-brand-400' : ''}`}>
                        Catalogo
                    </button>

                    {/* Botones para clientes */}
                    {isClient && (
                        <>
                        <button onClick={() => setVistaActual('miscompras')}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm
                        font-medium transition-all duration-200 hover:bg-brand-800
                        ${vistaActual === 'miscompras' ?
                        'bg-brand-800 font-bold border-b-2 border-brand-400' : ''}`}>
                            <ListOrdered className="w-4 h-4"/>
                            Mis Compras
                        </button>
                        </>
                    )}
                    {/* Botones para admin */}
                    {isAdmin && (
                        <>
                        <button onClick={() => setVistaActual('admin')}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm
                        font-medium transition-all duration-200 hover:bg-brand-800
                        ${vistaActual === 'admin' ?
                        'bg-brand-800 font-bold border-b-2 border-brand-400' : ''}`}>
                            <ListOrdered className="w-4 h-4"/>
                            Admin Panel
                        </button>
                        </>
                    )}

                    {/* Botón de carrito y loggeo */}
                    {user ? (<>
                        {/* La insignia del usuario es el acceso al perfil. */}
                        <button onClick={() => setVistaActual('perfil')}
                            title="Mi perfil"
                            className={`flex items-center text-sm font-medium
                            px-3 py-1.5 rounded-full border gap-1.5 max-w-[150px]
                            transition-colors cursor-pointer hover:bg-brand-700 ${
                                vistaActual === 'perfil'
                                    ? 'bg-brand-700 border-brand-400 font-bold'
                                    : 'bg-brand-800 border-brand-600'
                            }`}>
                            <User className="w-4 h-4 text-brand-300 flex-shrink-0"/>
                            <span className="truncate">{user.nombre}</span>
                        </button>

                        {isClient && (
                            <button onClick={openCart}
                            className="relative p-2 rounded-full hover:bg-brand-800
                            transition-colors cursor-pointer group">
                                <ShoppingCart className="w-6 h-6 text-white group-hover:text-brand-300" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500
                                        text-white rounded-full text-xs w-5 h-5
                                        flex items-center justify-center font-bold border
                                         border-brand-900 animate-bounce">
                                        {cartCount}
                                        </span>
                                    )}
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-full hover:bg-red-900 hover:text-red-200
                            transition-colors cursor-pointer"
                            title="Cerrar Sesión">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </>
                    ):(<>
                        <button onClick={() => setVistaActual('login')}
                        className="px-3 py-2 rounded-md text-sm font-medium
                        transition-colors hover:bg-brand-800">
                            Iniciar Sesión
                        </button>
                        <button onClick={() => setVistaActual('registro')}
                        className="bg-brand-500 hover:bg-brand-600
                        text-white px-4 py-2 rounded-md text-sm font-medium
                        transition-colors shadow-md">
                            Registrarse
                        </button>
                    </>
                    )}
                </div>

            </div>
        </div>
    </nav>

);

};
