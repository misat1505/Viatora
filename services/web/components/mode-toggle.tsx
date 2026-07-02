'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Pallette = 'caffeine' | 'supabase';

export function ModeToggle() {
  const { setTheme } = useTheme();

  function handleSwitch(pallette: Pallette, mode: 'dark' | 'light') {
    setTheme(mode);
    document.documentElement.classList.remove('theme-caffeine', 'supabase');

    document.documentElement.classList.add(pallette);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleSwitch('caffeine', 'light')}>
          light-caffeine
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSwitch('caffeine', 'dark')}>
          dark-caffeine
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSwitch('supabase', 'light')}>
          light-supabase
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSwitch('supabase', 'dark')}>
          dark-supabase
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
