import type { Media } from './domain';

const localIds = new Set(__LOCAL_VIDEO_IDS__);

export function studyMedia(item: Media): Media {
  if (item.source !== 'youtube' || !item.videoId || !localIds.has(item.videoId)) return item;

  return {
    ...item,
    source: 'local',
    path: `study-media/${item.videoId}`,
    videoId: undefined,
  };
}
