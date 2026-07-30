import { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { Inventario } from './Inventario';
import { RegistroVentas } from './RegistroVentas';
import { Proveedores } from './Proveedores';
import { Categorias } from './Categorias';
import { Usuarios } from './Usuarios';
import { DollarSign, Tags, ShoppingBag, Package, LayoutDashboard } from 'lucide-react';

const PESTANAS = [
    { id: 'productos', label: 'Gestión de productos', componente: Inventario },
    { id: 'ventas', label: 'Registro de ventas', componente: RegistroVentas },
    { id: 'proveedores', label: 'Proveedores', componente: Proveedores },
    { id: 'categorias', label: 'Gestor de categorías', componente: Categorias },
    { id: 'usuarios', label: 'Usuarios', componente: Usuarios },
];

export const AdminDashboard = () => {
    const [pestana, setPestana] = useState('productos');
    const [stats, setStats] = useState(null);

    // Carga las métricas al montar.
    useEffect(() => {
        let activo = true;
        apiService.getEstadisticas()
            .then((d) => { if (activo) setStats(d); })
            .catch(() => { if (activo) setStats(null); });
        return () => { activo = false; };
    }, []);

    const dinero = (n) => `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

    // Tarjetas derivadas del estado. Con stats nulo muestran "—".
    const metricas = [
        { id: 'recaudado', titulo: 'Total recaudado', valor: stats ? dinero(stats.totalRecaudado) : '—', nota: 'Suma de ventas', icono: DollarSign },
        { id: 'categorias', titulo: 'Categorías', valor: stats ? stats.totalCategorias : '—', nota: 'Registradas', icono: Tags },
        { id: 'ordenes', titulo: 'Órdenes totales', valor: stats ? stats.totalOrdenes : '—', nota: 'Ventas hechas', icono: ShoppingBag },
        { id: 'activos', titulo: 'Productos activos', valor: stats ? stats.productosActivos : '—', nota: 'En catálogo', icono: Package },
    ];

    // Componente de la pestaña abierta; cae en la primera si el id no existe.
    const SeccionActiva = (PESTANAS.find((p) => p.id === pestana) ?? PESTANAS[0]).componente;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-gradient-to-r from-brand-800 to-brand-600 rounded-2xl p-8 mb-8
            text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 max-w-xl">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Panel de administración</h1>
                    <p className="mt-2 text-brand-100 text-sm sm:text-base">
                        Resumen de la tienda y gestión del catálogo.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center p-8">
                    <LayoutDashboard className="w-64 h-64" />
                </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metricas.map((m) => (
                    <div key={m.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">{m.titulo}</p>
                                <p className="mt-2 text-3xl font-extrabold text-brand-900">{m.valor}</p>
                                <p className="mt-1 text-xs text-gray-600">{m.nota}</p>
                            </div>
                            <div className="bg-brand-50 rounded-xl p-2.5">
                                <m.icono className="w-5 h-5 text-brand-600" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Selector de sección. Con scroll horizontal para que no desborde en pantallas angostas. */}
            <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
                {PESTANAS.map((p) => (
                    <button key={p.id} onClick={() => setPestana(p.id)}
                    className={`px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-all cursor-pointer border-b-2 -mb-px ${
                        pestana === p.id
                            ? 'border-brand-600 text-brand-700'
                            : 'border-transparent text-gray-600 hover:text-gray-700'
                    }`}>
                        {p.label}
                    </button>
                ))}
            </div>

            <SeccionActiva />
        </div>
    );
};
