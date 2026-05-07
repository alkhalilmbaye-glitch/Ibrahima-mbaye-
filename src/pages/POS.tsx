import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  ShoppingBag, 
  ShoppingCart,
  CreditCard, 
  User, 
  Tag,
  Scan,
  X,
  CheckCircle2,
  ChevronRight,
  Printer
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, increment, getDoc } from 'firebase/firestore';
import { cn, formatCurrency } from '../lib/utils';
import { Product, Sale, SaleItem, Category, PaymentMethod, OperationType } from '../types';
import { handleFirestoreError } from '../lib/errorHandling';

interface CartItem extends Product {
  quantity: number;
}

import Receipt from '../components/Receipt';
import { useSettings } from '../hooks/useSettings';

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "Tous">("Tous");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const { settings } = useSettings();

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

  useEffect(() => {
    let filtered = products;
    if (search) {
      filtered = filtered.filter(p => 
        p.nom.toLowerCase().includes(search.toLowerCase()) || 
        p.codeBarre?.includes(search)
      );
    }
    if (selectedCategory !== "Tous") {
      filtered = filtered.filter(p => p.categorie === selectedCategory);
    }
    setFilteredProducts(filtered);
  }, [search, selectedCategory, products]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, Math.min(item.quantity + delta, item.stock));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.prix * item.quantity), 0);
  const cartProfit = cart.reduce((acc, item) => acc + ((item.prix - item.prixAchat || 0) * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const sale: Sale = {
        items: cart.map(item => ({
          productId: item.id!,
          nom: item.nom,
          prix: item.prix,
          quantite: item.quantity,
          total: item.prix * item.quantity
        })),
        total: cartTotal,
        profit: cartProfit,
        date: new Date().toISOString(),
        modePaiement: paymentMethod
      };

      // Add Sale
      const saleRef = await addDoc(collection(db, 'sales'), sale);
      const FinalSale = { ...sale, id: saleRef.id };

      // Update Stock for each product
      for (const item of cart) {
        const productRef = doc(db, 'products', item.id!);
        await updateDoc(productRef, {
          stock: increment(-item.quantity),
          updatedAt: new Date().toISOString()
        });
      }

      setLastSale(FinalSale);
      setSuccess(true);
      setCart([]);
      // Don't close checkout automatically if success, let user click print
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'sales/products');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-12rem)] gap-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Product Selection */}
      <div className="flex-1 flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher un produit ou scanner..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-accent outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
          >
            <option value="Tous">Toutes les catégories</option>
            {Object.values(Category).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={cn(
                "group relative bg-white p-4 rounded-3xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl text-left overflow-hidden",
                product.stock <= 0 && "opacity-50 grayscale"
              )}
            >
              <div className="aspect-square bg-gray-50 rounded-2xl mb-4 overflow-hidden flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <ShoppingBag size={40} className="text-gray-200" />
                )}
                {product.stock <= 5 && product.stock > 0 && (
                  <div className="absolute top-6 right-6 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                    Stock Faible
                  </div>
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">{product.categorie}</p>
                <h4 className="font-bold text-gray-900 truncate mb-1">{product.nom}</h4>
                <div className="flex items-center justify-between">
                  <p className="text-accent font-black">{formatCurrency(product.prix)}</p>
                  <p className="text-xs text-gray-400 font-medium">{product.stock} dispo.</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors pointer-events-none" />
            </button>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
              <ShoppingBag size={18} />
            </div>
            <h3 className="font-bold">Panier</h3>
          </div>
          <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
            {cart.length} Articles
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length > 0 ? (
            cart.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.nom} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Tag size={24} className="text-gray-200" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start">
                    <h5 className="text-sm font-bold truncate pr-2">{item.nom}</h5>
                    <button onClick={() => removeFromCart(item.id!)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-gray-100 px-2 py-1 rounded-lg">
                      <button onClick={() => updateQuantity(item.id!, -1)} className="text-gray-500 hover:text-primary"><Minus size={14} /></button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id!, 1)} className="text-gray-500 hover:text-primary"><Plus size={14} /></button>
                    </div>
                    <p className="font-bold text-accent text-sm">{formatCurrency(item.prix * item.quantity)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale pt-20">
              <ShoppingCart size={64} className="mb-4" />
              <p className="font-bold text-lg">Votre panier est vide</p>
              <p className="text-sm">Commencez par ajouter des produits</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50/50 border-t border-gray-100 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500 font-medium">
              <span>Sous-total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-primary">
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(true)}
            disabled={cart.length === 0}
            className="w-full py-4 bg-primary hover:bg-primary/95 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-transform active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            Passer à la caisse
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {success ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-2">Vente Réussie !</h2>
                  <p className="text-gray-500 font-medium">Le stock a été mis à jour et la transaction enregistrée.</p>
                </div>
                
                <div className="flex flex-col w-full gap-3">
                  <button 
                    onClick={() => setShowReceipt(true)}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg"
                  >
                    <Printer size={20} />
                    Imprimer le Reçu
                  </button>
                  <button 
                    onClick={() => {
                      setSuccess(false);
                      setIsCheckoutOpen(false);
                    }}
                    className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold"
                  >
                    Nouvelle Vente
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="text-xl font-black text-primary">Finaliser la vente</h3>
                  <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <X size={24} className="text-gray-400" />
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-widest font-black text-gray-400">Mode de paiement</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[PaymentMethod.CASH, PaymentMethod.WAVE, PaymentMethod.ORANGE_MONEY].map(method => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200",
                            paymentMethod === method 
                              ? "border-accent bg-accent/5 text-accent shadow-md shadow-accent/10" 
                              : "border-gray-100 hover:border-gray-200 text-gray-400"
                          )}
                        >
                          <CreditCard size={20} />
                          <span className="text-[10px] font-bold uppercase">{method}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-3xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Total à payer</span>
                      <span className="text-2xl font-black text-primary">{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="h-px bg-gray-200" />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Nombre d'articles</span>
                      <span className="text-lg font-bold text-gray-700">{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={processing}
                    className="w-full py-5 bg-accent hover:bg-accent/90 text-white rounded-2xl font-black text-lg transition-all transform active:scale-95 disabled:opacity-50 shadow-xl shadow-accent/20 flex items-center justify-center gap-4"
                  >
                    {processing ? (
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>CONFIRMER LE PAIEMENT</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showReceipt && lastSale && (
        <Receipt 
          sale={{...lastSale, createdAt: lastSale.date} as any} 
          products={products} 
          settings={settings} 
          onClose={() => setShowReceipt(false)} 
        />
      )}
    </div>
  );
}
