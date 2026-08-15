import React from 'react';
import { FolderArchive, Languages, History, Radio } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  lang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  historyCount: number;
  onOpenHistory: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onSelectLang,
  historyCount,
  onOpenHistory,
  onReset,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-[#1E293B] border-b border-slate-800 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group shrink-0 select-none"
        >
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center font-black text-white text-lg shadow-md group-hover:bg-red-500 transition-colors">
            <FolderArchive className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Tube<span className="text-red-500">Zip</span>
            <span className="text-xs font-semibold text-slate-400 ml-1.5 uppercase tracking-wider hidden sm:inline">PRO</span>
          </span>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Server Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800 border border-slate-700/60 rounded-full text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Server Status: Optimal</span>
          </div>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors active:scale-95"
            title={t.history}
          >
            <History className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{t.history}</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-lg p-1 text-xs">
            <Languages className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <button
              onClick={() => onSelectLang('ar')}
              className={`px-2 py-0.5 rounded font-bold transition-all ${
                lang === 'ar' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              الدارجة
            </button>
            <button
              onClick={() => onSelectLang('fr')}
              className={`px-2 py-0.5 rounded font-bold transition-all ${
                lang === 'fr' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => onSelectLang('en')}
              className={`px-2 py-0.5 rounded font-bold transition-all ${
                lang === 'en' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
