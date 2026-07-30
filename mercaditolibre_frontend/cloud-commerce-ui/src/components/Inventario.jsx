import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const INPUT_CLASE = 'rounded border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none';

// Lista los productos, los da de alta, los edita y los da de baja.
export const Inventario = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Campos del formulario de alta
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [stock, setStock] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [formError, setFormError] = useState(null);

    // Edición en línea: id de la fila abierta y sus valores.
    const [editandoId, setEditandoId] = useState(null);
    const [edit, setEdit] = useState({ nombre: '', descripcion: '', precio: '', stock: '', categoriaId: '' });
    const cambiarEdit = (campo, valor) => setEdit((prev) => ({ ...prev, [campo]: valor }));
    // Errores de acciones sobre la tabla. Separado de `error`, que sustituye la tabla por un aviso de carga fallida.
    const [accionError, setAccionError] = useState(null);
    // Id del producto cuya imagen se está subiendo, para deshabilitar el control mientras tanto.
    const [subiendoImagen, setSubiendoImagen] = useState(null);

    // Trae los productos del backend
    const cargarProductos = async () => {
        setCargando(true);
        setError(null);
        try {
            const datos = await apiService.getProductos();
            setProductos(datos ?? []);
        } catch (e) {
            setError(e.message);
        } finally {
            setCargando(false);
        }
    };

    // Carga inicial al montar: productos y el catálogo de categorías para los desplegables.
    useEffect(() => {
        let activo = true;
        apiService
            .getProductos()
            .then((datos) => { if (activo) setProductos(datos ?? []); })
            .catch((e) => { if (activo) setError(e.message); })
            .finally(() => { if (activo) setCargando(false); });
        apiService
            .getCategorias()
            .then((datos) => { if (activo) setCategorias(datos ?? []); })
            .catch(() => { if (activo) setCategorias([]); });
        return () => { activo = false; };
    }, []);

    // Opciones del desplegable: solo las categorías activas, más la que ya tenga el producto
    // aunque esté dada de baja, para no reasignarla sin querer al editar.
    const opcionesCategoria = (actual) => {
        const activas = categorias.filter((c) => c.activo);
        if (actual && !activas.some((c) => c.id === actual.id)) {
            return [...activas, { ...actual, inactiva: true }];
        }
        return activas;
    };

    // El backend reemplaza el registro completo, así que se manda la categoría entera, no solo el id.
    const categoriaPorId = (id) => (id ? categorias.find((c) => String(c.id) === String(id)) ?? null : null);

    // Alta de un producto nuevo
    const handleCrear = async (e) => {
        e.preventDefault();
        setFormError(null);

        // Valida en el front; el back revalida.
        if (!nombre.trim()) return setFormError('El nombre es obligatorio.');
        if (Number(precio) <= 0) return setFormError('El precio debe ser mayor a cero.');
        if (Number(stock) < 0) return setFormError('El stock no puede ser negativo.');

        setGuardando(true);
        try {
            await apiService.crearProducto({
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                precio: Number(precio),
                stock: Number(stock),
                categoria: categoriaPorId(categoriaId),
                activo: true,
            });
            // Limpia el formulario y recarga la lista
            setNombre('');
            setPrecio('');
            setStock('');
            setDescripcion('');
            setCategoriaId('');
            await cargarProductos();
        } catch (e) {
            setFormError(e.message);
        } finally {
            setGuardando(false);
        }
    };

    const abrirEdicion = (producto) => {
        setEditandoId(producto.id);
        setEdit({
            nombre: producto.nombre,
            descripcion: producto.descripcion ?? '',
            precio: String(producto.precio),
            stock: String(producto.stock),
            categoriaId: producto.categoria ? String(producto.categoria.id) : '',
        });
    };

    const guardarEdicion = async (producto) => {
        if (!edit.nombre.trim()) return setAccionError('El nombre es obligatorio.');
        if (Number(edit.precio) <= 0) return setAccionError('El precio debe ser mayor a cero.');
        if (Number(edit.stock) < 0) return setAccionError('El stock no puede ser negativo.');
        setAccionError(null);
        try {
            // Se reenvía el producto completo: el PUT reemplaza todos los campos y si no,
            // el producto perdería su categoría, su proveedor, su imagen y quedaría inactivo.
            await apiService.actualizarProducto(producto.id, {
                ...producto,
                nombre: edit.nombre.trim(),
                descripcion: edit.descripcion.trim(),
                precio: Number(edit.precio),
                stock: Number(edit.stock),
                categoria: categoriaPorId(edit.categoriaId),
            });
            setEditandoId(null);
            await cargarProductos();
        } catch (e) {
            setAccionError(e.message);
        }
    };

    const handleSubirImagen = async (id, archivo) => {
        if (!archivo) return;
        setAccionError(null);
        setSubiendoImagen(id);
        try {
            await apiService.subirImagenProducto(id, archivo);
            await cargarProductos();
        } catch (e) {
            setAccionError(e.message);
        } finally {
            setSubiendoImagen(null);
        }
    };

    const handleQuitarImagen = async (id) => {
        setAccionError(null);
        try {
            await apiService.eliminarImagenProducto(id);
            await cargarProductos();
        } catch (e) {
            setAccionError(e.message);
        }
    };

    // Baja lógica: el back pone activo=false, no borra.
    const handleEliminar = async (id) => {
        try {
            await apiService.eliminarProducto(id);
            await cargarProductos();
        } catch (e) {
            setAccionError(e.message);
        }
    };

    // Reactiva un producto dado de baja: el back pone activo=true.
    const handleReactivar = async (id) => {
        try {
            await apiService.reactivarProducto(id);
            await cargarProductos();
        } catch (e) {
            setAccionError(e.message);
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Formulario de alta */}
            <form onSubmit={handleCrear} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">Nuevo producto</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <input
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Nombre"
                        className={INPUT_CLASE}
                    />
                    <input
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        type="number"
                        step="0.01"
                        placeholder="Precio"
                        className={INPUT_CLASE}
                    />
                    <input
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        type="number"
                        placeholder="Stock"
                        className={INPUT_CLASE}
                    />
                    <input
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Descripción (opcional)"
                        className={INPUT_CLASE}
                    />
                    {/* Desplegable: la categoría se elige de las existentes, no se escribe. */}
                    <select
                        value={categoriaId}
                        onChange={(e) => setCategoriaId(e.target.value)}
                        className={INPUT_CLASE}
                    >
                        <option value="">Sin categoría</option>
                        {opcionesCategoria(null).map((c) => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                </div>
                {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}
                <button
                    type="submit"
                    disabled={guardando}
                    className="mt-3 rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                    {guardando ? 'Guardando…' : 'Agregar producto'}
                </button>
            </form>

            {/* Tabla de productos */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <h3 className="text-lg font-semibold text-gray-800">Productos</h3>
                    <button
                        onClick={cargarProductos}
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
                    <p className="px-4 py-6 text-sm text-gray-600">Cargando productos…</p>
                ) : error ? (
                    <div className="px-4 py-6">
                        <p className="text-sm text-red-600">Error: {error}</p>
                        <p className="mt-1 text-xs text-gray-600">
                            ¿El backend está corriendo en http://localhost:8085?
                        </p>
                    </div>
                ) : productos.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-gray-600">No hay productos registrados todavía.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                                <tr>
                                    <th className="px-4 py-2">ID</th>
                                    <th className="px-4 py-2">Imagen</th>
                                    <th className="px-4 py-2">Nombre</th>
                                    <th className="px-4 py-2">Descripción</th>
                                    <th className="px-4 py-2">Categoría</th>
                                    <th className="px-4 py-2">Precio</th>
                                    <th className="px-4 py-2">Stock</th>
                                    <th className="px-4 py-2">Estado</th>
                                    <th className="px-4 py-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map((p) => (
                                    <tr key={p.id} className="border-t border-gray-100">
                                        <td className="px-4 py-2 text-gray-600">{p.id}</td>
                                        {/* Miniatura + subir/cambiar/quitar. Siempre visible, sin entrar en modo edición. */}
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                {p.imagenUrl ? (
                                                    <img src={p.imagenUrl} alt={p.nombre} className="h-12 w-12 rounded object-cover border border-gray-200" />
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded border border-dashed border-gray-300 text-[10px] text-gray-400">
                                                        sin img
                                                    </div>
                                                )}
                                                <div className="flex flex-col gap-0.5">
                                                    <label className={`cursor-pointer text-xs ${subiendoImagen === p.id ? 'text-gray-400' : 'text-brand-600 hover:underline'}`}>
                                                        {subiendoImagen === p.id ? 'Subiendo…' : (p.imagenUrl ? 'Cambiar' : 'Subir')}
                                                        <input
                                                            type="file"
                                                            accept="image/png,image/jpeg,image/webp,image/gif"
                                                            className="hidden"
                                                            disabled={subiendoImagen === p.id}
                                                            onChange={(e) => { handleSubirImagen(p.id, e.target.files?.[0]); e.target.value = ''; }}
                                                        />
                                                    </label>
                                                    {p.imagenUrl && (
                                                        <button onClick={() => handleQuitarImagen(p.id)} className="text-left text-xs text-red-600 hover:underline">
                                                            Quitar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        {editandoId === p.id ? (
                                            <>
                                                <td className="px-4 py-2">
                                                    <input value={edit.nombre} onChange={(e) => cambiarEdit('nombre', e.target.value)} className={`${INPUT_CLASE} w-40`} />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input value={edit.descripcion} onChange={(e) => cambiarEdit('descripcion', e.target.value)} className={`${INPUT_CLASE} w-48`} />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <select value={edit.categoriaId} onChange={(e) => cambiarEdit('categoriaId', e.target.value)} className={`${INPUT_CLASE} w-40`}>
                                                        <option value="">Sin categoría</option>
                                                        {opcionesCategoria(p.categoria).map((c) => (
                                                            <option key={c.id} value={c.id}>{c.nombre}{c.inactiva ? ' (dada de baja)' : ''}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input value={edit.precio} onChange={(e) => cambiarEdit('precio', e.target.value)} type="number" step="0.01" className={`${INPUT_CLASE} w-24`} />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input value={edit.stock} onChange={(e) => cambiarEdit('stock', e.target.value)} type="number" className={`${INPUT_CLASE} w-20`} />
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-4 py-2 font-medium text-gray-800">{p.nombre}</td>
                                                <td className="px-4 py-2 text-gray-700">{p.descripcion || '—'}</td>
                                                <td className="px-4 py-2 text-gray-700">{p.categoria?.nombre || '—'}</td>
                                                <td className="px-4 py-2 tabular-nums text-gray-700">${Number(p.precio).toFixed(2)}</td>
                                                <td className="px-4 py-2 tabular-nums text-gray-700">{p.stock}</td>
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
                                                        <button onClick={() => handleEliminar(p.id)} className="text-sm text-red-600 hover:underline">
                                                            Dar de baja
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleReactivar(p.id)} className="text-sm text-success-700 hover:underline">
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
