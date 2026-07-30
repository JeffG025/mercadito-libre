import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

// Alta, edición del nombre/descripción y baja lógica de las categorías del catálogo.
export const Categorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Campos del formulario de alta
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [formError, setFormError] = useState(null);

    // Edición en línea: id de la fila abierta y sus valores.
    const [editandoId, setEditandoId] = useState(null);
    const [editNombre, setEditNombre] = useState('');
    const [editDescripcion, setEditDescripcion] = useState('');
    // Errores de acciones sobre la tabla. Separado de `error`, que sustituye la tabla por un aviso de carga fallida.
    const [accionError, setAccionError] = useState(null);

    const cargarCategorias = async () => {
        setCargando(true);
        setError(null);
        try {
            const datos = await apiService.getCategorias();
            setCategorias(datos ?? []);
        } catch (e) {
            setError(e.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        let activo = true;
        apiService
            .getCategorias()
            .then((datos) => { if (activo) setCategorias(datos ?? []); })
            .catch((e) => { if (activo) setError(e.message); })
            .finally(() => { if (activo) setCargando(false); });
        return () => { activo = false; };
    }, []);

    const handleCrear = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (!nombre.trim()) return setFormError('El nombre es obligatorio.');
        if (nombre.trim().length > 100) return setFormError('El nombre no puede superar los 100 caracteres.');

        setGuardando(true);
        try {
            await apiService.crearCategoria({
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                activo: true,
            });
            setNombre('');
            setDescripcion('');
            await cargarCategorias();
        } catch (e) {
            setFormError(e.message);
        } finally {
            setGuardando(false);
        }
    };

    const abrirEdicion = (categoria) => {
        setEditandoId(categoria.id);
        setEditNombre(categoria.nombre);
        setEditDescripcion(categoria.descripcion ?? '');
    };

    const guardarEdicion = async (categoria) => {
        if (!editNombre.trim()) return setAccionError('El nombre es obligatorio.');
        setAccionError(null);
        try {
            await apiService.actualizarCategoria(categoria.id, {
                ...categoria,
                nombre: editNombre.trim(),
                descripcion: editDescripcion.trim(),
            });
            setEditandoId(null);
            await cargarCategorias();
        } catch (e) {
            setAccionError(e.message);
        }
    };

    // Baja lógica: el back pone activo=false, no borra la fila.
    const handleDarDeBaja = async (id) => {
        try {
            await apiService.eliminarCategoria(id);
            await cargarCategorias();
        } catch (e) {
            setAccionError(e.message);
        }
    };

    // No hay endpoint de reactivar: se reenvía la categoría con activo=true.
    const handleReactivar = async (categoria) => {
        try {
            await apiService.actualizarCategoria(categoria.id, { ...categoria, activo: true });
            await cargarCategorias();
        } catch (e) {
            setAccionError(e.message);
        }
    };

    const inputClase = 'rounded border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none';

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Formulario de alta */}
            <form onSubmit={handleCrear} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">Nueva categoría</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Nombre"
                        className={inputClase}
                    />
                    <input
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Descripción (opcional)"
                        className={inputClase}
                    />
                </div>
                {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}
                <button
                    type="submit"
                    disabled={guardando}
                    className="mt-3 rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                    {guardando ? 'Guardando…' : 'Crear categoría'}
                </button>
            </form>

            {/* Tabla de categorías */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <h3 className="text-lg font-semibold text-gray-800">Categorías</h3>
                    <button
                        onClick={cargarCategorias}
                        className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
                    >
                        Recargar
                    </button>
                </div>

                {/* Aviso de acción fallida. Va aquí para no desmontar la tabla ni perder la edición en curso. */}
                {accionError && (
                    <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600">{accionError}</p>
                )}

                {cargando ? (
                    <p className="px-4 py-6 text-sm text-gray-600">Cargando categorías…</p>
                ) : error ? (
                    <div className="px-4 py-6">
                        <p className="text-sm text-red-600">Error: {error}</p>
                        <p className="mt-1 text-xs text-gray-600">
                            ¿El backend está corriendo en http://localhost:8085?
                        </p>
                    </div>
                ) : categorias.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-gray-600">No hay categorías registradas todavía.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                                <tr>
                                    <th className="px-4 py-2">ID</th>
                                    <th className="px-4 py-2">Nombre</th>
                                    <th className="px-4 py-2">Descripción</th>
                                    <th className="px-4 py-2">Estado</th>
                                    <th className="px-4 py-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorias.map((c) => (
                                    <tr key={c.id} className="border-t border-gray-100">
                                        <td className="px-4 py-2 text-gray-600">{c.id}</td>
                                        {editandoId === c.id ? (
                                            <>
                                                <td className="px-4 py-2">
                                                    <input
                                                        value={editNombre}
                                                        onChange={(e) => setEditNombre(e.target.value)}
                                                        className={`${inputClase} w-full`}
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        value={editDescripcion}
                                                        onChange={(e) => setEditDescripcion(e.target.value)}
                                                        className={`${inputClase} w-full`}
                                                    />
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-4 py-2 font-medium text-gray-800">{c.nombre}</td>
                                                <td className="px-4 py-2 text-gray-700">{c.descripcion || '—'}</td>
                                            </>
                                        )}
                                        <td className="px-4 py-2">
                                            {c.activo ? (
                                                <span className="rounded-full bg-success-100 px-2 py-0.5 text-xs text-success-700">Activa</span>
                                            ) : (
                                                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">Inactiva</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {editandoId === c.id ? (
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={() => guardarEdicion(c)} className="text-sm text-success-700 hover:underline">
                                                        Guardar
                                                    </button>
                                                    <button onClick={() => setEditandoId(null)} className="text-sm text-gray-600 hover:underline">
                                                        Cancelar
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={() => abrirEdicion(c)} className="text-sm text-brand-600 hover:underline">
                                                        Editar
                                                    </button>
                                                    {c.activo ? (
                                                        <button onClick={() => handleDarDeBaja(c.id)} className="text-sm text-red-600 hover:underline">
                                                            Dar de baja
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleReactivar(c)} className="text-sm text-success-700 hover:underline">
                                                            Reactivar
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
