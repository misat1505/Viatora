type Media =
  | { type: 'none'; url: '' }
  | { type: 'image'; url: string }
  | { type: 'video'; url: string };

export function parseMedia(media: any): Media {
  if (!media || media.type === 'none') return { type: 'none', url: '' };
  if (media.type === 'image')
    return { type: 'image', url: media.image.asset._ref };
  if (media.type === 'video')
    return { type: 'video', url: media.video.asset._ref };
  throw new Error('Unreachable');
}
