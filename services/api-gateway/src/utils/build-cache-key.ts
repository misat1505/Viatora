const prefixSegments = ['api-gateway', 'endpoints'];

export function buildCacheKey(...segments: string[]): string {
  const allSegments = [...prefixSegments, ...segments];
  return allSegments.join(':');
}
