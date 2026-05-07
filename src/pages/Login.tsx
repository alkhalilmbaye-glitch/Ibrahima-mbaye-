import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { LogIn, ShieldAlert } from 'lucide-react';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl overflow-hidden relative">
        {/* Accent decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12" />

        <div className="text-center relative z-10">
          <div className="w-20 h-20 bg-primary rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-lg rotate-3 overflow-hidden">
             <span className="animate-pulse">AK</span>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Bienvenue</h1>
          <p className="text-gray-500 mb-8 font-medium">AL KHALIL BUSINESS COMPAGNY</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100 animate-shake">
              <ShieldAlert size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/95 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-4 transition-all duration-300 transform active:scale-95 disabled:opacity-50 shadow-xl"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn size={20} />
            )}
            Se connecter avec Google
          </button>

          <p className="mt-8 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Gestion de Caisse & Stock Sécurisée
          </p>
        </div>
      </div>
    </div>
  );
}
