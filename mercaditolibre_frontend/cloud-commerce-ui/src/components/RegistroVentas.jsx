import { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { Receipt } from 'lucide-react';

// Tabla con todas las ventas (vista admin).
export const RegistroVentas = () => {
    const [ventas, setVentas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let activo = true;
        apiService.getVentas()
            .then((d) => { if (activo) setVentas(d ?? []); })
            .catch((e) => { if (activo) setError(e.message); })
            .finally(() => { if (activo) setCargando(false); });
        return () => { activo = false; };
    }, []);

    const dinero = (n) => `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-800">Registro de ventas</h3>

            {error && (
                <div className="bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-200 text-sm">
                    {error}
                </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="text-left font-semibold px-4 py-3">#</th>
                            <th className="text-left font-semibold px-4 py-3">Fecha</th>
                            <th className="text-left font-semibold px-4 py-3">Cliente</th>
                            <th className="text-left font-semibold px-4 py-3">Estado</th>
                            <th className="text-right font-semibold px-4 py-3">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando ? (
                            <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-600">Cargando ventas...</td></tr>
                        ) : ventas.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center">
                                    <Receipt className="w-10 h-10 text-brand-300 mx-auto mb-3" />
                                    <p className="font-bold text-gray-800">Sin ventas registradas</p>
                                    <p className="text-gray-600 text-xs mt-1">Aún no hay pedidos en la tienda.</p>
                                </td>
                            </tr>
                        ) : (
                            ventas.map((venta) => (
                                <tr key={venta.id} className="border-t border-gray-100">
                                    <td className="px-4 py-3">{venta.id}</td>
                                    <td className="px-4 py-3">{venta.fecha ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        {venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido ?? ''}`.trim() : '—'}
                                    </td>
                                    <td className="px-4 py-3">{venta.estadoPago ?? '—'}</td>
                                    <td className="px-4 py-3 text-right font-bold text-brand-900">{dinero(venta.total)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
