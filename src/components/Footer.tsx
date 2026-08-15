import React from 'react';
import { LanguageCode } from '../types';
import { translations } from '../translations';

interface FooterProps {
  lang: LanguageCode;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <footer className="mt-16 border-t border-slate-800 bg-[#1E293B] text-slate-500 text-[11px] font-mono uppercase tracking-widest py-4 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="font-bold text-slate-300">© 2026 TUBEZIP PRO</span>
          <span>—</span>
          <span>BATCH CONVERTER & PACKAGER</span>
        </div>

        <div className="flex items-center gap-6">
          <span>DAILY CAP: OPTIMAL</span>
          <span className="hidden sm:inline">•</span>
          <span className="text-slate-400 font-bold">100% FREE ZIP BUNDLER</span>
        </div>
      </div>
    </footer>
  );
};
