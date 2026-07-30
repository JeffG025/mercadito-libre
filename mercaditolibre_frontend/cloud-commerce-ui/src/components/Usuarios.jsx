import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const INPUT_CLASE = 'rounded border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Alta de usuarios desde el panel, incluidos otros administradores.
export const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [accionError, setAccionError] = useState(null);

    const [form, setForm] = useState({ username: '', password: '', nombre: '', email: '', direccion: '', rol: 'ROLE_CLIENTE' });
    const [guardando, setGuardando] = useState(false);
    const [formError, setFormError] = useState(null);
    const [creado, setCreado] = useState(null);

    const cambiar = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

    const cargarUsuarios = async () => {
        setCargando(true);
        setError(null);
        try {
            const datos = await apiService.getUsuarios();
            setUsuarios(datos ?? []);
        } catch (e) {
            setError(e.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        let activo = true;
        apiService.getUsuarios()
            .then((datos) => { if (activo) setUsuarios(datos ?? []); })
            .catch((e) => { if (activo) setError(e.message); })
            .finally(() => { if (activo) setCargando(false); });
        return () => { activo = false; };
    }, []);

    const handleCrear = async (e) => {
        e.preventDefault();
        setFormError(null);
        setCreado(null);

        if (!form.username.trim()) return setFormError('El usuario es obligatorio.');
        if (form.password.length < 6) return setFormError('La contraseña debe tener al menos 6 caracteres.');
        if (!form.nombre.trim()) return setFormError('El nombre es obligatorio.');
        if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) return setFormError('El correo no tiene un formato válido.');

        setGuardando(true);
        try {
            const nuevo = await apiService.crearUsuario({
                username: form.username.trim(),
                password: form.password,
                nombre: form.nombre.trim(),
                email: form.email.trim(),
                direccion: form.direccion.trim(),
                rol: form.rol,
            });
            setCreado(`${nuevo.username} creado como ${nuevo.role === 'ROLE_ADMIN' ? 'administrador' : 'cliente'}.`);
            setForm({ username: '', password: '', nombre: '', email: '', direccion: '', rol: 'ROLE_CLIENTE' });
            await cargarUsuarios();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    const admins = usuarios.filter((u) => u.role === 'ROLE_ADMIN').length;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Formulario de alta */}
            <form onSubmit={handleCrear} noValidate className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">Nuevo usuario</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <input value={form.username} onChange={(e) => cambiar('username', e.target.value)}
                        placeholder="Usuario" autoComplete="off" className={INPUT_CLASE} />
                    <input value={form.password} onChange={(e) => cambiar('password', e.target.value)}
                        type="password" placeholder="Contraseña" autoComplete="new-password" className={INPUT_CLASE} />
                    <input value={form.nombre} onChange={(e) => cambiar('nombre', e.target.value)}
                        placeholder="Nombre" className={INPUT_CLASE} />
                    <input value={form.email} onChange={(e) => cambiar('email', e.target.value)}
                        type="email" placeholder="Correo (opcional)" className={INPUT_CLASE} />
                    <input value={form.direccion} onChange={(e) => cambiar('direccion', e.target.value)}
                        placeholder="Dirección (opcional)" className={INPUT_CLASE} />
                    {/* El rol se elige de una lista: escribirlo a mano daría errores de dedo. */}
                    <select value={form.rol} onChange={(e) => cambiar('rol', e.target.value)} className={INPUT_CLASE}>
                        <option value="ROLE_CLIENTE">Cliente</option>
                        <option value="ROLE_ADMIN">Administrador</option>
                    </select>
                </div>

                {form.rol === 'ROLE_ADMIN' && (
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                        Un administrador puede gestionar el catálogo, ver todas las ventas y crear más administradores.
                    </p>
                )}
                {formError && <p className="mt-2 text-sm text-red-700">{formError}</p>}
                {creado && <p className="mt-2 text-sm text-success-700">{creado}</p>}

                <button type="submit" disabled={guardando}
                    className="mt-3 rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
                    {guardando ? 'Guardando…' : 'Crear usuario'}
                </button>
            </form>

            {/* Tabla de usuarios */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Usuarios <span className="text-sm font-normal text-gray-600">({admins} admin de {usuarios.length})</span>
                    </h3>
                    <button onClick={cargarUsuarios}
                        className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50">
                        Recargar
                    </button>
                </div>

                {accionError && (
                    <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">{accionError}</p>
                )}

                {cargando ? (
                    <p className="px-4 py-6 text-sm text-gray-600">Cargando usuarios…</p>
                ) : error ? (
                    <div className="px-4 py-6">
                        <p className="text-sm text-red-700">Error: {error}</p>
                        <p className="mt-1 text-xs text-gray-600">¿El backend está corriendo en http://localhost:8085?</p>
                    </div>
                ) : usuarios.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-gray-600">No hay usuarios registrados.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                                <tr>
                                    <th className="px-4 py-2">ID</th>
                                    <th className="px-4 py-2">Usuario</th>
                                    <th className="px-4 py-2">Nombre</th>
                                    <th className="px-4 py-2">Correo</th>
                                    <th className="px-4 py-2">Dirección</th>
                                    <th className="px-4 py-2">Rol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((u) => (
                                    <tr key={u.id} className="border-t border-gray-100">
                                        <td className="px-4 py-2 text-gray-600">{u.id}</td>
                                        <td className="px-4 py-2 font-medium text-gray-800">{u.username}</td>
                                        <td className="px-4 py-2 text-gray-700">{u.nombre || '—'}</td>
                                        <td className="px-4 py-2 text-gray-700">{u.email || '—'}</td>
                                        <td className="px-4 py-2 text-gray-700">{u.direccion || '—'}</td>
                                        <td className="px-4 py-2">
                                            {u.role === 'ROLE_ADMIN' ? (
                                                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">Administrador</span>
                                            ) : (
                                                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">Cliente</span>
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
