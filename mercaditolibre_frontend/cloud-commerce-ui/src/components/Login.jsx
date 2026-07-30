import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { User, Lock, LogIn as LogInIcon, AlertCircle, ArrowLeft } from 'lucide-react';

export const Login = ({ onLoginSuccess, onGoToRegister, onGoToCatalogo }) => {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.username.trim() || !form.password) {
            setError('Usuario y contraseña son obligatorios.');
            return;
        }
        setCargando(true);
        try {
            const data = await apiService.login(form);
            onLoginSuccess && onLoginSuccess({
                username: data.username,
                nombre: data.nombre,
                role: data.role,
            });
        } catch (err) {
            setError(err.message || 'No se pudo iniciar sesión.');
        } finally {
            setCargando(false);
        }
    };

    const inputBase = "w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-900";

    return (
        <div className="max-w-md w-full mx-auto my-12 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-brand-800 to-brand-900 px-6 py-8 text-center text-white">
                <h2 className="text-2xl font-bold">Bienvenido</h2>
                <p className="text-brand-200 mt-1 text-sm">Inicia sesión en tu cuenta de Mercadito Libre</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-start gap-2 border border-red-200 text-sm">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Usuario</label>
                    <div className="relative">
                        <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Tu usuario"
                            className={inputBase}
                            autoComplete="username"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                    <div className="relative">
                        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Tu contraseña"
                            className={inputBase}
                            autoComplete="current-password"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={cargando}
                    className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl shadow-sm transition disabled:bg-brand-300 disabled:cursor-not-allowed"
                >
                    <LogInIcon className="w-5 h-5" />
                    {cargando ? 'Entrando...' : 'Iniciar sesión'}
                </button>
                <div className="flex items-center justify-between text-sm pt-2">
                    <button type="button" onClick={onGoToCatalogo} className="flex items-center gap-1 text-gray-600 hover:text-brand-700">
                        <ArrowLeft className="w-4 h-4" /> Catálogo
                    </button>
                    <button type="button" onClick={onGoToRegister} className="text-brand-700 font-medium hover:text-brand-900">
                        Crear cuenta
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Login;


/* Login nuevo

import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import{ Mail, Lock, LogIn, AlertCircle} from 'lucide-react';


export const Login = ({onLoginSuccess, onGoToRegister}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async(e) =>{
        e.preventDefault();
        setError('');
        setLoading(true);

        try{
            const data = await apiService.login(username, password);
            onLoginSuccess(data);
        }catch(err){
            setError(err.message || 
                'Credenciales invalidas. Verifica tu correo o pass');
        }finally{
            setLoading(false);
        }
    };

    return(
        <div className="max-w-lg w-full mx-auto my-12 bg-white 
        rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-brand-800 to-brand-900 
                px-6 py-6 text-center text-white">
                <h2 className="text-2xl font-bold">¡Bienvenido de new!</h2>
                <p className="text-brand-200 mt-1 text-sm">Inicia sesion 
                    en tu cuenta de MercaditoLibre</p>
               
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex 
                            items-start gap-2.5 border border-red-200 text-sm">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
            </div>
            )}

        { Campo Correo }
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="pl-11 w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-gray-900"
              placeholder="nombre@correo.com"
            />
          </div>
        </div>

        {/* Campo Contraseña }
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-11 w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-gray-900"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Botón Entrar }
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          <LogIn className="w-5 h-5" />
          {loading ? 'Iniciando Sesión...' : 'Entrar'}
        </button>

        {/* Enlace al registro }
        <div className="text-center text-sm text-gray-600 border-t border-gray-100 pt-6">
          ¿No tienes una cuenta?{' '}
          <button
            type="button"
            onClick={onGoToRegister}
            className="text-brand-600 font-bold hover:underline"
          >
            Regístrate ahora
          </button>
        </div>
      </form>

        </div>
    );
};

*/
