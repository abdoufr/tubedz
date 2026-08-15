import React from 'react';
import { 
  FolderArchive, 
  CheckCircle2, 
  Download, 
  X, 
  FileCheck,
  Disc3
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../translations';

interface BatchProgressState {
  currentTrackIndex: number;
  totalTracks: number;
  currentTrackTitle: string;
  trackPercent: number;
  overallPercent: number;
  statusText: string;
  zipStep: boolean;
  isComplete: boolean;
  downloadUrl?: string;
  zipFileName?: string;
  totalSizeMb?: number;
}

interface BatchDownloadModalProps {
  lang: LanguageCode;
  isOpen: boolean;
  progress: BatchProgressState;
  onClose: () => void;
  onTriggerDownload: () => void;
}

export const BatchDownloadModal: React.FC<BatchDownloadModalProps> = ({
  lang,
  isOpen,
  progress,
  onClose,
  onTriggerDownload,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              progress.isComplete 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-red-600/20 text-red-500 border border-red-500/30'
            }`}>
              {progress.isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <FolderArchive className="w-5 h-5 animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {progress.isComplete ? t.zipSuccessTitle : t.downloadingZipProgress}
              </h3>
              <p className="text-xs text-slate-400">
                {progress.isComplete 
                  ? t.zipSuccessDesc 
                  : `${progress.currentTrackIndex} / ${progress.totalTracks} pistes traitées`}
              </p>
            </div>
          </div>

          {progress.isComplete && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress State */}
        {!progress.isComplete ? (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                <span>Progression Globale Archive ZIP</span>
                <span className="text-red-500 font-mono text-sm">{progress.overallPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-[#0F172A] rounded-full overflow-hidden border border-slate-700/50">
                <div
                  className="h-full bg-red-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress.overallPercent}%` }}
                />
              </div>
            </div>

            {/* Current Processing Box */}
            <div className="bg-[#0F172A] border border-slate-700/60 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                <Disc3 className="w-4 h-4 text-red-500 animate-spin" />
                <span className="truncate">{progress.currentTrackTitle || t.convertingTrack}</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                  <span>{progress.statusText}</span>
                  <span>{progress.trackPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-200"
                    style={{ width: `${progress.trackPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Completion State */
          <div className="space-y-5 text-center">
            <div className="p-4 bg-[#0F172A] border border-emerald-500/30 rounded-xl space-y-1.5">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                <FileCheck className="w-4 h-4" />
                <span>{progress.zipFileName}</span>
              </div>
              <p className="text-xs text-slate-300">
                Taille de l'archive : <strong className="text-amber-400">{progress.totalSizeMb} MB</strong>
              </p>
            </div>

            <button
              onClick={onTriggerDownload}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2.5 text-sm transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Télécharger le Fichier ZIP Maintenant</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors"
            >
              {t.close}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
