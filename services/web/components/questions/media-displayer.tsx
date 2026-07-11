import { ExamQuestionDTO } from '@/generated/viatoraAPI.schemas';
import { sanityFileUrl, sanityImageUrl } from '@/lib/sanity-image';
import { ImageOff } from 'lucide-react';
import Image from 'next/image';

type MediaDisplayerProps = {
  media: ExamQuestionDTO['media'];
  unavailableText: string;
  errorText: string;
};

const MediaDisplayer = ({ media, unavailableText, errorText }: MediaDisplayerProps) => {
  if (media.type === 'image')
    return (
      <Image
        src={sanityImageUrl(media.url)!}
        alt={errorText}
        fill
        className="object-contain"
        sizes="(max-width: 1024px) 100vw, 900px"
        priority
      />
    );

  if (media.type === 'video')
    return (
      <video
        src={sanityFileUrl(media.url)!}
        controls
        preload="metadata"
        className="h-full w-full object-contain"
      >
        {errorText}
      </video>
    );

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
      <ImageOff className="h-8 w-8" aria-hidden="true" />
      <span className="text-xs">{unavailableText}</span>
    </div>
  );
};

export default MediaDisplayer;
