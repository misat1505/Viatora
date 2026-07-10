// src/components/assistant/assistant-aside.tsx
'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Bot, Loader2, Send, User, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/app/[lang]/dictionaries';
import { sendMessageToAssistant } from '@/actions/assistant/send-message-to-assistant';
import { getConversationHistory } from '@/actions/assistant/get-conversation-history';

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface AssistantAsideProps {
  questionId: string;
  lang: Locale;
}

const dict = {
  pl: {
    title: 'Asystent AI',
    openLabel: 'Asystent',
    closeLabel: 'Zamknij asystenta',
    placeholder: 'Zapytaj o podpowiedź lub wyjaśnienie...',
    send: 'Wyślij',
    empty: 'Masz pytanie do tego zadania? Zapytaj asystenta o podpowiedź.',
    thinking: 'Asystent pisze...',
    error: 'Coś poszło nie tak. Spróbuj ponownie.',
  },
  en: {
    title: 'AI Assistant',
    openLabel: 'Assistant',
    closeLabel: 'Close assistant',
    placeholder: 'Ask for a hint or explanation...',
    send: 'Send',
    empty: 'Stuck on this question? Ask the assistant for a hint.',
    thinking: 'Assistant is typing...',
    error: 'Something went wrong. Please try again.',
  },
} as const;

// Renders assistant markdown with sizing/colors that match the chat bubble
function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none wrap-break-words prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0 prose-pre:my-2 prose-pre:bg-background prose-code:text-foreground prose-strong:text-foreground prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-a:text-primary">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

export function AssistantAside({ questionId, lang }: AssistantAsideProps) {
  const t = dict[lang] ?? dict.en;
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen || hasLoadedHistory) return;

    startTransition(async () => {
      const [error, data] = await getConversationHistory(questionId);
      if (!error && data) {
        setMessages(data.messages);
      }
      setHasLoadedHistory(true);
    });
  }, [isOpen, hasLoadedHistory, questionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isPending]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Auto-resize the textarea as the user types
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  function submitMessage() {
    const trimmed = input.trim();
    if (!trimmed || isPending) return;

    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput('');
    setErrorMessage(null);

    startTransition(async () => {
      const [error, data] = await sendMessageToAssistant({
        questionId,
        message: trimmed,
        locale: lang,
      });

      if (error || !data) {
        setErrorMessage(t.error);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `${data.conversationId}-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          createdAt: new Date().toISOString(),
        },
      ]);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitMessage();
  }

  // Enter sends, Shift+Enter adds a new line
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label={t.openLabel}
          className="fixed right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2 rounded-l-lg bg-primary px-2.5 py-4 text-primary-foreground shadow-md transition-colors hover:cursor-pointer hover:bg-primary/90"
        >
          <Bot className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-medium [writing-mode:vertical-rl]">{t.openLabel}</span>
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed right-0 top-0 z-50 flex h-svh w-full flex-col border-l border-border bg-card text-card-foreground shadow-xl transition-transform duration-300 ease-in-out sm:w-96',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="font-semibold">{t.title}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            aria-label={t.closeLabel}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {messages.length === 0 && !isPending ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">{t.empty}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <div
                    key={message.id}
                    className={cn('flex items-start gap-2', isUser && 'flex-row-reverse')}
                  >
                    <div
                      className={cn(
                        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                        isUser ? 'bg-secondary' : 'bg-primary',
                      )}
                    >
                      {isUser ? (
                        <User
                          className="h-3.5 w-3.5 text-secondary-foreground"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bot className="h-3.5 w-3.5 text-primary-foreground" aria-hidden="true" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed',
                        isUser
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-muted text-foreground',
                      )}
                    >
                      {isUser ? (
                        <span className="whitespace-pre-wrap">{message.content}</span>
                      ) : (
                        <MarkdownContent content={message.content} />
                      )}
                    </div>
                  </div>
                );
              })}

              {isPending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Bot className="h-3.5 w-3.5 text-primary-foreground" aria-hidden="true" />
                  </div>
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    {t.thinking}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {errorMessage && <p className="px-4 pb-1 text-xs text-destructive">{errorMessage}</p>}

        <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-border p-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            disabled={isPending}
            rows={1}
            className="max-h-40 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring scrollbar-none [&::-webkit-scrollbar]:hidden"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isPending || !input.trim()}
            aria-label={t.send}
            className="shrink-0"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>
      </aside>
    </>
  );
}
