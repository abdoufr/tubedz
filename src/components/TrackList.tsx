import React, { useState } from 'react';
import { 
  PlaylistInfo, 
  PlaylistTrack, 
  LanguageCode, 
  ConversionOptions 
} from '../types';
import { translations } from '../translations';
import { calculateFileSizeMb } from '../services/youtubeService';
import { 
  CheckSquare, 
  Square, 
  Search, 
  Play, 
  Download, 
  FolderArchive, 
  ExternalLink, 
  Clock, 
  Music2,
  Film
} from 'lucide-react';

interface TrackListProps {
  lang: LanguageCode;
  playlist: PlaylistInfo;
  tracks: PlaylistTrack[];
  onToggleTrack: (trackId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onStartZipDownload: (selectedOnly: boolean) => void;
  onPreviewTrack: (track: PlaylistTrack) => void;
  onSingleTrackDownload: (track: PlaylistTrack) => void;
  options: ConversionOptions;
}

export const TrackList: React.FC<TrackListProps> = ({
  lang,
  playlist,
  tracks,
  onToggleTrack,
  onSelectAll,
  onDeselectAll,
  onStartZipDownload,
  onPreviewTrack,
  onSingleTrackDownload,
  options,
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');

  const selectedTracks = tracks.filter((t) => t.selected);
  const selectedCount = selectedTracks.length;

  const filteredTracks = tracks.filter((tr) =>
    tr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tr.channel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSizeMb = selectedTracks.reduce((acc, tr) => {
    return acc + calculateFileSizeMb(tr.durationSeconds, options.format, options.qualityAudio, options.qualityVideo);
  }, 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Hero Playlist Banner */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 flex-1">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-[#0F172A] border border-slate-700 shadow">
            <img
              src={playlist.thumbnail}
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
              <span className="text-[10px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded">
                {playlist.itemCount} Pistes
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                {options.format === 'mp4' ? <Film className="w-3 h-3" /> : <Music2 className="w-3 h-3" />}
                {options.format.toUpperCase()} • {options.format === 'mp4' ? options.qualityVideo : options.qualityAudio}
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white truncate">
              {playlist.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span className="font-semibold text-slate-300">{playlist.channelTitle}</span>
              <span>•</span>
              <a
                href={playlist.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-red-400 hover:text-red-300 underline flex items-center gap-1 text-[11px]"
              >
                <span>Lien Youtube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>

        {/* CTA Button Box */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
          <div className="text-right text-xs text-slate-400 hidden md:block">
            <span>{t.totalEstimatedSize} </span>
            <span className="font-bold text-amber-400 font-mono">~{totalSizeMb.toFixed(1)} MB</span>
          </div>

          <button
            onClick={() => onStartZipDownload(true)}
            disabled={selectedCount === 0}
            className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-950/40 flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <FolderArchive className="w-5 h-5 text-white" />
            <span>
              {selectedCount === tracks.length
                ? t.downloadAllZip
                : `${t.downloadSelectedZip} (${selectedCount})`}
            </span>
          </button>
        </div>
      </div>

      {/* Main Track Queue Table Box */}
      <div className="bg-[#1E293B]/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Table Header Bar */}
        <div className="bg-slate-800/50 px-6 py-3 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={selectedCount === tracks.length ? onDeselectAll : onSelectAll}
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              {selectedCount === tracks.length ? (
                <>
                  <Square className="w-4 h-4 text-slate-500" />
                  <span>{t.deselectAll}</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4 text-red-500" />
                  <span>{t.selectAll}</span>
                </>
              )}
            </button>
            <span className="text-xs font-mono text-slate-400">
              <strong className="text-white">{selectedCount}</strong> / {tracks.length} Pistes
            </span>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchTracks}
              className="w-full pl-9 pr-3 py-1 bg-[#0F172A] border border-slate-700/80 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Tracks List */}
        <div className="p-4 space-y-2.5">
          {filteredTracks.map((track, idx) => {
            const estMb = calculateFileSizeMb(track.durationSeconds, options.format, options.qualityAudio, options.qualityVideo);

            return (
              <div
                key={track.id}
                className={`p-3.5 rounded-xl flex items-center justify-between gap-3 sm:gap-4 border transition-all ${
                  track.selected
                    ? 'bg-[#0F172A] border-slate-700/60 shadow-md'
                    : 'bg-[#0F172A]/40 border-slate-800/50 opacity-60 hover:opacity-100'
                }`}
              >
                {/* Checkbox & Track Number */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => onToggleTrack(track.id)}
                    className="p-1 hover:text-red-400 text-slate-400 transition-colors"
                  >
                    {track.selected ? (
                      <CheckSquare className="w-5 h-5 text-red-500" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-600" />
                    )}
                  </button>
                  <span className="text-xs font-mono text-slate-500 w-5 text-center">
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                </div>

                {/* Track Thumbnail */}
                <div 
                  onClick={() => onPreviewTrack(track)}
                  className="relative w-14 h-11 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-800 cursor-pointer group"
                >
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 text-white fill-white opacity-80 group-hover:opacity-100" />
                  </div>
                </div>

                {/* Track Details */}
                <div className="min-w-0 flex-1">
                  <h4 
                    onClick={() => onPreviewTrack(track)}
                    className="text-xs sm:text-sm font-semibold text-slate-200 hover:text-red-400 cursor-pointer truncate transition-colors"
                  >
                    {track.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="truncate">{track.channel}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {track.duration}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">~{estMb} MB</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onPreviewTrack(track)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title={t.previewTrack}
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSingleTrackDownload(track)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors"
                    title={t.downloadSingleTrack}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
