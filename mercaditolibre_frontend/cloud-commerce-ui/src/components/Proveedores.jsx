import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INPUT_CLASE = 'rounded border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none';

// Da de alta proveedores, los edita y los da de baja. No tienen vista propia: solo se administran desde aquí.
export const Proveedores = () => {
    const [proveedores, setProveedores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Campos del formulario de alta
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [formError, setFormError] = useState(null);

    // Edición en línea: id de la fila abierta y sus valores.
    const [editandoId, setEditandoId] = useState(null);
    const [editNombre, setEditNombre] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editTelefono, setEditTelefono] = useState('');
    // Errores de acciones sobre la tabla. Separado de `error`, que sustituye la tabla por un aviso de carga fallida.
    const [accionError, setAccionError] = useState(null);

    const cargarProveedores = async () => {
        setCargando(true);
        setError(null);
        try {
            const datos = await apiService.getProveedores();
            setProveedores(datos ?? []);
        } catch (e) {
            setError(e.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        let activo = true;
        apiService
            .getProveedores()
            .then((datos) => { if (activo) setProveedores(datos ?? []); })
            .catch((e) => { if (activo) setError(e.message); })
            .finally(() => { if (activo) setCargando(false); });
        return () => { activo = false; };
    }, []);

    const handleCrear = async (e) => {
        e.preventDefault();
        setFormError(null);

        // Valida en el front; el back revalida con @Valid.
        if (!nombre.trim()) return setFormError('El nombre es obligatorio.');
        if (!email.trim()) return setFormError('El correo es obligatorio.');
        if (!EMAIL_RE.test(email.trim())) return setFormError('El correo no tiene un formato válido.');

        setGuardando(true);
        try {
            await apiService.crearProveedor({
                nombre: nombre.trim(),
                email: email.trim(),
                telefono: telefono.trim(),
                activo: true,
            });
            setNombre('');
            setEmail('');
            setTelefono('');
            await cargarProveedores();
        } catch (e) {
            setFormError(e.message);
        } finally {
            setGuardando(false);
        }
    };

    const abrirEdicion = (proveedor) => {
        setEditandoId(proveedor.id);
        setEditNombre(proveedor.nombre);
        setEditEmail(proveedor.email);
        setEditTelefono(proveedor.telefono ?? '');
    };

    const guardarEdicion = async (proveedor) => {
        if (!editNombre.trim()) return setAccionError('El nombre es obligatorio.');
        if (!EMAIL_RE.test(editEmail.trim())) return setAccionError('El correo no tiene un formato válido.');
        setAccionError(null);
        try {
            // Se reenvía el proveedor completo: el PUT reemplaza todos los campos.
            await apiService.actualizarProveedor(proveedor.id, {
                ...proveedor,
                nombre: editNombre.trim(),
                email: editEmail.trim(),
                telefono: editTelefono.trim(),
            });
            setEditandoId(null);
            await cargarProveedores();
        } catch (e) {
            setAccionError(e.message);
        }
    };

    // Baja lógica: el back pone activo=false, no borra la fila.
    const handleDarDeBaja = async (id) => {
        try {
            await apiService.eliminarProveedor(id);
            await cargarProveedores();
        } catch (e) {
            setAccionError(e.message);
        }
    };

    // No hay endpoint de reactivar: se reenvía el proveedor con activo=true.
    const handleReactivar = async (proveedor) => {
        try {
            await apiService.actualizarProveedor(proveedor.id, { ...proveedor, activo: true });
            await cargarProveedores();
        } catch (e) {
            setAccionError(e.message);
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Formulario de alta */}
            {/* noValidate: sin esto el globo nativo de type="email" corta el submit y nunca se ve el error en línea. */}
            <form onSubmit={handleCrear} noValidate className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">Nuevo proveedor</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <input
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Nombre"
                        className={INPUT_CLASE}
                    />
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="Correo"
                        className={INPUT_CLASE}
                    />
                    <input
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        type="tel"
                        placeholder="Número de teléfono"
                        className={INPUT_CLASE}
                    />
                </div>
                {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}
                <button
                    type="submit"
                    disabled={guardando}
                    className="mt-3 rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                    {guardando ? 'Guardando…' : 'Dar de alta'}
                </button>
            </form>

            {/* Tabla de proveedores */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <h3 className="text-lg font-semibold text-gray-800">Proveedores</h3>
                    <button
                        onClick={cargarProveedores}
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
                    <p className="px-4 py-6 text-sm text-gray-600">Cargando proveedores…</p>
                ) : error ? (
                    <div className="px-4 py-6">
                        <p className="text-sm text-red-600">Error: {error}</p>
                        <p className="mt-1 text-xs text-gray-600">
                            ¿El backend está corriendo en http://localhost:8085?
                        </p>
                    </div>
                ) : proveedores.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-gray-600">No hay proveedores registrados todavía.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                                <tr>
                                    <th className="px-4 py-2">ID</th>
                                    <th className="px-4 py-2">Nombre</th>
                                    <th className="px-4 py-2">Correo</th>
                                    <th className="px-4 py-2">Teléfono</th>
                                    <th className="px-4 py-2">Estado</th>
                                    <th className="px-4 py-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {proveedores.map((p) => (
                                    <tr key={p.id} className="border-t border-gray-100">
                                        <td className="px-4 py-2 text-gray-600">{p.id}</td>
                                        {editandoId === p.id ? (
                                            <>
                                                <td className="px-4 py-2">
                                                    <input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className={`${INPUT_CLASE} w-full`} />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className={`${INPUT_CLASE} w-full`} />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input value={editTelefono} onChange={(e) => setEditTelefono(e.target.value)} className={`${INPUT_CLASE} w-full`} />
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-4 py-2 font-medium text-gray-800">{p.nombre}</td>
                                                <td className="px-4 py-2 text-gray-700">{p.email}</td>
                                                <td className="px-4 py-2 tabular-nums text-gray-700">{p.telefono || '—'}</td>
                                            </>
                                        )}
                                        <td className="px-4 py-2">
                                            {p.activo ? (
                                                <span className="rounded-full bg-success-100 px-2 py-0.5 text-xs text-success-700">Activo</span>
                                            ) : (
                                                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">Inactivo</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {editandoId === p.id ? (
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={() => guardarEdicion(p)} className="text-sm text-success-700 hover:underline">
                                                        Guardar
                                                    </button>
                                                    <button onClick={() => setEditandoId(null)} className="text-sm text-gray-600 hover:underline">
                                                        Cancelar
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={() => abrirEdicion(p)} className="text-sm text-brand-600 hover:underline">
                                                        Editar
                                                    </button>
                                                    {p.activo ? (
                                                        <button onClick={() => handleDarDeBaja(p.id)} className="text-sm text-red-600 hover:underline">
                                                            Dar de baja
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleReactivar(p)} className="text-sm text-success-700 hover:underline">
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
