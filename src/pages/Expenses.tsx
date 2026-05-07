import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Wallet, 
  Calendar, 
  Tag, 
  ArrowDownRight,
  TrendingUp,
  X,
  Save,
  Trash2
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import { Expense, OperationType } from '../types';
import { handleFirestoreError } from '../lib/errorHandling';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>({
    montant: 0,
    description: "",
    categorie: "Général",
    date: new Date().toISOString()
  });

  useEffect(() => {
    const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eList: Expense[] = [];
      snapshot.forEach(doc => {
        eList.push({ id: doc.id, ...doc.data() } as Expense);
      });
      setExpenses(eList);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'expenses'), {
        ...formData,
        montant: Number(formData.montant),
        date: new Date().toISOString()
      });
      setIsOpen(false);
      setFormData({ montant: 0, description: "", categorie: "Général" });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'expenses');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Supprimer cette dépense ?")) {
      try {
        await deleteDoc(doc(db, 'expenses', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `expenses/${id}`);
      }
    }
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.montant, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dépenses</h1>
          <p className="text-gray-500">Suivi des coûts opérationnels et achats boutique.</p>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 transition-transform active:scale-95"
        >
          <Plus size={20} />
          Nouvelle Dépense
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-primary p-8 rounded-[2.5rem] text-white shadow-xl shadow-primary/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
               <Wallet className="mb-4 opacity-50" size={32} />
               <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest mb-1">Total Dépenses</p>
               <h3 className="text-3xl font-black">{formatCurrency(totalExpenses)}</h3>
               <div className="mt-4 flex items-center gap-2 text-red-200 text-xs font-bold">
                 <TrendingUp size={14} className="rotate-180" />
                 <span>+4% ce mois</span>
               </div>
           </div>

           <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <h4 className="font-bold text-sm mb-4 flex items-center gap-2 text-gray-500">
               <Tag size={16} /> Catégories
             </h4>
             <div className="space-y-2">
               {['Loyers', 'Salaires', 'Stocks', 'Logistique', 'Autre'].map(cat => (
                 <div key={cat} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                   <span className="text-sm font-semibold text-gray-700">{cat}</span>
                   <span className="text-xs font-black text-gray-400">0 XOF</span>
                 </div>
               ))}
             </div>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <Calendar size={18} /> Historique Récent
              </h3>
              <div className="relative w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {expenses.map(expense => (
                <div key={expense.id} className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors group">
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                    <ArrowDownRight size={24} />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-gray-900">{expense.description}</h5>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{expense.categorie} • {formatDate(expense.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-red-600">{formatCurrency(expense.montant)}</p>
                  </div>
                  <button onClick={() => handleDelete(expense.id!)} className="p-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-gray-300">
                  <Wallet size={48} className="mb-2 opacity-20" />
                  <p className="font-bold">Aucune dépense enregistrée</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-red-50/30">
                <h3 className="text-xl font-black text-red-600">Nouvelle Dépense</h3>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X size={24} className="text-gray-400" />
                </button>
             </div>
             <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Description</label>
                    <input required type="text" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-bold" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Montant (XOF)</label>
                    <input required type="number" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-bold text-red-600" value={formData.montant} onChange={e => setFormData({...formData, montant: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Catégorie</label>
                    <select className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-bold" value={formData.categorie} onChange={e => setFormData({...formData, categorie: e.target.value})}>
                      <option>Loyers</option>
                      <option>Salaires</option>
                      <option>Stocks</option>
                      <option>Impôts</option>
                      <option>Marketing</option>
                      <option>Logistique</option>
                      <option>Autre</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-red-500 text-white rounded-2xl font-black shadow-xl shadow-red-500/20 flex items-center justify-center gap-3 active:scale-95 transition-transform">
                  <Save size={20} />
                  ENREGISTRER LA DÉPENSE
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
