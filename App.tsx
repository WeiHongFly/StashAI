import React, { useState, useEffect } from 'react';
import { InventoryItem, ViewState, Category } from './types';
import NavBar from './components/NavBar';
import HomeView from './components/HomeView';
import InventoryView from './components/InventoryView';
import AddItemView from './components/AddItemView';

// Mock Data for Demo Purposes
const MOCK_DATA: InventoryItem[] = [
  {
    id: '1',
    name: 'Almond Milk',
    category: Category.Food,
    location: 'Fridge Top Shelf',
    addedDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 86400000 * 3).toISOString(), // Expires in 3 days
    imageUrl: 'https://picsum.photos/100/100',
  },
  {
    id: '2',
    name: 'AA Batteries',
    category: Category.Electronics,
    location: 'Living Room Drawer',
    addedDate: new Date().toISOString(),
    expiryDate: undefined,
    notes: 'Pack of 12'
  },
  {
    id: '3',
    name: 'Cough Syrup',
    category: Category.Medicine,
    location: 'Bathroom Cabinet',
    addedDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() - 86400000).toISOString(), // Expired yesterday
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('stashai_inventory');
    return saved ? JSON.parse(saved) : MOCK_DATA;
  });

  useEffect(() => {
    localStorage.setItem('stashai_inventory', JSON.stringify(inventory));
  }, [inventory]);

  const handleAddItem = (item: InventoryItem) => {
    setInventory(prev => [item, ...prev]);
    setCurrentView('inventory');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomeView inventory={inventory} onNavigateToInventory={() => setCurrentView('inventory')} />;
      case 'inventory':
        return <InventoryView inventory={inventory} />;
      case 'add':
        // Add View typically covers the whole screen or is a modal
        // Here we render it as a full page view, but without the navbar usually,
        // but for simplicity we keep layout consistent or hide navbar.
        return <AddItemView onSave={handleAddItem} onCancel={() => setCurrentView('home')} />;
      default:
        return <HomeView inventory={inventory} onNavigateToInventory={() => setCurrentView('inventory')} />;
    }
  };

  return (
    <div className="h-screen w-full bg-white relative overflow-hidden">
      
      {/* Main Content Area */}
      <div className="h-full w-full">
        {renderContent()}
      </div>

      {/* Navigation Bar - Hide on Add Screen for Modal feel */}
      {currentView !== 'add' && (
        <NavBar currentView={currentView} setView={setCurrentView} />
      )}
    </div>
  );
};

export default App;
