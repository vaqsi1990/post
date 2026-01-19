'use client';

import { useState } from 'react';
import CreateOrderForm from './CreateOrderForm';

type CreateOrderModalProps = {
  onOrderCreated?: (order: any) => void;
};

export default function CreateOrderModal({ onOrderCreated }: CreateOrderModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-black px-4 py-2 text-[16px] font-semibold text-white hover:bg-gray-800"
      >
        + ახალი Order-ის დამატება
      </button>

      <CreateOrderForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onOrderCreated={onOrderCreated}
      />
    </>
  );
}
