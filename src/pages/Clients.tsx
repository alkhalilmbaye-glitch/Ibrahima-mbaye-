import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  History, 
  Star,
  MoreVertical,
  X,
  Save,
  MessageSquare
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, orderBy } from 'firebase/firestore';
import { cn, formatDate } from '../lib/utils';
import { Client, OperationType } from '../types';
import { handleFirestoreError } from '../lib/errorHandling';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({
    nom: "",
    telephone: "",
    email: "",
    pointsFidelite: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cList: Client[] = [];
      snapshot.forEach(doc => {
        cList.push({ id: doc.id, ...doc.data() } as Client);
      });
      setClients(cList);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        pointsFidelite: Number(formData.pointsFidelite) || 0,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'clients'), data);
      setIsOpen(false);
      setFormData({ nom: "", telephone: "", email: "", pointsFidelite: 0 });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'clients');
    }
  };

  const filteredClients = clients.filter(c => 
    c.nom.toLowerCase().includes(search.toLowerCase()) || 
    c.telephone.includes(search)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestion Clients</h1>
          <p className="text-gray-500">Suivi de la fidélité et historique des achats.</p>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary/95 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Nouveau Client
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Rechercher un client par nom ou téléphone..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-accent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
             
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center text-white text-xl font-black">
                {client.nom.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 leading-tight">{client.nom}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Client depuis {new Date(client.createdAt).getFullYear()}</p>
              </div>
              <div className="ml-auto flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-1 rounded-lg">
                <Star size={14} fill="currentColor" />
                <span className="text-xs font-black">{client.pointsFidelite}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <Phone size={16} />
                </div>
                {client.telephone}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <Mail size={16} />
                </div>
                {client.email || 'Pas d\'email'}
              </div>
            </div>

            <div className="flex gap-2">
               <button className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors">
                 <History size={14} /> Historique
               </button>
               <button className="p-3 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-colors">
                 <MessageSquare size={16} />
               </button>
               <button className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-xl transition-colors">
                 <MoreVertical size={16} />
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-xl font-black text-primary">Nouveau Client</h3>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X size={24} className="text-gray-400" />
                </button>
             </div>
             <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nom complet</label>
                    <input required type="text" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent font-bold" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Téléphone</label>
                    <input required type="tel" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent font-bold" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email (Optionnel)</label>
                    <input type="email" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-transform">
                  <Save size={20} />
                  CRÉER LE DOSSIER CLIENT
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
