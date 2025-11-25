import React, { useState } from 'react';
import { Search, Sparkles, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { InventoryItem } from '../types';
import { askInventoryAssistant } from '../services/geminiService';

interface HomeViewProps {
  inventory: InventoryItem[];
  onNavigateToInventory: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ inventory, onNavigateToInventory }) => {
  const [query, setQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const expiringItems = inventory.filter(item => {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= -30; // Expiring in next 7 days or expired recently
  }).sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsAsking(true);
    setAnswer(null);
    const response = await askInventoryAssistant(query, inventory);
    setAnswer(response);
    setIsAsking(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2F7] overflow-y-auto pb-24">
      
      {/* Hero Header */}
      <div className="pt-14 pb-6 px-6 bg-white rounded-b-3xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">StashAI</h1>
        <p className="text-gray-500 text-sm mb-6">Your intelligent home organizer.</p>

        {/* AI Search Bar */}
        <form onSubmit={handleAsk} className="relative shadow-sm">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Where are my batteries?"
            className="w-full pl-11 pr-12 py-4 rounded-2xl bg-gray-100 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
          <button 
            type="submit"
            disabled={isAsking || !query}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-500 rounded-xl text-white disabled:opacity-50"
          >
            {isAsking ? <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight size={16} />}
          </button>
        </form>

        {/* AI Answer Card */}
        {answer && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-2">
                    <Sparkles className="text-blue-600 mt-1 shrink-0" size={16} />
                    <p className="text-blue-900 text-sm leading-relaxed">{answer}</p>
                </div>
            </div>
        )}
      </div>

      {/* Expiring Soon Section */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3 px-2">
             <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Clock size={20} className="text-orange-500"/>
                Expiring Soon
            </h2>
            {expiringItems.length > 0 && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold">{expiringItems.length}</span>}
        </div>
       
        {expiringItems.length === 0 ? (
            <div className="p-6 text-center text-gray-400 bg-white rounded-2xl shadow-sm">
                <p>No items expiring soon. You're good!</p>
            </div>
        ) : (
             <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {expiringItems.map(item => {
                    const expiry = new Date(item.expiryDate!);
                    const today = new Date();
                    const isExpired = expiry < today;
                    return (
                        <div key={item.id} className="min-w-[160px] p-4 bg-white rounded-2xl shadow-sm flex flex-col border border-gray-100 relative overflow-hidden">
                             {isExpired && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg">Expired</div>}
                             <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-3 text-orange-600">
                                {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover rounded-full" alt="" /> : <AlertTriangle size={20} />}
                             </div>
                             <span className="font-semibold text-gray-900 truncate">{item.name}</span>
                             <span className="text-xs text-gray-500 truncate mb-2">{item.location}</span>
                             <span className={`text-xs font-medium ${isExpired ? 'text-red-500' : 'text-orange-500'}`}>
                                {expiry.toLocaleDateString()}
                             </span>
                        </div>
                    );
                })}
            </div>
        )}
      </div>

       {/* Quick Stats / Categories Teaser */}
       <div className="mt-2 px-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3 px-2">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
                <button onClick={onNavigateToInventory} className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-left active:scale-95 transition-transform">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2 text-purple-600">
                        <Search size={20}/>
                    </div>
                    <span className="font-semibold text-gray-900 block">Browse All</span>
                    <span className="text-xs text-gray-500">View full inventory</span>
                </button>
                 <button className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-left active:scale-95 transition-transform">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2 text-green-600">
                        <Clock size={20}/>
                    </div>
                    <span className="font-semibold text-gray-900 block">History</span>
                    <span className="text-xs text-gray-500">Recent changes</span>
                </button>
            </div>
       </div>

    </div>
  );
};

export default HomeView;
