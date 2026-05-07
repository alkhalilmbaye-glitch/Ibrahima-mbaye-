import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  Tag,
  Package,
  Layers,
  Camera,
  X,
  Save,
  Image as ImageIcon
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { cn, formatCurrency } from '../lib/utils';
import { Product, Category, OperationType } from '../types';
import { handleFirestoreError } from '../lib/errorHandling';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    nom: "",
    prix: 0,
    prixAchat: 0,
    stock: 0,
    stockMin: 5,
    categorie: Category.GENERAL,
    codeBarre: ""
  });

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pList: Product[] = [];
      snapshot.forEach(doc => {
        pList.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(pList);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        updatedAt: new Date().toISOString()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id!), data);
      } else {
        await addDoc(collection(db, 'products'), data);
      }
      
      closeModal();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      }
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        nom: "",
        prix: 0,
        prixAchat: 0,
        stock: 0,
        stockMin: 5,
        categorie: Category.GENERAL,
        codeBarre: ""
      });
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(p => 
    p.nom.toLowerCase().includes(search.toLowerCase()) || 
    p.codeBarre?.includes(search) ||
    p.categorie.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Produits</h1>
          <p className="text-gray-500">Gérez votre inventaire et vos catégories.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
          Ajouter un produit
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, catégorie ou code-barres..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-accent outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 italic">
                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase">Produit</th>
                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase">Catégorie</th>
                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase text-right">Prix</th>
                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase text-center">Stock</th>
                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.nom} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} className="text-gray-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{product.nom}</p>
                        <p className="text-xs text-gray-400 font-medium">Ref: {product.codeBarre || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                      {product.categorie}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-primary">{formatCurrency(product.prix)}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Marge: {formatCurrency(product.prix - product.prixAchat)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          product.stock <= product.stockMin ? "bg-red-500 animate-pulse" : "bg-green-500"
                        )} />
                        <span className={cn(
                          "font-bold text-sm",
                          product.stock <= product.stockMin ? "text-red-500" : "text-gray-700"
                        )}>
                          {product.stock}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openModal(product)}
                        className="p-2 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id!)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <Package size={64} className="mb-4 opacity-20" />
              <p className="font-bold">Aucun produit trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-primary">
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </h3>
                <p className="text-xs text-gray-500 font-medium tracking-wide">Remplissez les informations ci-dessous</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nom du produit</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-accent outline-none font-bold"
                      value={formData.nom}
                      onChange={e => setFormData({...formData, nom: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Catégorie</label>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-accent outline-none font-bold"
                      value={formData.categorie}
                      onChange={e => setFormData({...formData, categorie: e.target.value as any})}
                    >
                      {Object.values(Category).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Prix d'Achat (XOF)</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-accent outline-none font-bold text-red-600"
                      value={formData.prixAchat}
                      onChange={e => setFormData({...formData, prixAchat: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Prix de Vente (XOF)</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-accent outline-none font-bold text-green-600"
                      value={formData.prix}
                      onChange={e => setFormData({...formData, prix: Number(e.target.value)})}
                    />
                  </div>
                </div>

                {/* Inventory & Image */}
                <div className="space-y-4">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Code-barres</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-accent outline-none font-bold"
                        value={formData.codeBarre}
                        onChange={e => setFormData({...formData, codeBarre: e.target.value})}
                      />
                      <button type="button" className="p-3 bg-primary text-white rounded-2xl hover:bg-primary/95">
                        <Camera size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Stock Initial</label>
                      <input 
                        required
                        type="number" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-accent outline-none font-bold"
                        value={formData.stock}
                        onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Alerte Stock</label>
                      <input 
                        required
                        type="number" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-accent outline-none font-bold"
                        value={formData.stockMin}
                        onChange={e => setFormData({...formData, stockMin: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">URL Image (Optionnel)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="https://..."
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-accent outline-none font-bold"
                        value={formData.image}
                        onChange={e => setFormData({...formData, image: e.target.value})}
                      />
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100">
                        {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-300" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 px-6 bg-primary hover:bg-primary/95 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                  <Save size={20} />
                  Enregistrer le produit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
