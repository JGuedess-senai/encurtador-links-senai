import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase/config';
import { collection, query, where, getDocs, updateDoc, increment, doc } from 'firebase/firestore';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function Redirector() {
  const { code } = useParams();
  const [error, setError] = useState(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    async function doRedirect() {
      try {
        const linksRef = collection(db, 'links');
        const q = query(linksRef, where("shortCode", "==", code));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("Link não encontrado ou expirado.");
          return;
        }

        const linkDoc = querySnapshot.docs[0];
        const linkData = linkDoc.data();

        // Check expiration
        if (linkData.expiresAt && new Date(linkData.expiresAt) < new Date()) {
          setError("Este link expirou (validade de 30 dias ultrapassada).");
          return;
        }

        // Increment click
        await updateDoc(doc(db, 'links', linkDoc.id), {
          clicks: increment(1)
        });

        // Redirect
        window.location.href = linkData.originalUrl;

      } catch (err) {
        console.error("Erro ao redirecionar:", err);
        setError("Erro ao acessar o link.");
      }
    }
    doRedirect();
  }, [code]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-panel p-8 rounded-2xl text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Ops!</h2>
          <p className="text-gray-300">{error}</p>
          <a href="/" className="mt-6 inline-block text-brand-500 hover:text-brand-400 transition-colors">Voltar para o início</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mb-4"></div>
      <p className="text-gray-400 animate-pulse">Redirecionando...</p>
    </div>
  );
}

function PrivateRoute({ children, user, loading }) {
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/r/:code" element={<Redirector />} />
        <Route 
          path="/" 
          element={
            <PrivateRoute user={user} loading={loading}>
              <Dashboard user={user} />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
