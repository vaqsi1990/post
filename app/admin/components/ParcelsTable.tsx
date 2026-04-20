'use client';

import React, { useEffect, useRef, useState } from 'react';
import { formatOriginCountryLabel } from '@/lib/formatOriginCountry';
import { employeeCountryLabel } from '@/lib/employeeCountryLabel';
import { useLocale } from 'next-intl';

type Parcel = {
  id: string;
  trackingNumber: string;
  status: string;
  price: number;
  shippingAmount?: number | null;
  shippingFormula?: string | null;
  currency: string;
  weight: number | null;
  originCountry: string | null;
  quantity: number;
  customerName: string;
  createdAt: string;
  filePath: string | null;
  courierServiceRequested: boolean;
  courierFeeAmount: number | null;
  payableAmount: number | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone?: string | null;
    city?: string | null;
    address?: string | null;
  };
  createdBy: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    employeeCountry: string | null;
  } | null;
};

type ParcelsTableProps = {
  parcels: Parcel[];
  currentStatus: string;
  allowDelete?: boolean;
  onParcelUpdated?: (parcel: Parcel) => void;
};

const formatPhone = (phone?: string | null) => {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  // Georgian phone, store internally as 995 + 9 digits (e.g. 995599542624)
  if (digits.startsWith('995') && digits.length === 12) {
    const local = digits.slice(3); // 9 digits
    return `+995 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  // If only local 9‑digit number like 599542624
  if (digits.length === 9 && digits.startsWith('5')) {
    return `+995 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return digits;
};

export default function ParcelsTable({
  parcels: initialParcels,
  currentStatus,
  allowDelete = true,
  onParcelUpdated,
}: ParcelsTableProps) {
  const locale = useLocale();
  const isEn = locale === 'en';
  const isRu = locale === 'ru';
  const t = {
    pending: isRu ? 'Склад' : isEn ? 'Warehouse' : 'მოლოდინში',
    inWarehouse: isRu ? 'На складе' : isEn ? 'In warehouse' : 'საწყობში',
    inTransit: isRu ? 'В пути' : isEn ? 'In transit' : 'გზაში',
    arrived: isRu ? 'Прибывшие' : isEn ? 'Arrived' : 'ჩამოსული',
    region: isRu ? 'Регион' : isEn ? 'Region' : 'რეგიონი',
    stopped: isRu ? 'Остановлена' : isEn ? 'Stopped' : 'გაჩერებული',
    delivered: isRu ? 'Доставленные' : isEn ? 'Delivered' : 'გატანილი',
    statusUpdateError: isRu ? 'Ошибка при обновлении статуса' : isEn ? 'Failed to update status' : 'სტატუსის განახლებისას მოხდა შეცდომა',
    courierFeeInvalid: isRu ? 'Курьерская сумма должна быть положительным числом или пустой (очистка).' : isEn ? 'Courier fee must be a positive number or empty (clear).' : 'საკურიერო თანხა უნდა იყოს დადებითი რიცხვი ან ცარიელი (გასუფთავება).',
    courierFeeSaveError: isRu ? 'Не удалось сохранить курьерскую сумму' : isEn ? 'Failed to save courier fee' : 'საკურიერო თანხის შენახვა ვერ მოხერხდა',
    payableInvalid: isRu ? 'Сумма к оплате должна быть положительным числом или пустой.' : isEn ? 'Payable amount must be a positive number or empty.' : 'გადასახდელი თანხა უნდა იყოს დადებითი რიცხვი ან ცარიელი.',
    payableSaveError: isRu ? 'Не удалось сохранить сумму к оплате' : isEn ? 'Failed to save payable amount' : 'გადასახდელი თანხის შენახვა ვერ მოხერხდა',
    weightInvalid: isRu ? 'Вес должен быть числом не меньше 0,001 кг.' : isEn ? 'Weight must be a number of at least 0.001 kg.' : 'წონა უნდა იყოს რიცხვი მინიმუმ 0,001 კგ.',
    weightSaveError: isRu ? 'Не удалось сохранить вес' : isEn ? 'Failed to save weight' : 'წონის შენახვა ვერ მოხერხდა',
    genericError: isRu ? 'Произошла ошибка. Пожалуйста, попробуйте снова.' : isEn ? 'An error occurred. Please try again.' : 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.',
    deleteConfirm: isRu ? 'Вы уверены, что хотите удалить посылку?' : isEn ? 'Are you sure you want to delete the parcel?' : 'დარწმუნებული ხართ, რომ გსურთ ამანათის წაშლა?',
    deleteError: isRu ? 'Ошибка при удалении посылки' : isEn ? 'Failed to delete parcel' : 'ამანათის წაშლისას მოხდა შეცდომა',
    noParcels: isRu ? 'Пока нет ни одной посылки.' : isEn ? 'No parcels yet.' : 'ჯერ არცერთი ამანათი არ არის.',
    tracking: isRu ? 'Трекинг' : isEn ? 'Tracking' : 'თრექინგი',
    quantity: isRu ? 'Количество' : isEn ? 'Quantity' : 'რაოდენობა',
    weight: isRu ? 'Вес' : isEn ? 'Weight' : 'წონა',
    itemValue: isRu ? 'Стоимость товара' : isEn ? 'Item value' : 'ნივთის ღირებულება',
    amount: isRu ? 'Сумма' : isEn ? 'Amount' : 'თანხა',
    phone: isRu ? 'Телефон' : isEn ? 'Phone' : 'ტელეფონი',
    city: isRu ? 'Город' : isEn ? 'City' : 'ქალაქი',
    street: isRu ? 'Улица' : isEn ? 'Street' : 'ქუჩა',
    arrivedPayable: isRu ? 'Прибыло — сумма к оплате' : isEn ? 'Arrived — payable amount' : 'ჩამოსული — გადასახდელი თანხა',
    payable: isRu ? 'К оплате' : isEn ? 'Payable' : 'გადასახდელი',
    save: isRu ? 'Сохранить' : isEn ? 'Save' : 'შენახვა',
    courierShort: isRu ? 'Курьер' : isEn ? 'Courier' : 'საკურიერ',
    requestedByUser: isRu ? '(запрошено пользователем)' : isEn ? '(requested by user)' : '(მომხმარებელმა მოითხოვა)',
    courier: isRu ? 'Курьерская' : isEn ? 'Courier' : 'საკურიერო',
    file: isRu ? 'Файл' : isEn ? 'File' : 'ფაილი',
    open: isRu ? 'Открыть' : isEn ? 'Open' : 'გახსნა',
    download: isRu ? 'Скачать' : isEn ? 'Download' : 'ჩამოტვირთვა',
    status: isRu ? 'Статус' : isEn ? 'Status' : 'სტატუსი',
    deleting: isRu ? 'Удаляется...' : isEn ? 'Deleting...' : 'შლდება...',
    delete: isRu ? 'Удалить' : isEn ? 'Delete' : 'წაშლა',
    user: isRu ? 'Пользователь' : isEn ? 'User' : 'მომხმარებელი',
    details: isRu ? 'Подробнее' : isEn ? 'Details' : 'დეტალურად',
    country: isRu ? 'Страна' : isEn ? 'Country' : 'ქვეყანა',
    date: isRu ? 'Дата' : isEn ? 'Date' : 'თარიღი',
    userRequest: isRu ? 'Запрос пользователя' : isEn ? 'User request' : 'მომხმარებლის მოთხოვნა',
    saving: isRu ? 'Сохранение...' : isEn ? 'Saving...' : 'ინახება...',
    uploadedBy: isRu ? 'Кто загрузил' : isEn ? 'Uploaded by' : 'ატვირთა',
    uploadedByCountry: isRu ? 'Страна сотрудника' : isEn ? 'Staff country' : 'თანამშრომლის ქვეყანა',
    uploaderAdmin: isRu ? 'Администратор' : isEn ? 'Administrator' : 'ადმინისტრატორი',
    bulkSelectAll: isRu ? 'Выбрать все' : isEn ? 'Select all' : 'ყველას მონიშვნა',
    bulkClearSelection: isRu ? 'Снять выделение' : isEn ? 'Clear selection' : 'მონიშვნის გასუფთავება',
    bulkSelectedLabel: isRu ? 'Выбрано' : isEn ? 'Selected' : 'არჩეულია',
    bulkNewStatus: isRu ? 'Новый статус' : isEn ? 'New status' : 'ახალი სტატუსი',
    bulkApply: isRu ? 'Применить' : isEn ? 'Apply' : 'გამოყენება',
    bulkPickStatus: isRu ? 'Выберите статус' : isEn ? 'Choose status' : 'აირჩიეთ სტატუსი',
    bulkApplying: isRu ? 'Применение...' : isEn ? 'Applying...' : 'იგზავნება...',
    bulkSelectParcel: isRu ? 'Выбрать посылку' : isEn ? 'Select parcel' : 'ამანათის მონიშვნა',
  } as const;
  const statusOptions = [
    { value: 'pending', label: t.pending },
    { value: 'in_warehouse', label: t.inWarehouse },
    { value: 'in_transit', label: t.inTransit },
    { value: 'arrived', label: t.arrived },
    { value: 'region', label: t.region },
    { value: 'stopped', label: t.stopped },
    { value: 'delivered', label: t.delivered },
  ];

  function renderUploaderBlock(parcel: Parcel) {
    if (!parcel.createdBy) {
      return (
        <div className="mt-2 border-t border-gray-100 pt-2 text-[12px] text-gray-600">
          <p className="font-semibold text-gray-900">{t.uploadedBy}</p>
          <p>—</p>
        </div>
      );
    }
    const u = parcel.createdBy;
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email;
    return (
      <div className="mt-2 border-t border-gray-100 pt-2 text-[12px] text-gray-700">
        <p className="font-semibold text-gray-900">{t.uploadedBy}</p>
        <p className="text-black">{name}</p>
        {u.role === 'EMPLOYEE' ? (
          <p className="text-gray-700">
            {t.uploadedByCountry}: {employeeCountryLabel(u.employeeCountry, locale)}
          </p>
        ) : (
          <p className="text-gray-600">{t.uploaderAdmin}</p>
        )}
      </div>
    );
  }

  const [parcels, setParcels] = useState(initialParcels);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feeDraftById, setFeeDraftById] = useState<Record<string, string>>({});
  const [courierFeeSavingId, setCourierFeeSavingId] = useState<string | null>(null);
  const [payableDraftById, setPayableDraftById] = useState<Record<string, string>>({});
  const [payableSavingId, setPayableSavingId] = useState<string | null>(null);
  const [weightDraftById, setWeightDraftById] = useState<Record<string, string>>({});
  const [weightSavingId, setWeightSavingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkTargetStatus, setBulkTargetStatus] = useState('');
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const allSelected =
    parcels.length > 0 && selectedIds.length === parcels.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < parcels.length;

  useEffect(() => {
    const valid = new Set(parcels.map((p) => p.id));
    setSelectedIds((prev) => prev.filter((id) => valid.has(id)));
  }, [parcels]);

  useEffect(() => {
    const el = selectAllRef.current;
    if (el) el.indeterminate = someSelected;
  }, [someSelected]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(parcels.map((p) => p.id));
    }
  };

  const handleBulkStatusApply = async () => {
    if (selectedIds.length === 0) return;
    const newStatus = bulkTargetStatus;
    if (!newStatus) {
      setError(t.bulkPickStatus);
      return;
    }

    setBulkUpdating(true);
    setError('');

    const ids = [...selectedIds];
    try {
      const results = await Promise.allSettled(
        ids.map(async (parcelId) => {
          const res = await fetch(`/api/admin/parcels/${parcelId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(
              typeof data.error === 'string' ? data.error : t.statusUpdateError,
            );
          }
          return { parcelId, parcel: data.parcel as Parcel };
        }),
      );

      const succeeded: { parcelId: string; parcel: Parcel }[] = [];
      let failCount = 0;
      for (const r of results) {
        if (r.status === 'fulfilled') {
          succeeded.push(r.value);
        } else {
          failCount++;
        }
      }

      setParcels((prev) => {
        let next = [...prev];
        for (const { parcelId, parcel } of succeeded) {
          if (parcel.status !== currentStatus) {
            next = next.filter((p) => p.id !== parcelId);
          } else {
            next = next.map((p) => (p.id === parcelId ? parcel : p));
          }
        }
        return next;
      });

      const okIds = new Set(succeeded.map((s) => s.parcelId));
      for (const { parcel } of succeeded) {
        onParcelUpdated?.(parcel);
      }
      setSelectedIds((prev) => prev.filter((id) => !okIds.has(id)));

      if (failCount > 0) {
        const total = ids.length;
        setError(
          isRu
            ? `Не удалось обновить ${failCount} из ${total}`
            : isEn
              ? `Failed to update ${failCount} of ${total} parcels`
              : `${failCount}/${total} ამანათის სტატუსი ვერ განახლდა`,
        );
      }
    } catch {
      setError(t.genericError);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleStatusChange = async (parcelId: string, newStatus: string) => {
    setUpdatingId(parcelId);
    setError('');

    try {
      const res = await fetch(`/api/admin/parcels/${parcelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.statusUpdateError);
        return;
      }

      const updatedParcel: Parcel = data.parcel;

      if (updatedParcel.status !== currentStatus) {
        setParcels((prev) => prev.filter((p) => p.id !== parcelId));
      } else {
        setParcels((prev) =>
          prev.map((p) => (p.id === parcelId ? updatedParcel : p))
        );
      }

      if (onParcelUpdated) {
        onParcelUpdated(updatedParcel);
      }
    } catch {
      setError(t.genericError);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveCourierFee = async (parcel: Parcel) => {
    const raw = feeDraftById[parcel.id];
    const trimmed = raw?.trim() ?? '';
    let value: number | null;
    if (trimmed === '') {
      value = null;
    } else {
      const n = parseFloat(trimmed.replace(',', '.'));
      if (Number.isNaN(n) || n < 0) {
        setError(t.courierFeeInvalid);
        return;
      }
      value = Math.round(n * 100) / 100;
    }

    setCourierFeeSavingId(parcel.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/parcels/${parcel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierFeeAmount: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.courierFeeSaveError);
        return;
      }
      const updatedParcel: Parcel = data.parcel;
      setParcels((prev) =>
        prev.map((p) => (p.id === parcel.id ? updatedParcel : p)),
      );
      setFeeDraftById((prev) => {
        const next = { ...prev };
        delete next[parcel.id];
        return next;
      });
      if (onParcelUpdated) onParcelUpdated(updatedParcel);
    } catch {
      setError(t.genericError);
    } finally {
      setCourierFeeSavingId(null);
    }
  };

  const handleSaveWeight = async (parcel: Parcel) => {
    const raw = weightDraftById[parcel.id];
    const trimmed = raw?.trim() ?? '';
    if (trimmed === '') {
      setError(t.weightInvalid);
      return;
    }
    const n = parseFloat(trimmed.replace(',', '.'));
    if (Number.isNaN(n) || n < 0.001) {
      setError(t.weightInvalid);
      return;
    }
    const value = Math.round(n * 1000) / 1000;

    setWeightSavingId(parcel.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/parcels/${parcel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.weightSaveError);
        return;
      }
      const updatedParcel: Parcel = data.parcel;
      setParcels((prev) =>
        prev.map((p) => (p.id === parcel.id ? updatedParcel : p)),
      );
      setWeightDraftById((prev) => {
        const next = { ...prev };
        delete next[parcel.id];
        return next;
      });
      if (onParcelUpdated) onParcelUpdated(updatedParcel);
    } catch {
      setError(t.genericError);
    } finally {
      setWeightSavingId(null);
    }
  };

  const handleSavePayable = async (parcel: Parcel) => {
    const raw = payableDraftById[parcel.id];
    const trimmed = raw?.trim() ?? '';
    let value: number | null;
    if (trimmed === '') {
      value = null;
    } else {
      const n = parseFloat(trimmed.replace(',', '.'));
      if (Number.isNaN(n) || n < 0) {
        setError(t.payableInvalid);
        return;
      }
      value = Math.round(n * 100) / 100;
    }

    setPayableSavingId(parcel.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/parcels/${parcel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payableAmount: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.payableSaveError);
        return;
      }
      const updatedParcel: Parcel = data.parcel;
      setParcels((prev) =>
        prev.map((p) => (p.id === parcel.id ? updatedParcel : p)),
      );
      setPayableDraftById((prev) => {
        const next = { ...prev };
        delete next[parcel.id];
        return next;
      });
      if (onParcelUpdated) onParcelUpdated(updatedParcel);
    } catch {
      setError(t.genericError);
    } finally {
      setPayableSavingId(null);
    }
  };

  const handleDelete = async (parcelId: string) => {
    if (!window.confirm(t.deleteConfirm)) {
      return;
    }

    setDeletingId(parcelId);
    setError('');

    try {
      const res = await fetch(`/api/admin/parcels/${parcelId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.deleteError);
        return;
      }

      setParcels((prev) => prev.filter((p) => p.id !== parcelId));
    } catch {
      setError(t.genericError);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-[16px] text-red-800">{error}</p>
        </div>
      ) : null}

      {parcels.length > 0 ? (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex cursor-pointer items-center gap-2 text-[14px] text-black">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              disabled={bulkUpdating}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span>{t.bulkSelectAll}</span>
          </label>
          <span className="text-[14px] text-gray-700">
            {t.bulkSelectedLabel}: {selectedIds.length}
          </span>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            disabled={selectedIds.length === 0 || bulkUpdating}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[14px] text-black hover:bg-gray-100 disabled:opacity-50"
          >
            {t.bulkClearSelection}
          </button>
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <label className="flex items-center gap-2 text-[14px] text-black">
              <span className="whitespace-nowrap">{t.bulkNewStatus}</span>
              <select
                value={bulkTargetStatus}
                onChange={(e) => setBulkTargetStatus(e.target.value)}
                disabled={bulkUpdating}
                className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-[14px] text-black"
              >
                <option value="">{t.bulkPickStatus}</option>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={handleBulkStatusApply}
              disabled={
                selectedIds.length === 0 || !bulkTargetStatus || bulkUpdating
              }
              className="rounded-md bg-black px-4 py-1.5 text-[14px] font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {bulkUpdating ? t.bulkApplying : t.bulkApply}
            </button>
          </div>
        </div>
      ) : null}

      {/* Mobile / small screens: card layout */}
      <div className="space-y-3 md:hidden">
        {parcels.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center text-[16px] text-gray-600">
            {t.noParcels}
          </div>
        ) : (
          parcels.map((parcel) => (
            <div
              key={parcel.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(parcel.id)}
                    onChange={() => toggleSelect(parcel.id)}
                    disabled={bulkUpdating}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300"
                    aria-label={t.bulkSelectParcel}
                  />
                  <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-black">
                    {parcel.customerName}
                  </p>
                  <p className="text-[13px] text-gray-600">
                    {parcel.user.email}
                  </p>
                  </div>
                </div>
                <div className="text-right text-[13px] text-black">
                  <p>{parcel.createdAt}</p>
                  <p>{formatOriginCountryLabel(parcel.originCountry)}</p>
                </div>
              </div>

                <div className="mb-3 grid grid-cols-2 gap-2 text-[13px] text-black">
                <span className="text-black">{t.tracking}</span>
                <span className="text-black">{parcel.trackingNumber}</span>

                <span className="text-black">{t.quantity}</span>
                <span className="text-black">{parcel.quantity}</span>

                <span className="text-black">{t.weight}</span>
                {currentStatus === 'arrived' || currentStatus === 'in_warehouse' ? (
                  <span className="flex flex-wrap items-center gap-2 text-black">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      value={
                        weightDraftById[parcel.id] !== undefined
                          ? weightDraftById[parcel.id]
                          : parcel.weight != null
                            ? String(parcel.weight)
                            : ''
                      }
                      onChange={(e) =>
                        setWeightDraftById((prev) => ({
                          ...prev,
                          [parcel.id]: e.target.value,
                        }))
                      }
                      className="w-28 rounded-md border border-gray-300 px-2 py-1 text-[14px] text-black"
                    />
                    <span className="text-[13px] text-gray-600">kg</span>
                    <button
                      type="button"
                      disabled={weightSavingId === parcel.id}
                      onClick={() => handleSaveWeight(parcel)}
                      className="rounded-md bg-black px-2 py-1 text-[12px] font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                      {weightSavingId === parcel.id ? '...' : t.save}
                    </button>
                  </span>
                ) : (
                  <span className="text-black">
                    {parcel.weight != null ? `${parcel.weight} kg` : '—'}
                  </span>
                )}

                <span className="text-black">{t.itemValue}</span>
                <span className="text-black">
                  {parcel.price.toFixed(2)} {parcel.currency || 'GEL'}
                </span>

                {currentStatus === 'arrived' || currentStatus === 'delivered' ? (
                  <>
                    <span className="text-black">{t.amount}</span>
                    <span className="text-black">
                      {parcel.shippingAmount != null
                        ? `${parcel.shippingAmount.toFixed(2)} GEL${
                            parcel.shippingFormula ? ` (${parcel.shippingFormula})` : ''
                          }`
                        : '—'}
                    </span>
                  </>
                ) : null}

                <span className="text-black">{t.phone}</span>
                <span className="text-black">
                  {formatPhone(parcel.user.phone)}
                </span>

                <span className="text-black">{t.city}</span>
                <span className="text-black">
                  {parcel.user.city || '—'}
                </span>

                <span className="text-black">{t.street}</span>
                <span className="text-black">
                  {parcel.user.address || '—'}
                </span>

                <div className="col-span-2">{renderUploaderBlock(parcel)}</div>

                {currentStatus === 'arrived' ? (
                  <>
                    <span className="col-span-2 mt-1 border-t border-gray-100 pt-2 text-[12px] font-semibold text-black">
                      {t.arrivedPayable}
                    </span>
                    <span className="text-black">{t.payable} ({parcel.currency || 'GEL'})</span>
                    <span className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={
                          payableDraftById[parcel.id] !== undefined
                            ? payableDraftById[parcel.id]
                            : parcel.payableAmount != null
                              ? String(parcel.payableAmount)
                              : ''
                        }
                        onChange={(e) =>
                          setPayableDraftById((prev) => ({
                            ...prev,
                            [parcel.id]: e.target.value,
                          }))
                        }
                        className="w-28 rounded-md border border-gray-300 px-2 py-1 text-[14px] text-black"
                      />
                      <button
                        type="button"
                        disabled={payableSavingId === parcel.id}
                        onClick={() => handleSavePayable(parcel)}
                        className="rounded-md bg-[#3a5bff] px-2 py-1 text-[12px] font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                      >
                        {payableSavingId === parcel.id ? '...' : t.save}
                      </button>
                    </span>

                    <span className="col-span-2 mt-1 border-t border-gray-100 pt-2 text-[12px] font-semibold text-amber-900">
                      {t.courierShort}
                      {parcel.courierServiceRequested ? (
                        <span className="ml-1 font-normal text-amber-800">
                          {t.requestedByUser}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-black">{t.courier} ({parcel.currency || 'GEL'})</span>
                    <span className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={
                          feeDraftById[parcel.id] !== undefined
                            ? feeDraftById[parcel.id]
                            : parcel.courierFeeAmount != null
                              ? String(parcel.courierFeeAmount)
                              : ''
                        }
                        onChange={(e) =>
                          setFeeDraftById((prev) => ({
                            ...prev,
                            [parcel.id]: e.target.value,
                          }))
                        }
                        className="w-28 rounded-md border border-gray-300 px-2 py-1 text-[14px] text-black"
                      />
                      <button
                        type="button"
                        disabled={courierFeeSavingId === parcel.id}
                        onClick={() => handleSaveCourierFee(parcel)}
                        className="rounded-md bg-[#3a5bff] px-2 py-1 text-[12px] font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                      >
                        {courierFeeSavingId === parcel.id ? '...' : t.save}
                      </button>
                    </span>
                  </>
                ) : null}

                <span className="text-black">{t.file}</span>
                {parcel.filePath ? (
                  <span className="flex flex-wrap gap-2">
                    <a
                      href={parcel.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md bg-gray-900 px-2 py-1 text-[12px] font-medium text-white hover:bg-black"
                    >
                      {t.open}
                    </a>
                    <a
                      href={parcel.filePath}
                      download
                      className="rounded-md bg-gray-100 px-2 py-1 text-[12px] font-medium text-gray-900 hover:bg-gray-200"
                    >
                      {t.download}
                    </a>
                  </span>
                ) : (
                  <span className="text-black">—</span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-black">{t.status}</span>
                <div className="flex flex-1 flex-col md:flex-row items-center gap-2">
                  <select
                    value={parcel.status}
                    onChange={(e) => handleStatusChange(parcel.id, e.target.value)}
                    disabled={
                      updatingId === parcel.id ||
                      deletingId === parcel.id ||
                      bulkUpdating
                    }
                    className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-[14px] text-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDelete(parcel.id)}
                    disabled={deletingId === parcel.id}
                    className="rounded-md bg-red-600 px-2 py-1 text-[12px] font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingId === parcel.id ? t.deleting : t.delete}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop / larger screens: table layout */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-[16px] md:text-[18px] font-semibold text-black">
                {t.user}
              </th>
             
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {parcels.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-6 text-center text-[16px] text-gray-600"
                >
                  {t.noParcels}
                </td>
              </tr>
            ) : (
              parcels.map((parcel) => (
                <React.Fragment key={parcel.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2 align-top text-[16px] text-black">
                      <span className="inline-flex flex-wrap items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(parcel.id)}
                          onChange={() => toggleSelect(parcel.id)}
                          disabled={bulkUpdating}
                          className="h-4 w-4 shrink-0 rounded border-gray-300"
                          aria-label={t.bulkSelectParcel}
                        />
                        <span>{parcel.user.email}</span>
                        {parcel.courierServiceRequested ? (
                          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                            {t.courier}
                          </span>
                        ) : null}
                      </span>
                      {(parcel.user.firstName || parcel.user.lastName) && (
                        <span className="block text-sm text-black">
                          {parcel.user.firstName} {parcel.user.lastName}
                        </span>
                      )}
                      {renderUploaderBlock(parcel)}
                    </td>
                    <td className="px-4 py-2 text-right text-[14px] text-blue-600">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expandedId === parcel.id ? null : parcel.id)
                        }
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-blue-50"
                      >
                        <span>{t.details}</span>
                        <span
                          className={`transition-transform ${
                            expandedId === parcel.id ? 'rotate-180' : ''
                          }`}
                        >
                          ▼
                        </span>
                      </button>
                    </td>
                  </tr>
                  {expandedId === parcel.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={2} className="px-4 pb-4 pt-0 text-black text-[14px] md:text-[18px]">
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <span className="text-black">{t.user}</span>
                          <span>{parcel.customerName}</span>

                          <div className="col-span-2">{renderUploaderBlock(parcel)}</div>

                          <span className="text-black">{t.tracking}</span>
                          <span>{parcel.trackingNumber}</span>

                          <span className="text-black">{t.quantity}</span>
                          <span>{parcel.quantity}</span>

                          <span className="text-black">{t.country}</span>
                          <span>{formatOriginCountryLabel(parcel.originCountry)}</span>

                          <span className="text-black">{t.weight}</span>
                          {currentStatus === 'arrived' || currentStatus === 'in_warehouse' ? (
                            <span className="flex flex-wrap items-center gap-2">
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder="0"
                                value={
                                  weightDraftById[parcel.id] !== undefined
                                    ? weightDraftById[parcel.id]
                                    : parcel.weight != null
                                      ? String(parcel.weight)
                                      : ''
                                }
                                onChange={(e) =>
                                  setWeightDraftById((prev) => ({
                                    ...prev,
                                    [parcel.id]: e.target.value,
                                  }))
                                }
                                className="w-32 rounded-md border border-gray-300 px-2 py-1 text-[14px] text-black"
                              />
                              <span className="text-black">kg</span>
                              <button
                                type="button"
                                disabled={weightSavingId === parcel.id}
                                onClick={() => handleSaveWeight(parcel)}
                                className="rounded-md bg-[#3a5bff] px-2 py-1 text-[12px] font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                              >
                                {weightSavingId === parcel.id ? t.saving : t.save}
                              </button>
                            </span>
                          ) : (
                            <span>
                              {parcel.weight != null
                                ? `${parcel.weight} kg`
                                : '—'}
                            </span>
                          )}

                          <span className="text-black">{t.itemValue}</span>
                          <span>
                            {parcel.price.toFixed(2)} {parcel.currency || 'GEL'}
                          </span>

                          {currentStatus === 'arrived' || currentStatus === 'delivered' ? (
                            <>
                              <span className="text-black">{t.amount}</span>
                              <span>
                                {parcel.shippingAmount != null
                                  ? `${parcel.shippingAmount.toFixed(2)} GEL${
                                      parcel.shippingFormula ? ` (${parcel.shippingFormula})` : ''
                                    }`
                                  : '—'}
                              </span>
                            </>
                          ) : null}

                          <span className="text-black">{t.phone}</span>
                          <span>{formatPhone(parcel.user.phone)}</span>

                          <span className="text-black">{t.city}</span>
                          <span>{parcel.user.city || '—'}</span>

                          <span className="text-black">{t.street}</span>
                          <span>{parcel.user.address || '—'}</span>

                          <span className="text-black">{t.file}</span>
                          {parcel.filePath ? (
                            <span className="flex flex-wrap gap-2">
                              <a
                                href={parcel.filePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded-md bg-gray-900 px-2 py-1 text-[12px] font-medium text-white hover:bg-black"
                              >
                                {t.open}
                              </a>
                              <a
                                href={parcel.filePath}
                                download
                                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-[12px] font-medium text-gray-900 hover:bg-gray-200"
                              >
                                {t.download}
                              </a>
                            </span>
                          ) : (
                            <span>—</span>
                          )}

                          <span className="text-black">{t.date}</span>
                          <span>{parcel.createdAt}</span>

                          {currentStatus === 'arrived' ? (
                            <>
                              <span className="text-black">{t.payable}</span>
                              <span className="flex flex-wrap items-center gap-2">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  placeholder="0"
                                  value={
                                    payableDraftById[parcel.id] !== undefined
                                      ? payableDraftById[parcel.id]
                                      : parcel.payableAmount != null
                                        ? String(parcel.payableAmount)
                                        : ''
                                  }
                                  onChange={(e) =>
                                    setPayableDraftById((prev) => ({
                                      ...prev,
                                      [parcel.id]: e.target.value,
                                    }))
                                  }
                                  className="w-32 rounded-md border border-gray-300 px-2 py-1 text-[14px] text-black"
                                />
                                <span className="text-black">{parcel.currency || 'GEL'}</span>
                                <button
                                  type="button"
                                  disabled={payableSavingId === parcel.id}
                                  onClick={() => handleSavePayable(parcel)}
                                  className="rounded-md bg-[#3a5bff] px-2 py-1 text-[12px] font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                                >
                                  {payableSavingId === parcel.id ? t.saving : t.save}
                                </button>
                              </span>

                              <span className="text-black">{t.courier}</span>
                              <span className="flex flex-col gap-1">
                                {parcel.courierServiceRequested ? (
                                  <span className="text-[12px] text-amber-900">
                                    {t.userRequest}
                                  </span>
                                ) : null}
                                <span className="flex flex-wrap items-center gap-2">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0"
                                    value={
                                      feeDraftById[parcel.id] !== undefined
                                        ? feeDraftById[parcel.id]
                                        : parcel.courierFeeAmount != null
                                          ? String(parcel.courierFeeAmount)
                                          : ''
                                    }
                                    onChange={(e) =>
                                      setFeeDraftById((prev) => ({
                                        ...prev,
                                        [parcel.id]: e.target.value,
                                      }))
                                    }
                                    className="w-32 rounded-md border border-gray-300 px-2 py-1 text-[14px] text-black"
                                  />
                                  <span className="text-black">{parcel.currency || 'GEL'}</span>
                                  <button
                                    type="button"
                                    disabled={courierFeeSavingId === parcel.id}
                                    onClick={() => handleSaveCourierFee(parcel)}
                                    className="rounded-md bg-black px-2 py-1 text-[12px] font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                                  >
                                    {courierFeeSavingId === parcel.id ? t.saving : t.save}
                                  </button>
                                </span>
                              </span>
                            </>
                          ) : null}

                          <span className="text-black">{t.status}</span>
                          <span className="flex items-center gap-2">
                            <select
                              value={parcel.status}
                              onChange={(e) =>
                                handleStatusChange(parcel.id, e.target.value)
                              }
                              disabled={
                                updatingId === parcel.id ||
                                deletingId === parcel.id ||
                                bulkUpdating
                              }
                              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-[14px] text-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                            >
                              {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            {allowDelete ? (
                              <button
                                type="button"
                                onClick={() => handleDelete(parcel.id)}
                                disabled={deletingId === parcel.id}
                                className="mt-1 rounded-md bg-red-600 px-2 py-1 text-[12px] font-medium text-white hover:bg-red-700 disabled:opacity-50"
                              >
                                {deletingId === parcel.id ? t.deleting : t.delete}
                              </button>
                            ) : null}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

