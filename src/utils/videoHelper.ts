// Video helper for extracting embeddable URLs from YouTube, YouTube Shorts, Vimeo, and MP4 links

export interface VideoInfo {
  type: 'youtube' | 'vimeo' | 'mp4' | 'other';
  embedUrl: string;
  originalUrl: string;
}

export function parseVideoUrl(url?: string): VideoInfo | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null;
  const clean = url.trim();

  // 1. YouTube standard watch, short link, or shorts
  // Matches: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, youtube.com/embed/ID
  const ytMatch = clean.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
      originalUrl: clean,
    };
  }

  // 2. Vimeo links
  const vimeoMatch = clean.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1`,
      originalUrl: clean,
    };
  }

  // 3. Direct video files (.mp4, .webm, .ogg, .mov, .m4v, .mkv, blob:, data:video/)
  if (
    /\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i.test(clean) ||
    clean.startsWith('blob:') ||
    clean.startsWith('data:video/')
  ) {
    return {
      type: 'mp4',
      embedUrl: clean,
      originalUrl: clean,
    };
  }

  // 4. Fallback for other video embeds
  return {
    type: 'other',
    embedUrl: clean,
    originalUrl: clean,
  };
}
