'use client';

import { useEffect, useState } from 'react';

type ChatThread = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
};

type ChatMessage = {
  id: string;
  sender: 'USER' | 'ADMIN';
  text: string;
  createdAt: string;
};

export default function ChatAdmin() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadThreads = async () => {
    setLoadingThreads(true);
    setError('');
    try {
      const res = await fetch('/api/admin/chat/threads');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ვერ მოხერხდა ჩათების წამოღება');
      setThreads(Array.isArray(data.threads) ? data.threads : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'დაფიქსირდა შეცდომა');
    } finally {
      setLoadingThreads(false);
    }
  };

  const loadMessages = async (id: string) => {
    setLoadingMessages(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/chat/threads/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ვერ მოხერხდა შეტყობინებების წამოღება');
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'დაფიქსირდა შეცდომა');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    void loadThreads();
  }, []);

  useEffect(() => {
    if (selectedId) {
      void loadMessages(selectedId);
    } else {
      setMessages([]);
    }
  }, [selectedId]);

  const handleSend = async () => {
    if (!selectedId || !reply.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/chat/threads/${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'შეტყობინება ვერ გაიგზავნა');
      setReply('');
      await loadMessages(selectedId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'შეტყობინება ვერ გაიგზავნა');
    } finally {
      setSending(false);
    }
  };

  const handleCloseThread = async () => {
    if (!selectedId) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/chat/threads/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'დიალოგის დახურვა ვერ მოხერხდა');
      await loadThreads();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'დიალოგის დახურვა ვერ მოხერხდა');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteThread = async () => {
    if (!selectedId) return;
    const confirmDelete = window.confirm('დარწმუნებული ხარ, რომ გინდა ამ ჩათის წაშლა?');
    if (!confirmDelete) return;

    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/chat/threads/${selectedId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'დიალოგის წაშლა ვერ მოხერხდა');
      setSelectedId(null);
      await loadThreads();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'დიალოგის წაშლა ვერ მოხერხდა');
    } finally {
      setActionLoading(false);
    }
  };

  const selectedThread = threads.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="h-[calc(100vh-6rem)] rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">ჩათის მართვა</h1>
          <p className="text-sm text-gray-500">
            იხილე შეკითხვები და უპასუხე მომხმარებლებს რეალურ დროში.
          </p>
        </div>
        <button
          type="button"
          onClick={loadThreads}
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
        >
          ↻ განახლება
        </button>
      </div>

      <div className="grid h-[calc(100%-3.5rem)] grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
        {/* Threads list */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">დიალოგები</h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {threads.length} მომხმარებელი
            </span>
          </div>
          {loadingThreads ? (
            <div className="flex flex-1 items-center justify-center px-4 py-6">
              <p className="text-sm text-gray-600">ჩათები იტვირთება...</p>
            </div>
          ) : threads.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-4 py-6">
              <p className="text-sm text-gray-600">ჯერ არცერთი ჩათი არ არის.</p>
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-gray-100 overflow-y-auto">
              {threads.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(t.id)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                      selectedId === t.id
                        ? 'border-l-2 border-l-black bg-gray-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                      {t.firstName.charAt(0)}
                      {t.lastName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-gray-900">
                          {t.firstName} {t.lastName}
                        </span>
                        <span
                          className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            t.status === 'open'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {t.status === 'open' ? 'ღია' : 'დახურული'}
                        </span>
                      </div>
                      <p className="truncate text-xs text-gray-500">{t.email}</p>
                      <p className="truncate text-xs text-gray-500">{t.phone}</p>
                      <p className="mt-1 text-[11px] text-gray-400">{t.createdAt}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Messages panel */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {error ? (
            <div className="border-b border-red-200 bg-red-50 px-4 py-2">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          ) : null}

          {!selectedId || !selectedThread ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                💬
              </div>
              <p className="text-sm font-medium text-gray-800">აირჩიეთ ჩათი მარცხენა მხრიდან.</p>
              <p className="text-xs text-gray-500">
                იხილავთ მომხმარებლის ისტორიას და შეძლებთ პასუხის გაგზავნას.
              </p>
            </div>
          ) : (
            <>
              {/* Conversation header */}
              <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {selectedThread.firstName} {selectedThread.lastName}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {selectedThread.email} · {selectedThread.phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                      selectedThread.status === 'open'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {selectedThread.status === 'open' ? 'აქტიური დიალოგი' : 'დახურული დიალოგი'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCloseThread}
                    disabled={actionLoading || selectedThread.status === 'closed'}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    დასრულება
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteThread}
                    disabled={actionLoading}
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 shadow-sm transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    წაშლა
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-2 overflow-y-auto bg-gray-50 px-4 py-4">
                {loadingMessages ? (
                  <p className="text-sm text-gray-700">შეტყობინებები იტვირთება...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-gray-700">ჯერჯერობით შეტყობინება არ არის.</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex w-full ${
                        m.sender === 'ADMIN' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                          m.sender === 'ADMIN'
                            ? 'bg-black text-white'
                            : 'bg-white text-gray-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.text}</p>
                        <p
                          className={`mt-1 text-right text-[11px] ${
                            m.sender === 'ADMIN' ? 'text-gray-300' : 'text-gray-400'
                          }`}
                        >
                          {m.createdAt}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reply box */}
              <div className="border-t border-gray-200 bg-white/80 p-3 backdrop-blur">
                <div className="flex items-end gap-2">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={2}
                    placeholder="დაწერე პასუხი..."
                    className="max-h-32 flex-1 resize-y rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending || !reply.trim()}
                    className="inline-flex items-center justify-center rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? 'იგზავნება...' : 'გაგზავნა'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

