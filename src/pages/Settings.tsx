import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Store, 
  Bell, 
  Shield, 
  Smartphone, 
  User, 
  Save,
  Printer,
  Cloud,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ShopSettings, OperationType } from '../types';
import { handleFirestoreError } from '../lib/errorHandling';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('boutique');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ShopSettings>({
    name: "AL KHALIL BUSINESS COMPAGNY",
    phone: "76 383 56 91",
    address: "Dakar, Sénégal",
    currency: "XOF"
  });

  const tabs = [
    { id: 'boutique', icon: <Store size={18} />, label: 'Boutique' },
    { id: 'securite', icon: <Shield size={18} />, label: 'Sécurité' },
    { id: 'notifications', icon: <Bell size={18} />, label: 'Alertes' },
    { id: 'imprimante', icon: <Printer size={18} />, label: 'Imprimante' },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as ShopSettings);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/general');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-primary">Paramètres</h1>
        <p className="text-gray-500">Personnalisez votre application et connectez vos périphériques.</p>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row h-[700px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50/50 border-r border-gray-100 p-6 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-bold text-sm",
                activeTab === tab.id 
                  ? "bg-white text-primary shadow-lg shadow-primary/5 scale-105" 
                  : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}

          <div className="mt-8 pt-8 border-t border-gray-200">
             <div className="p-4 bg-primary text-white rounded-2xl space-y-3">
                <Cloud size={24} className="opacity-50" />
                <p className="text-xs font-bold leading-tight">Synchronisation Cloud Active</p>
                <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                   <div className="h-full bg-accent w-3/4" />
                </div>
                <p className="text-[10px] text-white/60 font-medium">Dernière synchro: il y a 2 min</p>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-10 overflow-y-auto">
          {activeTab === 'boutique' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-6">
                <h3 className="font-black text-xl text-primary underline decoration-accent decoration-4 underline-offset-8">Informations Boutique</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nom de l'enseigne</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent font-bold" 
                      value={settings.name}
                      onChange={(e) => setSettings({...settings, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Téléphone Principal</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent font-bold" 
                      value={settings.phone}
                      onChange={(e) => setSettings({...settings, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Adresse</label>
                    <textarea 
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent font-bold resize-none h-24" 
                      value={settings.address}
                      onChange={(e) => setSettings({...settings, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>

               <div className="space-y-6">
                <h3 className="font-black text-xl text-primary underline decoration-accent decoration-4 underline-offset-8">Réseaux de Paiement</h3>
                <div className="space-y-4 pt-4">
                   {['Wave Sénégal', 'Orange Money'].map(p => (
                     <div key={p} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white rounded-xl shadow-sm" />
                           <span className="font-bold text-gray-700">{p}</span>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" className="sr-only peer" defaultChecked />
                           <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-accent after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'securite' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
               <div className="space-y-6">
                <h3 className="font-black text-xl text-primary underline decoration-accent decoration-4 underline-offset-8">Accès Administrateur</h3>
                <div className="space-y-4 pt-4">
                   <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-center gap-4">
                      <Shield className="text-primary flex-shrink-0" size={32} />
                      <div>
                        <p className="font-bold text-primary">Protection par code PIN</p>
                        <p className="text-xs text-blue-600/70 font-medium leading-relaxed">Activez un code PIN requis pour les opérations sensibles comme les remboursements ou la suppression de produits.</p>
                      </div>
                      <button className="ml-auto bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold">Activer</button>
                   </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto pt-10 border-t border-gray-100 flex items-center justify-between">
             <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
               <Smartphone size={14} /> Version 1.0.0 Stable
             </div>
             <button 
               onClick={handleSave}
               className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl transition-all active:scale-95 hover:bg-primary/95"
             >
               {saved ? <CheckCircle2 size={20} /> : <Save size={20} />}
               {saved ? 'Enregistré' : 'Sauvegarder les modifications'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
