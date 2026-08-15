import React from 'react';
import { X, History, Trash2, FolderArchive, Clock } from 'lucide-react';
import { DownloadHistoryItem, LanguageCode } from '../types';
import { translations } from '../translations';

interface HistoryDrawerProps {
  lang: LanguageCode;
  isOpen: boolean;
  history: DownloadHistoryItem[];
  onClose: () => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  lang,
  isOpen,
  history,
  onClose,
  onClearHistory,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#1E293B] border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800 text-amber-400 border border-slate-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.history}</h3>
              <p className="text-xs text-slate-400">{history.length} archives enregistrées</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
              <FolderArchive className="w-10 h-10 text-slate-700" />
              <p className="text-xs font-medium">{t.noHistory}</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-[#0F172A] border border-slate-700/60 rounded-xl space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-100 line-clamp-2">
                    {item.playlistTitle}
                  </h4>
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase bg-red-950/80 text-red-400 border border-red-800/50 rounded shrink-0">
                    {item.format.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {item.timestamp}
                  </span>
                  <span className="font-bold text-amber-400">
                    {item.trackCount} Pistes (~{item.totalSizeMb} MB)
                  </span>
                </div>

                <div className="text-[10px] font-mono text-slate-400 truncate bg-slate-900/90 px-2 py-1 rounded border border-slate-800">
                  📦 {item.zipName}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 bg-[#0F172A] border-t border-slate-800">
            <button
              onClick={onClearHistory}
              className="w-full py-2 bg-slate-800 hover:bg-rose-900/50 border border-slate-700 text-slate-300 hover:text-rose-300 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearHistory}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
