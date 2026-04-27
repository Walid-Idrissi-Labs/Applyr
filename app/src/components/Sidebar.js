import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, unreadNotifs }) {
  return (
    <aside className="w-40 border-r border-[#111] p-4 shrink-0 flex flex-col">
      <div className="font-bold text-[18px] tracking-widest mb-8">Applyr</div>
      <nav className="flex flex-col gap-1 flex-1">
        {['Dashboard', 'Candidatures', 'Notifications', 'Profil'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-left py-1.5 px-2 border-b border-gray-200 hover:bg-gray-50 flex justify-between items-center ${activeTab === tab ? 'font-bold border-l-4 border-l-[#111] pl-3' : ''}`}
          >
            <span>{tab}</span>
            {tab === 'Notifications' && unreadNotifs > 0 && (
              <span className="bg-[#111] text-white text-[10px] px-1.5 py-0.5 leading-none font-bold">{unreadNotifs}</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
