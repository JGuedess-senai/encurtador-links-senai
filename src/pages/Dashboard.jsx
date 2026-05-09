import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { LogOut, Link as LinkIcon, Copy, Trash2, ExternalLink, Calendar, MousePointerClick, Edit2, X } from 'lucide-react';

export default function Dashboard({ user }) {
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [editUrl, setEditUrl] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Fetch links in real-time
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'links'), 
      where("userId", "==", user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const linksData = [];
      querySnapshot.forEach((doc) => {
        linksData.push({ id: doc.id, ...doc.data() });
      });
      // Sort by creation date client-side
      linksData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
      setLinks(linksData);
    });

    return () => unsubscribe();
  }, [user]);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    let validUrl = url;
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    setLoading(true);
    setError('');

    try {
      const linksRef = collection(db, 'links');
      let shortCode = '';
      let isUnique = false;

      // Handle collision
      while (!isUnique) {
        shortCode = generateCode();
        const codeQuery = query(linksRef, where("shortCode", "==", shortCode));
        const codeSnapshot = await getDocs(codeQuery);
        if (codeSnapshot.empty) {
          isUnique = true;
        }
      }

      // Valid for 30 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await addDoc(collection(db, 'links'), {
        userId: user.uid,
        originalUrl: validUrl,
        shortCode: shortCode,
        clicks: 0,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt.toISOString()
      });

      setUrl('');
    } catch (err) {
      console.error(err);
      setError('Erro ao encurtar o link.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (link) => {
    setEditingLink(link);
    setEditUrl(link.originalUrl);
    setEditCode(link.shortCode);
    setEditError('');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingLink(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editUrl || !editCode) return;
    
    let validUrl = editUrl;
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    setEditLoading(true);
    setEditError('');

    try {
      // Verifica colisão se o código foi alterado
      if (editCode !== editingLink.shortCode) {
        const linksRef = collection(db, 'links');
        const codeQuery = query(linksRef, where("shortCode", "==", editCode));
        const codeSnapshot = await getDocs(codeQuery);
        
        if (!codeSnapshot.empty) {
          setEditError('Este código curto já está em uso. Tente outro.');
          setEditLoading(false);
          return;
        }
      }

      await updateDoc(doc(db, 'links', editingLink.id), {
        originalUrl: validUrl,
        shortCode: editCode
      });

      closeEditModal();
    } catch (err) {
      console.error(err);
      setEditError('Erro ao atualizar o link.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este link?")) {
      try {
        await deleteDoc(doc(db, 'links', id));
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir o link.");
      }
    }
  };

  const handleCopy = (code, id) => {
    const fullUrl = `${window.location.origin}/r/${code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-bg-dark pb-12">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-brand-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
              <LinkIcon className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Encurta Link Senai</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:block">{user.email}</span>
            <button 
              onClick={() => signOut(auth)}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Shortener Box */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          
          <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Encurte sua URL longa</h2>
          <p className="text-gray-400 mb-6 relative z-10">Cole o link abaixo e receba uma versão curta e rastreável, válida por 30 dias.</p>
          
          <form onSubmit={handleShorten} className="relative z-10 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://sua-url-muito-longa.com/algo"
                className="w-full bg-gray-900/80 border border-gray-700/80 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-600 hover:bg-brand-500 text-white font-medium py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg shadow-brand-500/25 flex items-center justify-center min-w-[140px] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Encurtar'
              )}
            </button>
          </form>
          {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
        </div>

        {/* Links List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <MousePointerClick className="w-5 h-5 text-brand-400" />
            Seus Links Recentes
          </h3>
          
          {links.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-700/50 rounded-3xl bg-white/[0.02]">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400">Você ainda não encurtou nenhum link.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {links.map(link => (
                <div key={link.id} className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group hover:border-gray-600/50 transition-colors">
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-3 mb-1">
                      <a 
                        href={`/r/${link.shortCode}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-brand-400 font-bold text-lg hover:underline flex items-center gap-1"
                      >
                        /r/{link.shortCode}
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </div>
                    <p className="text-gray-400 text-sm truncate" title={link.originalUrl}>
                      {link.originalUrl}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-medium">
                      <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                        <MousePointerClick className="w-3.5 h-3.5" />
                        {link.clicks} cliques
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {link.createdAt ? new Date(link.createdAt.toMillis()).toLocaleDateString('pt-BR') : 'Agora'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button 
                      onClick={() => handleCopy(link.shortCode, link.id)}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        copiedId === link.id 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
                      }`}
                    >
                      <Copy className="w-4 h-4" />
                      {copiedId === link.id ? 'Copiado!' : 'Copiar'}
                    </button>
                    
                    <button 
                      onClick={() => openEditModal(link)}
                      className="p-2 rounded-xl text-gray-400 hover:bg-brand-500/10 hover:text-brand-400 border border-transparent hover:border-brand-500/20 transition-all"
                      title="Editar link"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>

                    <button 
                      onClick={() => handleDelete(link.id)}
                      className="p-2 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all"
                      title="Excluir link"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeEditModal}></div>
          <div className="glass-panel p-6 sm:p-8 rounded-3xl w-full max-w-md relative z-10 shadow-2xl shadow-brand-500/20 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Editar Link</h3>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300 pl-1">URL Original de Destino</label>
                <input
                  type="text"
                  required
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full bg-gray-900/80 border border-gray-700/80 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300 pl-1">Código Encurtado (Customizável)</label>
                <div className="flex items-center">
                  <span className="bg-gray-800 border border-gray-700/80 border-r-0 rounded-l-xl py-3 px-4 text-gray-400 text-sm">/r/</span>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    className="w-full bg-gray-900/80 border border-gray-700/80 rounded-r-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-inner"
                  />
                </div>
                <p className="text-xs text-gray-500 pl-1 mt-1">Apenas letras, números, traços e underlines.</p>
              </div>

              {editError && <p className="text-red-400 text-sm mt-2">{editError}</p>}

              <button
                type="submit"
                disabled={editLoading}
                className="w-full mt-6 bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center disabled:opacity-50"
              >
                {editLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
