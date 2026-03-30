'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { parcelOriginLabelKey } from '@/lib/parcelOriginLabels';
import dayjs from '@/lib/dayjs';

const ORIGIN_CODES = ['uk', 'us', 'cn', 'it', 'gr', 'es', 'fr', 'de', 'tr'] as const;
// Allow "24" hour (24:00) as end-of-day. We'll convert it to next day 00:xx for ISO storage.
const HOUR_OPTIONS = Array.from({ length: 25 }, (_, i) => String(i).padStart(2, '0'));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

type ReisRow = {
  id: string;
  name: string;
  originCountry: string;
  destinationCountry: string;
  departureAt: string | null;
  arrivalAt: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { parcels: number };
};

function toDateValue(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = dayjs(iso);
  if (!d.isValid()) return '';
  return d.format('YYYY-MM-DD');
}

function toHourValue(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = dayjs(iso);
  if (!d.isValid()) return '';
  return d.format('HH');
}

function toMinuteValue(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = dayjs(iso);
  if (!d.isValid()) return '';
  return d.format('mm');
}

function fromDateTimePartsToIso(date: string, hour: string, minute: string): string | null {
  const d = date.trim();
  const h = hour.trim();
  const m = minute.trim();
  if (!d || !h || !m) return null;

  const hNum = Number(h);
  const mNum = Number(m);
  if (!Number.isFinite(hNum) || !Number.isFinite(mNum)) return null;
  if (hNum < 0 || hNum > 24) return null;
  if (mNum < 0 || mNum > 59) return null;

  // JS Date/dayjs doesn't reliably accept "24:00", so we shift it to next day.
  if (hNum === 24) {
    const shifted = dayjs(d).add(1, 'day').hour(0).minute(mNum).second(0).millisecond(0);
    return shifted.isValid() ? shifted.toISOString() : null;
  }

  const parsed = dayjs(`${d}T${h}:${m}`);
  if (!parsed.isValid()) return null;
  return parsed.toISOString();
}

function renderDateTimeParts(iso: string | null): React.ReactNode {
  if (!iso) return '—';
  const d = dayjs(iso);
  if (!d.isValid()) return '—';
  return (
    <div className="leading-tight">
      <div className="text-slate-800">{d.format('DD.MM.YYYY')}</div>
      <div className="text-slate-600">{d.format('HH:mm')}</div>
    </div>
  );
}

const emptyForm = () => ({
  name: '',
  originCountry: 'uk' as (typeof ORIGIN_CODES)[number],
  destinationCountry: 'GE',
  departureDate: '' as string,
  departureHour: '' as string,
  departureMinute: '' as string,
  arrivalDate: '' as string,
  arrivalHour: '' as string,
  arrivalMinute: '' as string,
  status: 'open' as 'open' | 'closed',
  notes: '',
});

