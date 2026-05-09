import { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      setError(err.message.includes('auth/invalid-credential') 
        ? 'Credenciais inválidas.' 
        : 'Erro ao autenticar. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      setError('Erro ao entrar com Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>

      <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10 transition-all duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-brand-500 to-cyan-400 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-brand-500/30">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Encurta Link Senai
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta para começar'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300 pl-1">E-mail</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300 pl-1">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20 flex items-center justify-center mt-6 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : isLogin ? (
              'Entrar'
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="w-1/5 border-b border-gray-700/50"></span>
          <span className="text-xs text-gray-500 uppercase font-medium">ou</span>
          <span className="w-1/5 border-b border-gray-700/50"></span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mt-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuar com Google
        </button>

        <p className="mt-8 text-center text-sm text-gray-400">
          {isLogin ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="ml-2 text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            {isLogin ? 'Criar agora' : 'Fazer login'}
          </button>
        </p>
      </div>
    </div>
  );
}
