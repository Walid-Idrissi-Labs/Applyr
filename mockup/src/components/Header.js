import React from 'react';

export default function Header() {
  return (
    <header className="border-b-2 border-[#111] p-3 px-5 flex justify-between items-center shrink-0">
      <div className="font-bold opacity-0">Applyr</div> {/* Just for spacing alignment with mockup */}
      <div className="text-[12px] cursor-pointer hover:underline">Profil | Déconnexion</div>
    </header>
  );
}
