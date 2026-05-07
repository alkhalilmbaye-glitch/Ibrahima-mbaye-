import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit, orderBy, onSnapshot } from 'firebase/firestore';
import { formatCurrency, cn, formatDate } from '../lib/utils';
import { Sale, Product, Expense } from '../types';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isUp: boolean };
  color: "blue" | "orange" | "green" | "red";
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  }[color];

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl", colorClasses)}>
          {icon}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trend.isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          )}>
            {trend.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend.value}%
          </div>
        )}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );
}

import { useSettings } from '../hooks/useSettings';
import Receipt from '../components/Receipt';

export default function Dashboard() {
  const [stats, setStats] = useState({
    ventesJour: 0,
    produitsEnStock: 0,
    beneficesJour: 0,
    depensesJour: 0,
    ruptureStock: 0
  });

  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    // Real-time listener for products to alert stock
    const qProducts = query(collection(db, 'products'));
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      let count = 0;
      let lowStock = 0;
      snapshot.forEach(doc => {
        const p = doc.data() as Product;
        count++;
        if (p.stock <= p.stockMin) lowStock++;
      });
      setStats(prev => ({ ...prev, produitsEnStock: count, ruptureStock: lowStock }));
    });

    // Real-time listener for today's sales
    const today = startOfDay(new Date());
    const qSales = query(
      collection(db, 'sales'),
      where('date', '>=', today.toISOString()),
      orderBy('date', 'desc')
    );

    const unsubscribeSales = onSnapshot(qSales, (snapshot) => {
      let total = 0;
      let profit = 0;
      const sales: Sale[] = [];
      snapshot.forEach(doc => {
        const s = { id: doc.id, ...doc.data() } as Sale;
        total += s.total;
        profit += s.profit;
        sales.push(s);
      });
      setStats(prev => ({ ...prev, ventesJour: total, beneficesJour: profit }));
      setRecentSales(sales.slice(0, 5));
    });

    // Mock data for chart - in real app we'd fetch last 7 days
    setChartData([
      { name: 'Lun', sales: 42000, profit: 12000 },
      { name: 'Mar', sales: 38000, profit: 10500 },
      { name: 'Mer', sales: 55000, profit: 15000 },
      { name: 'Jeu', sales: 48000, profit: 13200 },
      { name: 'Ven', sales: 62000, profit: 18500 },
      { name: 'Sam', sales: 75000, profit: 22000 },
      { name: 'Dim', sales: 31000, profit: 8500 },
    ]);

    return () => {
      unsubscribeProducts();
      unsubscribeSales();
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Vue d'ensemble</h1>
          <p className="text-gray-500">Bon retour ! Voici ce qui se passe dans votre boutique aujourd'hui.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm text-sm font-medium">
            {format(new Date(), 'dd MMMM yyyy', { locale: fr })}
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ventes du jour" 
          value={formatCurrency(stats.ventesJour)} 
          icon={<ShoppingCart size={24} />}
          trend={{ value: 12, isUp: true }}
          color="blue"
        />
        <StatCard 
          title="Bénéfices" 
          value={formatCurrency(stats.beneficesJour)} 
          icon={<TrendingUp size={24} />}
          trend={{ value: 8, isUp: true }}
          color="green"
        />
        <StatCard 
          title="Stocks" 
          value={`${stats.produitsEnStock} Produits`} 
          icon={<Package size={24} />}
          color="orange"
        />
        <StatCard 
          title="Alertes Stock" 
          value={stats.ruptureStock} 
          icon={<AlertTriangle size={24} />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Activité des 7 derniers jours</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-500 font-medium">Ventes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500 font-medium">Profit</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  hide 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-6">Dernières Ventes</h3>
          <div className="space-y-4 flex-1">
            {recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <button 
                  key={sale.id} 
                  onClick={() => setSelectedSale(sale)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                    sale.modePaiement === 'Wave' ? "bg-blue-100 text-blue-600" :
                    sale.modePaiement === 'Orange Money' ? "bg-orange-100 text-orange-600" :
                    "bg-green-100 text-green-600"
                  )}>
                    {sale.modePaiement[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {sale.items.length} {sale.items.length > 1 ? 'Articles' : 'Article'}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase truncate">
                      {formatDate(sale.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-primary">{formatCurrency(sale.total)}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center py-10">
                <ShoppingCart size={40} className="mb-2 opacity-20" />
                <p className="text-sm">Aucune vente récente</p>
              </div>
            )}
          </div>
          <button className="mt-6 w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-2xl transition-colors text-sm">
            Voir tout l'historique
          </button>
        </div>
      </div>
      
      {selectedSale && (
        <Receipt 
          sale={{...selectedSale, createdAt: selectedSale.date} as any}
          products={[]} 
          settings={settings}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  );
}
