import { GraduationCap } from 'lucide-react';

import { LocalizedLink } from '@/components/localized-link';
import { TranslationPath } from '@/providers/locale-provider';
import LocaleText from './locale-text';

interface FooterColumn {
  title: TranslationPath;
  links: {
    href: string;
    label: TranslationPath;
  }[];
}

const footerColumns: FooterColumn[] = [
  {
    title: 'footer.product',
    links: [
      { href: '/exams', label: 'footer.exams' },
      { href: '/questions', label: 'footer.question-bank' },
      { href: '/statistics', label: 'footer.statistics' },
    ],
  },
  {
    title: 'footer.account',
    links: [
      { href: '/register', label: 'footer.register' },
      { href: '/settings', label: 'footer.settings' },
    ],
  },
  {
    title: 'footer.legal',
    links: [
      { href: '/privacy', label: 'footer.privacy-policy' },
      { href: '/terms', label: 'footer.terms-of-use' },
      { href: '/contact', label: 'footer.contact' },
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
              <LocaleText k="footer.tagline" />
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">
                <LocaleText k={column.title} />
              </h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <LocalizedLink
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <LocaleText k={link.label} />
                    </LocalizedLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            <LocaleText k="footer.copyright" values={{ year: String(year) }} />
          </p>
          <p className="text-xs text-muted-foreground">
            <LocaleText k="footer.made-for-learners" />
          </p>
        </div>
      </div>
    </footer>
  );
}
