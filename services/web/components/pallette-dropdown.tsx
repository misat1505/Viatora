'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePallette } from '@/providers/pallette-provider';
import { capitalize } from '@/utils/capitalize';

export function PalletteDropdown() {
  const { setPallette, pallette } = usePallette();

  const colorsMap = {
    caffeine: ['#644A40', '#E8E8E8', '#FFDFB5', '#D8D8D8'],
    supabase: ['#72E3AD', '#EDEDED', '#FDFDFD', '#DFDFDF'],
    vercel: ['#000000', '#EBEBEB', '#EBEBEB', '#E4E4E4'],
    twitter: ['#1F9DF1', '#E3ECF6', '#0F1419', '#E1EAEF'],
    notebook: ['#606060', '#F3EAC8', '#DEDEDE', '#747272'],
    claude: ['#CA6442', '#E9E6DC', '#E9E6DC', '#DAD9D4'],
  };

  const sortedColorsMap = Object.fromEntries(
    Object.entries(colorsMap).sort(([a], [b]) => a.localeCompare(b)),
  );

  const colors = colorsMap[pallette];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {colors.map((c, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-xs"
              style={{ backgroundColor: c }}
              suppressHydrationWarning
            ></span>
          ))}
          <span suppressHydrationWarning>{capitalize(pallette)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-fit">
        {Object.keys(sortedColorsMap).map((pal, i) => (
          <DropdownMenuItem
            key={i}
            onClick={() => setPallette(pal as keyof typeof colorsMap)}
            disabled={pal === pallette}
            className="w-full"
          >
            {colorsMap[pal as keyof typeof colorsMap].map((c, j) => (
              <span key={j} className="w-2 h-2 rounded-xs" style={{ backgroundColor: c }}></span>
            ))}
            {capitalize(pal)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
