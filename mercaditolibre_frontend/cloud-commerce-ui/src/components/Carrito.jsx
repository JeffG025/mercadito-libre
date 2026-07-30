import { X, Minus, Plus, Trash2, Truck, ShoppingCart, ImageOff } from 'lucide-react';

// Panel lateral del carrito: ver, cambiar cantidades y eliminar.
export const Carrito = ({ abierto, items, onClose, onUpdateQuantity, onRemove, onClear, onCheckout }) => {
    const dinero = (n) => `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    const total = items.reduce((suma, item) => suma + item.producto.precio * item.cantidad, 0);
    const totalItems = items.reduce((n, item) => n + item.cantidad, 0);

    return (
        <>
            {/* Fondo oscuro */}
            <div onClick={onClose}
            className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${
                abierto ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`} />

            {/* Panel */}
            <aside className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-xl
            flex flex-col transition-transform duration-300 ${abierto ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-brand-600" />
                        Mi carrito ({totalItems})
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 cursor-pointer">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                        <ShoppingCart className="w-12 h-12 text-brand-200 mb-3" />
                        <p className="font-bold text-gray-800">Tu carrito está vacío</p>
                        <p className="text-gray-600 text-sm mt-1">Añade productos desde el catálogo.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-grow overflow-y-auto p-4 space-y-3">
                            {items.map(({ producto, cantidad }) => (
                                <div key={producto.id}
                                className="flex gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    {/* Imagen real del producto; si no tiene, marcador local. */}
                                    {producto.imagenUrl ? (
                                        <img src={producto.imagenUrl} alt={producto.nombre}
                                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <ImageOff className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-grow min-w-0">
                                        <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{producto.nombre}</h4>
                                        <p className="text-brand-900 font-bold text-sm">{dinero(producto.precio)}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <button onClick={() => onUpdateQuantity(producto.id, cantidad - 1)}
                                            className="p-1 rounded-full border border-gray-300 hover:bg-white cursor-pointer">
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-6 text-center text-sm font-bold">{cantidad}</span>
                                            <button onClick={() => onUpdateQuantity(producto.id, cantidad + 1)}
                                            className="p-1 rounded-full border border-gray-300 hover:bg-white cursor-pointer">
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end justify-between">
                                        <button onClick={() => onRemove(producto.id)}
                                        className="p-1 text-gray-400 hover:text-red-600 cursor-pointer">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <span className="font-bold text-gray-800 text-sm">
                                            {dinero(producto.precio * cantidad)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-100 p-5 space-y-3">
                            <div className="flex items-center justify-between text-sm text-success-700 font-medium">
                                <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> Envío</span>
                                <span>Gratis</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-800">Total</span>
                                <span className="font-extrabold text-xl text-brand-900">{dinero(total)}</span>
                            </div>
                            <button onClick={onCheckout}
                            className="w-full p-3 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-700
                            text-white shadow-sm transition-colors cursor-pointer">
                                Proceder al pago
                            </button>
                            <button onClick={onClear}
                            className="w-full p-2 rounded-xl font-medium text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                                Vaciar carrito
                            </button>
                        </div>
                    </>
                )}
            </aside>
        </>
    );
};
