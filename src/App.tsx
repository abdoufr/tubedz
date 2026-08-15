import React, { useState, useEffect } from 'react';
import { 
  LanguageCode, 
  PlaylistInfo, 
  PlaylistTrack, 
  ConversionOptions, 
  DownloadHistoryItem 
} from './types';
import { translations } from './translations';
import { fetchPlaylistInfo } from './services/youtubeService';
import { packagePlaylistToZip, downloadSingleTrack, triggerFileDownload } from './services/zipService';

import { Header } from './components/Header';
import { PlaylistForm } from './components/PlaylistForm';
import { TrackList } from './components/TrackList';
import { BatchDownloadModal } from './components/BatchDownloadModal';
import { PlayerModal } from './components/PlayerModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Footer } from './components/Footer';

import { AlertCircle, Youtube, ArrowDownCircle } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<LanguageCode>('ar');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [playlist, setPlaylist] = useState<PlaylistInfo | null>(null);
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);

  const [options, setOptions] = useState<ConversionOptions>({
    format: 'mp3',
    qualityAudio: '320k',
    qualityVideo: '720p',
    includePlaylistFile: true,
    includeReadme: true,
    addTrackNumbers: true,
    zipName: '',
  });

  // Modal States
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchProgress, setBatchProgress] = useState({
    currentTrackIndex: 0,
    totalTracks: 0,
    currentTrackTitle: '',
    trackPercent: 0,
    overallPercent: 0,
    statusText: '',
    zipStep: false,
    isComplete: false,
    downloadUrl: '',
    zipFileName: '',
    totalSizeMb: 0,
  });

  const [currentZipBlob, setCurrentZipBlob] = useState<Blob | null>(null);
  const [currentZipName, setCurrentZipName] = useState('');

  const [playerTrack, setPlayerTrack] = useState<PlaylistTrack | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);

  const t = translations[lang];

  // Load saved history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tubezip_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleFetchPlaylist = async (customUrl?: string) => {
    const targetUrl = customUrl || url;
    if (!targetUrl.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await fetchPlaylistInfo(targetUrl);
      setPlaylist(result);
      setTracks(result.tracks);
      setOptions((prev) => ({
        ...prev,
        zipName: result.title.replace(/[^a-zA-Z0-9_\s]/g, '_').slice(0, 30) || 'YouTube_Playlist',
      }));
    } catch (err) {
      console.error(err);
      setErrorMsg(t.errorFetching || 'تعذر جلب قائمة التشغيل، يرجى التأكد من الرابط.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTrack = (trackId: string) => {
    setTracks((prev) =>
      prev.map((tr) => (tr.id === trackId ? { ...tr, selected: !tr.selected } : tr))
    );
  };

  const handleSelectAll = () => {
    setTracks((prev) => prev.map((tr) => ({ ...tr, selected: true })));
  };

  const handleDeselectAll = () => {
    setTracks((prev) => prev.map((tr) => ({ ...tr, selected: false })));
  };

  // Start Batch ZIP Generation
  const handleStartZipDownload = async (selectedOnly = true) => {
    if (!playlist) return;

    const targets = selectedOnly ? tracks.filter((t) => t.selected) : tracks;
    if (targets.length === 0) return;

    setBatchModalOpen(true);
    setBatchProgress({
      currentTrackIndex: 0,
      totalTracks: targets.length,
      currentTrackTitle: targets[0].title,
      trackPercent: 0,
      overallPercent: 0,
      statusText: 'Initialisation de l\'encodage...',
      zipStep: false,
      isComplete: false,
      downloadUrl: '',
      zipFileName: '',
      totalSizeMb: 0,
    });

    try {
      const { zipBlob, zipFileName, totalSizeMb } = await packagePlaylistToZip(
        playlist,
        targets,
        options,
        (progressInfo) => {
          setBatchProgress((prev) => ({
            ...prev,
            ...progressInfo,
            isComplete: false,
          }));
        }
      );

      setCurrentZipBlob(zipBlob);
      setCurrentZipName(zipFileName);

      setBatchProgress((prev) => ({
        ...prev,
        isComplete: true,
        overallPercent: 100,
        trackPercent: 100,
        zipFileName,
        totalSizeMb,
      }));

      // Trigger instant automatic browser download
      triggerFileDownload(zipBlob, zipFileName);

      // Save to history
      const newHistoryItem: DownloadHistoryItem = {
        id: `hist_${Date.now()}`,
        playlistTitle: playlist.title,
        trackCount: targets.length,
        format: options.format,
        quality: options.format === 'mp4' ? options.qualityVideo : options.qualityAudio,
        totalSizeMb,
        timestamp: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        zipName: zipFileName,
        trackTitles: targets.map((t) => t.title),
      };

      setHistory((prev) => {
        const updated = [newHistoryItem, ...prev].slice(0, 20);
        try {
          localStorage.setItem('tubezip_history', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    } catch (err) {
      console.error('ZIP Packaging Error:', err);
      setBatchModalOpen(false);
      setErrorMsg('Une erreur est survenue lors de la création du fichier ZIP.');
    }
  };

  const handleManualTriggerDownload = () => {
    if (currentZipBlob && currentZipName) {
      triggerFileDownload(currentZipBlob, currentZipName);
    }
  };

  const handleSingleTrackDownload = (track: PlaylistTrack) => {
    downloadSingleTrack(track, options.format, options.qualityAudio, options.qualityVideo);
  };

  const handleReset = () => {
    setUrl('');
    setPlaylist(null);
    setTracks([]);
    setErrorMsg(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('tubezip_history');
    } catch {
      // ignore
    }
  };

  return (
    <div 
      className={`min-h-screen bg-[#0F172A] text-slate-100 font-sans flex flex-col justify-between selection:bg-red-600 selection:text-white ${
        lang === 'ar' ? 'font-arabic' : ''
      }`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div>
        {/* Header Bar */}
        <Header
          lang={lang}
          onSelectLang={setLang}
          historyCount={history.length}
          onOpenHistory={() => setHistoryOpen(true)}
          onReset={handleReset}
        />

        {/* Main Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12 space-y-8">
          {/* Hero Title Section */}
          <div className="w-full max-w-3xl mx-auto text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              {t.appSubtitle}
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
              {lang === 'ar' 
                ? 'ضع رابط أي قائمة تشغيل أو فيديو من يوتيوب، اختر الصيغة والجودة، واضغط على جلب القائمة لعرض مقاطع الفيديو وتحميلها مضغوطة في ملف ZIP.'
                : lang === 'fr'
                ? 'Collez l\'URL de votre playlist YouTube, choisissez le format et la qualité, puis récupérez vos vidéos.'
                : 'Paste your YouTube playlist URL, choose your format and quality, and fetch your videos.'}
            </p>
          </div>

          {/* Search Input & Options Form */}
          <PlaylistForm
            lang={lang}
            url={url}
            setUrl={setUrl}
            onFetch={() => handleFetchPlaylist()}
            isLoading={isLoading}
            options={options}
            setOptions={setOptions}
          />

          {/* Error Message */}
          {errorMsg && (
            <div className="w-full max-w-4xl mx-auto p-4 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-200 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Empty Prompt State when no playlist loaded */}
          {!playlist && !isLoading && (
            <div className="w-full max-w-3xl mx-auto my-12 p-8 sm:p-12 border-2 border-dashed border-slate-800 rounded-2xl bg-[#1E293B]/30 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <Youtube className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-200">
                  {lang === 'ar' ? 'ضع الرابط في الأعلى واضغط على جلب القائمة' : 'Collez un lien YouTube ci-dessus'}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {lang === 'ar'
                    ? 'سيتم استخراج جميع الفيديوهات والصوتيات مع عناوينها وصورها لتتمكن من تحميلها كملف ZIP واحد.'
                    : 'Toutes les pistes seront extraites automatiquement et téléchargeables en ZIP.'}
                </p>
              </div>
              <div className="pt-2 flex justify-center text-slate-500">
                <ArrowDownCircle className="w-5 h-5 animate-bounce text-red-500/80" />
              </div>
            </div>
          )}

          {/* Track List Queue */}
          {playlist && (
            <TrackList
              lang={lang}
              playlist={playlist}
              tracks={tracks}
              onToggleTrack={handleToggleTrack}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onStartZipDownload={handleStartZipDownload}
              onPreviewTrack={(tr) => setPlayerTrack(tr)}
              onSingleTrackDownload={handleSingleTrackDownload}
              options={options}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer lang={lang} />

      {/* Modals & Drawers */}
      <BatchDownloadModal
        lang={lang}
        isOpen={batchModalOpen}
        progress={batchProgress}
        onClose={() => setBatchModalOpen(false)}
        onTriggerDownload={handleManualTriggerDownload}
      />

      <PlayerModal
        lang={lang}
        track={playerTrack}
        onClose={() => setPlayerTrack(null)}
        onDownloadSingle={handleSingleTrackDownload}
      />

      <HistoryDrawer
        lang={lang}
        isOpen={historyOpen}
        history={history}
        onClose={() => setHistoryOpen(false)}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
