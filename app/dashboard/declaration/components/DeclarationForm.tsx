'use client';

import { useState, useRef } from 'react';

export default function DeclarationForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      if (f.type !== 'application/pdf') {
        setMessage({ type: 'error', text: 'მხოლოდ PDF ფორმატია დაშვებული' });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'ფაილის ზომა არ უნდა აღემატებოდეს 5 MB-ს' });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setFile(f);
      setMessage(null);
    } else {
      setFile(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const priceNum = parseFloat(price.replace(',', '.'));
    if (isNaN(priceNum) || priceNum < 0) {
      setMessage({ type: 'error', text: 'ფასი უნდა იყოს დადებითი რიცხვი' });
      return;
    }
    if (!file) {
      setMessage({ type: 'error', text: 'PDF ფაილის ატვირთვა აუცილებელია' });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set('firstName', firstName.trim());
      formData.set('lastName', lastName.trim());
      formData.set('trackingCode', trackingCode.trim());
      formData.set('price', String(priceNum));
      formData.set('file', file);
      const res = await fetch('/api/dashboard/declarations', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'შეცდომა' });
        setLoading(false);
        return;
      }
      setMessage({ type: 'success', text: data.message });
      setFirstName('');
      setLastName('');
      setTrackingCode('');
      setPrice('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setMessage({ type: 'error', text: 'შეცდომა ქსელში' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">დეკლარაციის გაგზავნა</h1>
      <p className="mb-6 text-[14px] text-gray-600">
        შეავსეთ სახელი, გვარი, თრექინგ კოდი, ფასი და ატვირთეთ დეკლარაციის PDF ფაილი.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div
            className={`rounded-lg px-4 py-3 text-[15px] ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="decl-firstName" className="mb-1 block text-[14px] font-medium text-gray-700">
              სახელი *
            </label>
            <input
              id="decl-firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="სახელი"
            />
          </div>
          <div>
            <label htmlFor="decl-lastName" className="mb-1 block text-[14px] font-medium text-gray-700">
              გვარი *
            </label>
            <input
              id="decl-lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="გვარი"
            />
          </div>
        </div>
        <div>
          <label htmlFor="decl-trackingCode" className="mb-1 block text-[14px] font-medium text-gray-700">
            თრექინგ კოდი *
          </label>
          <input
            id="decl-trackingCode"
            type="text"
            required
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="მაგ. 1Z999AA10123456784"
          />
        </div>
        <div>
          <label htmlFor="decl-price" className="mb-1 block text-[14px] font-medium text-gray-700">
            ფასი (USD) *
          </label>
          <input
            id="decl-price"
            type="text"
            inputMode="decimal"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="0.00"
          />
        </div>
        <div>
          <label htmlFor="decl-file" className="mb-1 block text-[14px] font-medium text-gray-700">
            დეკლარაციის PDF ფაილი *
          </label>
          <input
            ref={fileInputRef}
            id="decl-file"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black file:mr-3 file:rounded file:border-0 file:bg-amber-100 file:px-3 file:py-1.5 file:text-[14px] file:font-semibold file:text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {file && (
            <p className="mt-1 text-[13px] text-gray-500">
              არჩეული: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
          <p className="mt-1 text-[13px] text-gray-500">მაქს. 5 MB, მხოლოდ PDF</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-400 px-5 py-2.5 text-[15px] font-semibold text-black hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-70"
        >
          {loading ? 'იგზავნება...' : 'დეკლარაციის გაგზავნა'}
        </button>
      </form>
    </>
  );
}
