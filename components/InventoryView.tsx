import React, { useState, useMemo } from 'react';
import { Search, MapPin, Calendar, Tag, ChevronRight } from 'lucide-react';
import { InventoryItem, Category } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
}

const InventoryView: React.FC<InventoryViewProps> = ({ inventory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchTerm, selectedCategory]);

  const categories = ['All', ...Object.values(Category)];

  return (
    <div className="flex flex-col h-full bg-[#F2F2F7] pb-24">
        
      {/* Header */}
      <div className="pt-12 pb-4 px-4 bg-white sticky top-0 z-10 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Items</h1>
        
        {/* Search */}
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Search items..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Search size={48} className="mb-2 opacity-20" />
                <p>No items found.</p>
            </div>
        ) : (
            <div className="space-y-3">
                {filteredItems.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 active:scale-[0.99] transition-transform">
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Tag size={20} />
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                            <div className="flex items-center text-xs text-gray-500 mt-1 gap-3">
                                <div className="flex items-center gap-1 truncate">
                                    <MapPin size={12} />
                                    <span>{item.location}</span>
                                </div>
                                {item.expiryDate && (
                                    <div className="flex items-center gap-1 text-orange-600 truncate">
                                        <Calendar size={12} />
                                        <span>{new Date(item.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit'})}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <ChevronRight size={16} className="text-gray-300" />
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default InventoryView;
