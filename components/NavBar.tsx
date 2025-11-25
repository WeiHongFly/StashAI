import React from 'react';
import { Home, PlusCircle, List, User } from 'lucide-react';
import { ViewState } from '../types';

interface NavBarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentView, setView }) => {
  const navItemClass = (view: ViewState) =>
    `flex flex-col items-center justify-center w-full h-full space-y-1 ${
      currentView === view ? 'text-blue-500' : 'text-gray-400'
    }`;

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-20 bg-white/90 backdrop-blur-md border-t border-gray-200 pb-5">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        <button onClick={() => setView('home')} className={navItemClass('home')}>
          <Home size={24} strokeWidth={currentView === 'home' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        
        <button onClick={() => setView('add')} className={navItemClass('add')}>
          <div className="relative">
             <PlusCircle size={32} strokeWidth={currentView === 'add' ? 2.5 : 2} className={currentView === 'add' ? "fill-blue-100" : ""} />
          </div>
          <span className="text-[10px] font-medium">Add</span>
        </button>

        <button onClick={() => setView('inventory')} className={navItemClass('inventory')}>
          <List size={24} strokeWidth={currentView === 'inventory' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Items</span>
        </button>
      </div>
    </div>
  );
};

export default NavBar;
