import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Filter, 
  FileText, 
  Table as TableIcon,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { db } from '../lib/firebase';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { formatCurrency, cn } from '../lib/utils';
import { Sale, Category } from '../types';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

const COLORS = ['#0A2E73', '#FF7A00', '#22C55E', '#EF4444', '#8B5CF6', '#F59E0B'];

export default function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [timeRange, setTimeRange] = useState('Ce mois');
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    const fetchSales = async () => {
      const q = query(collection(db, 'sales'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const sList: Sale[] = [];
      snapshot.forEach(doc => {
        sList.push({ id: doc.id, ...doc.data() } as Sale);
      });
      setSales(sList);

      // Process monthly data (mocked for simplicity in UI)
      setMonthlyData([
        { name: 'Jan', total: 1200000, profit: 450000 },
        { name: 'Fév', total: 1500000, profit: 520000 },
        { name: 'Mar', total: 1100000, profit: 380000 },
        { name: 'Avr', total: 1800000, profit: 610000 },
        { name: 'Mai', total: 2100000, profit: 750000 },
      ]);

      // Process category data
      setCategoryData([
        { name: 'Alimentation', value: 45 },
        { name: 'Électronique', value: 25 },
        { name: 'Beauté', value: 15 },
        { name: 'Boissons', value: 15 },
      ]);
    };

    fetchSales();
  }, []);

  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const totalProfit = sales.reduce((acc, s) => acc + s.profit, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Rapports & Analyses</h1>
          <p className="text-gray-500">Visualisez la performance de votre entreprise.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white border border-gray-100 p-3 rounded-xl hover:bg-gray-50 text-gray-500">
             <Calendar size={20} />
          </button>
          <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-transform active:scale-95">
            <Download size={20} />
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <BarChart3 size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Revenu Total</p>
                <h3 className="text-2xl font-black text-primary">{formatCurrency(totalRevenue)}</h3>
              </div>
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full w-fit">
              <ArrowUpRight size={14} /> +15.5% vs mois dernier
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16" />
           <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 bg-orange-50 text-accent rounded-2xl flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Bénéfice Net</p>
                <h3 className="text-2xl font-black text-primary">{formatCurrency(totalProfit)}</h3>
              </div>
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full w-fit relative z-10">
              <ArrowUpRight size={14} /> +8.2% vs mois dernier
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Panier Moyen</p>
                <h3 className="text-2xl font-black text-primary">{formatCurrency(sales.length ? totalRevenue / sales.length : 0)}</h3>
              </div>
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full w-fit">
              <ArrowDownRight size={14} /> -2.1% vs mois dernier
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Graph */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-xl text-primary">Performance Mensuelle</h3>
              <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-500 outline-none">
                <option>Année 2026</option>
                <option>Année 2025</option>
              </select>
           </div>
           <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} tickFormatter={(v) => `${v/1000000}M`} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="total" fill="#0A2E73" radius={[8, 8, 0, 0]} barSize={20} />
                  <Bar dataKey="profit" fill="#FF7A00" radius={[8, 8, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Categories Pie */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
           <h3 className="font-bold text-xl text-primary mb-8">Répartition par Catégorie</h3>
           <div className="flex flex-col md:flex-row items-center h-full">
              <div className="h-[300px] w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-4 py-8">
                 {categoryData.map((cat, i) => (
                   <div key={cat.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                        <span className="font-bold text-sm text-gray-700">{cat.name}</span>
                      </div>
                      <span className="font-black text-gray-900">{cat.value}%</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Recent Activity Mini-table */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden mb-12">
        <div className="p-8 border-b border-gray-50">
           <h3 className="font-bold text-xl text-primary">Ventes Récentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead>
               <tr className="bg-gray-50/50">
                 <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-gray-400">ID</th>
                 <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-gray-400">Date</th>
                 <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-gray-400">Paiement</th>
                 <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-gray-400 text-right">Total</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
               {sales.slice(0, 5).map(sale => (
                 <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                       <span className="font-mono text-xs font-bold text-gray-400">#{sale.id?.slice(-6)}</span>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-sm font-bold text-gray-700">{format(new Date(sale.date), 'dd/MM/yyyy HH:mm')}</span>
                    </td>
                    <td className="px-8 py-5">
                       <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider",
                          sale.modePaiement === 'Wave' ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                       )}>
                          {sale.modePaiement}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-primary">
                       {formatCurrency(sale.total)}
                    </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
