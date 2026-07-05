import { Languages, Palette, SunMoon } from 'lucide-react';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { ModeToggle } from '@/components/mode-toggle';
import { PalletteDropdown } from '@/components/pallette-dropdown';
import LanguageSwitch from '@/components/language-switch';
import { Locale } from '../dictionaries';

export default async function SettingsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const lang = (await params).lang;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 md:py-14">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Customize how Viatora looks and speaks to you.
        </p>
      </div>

      <div className="space-y-6">
        {/* Language */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Languages className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">Language</CardTitle>
              <CardDescription>
                Choose the language used across exam questions and the interface.
              </CardDescription>
            </div>
            <LanguageSwitch lang={lang} />
          </CardHeader>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <SunMoon className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">Theme</CardTitle>
              <CardDescription>
                Switch between light, dark, or system-matched appearance.
              </CardDescription>
            </div>
            <ModeToggle />
          </CardHeader>
        </Card>

        {/* Color palette */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Palette className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">Color palette</CardTitle>
              <CardDescription>
                Set the accent color used for buttons, links, and highlights.
              </CardDescription>
            </div>
            <PalletteDropdown />
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