export default function ReisesManager() {
  const t = useTranslations('parcels');
  const tr = useTranslations('adminReises');
  const tc = useTranslations('common');

  const [rows, setRows] = useState<ReisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ReturnType<typeof emptyForm> | null>(null);

  const load = useCallback(async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reises', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = (await res.json()) as { reises?: ReisRow[]; error?: string };
      if (!res.ok) throw new Error(data.error || tr('loadError'));
      setRows(Array.isArray(data.reises) ? data.reises : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : tr('loadError'));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tr]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        originCountry: form.originCountry,
        destinationCountry: form.destinationCountry.trim() || 'GE',
        departureAt: fromDateTimePartsToIso(form.departureDate, form.departureHour, form.departureMinute),
        arrivalAt: fromDateTimePartsToIso(form.arrivalDate, form.arrivalHour, form.arrivalMinute),
        status: form.status,
        notes: form.notes.trim() || undefined,
      };
      const res = await fetch('/api/admin/reises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error || tr('saveError'));
      setMessage(data.message || tr('added'));
      setForm(emptyForm());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('saveError'));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (row: ReisRow) => {
    setEditingId(row.id);
    setEditDraft({
      name: row.name,
      originCountry: row.originCountry as (typeof ORIGIN_CODES)[number],
      destinationCountry: row.destinationCountry || 'GE',
      departureDate: toDateValue(row.departureAt),
      departureHour: toHourValue(row.departureAt),
      departureMinute: toMinuteValue(row.departureAt),
      arrivalDate: toDateValue(row.arrivalAt),
      arrivalHour: toHourValue(row.arrivalAt),
      arrivalMinute: toMinuteValue(row.arrivalAt),
      status: row.status === 'closed' ? 'closed' : 'open',
      notes: row.notes ?? '',
    });
    setError('');
    setMessage('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editDraft) return;
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const body = {
        id: editingId,
        name: editDraft.name.trim(),
        originCountry: editDraft.originCountry,
        destinationCountry: editDraft.destinationCountry.trim() || 'GE',
        departureAt: fromDateTimePartsToIso(editDraft.departureDate, editDraft.departureHour, editDraft.departureMinute),
        arrivalAt: fromDateTimePartsToIso(editDraft.arrivalDate, editDraft.arrivalHour, editDraft.arrivalMinute),
        status: editDraft.status,
        notes: editDraft.notes.trim() || undefined,
      };
      const res = await fetch('/api/admin/reises', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error || tr('saveError'));
      setMessage(data.message || tr('saved'));
      cancelEdit();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('saveError'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm(tr('confirmDelete'))) return;
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/reises', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error || tr('deleteError'));
      setMessage(data.message || tr('deleted'));
      if (editingId === id) cancelEdit();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('deleteError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-800">{error}</div>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[15px] text-emerald-900">{message}</div>
      ) : null}

      <form onSubmit={submitCreate} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <h2 className="text-[16px] font-semibold text-slate-900">{tr('newReis')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-slate-700">{tr('name')}</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-slate-700">{tr('originCountry')}</span>
            <select
              value={form.originCountry}
              onChange={(e) =>
                setForm((f) => ({ ...f, originCountry: e.target.value as (typeof ORIGIN_CODES)[number] }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900"
            >
              {ORIGIN_CODES.map((code) => (
                <option key={code} value={code}>
                  {t(parcelOriginLabelKey(code))}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-slate-700">{tr('destinationCountry')}</span>
            <input
              value={form.destinationCountry}
              onChange={(e) => setForm((f) => ({ ...f, destinationCountry: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-slate-700">{tr('departureAt')}</span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={form.departureDate}
                onChange={(e) =>
                  setForm((f) => {
                    const v = e.target.value;
                    return {
                      ...f,
                      departureDate: v,
                      departureHour: v ? f.departureHour : '',
                      departureMinute: v ? f.departureMinute : '',
                    };
                  })
                }
                className="flex-1 min-w-[140px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900"
              />
              <select
                value={form.departureHour}
                onChange={(e) => setForm((f) => ({ ...f, departureHour: e.target.value }))}
                className="w-[110px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900"
              >
                <option value="">HH</option>
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <select
                value={form.departureMinute}
                onChange={(e) => setForm((f) => ({ ...f, departureMinute: e.target.value }))}
                className="w-[110px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900"
              >
                <option value="">mm</option>
                {MINUTE_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-slate-700">{tr('arrivalAt')}</span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={form.arrivalDate}
                onChange={(e) =>
                  setForm((f) => {
                    const v = e.target.value;
                    return {
                      ...f,
                      arrivalDate: v,
                      arrivalHour: v ? f.arrivalHour : '',
                      arrivalMinute: v ? f.arrivalMinute : '',
                    };
                  })
                }
                className="flex-1 min-w-[140px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900"
              />
              <select
                value={form.arrivalHour}
                onChange={(e) => setForm((f) => ({ ...f, arrivalHour: e.target.value }))}
                className="w-[110px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900"
              >
                <option value="">HH</option>
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <select
                value={form.arrivalMinute}
                onChange={(e) => setForm((f) => ({ ...f, arrivalMinute: e.target.value }))}
                className="w-[110px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900"
              >
                <option value="">mm</option>
                {MINUTE_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-slate-700">{tr('status')}</span>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'open' | 'closed' }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900"
            >
              <option value="open">{tr('statusOpen')}</option>
              <option value="closed">{tr('statusClosed')}</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-[13px] font-medium text-slate-700">{tr('notes')}</span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#3a5bff] px-4 py-2.5 text-[15px] font-semibold text-white disabled:opacity-60"
        >
          {saving ? tc('sending') : tr('add')}
        </button>
      </form>

      <div>
        <h2 className="mb-3 text-[16px] font-semibold text-slate-900">{tr('listTitle')}</h2>
        {loading ? (
          <p className="text-[15px] text-slate-600">{tr('loading')}</p>
        ) : rows.length === 0 ? (
          <p className="text-[15px] text-slate-600">{tr('empty')}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-[14px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 font-semibold text-slate-800">{tr('name')}</th>
                  <th className="px-3 py-2 font-semibold text-slate-800">{tr('originCountry')}</th>
                  <th className="px-3 py-2 font-semibold text-slate-800">{tr('destinationCountry')}</th>
                  <th className="px-3 py-2 font-semibold text-slate-800">{tr('departureAt')}</th>
                  <th className="px-3 py-2 font-semibold text-slate-800">{tr('arrivalAt')}</th>
                  <th className="px-3 py-2 font-semibold text-slate-800">{tr('status')}</th>
                  <th className="px-3 py-2 font-semibold text-slate-800">{tr('parcelsCount')}</th>
                  <th className="px-3 py-2 font-semibold text-slate-800" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr>
                      <td className="px-3 py-2 text-slate-900">{row.name}</td>
                      <td className="px-3 py-2 text-slate-700">{t(parcelOriginLabelKey(row.originCountry))}</td>
                      <td className="px-3 py-2 text-slate-700">{row.destinationCountry}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {renderDateTimeParts(row.departureAt)}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {renderDateTimeParts(row.arrivalAt)}
                      </td>
                      <td className="px-3 py-2 text-slate-700">{row.status === 'closed' ? tr('statusClosed') : tr('statusOpen')}</td>
                      <td className="px-3 py-2 text-slate-700">{row._count?.parcels ?? 0}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(row)}
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-[13px] font-medium text-slate-800 hover:bg-slate-50"
                          >
                            {tr('edit')}
                          </button>
                          <button
                            type="button"
                            onClick={() => void remove(row.id)}
                            disabled={saving}
                            className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[13px] font-medium text-red-800 hover:bg-red-100 disabled:opacity-50"
                          >
                            {tr('delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingId === row.id && editDraft ? (
                      <tr className="bg-slate-50">
                        <td colSpan={8} className="px-3 py-4">
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <label className="block sm:col-span-2 lg:col-span-3">
                              <span className="mb-1 block text-[13px] font-medium text-slate-700">{tr('name')}</span>
                              <input
                                value={editDraft.name}
                                onChange={(e) => setEditDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px]"
                              />
                            </label>
                            <label className="block">
                              <span className="mb-1 block text-[13px] font-medium text-slate-700">{tr('originCountry')}</span>
                              <select
                                value={editDraft.originCountry}
                                onChange={(e) =>
                                  setEditDraft((d) =>
                                    d
                                      ? { ...d, originCountry: e.target.value as (typeof ORIGIN_CODES)[number] }
                                      : d,
                                  )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px]"
                              >
                                {ORIGIN_CODES.map((code) => (
                                  <option key={code} value={code}>
                                    {t(parcelOriginLabelKey(code))}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="block">
                              <span className="mb-1 block text-[13px] font-medium text-slate-700">{tr('destinationCountry')}</span>
                              <input
                                value={editDraft.destinationCountry}
                                onChange={(e) =>
                                  setEditDraft((d) => (d ? { ...d, destinationCountry: e.target.value } : d))
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px]"
                              />
                            </label>
                            <label className="block">
                              <span className="mb-1 block text-[13px] font-medium text-slate-700">{tr('departureAt')}</span>
                              <div className="flex flex-wrap items-center gap-2">
                                <input
                                  type="date"
                                  value={editDraft.departureDate}
                                  onChange={(e) =>
                                    setEditDraft((d) => {
                                      if (!d) return d;
                                      const v = e.target.value;
                                      return {
                                        ...d,
                                        departureDate: v,
                                        departureHour: v ? d.departureHour : '',
                                        departureMinute: v ? d.departureMinute : '',
                                      };
                                    })
                                  }
                                  className="flex-1 min-w-[140px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px]"
                                />
                                <select
                                  value={editDraft.departureHour}
                                  onChange={(e) =>
                                    setEditDraft((d) => (d ? { ...d, departureHour: e.target.value } : d))
                                  }
                                  className="w-[110px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px]"
                                >
                                  <option value="">HH</option>
                                  {HOUR_OPTIONS.map((h) => (
                                    <option key={h} value={h}>
                                      {h}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={editDraft.departureMinute}
                                  onChange={(e) =>
                                    setEditDraft((d) => (d ? { ...d, departureMinute: e.target.value } : d))
                                  }
                                  className="w-[110px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px]"
                                >
                                  <option value="">mm</option>
                                  {MINUTE_OPTIONS.map((m) => (
                                    <option key={m} value={m}>
                                      {m}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </label>
                            <label className="block">
                              <span className="mb-1 block text-[13px] font-medium text-slate-700">{tr('arrivalAt')}</span>
                              <div className="flex flex-wrap items-center gap-2">
                                <input
                                  type="date"
                                  value={editDraft.arrivalDate}
                                  onChange={(e) =>
                                    setEditDraft((d) => {
                                      if (!d) return d;
                                      const v = e.target.value;
                                      return {
                                        ...d,
                                        arrivalDate: v,
                                        arrivalHour: v ? d.arrivalHour : '',
                                        arrivalMinute: v ? d.arrivalMinute : '',
                                      };
                                    })
                                  }
                                  className="flex-1 min-w-[140px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px]"
                                />
                                <select
                                  value={editDraft.arrivalHour}
                                  onChange={(e) =>
                                    setEditDraft((d) => (d ? { ...d, arrivalHour: e.target.value } : d))
                                  }
                                  className="w-[110px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px]"
                                >
                                  <option value="">HH</option>
                                  {HOUR_OPTIONS.map((h) => (
                                    <option key={h} value={h}>
                                      {h}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={editDraft.arrivalMinute}
                                  onChange={(e) =>
                                    setEditDraft((d) => (d ? { ...d, arrivalMinute: e.target.value } : d))
                                  }
                                  className="w-[110px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px]"
                                >
                                  <option value="">mm</option>
                                  {MINUTE_OPTIONS.map((m) => (
                                    <option key={m} value={m}>
                                      {m}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </label>
                            <label className="block">
                              <span className="mb-1 block text-[13px] font-medium text-slate-700">{tr('status')}</span>
                              <select
                                value={editDraft.status}
                                onChange={(e) =>
                                  setEditDraft((d) =>
                                    d ? { ...d, status: e.target.value as 'open' | 'closed' } : d,
                                  )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px]"
                              >
                                <option value="open">{tr('statusOpen')}</option>
                                <option value="closed">{tr('statusClosed')}</option>
                              </select>
                            </label>
                            <label className="block sm:col-span-2 lg:col-span-3">
                              <span className="mb-1 block text-[13px] font-medium text-slate-700">{tr('notes')}</span>
                              <textarea
                                value={editDraft.notes}
                                onChange={(e) =>
                                  setEditDraft((d) => (d ? { ...d, notes: e.target.value } : d))
                                }
                                rows={2}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px]"
                              />
                            </label>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => void saveEdit()}
                              disabled={saving}
                              className="rounded-lg bg-[#3a5bff] px-4 py-2 text-[14px] font-semibold text-white disabled:opacity-60"
                            >
                              {tc('save')}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              disabled={saving}
                              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-[14px] font-medium text-slate-800"
                            >
                              {tc('cancel')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
