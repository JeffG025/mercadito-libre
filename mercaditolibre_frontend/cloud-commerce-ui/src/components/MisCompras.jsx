import { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { ListOrdered, Package } from 'lucide-react';

// Historial de compras del usuario autenticado.
export const MisCompras = () => {
    const [ventas, setVentas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let activo = true;
        apiService.getMisVentas()
            .then((d) => { if (activo) setVentas(d ?? []); })
            .catch((e) => { if (activo) setError(e.message); })
            .finally(() => { if (activo) setCargando(false); });
        return () => { activo = false; };
    }, []);

    const dinero = (n) => `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-gradient-to-r from-brand-800 to-brand-600 rounded-2xl p-8 mb-8
            text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 max-w-xl">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Mis Compras</h1>
                    <p className="mt-2 text-brand-100 text-sm sm:text-base">
                        El historial de tus pedidos y el estado de cada uno.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center p-8">
                    <ListOrdered className="w-64 h-64" />
                </div>
            </div>

            {error && (
                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-sm mb-6">
                    {error}
                </div>
            )}

            {cargando ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm text-gray-600">
                    Cargando tus compras...
                </div>
            ) : ventas.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                    <Package className="w-12 h-12 text-brand-300 mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-gray-800">Todavía no tienes compras</h3>
                    <p className="text-gray-600 text-sm mt-1">Cuando realices un pedido aparecerá aquí.</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="text-left font-semibold px-4 py-3">Pedido</th>
                                <th className="text-left font-semibold px-4 py-3">Fecha</th>
                                <th className="text-left font-semibold px-4 py-3">Estado</th>
                                <th className="text-right font-semibold px-4 py-3">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ventas.map((venta) => (
                                <tr key={venta.id} className="border-t border-gray-100">
                                    <td className="px-4 py-3 font-medium">#{venta.id}</td>
                                    <td className="px-4 py-3">{venta.fecha ?? '—'}</td>
                                    <td className="px-4 py-3">{venta.estadoPago ?? '—'}</td>
                                    <td className="px-4 py-3 text-right font-bold text-brand-900">{dinero(venta.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
