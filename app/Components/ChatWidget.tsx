'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
type WebhookResponse = {
  threadId: string;
  messageId: string;
  status: string;
};

type ChatMessage = {
  id: string;
  sender: 'USER' | 'ADMIN';
  text: string;
  createdAt: string;
};

const STORAGE_KEY = 'chat_thread_id';

export default function ChatWidget() {
  const t = useTranslations('chat');
  const [message, setMessage] = useState('');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setThreadId(saved);
    }
  }, []);

  const loadMessages = async (id: string, opts?: { withSpinner?: boolean }) => {
    const withSpinner = opts?.withSpinner ?? false;
    try {
      if (withSpinner) {
        setLoadingMessages(true);
      }
      const res = await fetch(`/api/chat/threads/${id}`);
      const data = await res.json();
      if (res.status === 404) {
        // თრედი უკვე აღარ არსებობს (შეიძლება ადმინმა წაშალა) –
        // ვასუფთავებთ ლოკალურ სტატუსს, რომ ახალი დიალოგი შეიქმნას.
        setMessages([]);
        setThreadId(null);
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(STORAGE_KEY);
        }
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'შეტყობინებების წამოღება ვერ მოხერხდა');
      }
      const incoming: ChatMessage[] = Array.isArray(data.messages) ? data.messages : [];

      // თუ არაფერი შეცვლილა, state არ განვაახლოთ რომ ზედმეტი რერენდერი არ იყოს
      if (
        messages.length === incoming.length &&
        messages[messages.length - 1]?.id === incoming[incoming.length - 1]?.id
      ) {
        return;
      }

      setMessages(incoming);
    } catch (e) {
      // არ ვაჩვენებთ ცალკე ერორს, რომ ფორმა არ გადაიფაროს
      console.error(e);
    } finally {
      if (withSpinner) {
        setLoadingMessages(false);
      }
    }
  };

  const handleToggleOpen = () => {
    setOpen((prev) => {
      const next = !prev;
      if (!prev && next && threadId) {
        void loadMessages(threadId, { withSpinner: true });
      }
      return next;
    });
  };

  // მსუბუქი polling: როცა ჩათი ღიაა და არსებობს თრედი, მომხმარებელი ავტომატურად ხედავს ადმინის პასუხებს.
  useEffect(() => {
    if (!threadId || !open) {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    void loadMessages(threadId, { withSpinner: false });

    pollRef.current = window.setInterval(() => {
      void loadMessages(threadId, { withSpinner: false });
    }, 8000); // ყოველ 8 წამში ერთხელ

    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [threadId, open]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!message) {
      setError('გთხოვთ ჩაწეროთ შეტყობინება.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/chat/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: threadId ?? undefined,
          message,
        }),
      });
      const data = (await res.json()) as Partial<WebhookResponse> & {
        error?: string;
        details?: { field: string; message: string }[];
      };
      if (!res.ok || !data.threadId) {
        throw new Error(data.error || 'შეტყობინება ვერ გაიგზავნა');
      }
      setThreadId(data.threadId);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, data.threadId);
      }
      setMessage('');
      setSuccess('შეტყობინება გაიგზავნა. დიალოგი გრძელდება ამავე ფანჯარიდან.');

      // თავიდან წამოიღე საუბარი (სპინერის გარეშე, რომ UI არ "გახტეს")
      if (data.threadId) {
        void loadMessages(data.threadId, { withSpinner: false });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'დაფიქსირდა შეცდომა');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[999] flex flex-col items-end gap-3">
      {/* Chat panel */}
      <div
        className={`pointer-events-auto transform transition-all duration-200 ${
          open
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        {open && (
          <div className="w-[520px] max-w-[92vw] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-black/10 md:w-[420px]">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-gray-900 via-black to-gray-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg">
                  💬
                </div>
                <div>
               
                  <p className="text-[12px] text-gray-200">
                    {t('answer')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm text-gray-100 hover:bg-white/20"
                aria-label={t('close')}
              >
                ×
              </button>
            </div>

            <div className="space-y-3 bg-gradient-to-b from-gray-50 via-white to-gray-50 px-4 py-3">
             

              {/* Messages from you and admin */}
              {threadId && (
                <div className="h-[250px] space-y-2 overflow-y-auto rounded-2xl border border-gray-200 bg-white/70 p-3">
                  {messages.length === 0 ? (
                    <p className="text-[12px] text-gray-600">
                      {t('noAnswer')}
                    </p>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex w-full ${
                          m.sender === 'ADMIN'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-[12px] shadow-sm ${
                            m.sender === 'ADMIN'
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {m.text}
                          </p>
                          <p
                            className={`mt-1 text-right text-[10px] ${
                              m.sender === 'ADMIN'
                                ? 'text-gray-300'
                                : 'text-gray-500'
                            }`}
                          >
                            {m.createdAt}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-[13px] text-red-800">{error}</p>
                </div>
              )}
             

              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="space-y-1 text-[15px] text-gray-600">
                  <span>{t('message')}</span>
                  <textarea
                    placeholder={t('placeholder')}
                    id="chat-message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-[13px] text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </label>

                <div className="flex items-center justify-between">
                 
                  <div className="flex items-center gap-2">
                    {threadId && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/chat/threads/${threadId}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'closed' }),
                            });
                            const data = await res.json();
                            if (!res.ok) {
                              throw new Error(
                                data.error || t('error')
                              );
                            }
                            setSuccess(
                              t('success')
                            );
                            setMessages([]);
                            setThreadId(null);
                            if (typeof window !== 'undefined') {
                              window.localStorage.removeItem(STORAGE_KEY);
                            }
                          } catch (e) {
                            setError(
                              e instanceof Error
                                ? e.message
                                : t('error')
                            );
                          }
                        }}
                        className="rounded-full border border-gray-300 bg-white px-3 py-1 text-[11px] md:text-[13px] font-medium text-black hover:bg-gray-50"
                      >
                        {t('close')}
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-1 rounded-full bg-black px-4 py-1.5 text-[13px] md:text-[15px] font-semibold text-white shadow-sm transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? t('loading') : t('send')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className="pointer-events-auto chatbutton p-12 inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#3a5bff] px-4 text-[14px] md:text-[16px] text-white shadow-xl shadow-black/20 transition hover:bg-gray-900 md:h-12 md:px-6 md:text-[15px]"
        aria-label={t('title')}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full  text-[15px]">
          💬 {open ? t('close') : t('start')}
        </span>
        
      </button>
    </div>
  );
}

