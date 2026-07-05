'use client';

import { usePathname } from 'next/navigation';
import { GraduationCap, Menu } from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { LocalizedLink } from '@/components/localized-link';
import { Locale } from '@/app/[lang]/dictionaries';
import { ModeToggle } from './mode-toggle';
import { TranslationPath, useLocaleContext } from '@/providers/locale-provider';
import LocaleText from './locale-text';

interface NavItem {
  href: string;
  label: TranslationPath;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'navbar.dashboard' },
  { href: '/exams', label: 'navbar.exams' },
  { href: '/questions', label: 'navbar.question-bank' },
  { href: '/statistics', label: 'navbar.statistics' },
  { href: '/settings', label: 'navbar.settings' },
];

function isActive(pathname: string, href: string, lang: string) {
  const localePrefix = `/${lang}`;
  const normalized = pathname.startsWith(localePrefix)
    ? pathname.slice(localePrefix.length) || '/'
    : pathname;

  if (href === '/') {
    return normalized === '/';
  }
  return normalized === href || normalized.startsWith(`${href}/`);
}

interface NavbarProps {
  lang: Locale;
}

export function Navbar({ lang }: NavbarProps) {
  const pathname = usePathname();
  const { t } = useLocaleContext();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 px-4 mx-auto">
        {/* Logo */}
        <LocalizedLink
          href="/"
          className="flex items-center gap-2 shrink-0 font-semibold text-lg tracking-tight text-foreground hover:opacity-90 transition-opacity"
        >
          <GraduationCap className="h-6 w-6 text-primary" aria-hidden="true" />
          <span>Viatora</span>
        </LocalizedLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href, lang);
            return (
              <LocalizedLink
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                <LocaleText k={item.label} />
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
                )}
              </LocalizedLink>
            );
          })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'md:hidden')}
                aria-label={t('navbar.open-menu')}
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-8 flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = isActive(pathname, item.href, lang);
                  return (
                    <LocalizedLink
                      key={item.href}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
                      )}
                    >
                      <LocaleText k={item.label} />
                    </LocalizedLink>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
