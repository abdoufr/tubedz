export type FormatType = 'mp3' | 'mp4' | 'm4a' | 'wav';

export type QualityAudio = '320k' | '256k' | '192k' | '128k';
export type QualityVideo = '1080p' | '720p' | '480p' | '360p';

export interface PlaylistTrack {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string; // e.g. "3:45"
  durationSeconds: number;
  publishedAt?: string;
  selected: boolean;
  status?: 'idle' | 'converting' | 'downloading' | 'completed' | 'error';
  progress?: number;
  fileSizeEstimateMb?: number;
}

export interface PlaylistInfo {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnail: string;
  itemCount: number;
  tracks: PlaylistTrack[];
  sourceUrl: string;
}

export interface ConversionOptions {
  format: FormatType;
  qualityAudio: QualityAudio;
  qualityVideo: QualityVideo;
  includePlaylistFile: boolean; // .m3u
  includeReadme: boolean;
  addTrackNumbers: boolean; // 01 - Title.mp3
  zipName: string;
  customArtist?: string;
}

export interface DownloadHistoryItem {
  id: string;
  playlistTitle: string;
  trackCount: number;
  format: FormatType;
  quality: string;
  totalSizeMb: number;
  timestamp: string;
  zipName: string;
  trackTitles: string[];
}

export type LanguageCode = 'ar' | 'fr' | 'en';
