
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
  // 闯关模式或抽奖结果页面隐藏导航栏，提供完整显示空间
  const hideNav = currentView === 'quiz' || currentView === 'draw-result';

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl relative overflow-hidden">
      {/* Header */}
      <header className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-40">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-white shadow-sm">P</div>
           <span className="font-bold text-gray-700">积分: {userState.points}</span>
        </div>
        <div className="text-xl font-black italic tracking-tighter" style={{ color: APP_THEME.primary }}>
          宝可梦英语
        </div>
        <button 
          onClick={() => setView('summary')}
          className="p-1 px-3 rounded-full border border-gray-200 text-xs font-bold hover:bg-gray-50 transition-colors"
        >
          学习报表
        </button>
      </header>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col overflow-hidden ${hideNav ? 'pb-0' : 'pb-20'}`}>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Footer Navigation */}
      {!hideNav && (
        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t flex justify-around p-2 pb-4 z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          <NavItem icon="🏠" label="首页" active={currentView === 'home'} onClick={() => setView('home')} />
          <NavItem icon="🛒" label="商城" active={currentView === 'store'} onClick={() => setView('store')} />
          <NavItem icon="🤝" label="集市" active={currentView === 'market'} onClick={() => setView('market')} />
          <NavItem icon="🎒" label="我的" active={currentView === 'collection'} onClick={() => setView('collection')} />
          <NavItem icon="✍️" label="错题" active={currentView === 'error-correction'} onClick={() => setView('error-correction')} />
        </nav>
      )}
    </div>
  );
};

const NavItem: React.FC<{ icon: string, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 ${active ? 'text-green-600 scale-105' : 'text-gray-400 opacity-70'}`}
  >
    <span className="text-2xl">{icon}</span>
    <span className="text-[10px] font-black">{label}</span>
  </button>
);

export default Layout;
