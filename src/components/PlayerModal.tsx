import React from 'react';
import { X, ExternalLink, Clock, User, Download, Music2 } from 'lucide-react';
import { PlaylistTrack, LanguageCode } from '../types';
import { translations } from '../translations';

interface PlayerModalProps {
  lang: LanguageCode;
  track: PlaylistTrack | null;
  onClose: () => void;
  onDownloadSingle: (track: PlaylistTrack) => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  lang,
  track,
  onClose,
  onDownloadSingle,
}) => {
  const t = translations[lang];

  if (!track) return null;

  // Determine YouTube Embed URL
  const embedUrl = track.videoId && track.videoId.length === 11
    ? `https://www.youtube-nocookie.com/embed/${track.videoId}?autoplay=1&enablejsapi=1`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
              {track.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{track.channel}</span>
              <span>•</span>
              <span className="font-mono text-slate-400">{track.duration}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Audio Embed Area */}
        <div className="relative aspect-video bg-black w-full flex items-center justify-center overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={track.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shadow-xl">
                <Music2 className="w-10 h-10 animate-bounce" />
              </div>
              <h4 className="text-white font-bold text-base">{track.title}</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Aperçu audio prêt. Cliquez ci-dessous pour télécharger cette piste directement.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <a
            href={`https://www.youtube.com/watch?v=${track.videoId}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <span>Ouvrir sur Youtube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => {
              onDownloadSingle(track);
              onClose();
            }}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadSingleTrack}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
