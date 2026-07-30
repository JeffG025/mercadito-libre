import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { User, IdCard, Lock, UserPlus, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export const Registro = ({ onRegistroSuccess, onGoToLogin, onGoToCatalogo }) => {
    const [form, setForm] = useState({ username: '', nombre: '', password: '', confirmar: '' });
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const validar = () => {
        if (!form.username.trim()) return 'El nombre de usuario es obligatorio.';
        if (form.username.trim().length < 4) return 'El usuario debe tener al menos 4 caracteres.';
        if (!form.nombre.trim()) return 'El nombre es obligatorio.';
        if (!form.password) return 'La contraseña es obligatoria.';
        if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
        if (form.password !== form.confirmar) return 'Las contraseñas no coinciden.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');
        const msg = validar();
        if (msg) {
            setError(msg);
            return;
        }
        setCargando(true);
        try {
            await apiService.registro({
                username: form.username.trim(),
                nombre: form.nombre.trim(),
                password: form.password,
            });
            setExito('¡Cuenta creada con éxito! Ya puedes iniciar sesión.');
            setForm({ username: '', nombre: '', password: '', confirmar: '' });
            setTimeout(() => { onRegistroSuccess && onRegistroSuccess(); }, 1200);
        } catch (err) {
            setError(err.message || 'No se pudo registrar.');
        } finally {
            setCargando(false);
        }
    };

    const inputBase = "w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-900";
    const labelCls = "block text-sm font-semibold text-gray-700 mb-1";

    return (
        <div className="max-w-md w-full mx-auto my-12 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-brand-800 to-brand-900 px-6 py-8 text-center text-white">
                <h2 className="text-2xl font-bold">Crear cuenta</h2>
                <p className="text-brand-200 mt-1 text-sm">Únete a Mercadito Libre hoy mismo</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-start gap-2 border border-red-200 text-sm">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}
                {exito && (
                    <div className="bg-success-50 text-success-700 p-3 rounded-xl flex items-start gap-2 border border-success-200 text-sm">
                        <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                        <span>{exito}</span>
                    </div>
                )}
                <div>
                    <label className={labelCls}>Usuario *</label>
                    <div className="relative">
                        <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" name="username" value={form.username} onChange={handleChange}
                            placeholder="ej. juanperez" className={inputBase} autoComplete="username" />
                    </div>
                </div>
                <div>
                    <label className={labelCls}>Nombre *</label>
                    <div className="relative">
                        <IdCard className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
                            placeholder="Tu nombre" className={inputBase} />
                    </div>
                </div>
                <div>
                    <label className={labelCls}>Contraseña *</label>
                    <div className="relative">
                        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="password" name="password" value={form.password} onChange={handleChange}
                            placeholder="Mínimo 6 caracteres" className={inputBase} autoComplete="new-password" />
                    </div>
                </div>
                <div>
                    <label className={labelCls}>Confirmar contraseña *</label>
                    <div className="relative">
                        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="password" name="confirmar" value={form.confirmar} onChange={handleChange}
                            placeholder="Repite tu contraseña" className={inputBase} autoComplete="new-password" />
                    </div>
                </div>
                <button type="submit" disabled={cargando}
                    className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl shadow-sm transition disabled:bg-brand-300 disabled:cursor-not-allowed">
                    <UserPlus className="w-5 h-5" />
                    {cargando ? 'Registrando...' : 'Crear cuenta'}
                </button>
                <div className="flex items-center justify-between text-sm pt-2">
                    <button type="button" onClick={onGoToCatalogo} className="flex items-center gap-1 text-gray-600 hover:text-brand-700">
                        <ArrowLeft className="w-4 h-4" /> Catálogo
                    </button>
                    <button type="button" onClick={onGoToLogin} className="text-brand-700 font-medium hover:text-brand-900">
                        Ya tengo cuenta
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Registro;
