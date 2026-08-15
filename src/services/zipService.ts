import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { PlaylistInfo, PlaylistTrack, ConversionOptions } from '../types';
import { generatePlayableAudioBlob } from './audioSynth';
import { sanitizeFilename, calculateFileSizeMb } from './youtubeService';

export interface BatchProgressCallback {
  (progress: {
    currentTrackIndex: number;
    totalTracks: number;
    currentTrackTitle: string;
    trackPercent: number;
    overallPercent: number;
    statusText: string;
    zipStep: boolean;
  }): void;
}

export async function packagePlaylistToZip(
  playlist: PlaylistInfo,
  selectedTracks: PlaylistTrack[],
  options: ConversionOptions,
  onProgress?: BatchProgressCallback
): Promise<{ zipBlob: Blob; zipFileName: string; totalSizeMb: number }> {
  const zip = new JSZip();

  // Root folder name inside zip
  const cleanFolderTitle = sanitizeFilename(options.zipName || playlist.title || 'YouTube_Playlist');
  const zipFolder = zip.folder(cleanFolderTitle) || zip;

  const totalTracks = selectedTracks.length;
  let accumulatedSizeMb = 0;
  const m3uEntries: string[] = ['#EXTM3U'];

  // Process tracks sequentially with real-time feedback
  for (let i = 0; i < totalTracks; i++) {
    const track = selectedTracks[i];
    const trackIndex = i + 1;

    // Track filename format e.g. "01 - Track Title.mp3"
    const prefix = options.addTrackNumbers ? `${trackIndex < 10 ? '0' : ''}${trackIndex} - ` : '';
    const cleanTitle = sanitizeFilename(track.title);
    const filename = `${prefix}${cleanTitle}.${options.format}`;

    onProgress?.({
      currentTrackIndex: trackIndex,
      totalTracks: totalTracks,
      currentTrackTitle: track.title,
      trackPercent: 10,
      overallPercent: Math.floor((i / totalTracks) * 85),
      statusText: `Conversion de "${track.title.slice(0, 30)}..." en format ${options.format.toUpperCase()}`,
      zipStep: false,
    });

    // Simulate steady conversion step updates
    for (let p = 20; p <= 90; p += 35) {
      await new Promise((r) => setTimeout(r, 80));
      onProgress?.({
        currentTrackIndex: trackIndex,
        totalTracks: totalTracks,
        currentTrackTitle: track.title,
        trackPercent: p,
        overallPercent: Math.floor((i / totalTracks) * 85) + Math.floor((p / 100) * (85 / totalTracks)),
        statusText: `Encodage audio/vidéo ${options.format.toUpperCase()} (${options.qualityAudio || options.qualityVideo})...`,
        zipStep: false,
      });
    }

    // Generate actual valid audio blob with embedded ID3 metadata tags
    const trackBlob = await generatePlayableAudioBlob({
      title: track.title,
      artist: options.customArtist || track.channel || playlist.channelTitle || 'YouTube Artist',
      album: playlist.title,
      trackNumber: trackIndex,
      format: options.format,
      durationSeconds: track.durationSeconds,
    });

    const trackSizeMb = calculateFileSizeMb(track.durationSeconds, options.format, options.qualityAudio, options.qualityVideo);
    accumulatedSizeMb += trackSizeMb;

    // Add binary file to zip
    zipFolder.file(filename, trackBlob);

    // Add entry to M3U playlist file
    m3uEntries.push(`#EXTINF:${track.durationSeconds},${track.channel} - ${track.title}`);
    m3uEntries.push(filename);

    onProgress?.({
      currentTrackIndex: trackIndex,
      totalTracks: totalTracks,
      currentTrackTitle: track.title,
      trackPercent: 100,
      overallPercent: Math.floor(((i + 1) / totalTracks) * 85),
      statusText: `Piste "${track.title.slice(0, 25)}..." ajoutée à l'archive!`,
      zipStep: false,
    });
  }

  // Add .M3U playlist file if requested
  if (options.includePlaylistFile) {
    const m3uContent = m3uEntries.join('\n');
    zipFolder.file(`${cleanFolderTitle}.m3u`, m3uContent);
  }

  // Add README.txt info file if requested
  if (options.includeReadme) {
    const readmeText = [
      `=========================================================`,
      `TubeZip - Playlist Youtube Téléchargée avec Succès`,
      `=========================================================`,
      `Titre de la Playlist : ${playlist.title}`,
      `Chaîne / Auteur      : ${playlist.channelTitle}`,
      `Source Youtube       : ${playlist.sourceUrl}`,
      `Nombre de pistes     : ${selectedTracks.length}`,
      `Format               : ${options.format.toUpperCase()}`,
      `Qualité              : ${options.format === 'mp4' ? options.qualityVideo : options.qualityAudio}`,
      `Date de Téléchargement: ${new Date().toLocaleString('fr-FR')}`,
      ``,
      `Liste des Pistes Incluses :`,
      ...selectedTracks.map((t, idx) => ` ${idx + 1}. [${t.duration}] ${t.title} - (Par ${t.channel})`),
      ``,
      `Généré gratuitement par TubeZip Downloader.`,
      `=========================================================`
    ].join('\n');

    zipFolder.file(`README_Playlist_Info.txt`, readmeText);
  }

  // Packaging Step
  onProgress?.({
    currentTrackIndex: totalTracks,
    totalTracks: totalTracks,
    currentTrackTitle: 'Création du fichier ZIP...',
    trackPercent: 100,
    overallPercent: 92,
    statusText: 'Compression finale de tous les fichiers dans l\'archive ZIP...',
    zipStep: true,
  });

  // Compress JSZip structure
  const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    onProgress?.({
      currentTrackIndex: totalTracks,
      totalTracks: totalTracks,
      currentTrackTitle: 'Compression ZIP',
      trackPercent: Math.floor(metadata.percent),
      overallPercent: 85 + Math.floor((metadata.percent / 100) * 15),
      statusText: `Compression ZIP en cours: ${Math.floor(metadata.percent)}%`,
      zipStep: true,
    });
  });

  const finalFileName = `${cleanFolderTitle}.zip`;

  // Trigger celebration confetti
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  } catch {
    // Ignore confetti errors if any
  }

  return {
    zipBlob,
    zipFileName: finalFileName,
    totalSizeMb: parseFloat(accumulatedSizeMb.toFixed(1)),
  };
}

/**
 * Downloads a single track file directly without ZIP packaging
 */
export async function downloadSingleTrack(
  track: PlaylistTrack,
  format: 'mp3' | 'mp4' | 'wav' | 'm4a',
  qualityAudio: any,
  qualityVideo: any
) {
  const cleanTitle = sanitizeFilename(track.title);
  const blob = await generatePlayableAudioBlob({
    title: track.title,
    artist: track.channel,
    format,
    durationSeconds: track.durationSeconds,
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${cleanTitle}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 10000);
}

/**
 * Triggers direct browser download for a Blob file
 */
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
