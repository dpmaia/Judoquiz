import type { Media } from './domain';

const videoPaths = new Map(Object.entries(__STUDY_VIDEO_PATHS__));

export function studyMedia(item: Media): Media {
  if (item.source !== 'youtube' || !item.videoId) return item;
  const path = videoPaths.get(item.videoId);
  if (!path) return item;

  return {
    ...item,
    source: 'local',
    path,
    videoId: undefined,
  };
}
