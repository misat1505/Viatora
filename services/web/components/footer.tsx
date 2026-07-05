import * as React from 'react';
import { GraduationCap } from 'lucide-react';

import { LocalizedLink } from '@/components/localized-link';

interface FooterColumn {
  title: string;
  links: { href: string; label: string }[];
}

const footerColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { href: '/exams', label: 'Exams' },
      { href: '/questions', label: 'Question bank' },
      { href: '/statistics', label: 'Statistics' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/register', label: 'Register' },
      { href: '/settings', label: 'Settings' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/terms', label: 'Terms of use' },
      { href: '/contact', label: 'Contact' },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
          {/* Logo + tagline */}
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <LocalizedLink
              href="/"
              className="flex items-center gap-2 font-semibold text-lg tracking-tight text-foreground hover:opacity-90 transition-opacity"
            >
              <GraduationCap className="h-6 w-6 text-primary" aria-hidden="true" />
              <span>Viatora</span>
            </LocalizedLink>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Prepare for your driving theory exam with confidence.
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <LocalizedLink
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </LocalizedLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">© {year} Viatora. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Made for learners, not for the DMV queue.</p>
        </div>
      </div>
    </footer>
  );
}
