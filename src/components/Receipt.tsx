import React from 'react';
import { Sale, Product, ShopSettings } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { Printer, X, Download } from 'lucide-react';

interface ReceiptProps {
  sale: Sale;
  products: Product[];
  settings: ShopSettings;
  onClose: () => void;
}

export default function Receipt({ sale, products, settings, onClose }: ReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:p-0 print:bg-white print:relative print:z-0">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300 print:shadow-none print:rounded-none print:max-w-none print:h-auto">
        {/* Header - Hidden on Print */}
        <div className="px-8 py-6 bg-primary text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/20 rounded-xl">
                <Printer size={20} />
             </div>
             <h3 className="font-bold">Aperçu du Reçu</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Receipt Content */}
        <div id="receipt-content" className="p-10 flex-1 overflow-auto bg-white font-mono text-sm text-gray-800">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-xl font-black text-primary uppercase tracking-tighter">{settings.name}</h2>
            <p className="text-gray-500 font-medium">{settings.address}</p>
            <p className="text-gray-500 font-medium">Tél: {settings.phone}</p>
          </div>

          <div className="border-y border-dashed border-gray-200 py-4 mb-6 space-y-1">
            <div className="flex justify-between">
              <span className="font-bold">Reçu N°:</span>
              <span>{sale.id?.substring(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Date:</span>
              <span>{formatDate(sale.date)}</span>
            </div>
            {sale.clientId && (
              <div className="flex justify-between">
                <span className="font-bold">Client:</span>
                <span>{sale.clientId}</span>
              </div>
            )}
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="py-2 font-black uppercase text-[10px] text-gray-400">Désignation</th>
                <th className="py-2 text-center font-black uppercase text-[10px] text-gray-400">Qté</th>
                <th className="py-2 text-right font-black uppercase text-[10px] text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sale.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3">
                    <div className="font-bold">{item.nom || 'Produit inconnu'}</div>
                    <div className="text-[10px] text-gray-400">{formatCurrency(item.prix)} / unité</div>
                  </td>
                  <td className="py-3 text-center font-medium">x{item.quantite}</td>
                  <td className="py-3 text-right font-bold">{formatCurrency(item.prix * item.quantite)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-3 pt-4 border-t border-dashed border-gray-200">
            <div className="flex justify-between text-lg font-black">
              <span>TOTAL</span>
              <span className="text-primary">{formatCurrency(sale.total)}</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>Mode de paiement</span>
              <span className="uppercase">{sale.modePaiement}</span>
            </div>
          </div>

          <div className="mt-12 text-center space-y-4">
            <div className="w-full h-12 bg-gray-50 rounded-lg flex items-center justify-center">
               {/* Simplified Barcode representation */}
               <div className="flex gap-1 h-6">
                 {[...Array(20)].map((_, i) => (
                   <div key={i} className={`bg-gray-300 w-${Math.random() > 0.5 ? '1' : '0.5'}`} />
                 ))}
               </div>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Merci de votre confiance !</p>
          </div>
        </div>

        {/* Footer Actions - Hidden on Print */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4 print:hidden">
          <button 
            onClick={handlePrint}
            className="flex-1 bg-primary text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/10 hover:bg-primary/95 transition-all active:scale-95"
          >
            <Printer size={20} />
            Imprimer
          </button>
          <button className="bg-white text-gray-700 border border-gray-200 px-6 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-gray-100 transition-all">
            <Download size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
