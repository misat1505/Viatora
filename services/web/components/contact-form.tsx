'use client';

import * as React from 'react';
import { Loader2, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type ContactFormDict = {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
};

interface ContactFormProps {
  dict: ContactFormDict;
}

export function ContactForm({ dict }: ContactFormProps) {
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      // TODO: podmień na właściwy endpoint / server action obsługujący formularz kontaktowy
      console.log(payload);
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });

      // if (!response.ok) throw new Error('Request failed');

      setStatus('success');
      event.currentTarget.reset();
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">{dict.nameLabel}</Label>
        <Input id="name" name="name" placeholder={dict.namePlaceholder} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{dict.emailLabel}</Label>
        <Input id="email" name="email" type="email" placeholder={dict.emailPlaceholder} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">{dict.messageLabel}</Label>
        <Textarea
          id="message"
          name="message"
          placeholder={dict.messagePlaceholder}
          rows={5}
          required
        />
      </div>

      <Button type="submit" disabled={status === 'submitting'} className="gap-2">
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {dict.submitting}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {dict.submit}
          </>
        )}
      </Button>

      {status === 'success' && <p className="text-sm text-primary">{dict.success}</p>}
      {status === 'error' && <p className="text-sm text-destructive">{dict.error}</p>}
    </form>
  );
}
