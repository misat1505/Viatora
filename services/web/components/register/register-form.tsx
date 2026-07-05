'use client';

import * as React from 'react';
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type RegisterFormDict = {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  passwordMismatch: string;
};

interface RegisterFormProps {
  dict: RegisterFormDict;
}

export function RegisterForm({ dict }: RegisterFormProps) {
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [showPassword, setShowPassword] = React.useState(false);
  const [mismatch, setMismatch] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMismatch(false);

    const formData = new FormData(event.currentTarget);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      setMismatch(true);
      return;
    }

    setStatus('submitting');

    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      password,
    };

    try {
      // TODO: podmień na właściwy endpoint rejestracji
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Request failed');

      setStatus('success');
      event.currentTarget.reset();
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{dict.nameLabel}</Label>
        <Input id="name" name="name" placeholder={dict.namePlaceholder} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{dict.emailLabel}</Label>
        <Input id="email" name="email" type="email" placeholder={dict.emailPlaceholder} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{dict.passwordLabel}</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={dict.passwordPlaceholder}
            minLength={8}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{dict.confirmPasswordLabel}</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder={dict.confirmPasswordPlaceholder}
          minLength={8}
          required
        />
      </div>

      {mismatch && <p className="text-sm text-destructive">{dict.passwordMismatch}</p>}

      <Button type="submit" disabled={status === 'submitting'} className="w-full gap-2">
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {dict.submitting}
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            {dict.submit}
          </>
        )}
      </Button>

      {status === 'success' && <p className="text-sm text-primary">{dict.success}</p>}
      {status === 'error' && <p className="text-sm text-destructive">{dict.error}</p>}
    </form>
  );
}
