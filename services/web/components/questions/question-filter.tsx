'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Filter, RotateCcw } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '../ui/label';

export const TAGS = [
  'road-signs',
  'traffic-rules',
  'right-of-way',
  'speed-limits',
  'vehicle-control',
  'safety-distance',
  'first-aid',
  'accident-handling',
  'vehicle-maintenance',
  'weather-conditions',
  'urban-driving',
  'highway-driving',
  'motorcycle-specific',
  'truck-specific',
  'risk-perception',
].sort();

type Props = {
  page: number;
  limit: number;
  points: number;
  tags: string[];
};

export default function QuestionFilters({ page, limit, points, tags }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const options = TAGS.map((tag) => ({
    label: tag.replaceAll('-', ' '),
    value: tag,
  }));

  const setParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams);

    if (!value) params.delete(key);
    else params.set(key, value);

    // po zmianie filtrów wracamy na pierwszą stronę
    if (key !== 'page') {
      params.set('page', '1');
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    router.replace(pathname);
  };

  const activeFiltersCount =
    (points !== 1 ? 1 : 0) + (limit !== 10 ? 1 : 0) + (tags.length > 0 ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <CardTitle>Filters</CardTitle>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          disabled={!hasActiveFilters}
          className="gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </CardHeader>

      <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Page</Label>

          <Select value={page.toString()} onValueChange={(v) => setParam('page', v)}>
            <SelectTrigger className={buttonVariants({ variant: 'outline' })}>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {Array.from({ length: 20 }).map((_, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Limit</Label>

          <Select value={limit.toString()} onValueChange={(v) => setParam('limit', v)}>
            <SelectTrigger className={buttonVariants({ variant: 'outline' })}>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {[10, 25, 50, 100].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Points</Label>

          <Select value={points.toString()} onValueChange={(v) => setParam('points', v)}>
            <SelectTrigger className={buttonVariants({ variant: 'outline' })}>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {[1, 2, 3].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value} {value > 1 ? 'points' : 'point'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 lg:col-span-4">
          <Label className="text-sm font-medium">Tags</Label>

          <MultiSelect
            key={tags.join(',')}
            options={options}
            defaultValue={tags}
            onValueChange={(values) => setParam('tags', values.join(','))}
            placeholder="Select tags..."
            className={buttonVariants({ variant: 'outline' })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
