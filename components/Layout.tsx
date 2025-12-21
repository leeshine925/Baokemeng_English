
import React from 'react';
import { View, UserState } from '../types';
import { APP_THEME } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  userState: UserState;
  currentView: View;
  setView: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userState, currentView, setView }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl relative">
      {/* Header */}
      <header className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-white">P</div>
           <span className="font-bold text-gray-700">积分: {userState.points}</span>
        </div>
        <div className="text-xl font-bold italic" style={{ color: APP_THEME.primary }}>
          宝可梦英语
        </div>
        <button 
          onClick={() => setView('summary')}
          className="p-1 px-3 rounded-full border border-gray-200 text-xs font-bold hover:bg-gray-50"
        >
          学习报表
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Footer Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t flex justify-around p-3 z-10">
        <NavItem icon="🏠" label="首页" active={currentView === 'home'} onClick={() => setView('home')} />
        <NavItem icon="🛒" label="商城" active={currentView === 'store'} onClick={() => setView('store')} />
        <NavItem icon="🤝" label="集市" active={currentView === 'market'} onClick={() => setView('market')} />
        <NavItem icon="🎒" label="我的" active={currentView === 'collection'} onClick={() => setView('collection')} />
        <NavItem icon="✍️" label="错题" active={currentView === 'error-correction'} onClick={() => setView('error-correction')} />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ icon: string, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-green-600' : 'text-gray-400'}`}
  >
    <span className="text-2xl">{icon}</span>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default Layout;
