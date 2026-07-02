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
  };

  const colors = colorsMap[pallette];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {colors.map((c) => (
            <span key={c} className="w-2 h-2 rounded-xs" style={{ backgroundColor: c }}></span>
          ))}
          {capitalize(pallette)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.keys(colorsMap).map((pal) => (
          <DropdownMenuItem
            key={pal}
            onClick={() => setPallette(pal as keyof typeof colorsMap)}
            disabled={pal === pallette}
          >
            {colorsMap[pal as keyof typeof colorsMap].map((c) => (
              <span key={c} className="w-2 h-2 rounded-xs" style={{ backgroundColor: c }}></span>
            ))}
            {capitalize(pal)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
