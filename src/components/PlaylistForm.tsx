import React, { useState } from 'react';
import { 
  Search, 
  Music, 
  Video, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  Link as LinkIcon 
} from 'lucide-react';
import { LanguageCode, QualityAudio, QualityVideo, ConversionOptions } from '../types';
import { translations } from '../translations';

interface PlaylistFormProps {
  lang: LanguageCode;
  url: string;
  setUrl: (url: string) => void;
  onFetch: () => void;
  isLoading: boolean;
  options: ConversionOptions;
  setOptions: React.Dispatch<React.SetStateAction<ConversionOptions>>;
}

export const PlaylistForm: React.FC<PlaylistFormProps> = ({
  lang,
  url,
  setUrl,
  onFetch,
  isLoading,
  options,
  setOptions,
}) => {
  const t = translations[lang];
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onFetch();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch {
      // Clipboard access fallback
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Big URL Search Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
              <LinkIcon className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="w-full bg-[#1E293B] border border-slate-700 rounded-xl py-4 sm:py-5 pl-12 pr-20 text-base sm:text-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 shadow-inner transition-all"
            />
            {url ? (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="absolute inset-y-0 right-3 my-auto px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700"
              >
                Effacer
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaste}
                className="absolute inset-y-0 right-3 my-auto px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              >
                Coller
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="px-8 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl py-4 sm:py-5 flex items-center justify-center gap-2.5 transition-colors shadow-lg shadow-red-950/40 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 text-base"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t.fetching}</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>{t.fetchPlaylistBtn}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Radio Format Selection & Settings Controls Bar */}
      <div className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
        {/* Format Radios */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Audio MP3 Radio */}
          <label 
            onClick={() => setOptions((prev) => ({ ...prev, format: 'mp3' }))}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-colors ${
              options.format !== 'mp4' ? 'border-red-500 bg-red-500' : 'border-slate-600 bg-slate-800 group-hover:border-slate-500'
            }`}>
              {options.format !== 'mp4' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <span className="text-sm font-semibold text-slate-300 group-hover:text-white flex items-center gap-1.5">
              <Music className="w-4 h-4 text-slate-400" />
              <span>Audio (MP3)</span>
            </span>
          </label>

          {/* Video MP4 Radio */}
          <label 
            onClick={() => setOptions((prev) => ({ ...prev, format: 'mp4' }))}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-colors ${
              options.format === 'mp4' ? 'border-red-500 bg-red-500' : 'border-slate-600 bg-slate-800 group-hover:border-slate-500'
            }`}>
              {options.format === 'mp4' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <span className="text-sm font-semibold text-slate-300 group-hover:text-white flex items-center gap-1.5">
              <Video className="w-4 h-4 text-slate-400" />
              <span>Vidéo (MP4)</span>
            </span>
          </label>
        </div>

        {/* Quality Select & ZIP Options Drawer Toggle */}
        <div className="flex items-center gap-3">
          {options.format === 'mp4' ? (
            <select
              value={options.qualityVideo}
              onChange={(e) => setOptions((prev) => ({ ...prev, qualityVideo: e.target.value as QualityVideo }))}
              className="bg-[#0F172A] border border-slate-700 rounded-lg py-2 px-3 text-xs font-bold text-slate-200 focus:outline-none focus:border-red-500"
            >
              <option value="1080p">1080p Full HD</option>
              <option value="720p">720p HD</option>
              <option value="480p">480p SD</option>
              <option value="360p">360p Mobile</option>
            </select>
          ) : (
            <select
              value={options.qualityAudio}
              onChange={(e) => setOptions((prev) => ({ ...prev, qualityAudio: e.target.value as QualityAudio }))}
              className="bg-[#0F172A] border border-slate-700 rounded-lg py-2 px-3 text-xs font-bold text-slate-200 focus:outline-none focus:border-red-500"
            >
              <option value="320k">320 kbps (High Quality)</option>
              <option value="256k">256 kbps (Medium)</option>
              <option value="192k">192 kbps (Standard)</option>
              <option value="128k">128 kbps (Compact)</option>
            </select>
          )}

          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.options}</span>
            {showOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Advanced ZIP Customization Drawer */}
      {showOptions && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 space-y-3 shadow-2xl animate-fadeIn">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
              {t.zipFileName}
            </label>
            <div className="relative max-w-md">
              <input
                type="text"
                value={options.zipName}
                onChange={(e) => setOptions((prev) => ({ ...prev, zipName: e.target.value }))}
                placeholder="YouTube_Playlist_Export"
                className="w-full bg-[#1E293B] border border-slate-700 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">.zip</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.addTrackNumbers}
                onChange={(e) => setOptions((prev) => ({ ...prev, addTrackNumbers: e.target.checked }))}
                className="w-4 h-4 rounded bg-[#1E293B] border-slate-700 text-red-600 focus:ring-red-500"
              />
              <span>{t.addTrackNumbers}</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.includePlaylistFile}
                onChange={(e) => setOptions((prev) => ({ ...prev, includePlaylistFile: e.target.checked }))}
                className="w-4 h-4 rounded bg-[#1E293B] border-slate-700 text-red-600 focus:ring-red-500"
              />
              <span>{t.includeM3u}</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.includeReadme}
                onChange={(e) => setOptions((prev) => ({ ...prev, includeReadme: e.target.checked }))}
                className="w-4 h-4 rounded bg-[#1E293B] border-slate-700 text-red-600 focus:ring-red-500"
              />
              <span>{t.includeReadme}</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
