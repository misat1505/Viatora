const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET!;

export function sanityImageUrl(ref: string): string | null {
  const match = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/);
  if (!match) return null;

  const [, hash, dimensions, format] = match;
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${hash}-${dimensions}.${format}`;
}

export function sanityFileUrl(ref: string): string | null {
  const match = ref.match(/^file-([a-f0-9]+)-(\w+)$/);
  if (!match) return null;

  const [, hash, format] = match;
  return `https://cdn.sanity.io/files/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${hash}.${format}`;
}
