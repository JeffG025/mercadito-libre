import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { User, Lock, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';

const INPUT_CLASE = 'w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30';
const ETIQUETA_CLASE = 'block text-sm font-semibold text-gray-700 mb-1.5';

// Ventana de perfil: datos propios y cambio de contraseña. Sirve para cliente y para admin.
export const Perfil = ({ onNombreCambiado }) => {
    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Formulario de datos
    const [datos, setDatos] = useState({ nombre: '', email: '', direccion: '' });
    const [guardandoDatos, setGuardandoDatos] = useState(false);
    const [datosError, setDatosError] = useState(null);
    const [datosOk, setDatosOk] = useState(false);

    // Formulario de contraseña
    const [pass, setPass] = useState({ passwordActual: '', passwordNueva: '', repetir: '' });
    const [guardandoPass, setGuardandoPass] = useState(false);
    const [passError, setPassError] = useState(null);
    const [passOk, setPassOk] = useState(false);

    useEffect(() => {
        let activo = true;
        apiService.getMiPerfil()
            .then((p) => {
                if (!activo) return;
                setPerfil(p);
                setDatos({ nombre: p.nombre ?? '', email: p.email ?? '', direccion: p.direccion ?? '' });
            })
            .catch((e) => { if (activo) setError(e.message); })
            .finally(() => { if (activo) setCargando(false); });
        return () => { activo = false; };
    }, []);

    const cambiarDato = (campo, valor) => {
        setDatos((prev) => ({ ...prev, [campo]: valor }));
        setDatosOk(false);
    };

    const guardarDatos = async (e) => {
        e.preventDefault();
        setDatosError(null);
        setDatosOk(false);

        if (!datos.nombre.trim()) return setDatosError('El nombre es obligatorio.');
        if (datos.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email.trim())) {
            return setDatosError('El correo no tiene un formato válido.');
        }

        setGuardandoDatos(true);
        try {
            const actualizado = await apiService.actualizarMiPerfil({
                nombre: datos.nombre.trim(),
                email: datos.email.trim(),
                direccion: datos.direccion.trim(),
            });
            setPerfil(actualizado);
            setDatosOk(true);
            // La navbar muestra el nombre: hay que refrescarlo tambien alli.
            if (onNombreCambiado) onNombreCambiado(actualizado.nombre);
        } catch (err) {
            setDatosError(err.message);
        } finally {
            setGuardandoDatos(false);
        }
    };

    const guardarPassword = async (e) => {
        e.preventDefault();
        setPassError(null);
        setPassOk(false);

        if (!pass.passwordActual) return setPassError('Escribe tu contraseña actual.');
        if (pass.passwordNueva.length < 6) return setPassError('La contraseña nueva debe tener al menos 6 caracteres.');
        if (pass.passwordNueva !== pass.repetir) return setPassError('Las contraseñas nuevas no coinciden.');

        setGuardandoPass(true);
        try {
            await apiService.cambiarMiPassword({
                passwordActual: pass.passwordActual,
                passwordNueva: pass.passwordNueva,
            });
            setPass({ passwordActual: '', passwordNueva: '', repetir: '' });
            setPassOk(true);
        } catch (err) {
            setPassError(err.message);
        } finally {
            setGuardandoPass(false);
        }
    };

    if (cargando) {
        return (
            <div className="flex items-center justify-center gap-2 py-20 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" /> Cargando tu perfil…
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-red-200 p-6 text-center">
                <ShieldAlert className="w-10 h-10 text-red-600 mx-auto mb-3" />
                <p className="text-sm text-red-700">No se pudo cargar el perfil: {error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
            {/* Encabezado */}
            <div className="bg-gradient-to-r from-brand-800 to-brand-600 rounded-2xl p-6 text-white flex items-center gap-4">
                <div className="bg-white/15 rounded-full p-3">
                    <User className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                    <h1 className="text-2xl font-extrabold truncate">{perfil.nombre || perfil.username}</h1>
                    <p className="text-brand-100 text-sm">
                        @{perfil.username} · {perfil.role === 'ROLE_ADMIN' ? 'Administrador' : 'Cliente'}
                    </p>
                </div>
            </div>

            {/* Datos personales */}
            <form onSubmit={guardarDatos} noValidate className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-gray-800">Mis datos</h2>

                <div>
                    <label className={ETIQUETA_CLASE} htmlFor="perfil-usuario">Usuario</label>
                    <input id="perfil-usuario" value={perfil.username} disabled readOnly
                        className={`${INPUT_CLASE} bg-gray-100 text-gray-600 cursor-not-allowed`} />
                    <p className="mt-1 text-xs text-gray-600">
                        El usuario no se puede cambiar: identifica la cuenta y tus compras quedan ligadas a él.
                    </p>
                </div>

                <div>
                    <label className={ETIQUETA_CLASE} htmlFor="perfil-nombre">Nombre</label>
                    <input id="perfil-nombre" value={datos.nombre}
                        onChange={(e) => cambiarDato('nombre', e.target.value)}
                        className={INPUT_CLASE} />
                </div>

                <div>
                    <label className={ETIQUETA_CLASE} htmlFor="perfil-email">Correo</label>
                    <input id="perfil-email" type="email" value={datos.email}
                        onChange={(e) => cambiarDato('email', e.target.value)}
                        placeholder="tucorreo@ejemplo.com" className={INPUT_CLASE} />
                </div>

                <div>
                    <label className={ETIQUETA_CLASE} htmlFor="perfil-direccion">Dirección de entrega</label>
                    <input id="perfil-direccion" value={datos.direccion}
                        onChange={(e) => cambiarDato('direccion', e.target.value)}
                        placeholder="Calle, número, colonia, ciudad" className={INPUT_CLASE} />
                </div>

                {datosError && (
                    <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{datosError}</p>
                )}
                {datosOk && (
                    <p className="text-sm text-success-700 bg-success-50 border border-success-200 rounded-xl px-3 py-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Datos guardados.
                    </p>
                )}

                <button type="submit" disabled={guardandoDatos}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2">
                    {guardandoDatos ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</> : 'Guardar cambios'}
                </button>
            </form>

            {/* Contraseña */}
            <form onSubmit={guardarPassword} noValidate className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-brand-600" /> Cambiar contraseña
                </h2>

                <div>
                    <label className={ETIQUETA_CLASE} htmlFor="pass-actual">Contraseña actual</label>
                    <input id="pass-actual" type="password" autoComplete="current-password"
                        value={pass.passwordActual}
                        onChange={(e) => { setPass((p) => ({ ...p, passwordActual: e.target.value })); setPassOk(false); }}
                        className={INPUT_CLASE} />
                </div>

                <div>
                    <label className={ETIQUETA_CLASE} htmlFor="pass-nueva">Contraseña nueva</label>
                    <input id="pass-nueva" type="password" autoComplete="new-password"
                        value={pass.passwordNueva}
                        onChange={(e) => { setPass((p) => ({ ...p, passwordNueva: e.target.value })); setPassOk(false); }}
                        className={INPUT_CLASE} />
                    <p className="mt-1 text-xs text-gray-600">Mínimo 6 caracteres.</p>
                </div>

                <div>
                    <label className={ETIQUETA_CLASE} htmlFor="pass-repetir">Repetir contraseña nueva</label>
                    <input id="pass-repetir" type="password" autoComplete="new-password"
                        value={pass.repetir}
                        onChange={(e) => { setPass((p) => ({ ...p, repetir: e.target.value })); setPassOk(false); }}
                        className={INPUT_CLASE} />
                </div>

                {passError && (
                    <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{passError}</p>
                )}
                {passOk && (
                    <p className="text-sm text-success-700 bg-success-50 border border-success-200 rounded-xl px-3 py-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Contraseña actualizada. Tu sesión actual sigue siendo válida.
                    </p>
                )}

                <button type="submit" disabled={guardandoPass}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2">
                    {guardandoPass ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</> : 'Cambiar contraseña'}
                </button>
            </form>
        </div>
    );
};
