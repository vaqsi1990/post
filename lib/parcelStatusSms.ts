import prisma from '@/lib/prisma';
import { warehouseFromPhraseKa } from '@/lib/parcelWarehouseSmsKa';
import { sendSms, normalizePhone } from '@/lib/sms';

/** სტატუსები, რომლებზეც მფლობელს SMS-ს ვუგზავნით */
const SMS_ON_STATUSES = new Set([
  'in_warehouse',
  'in_transit',
  'arrived',
  'delivered',
  'stopped',
]);

function smsBodyForStatus(
  status: string,
  trackingNumber: string,
  warehousePhrase: string | null,
): string | null {
  const code = trackingNumber.trim();
  if (status === 'in_warehouse') {
    if (warehousePhrase) {
      return `კომპანია Postifly გაცნობებთ, რომ თქვენი ამანათი კოდით ${code} მიღებულია ${warehousePhrase}  საწყობში`;
    }
    return `კომპანია Postifly გაცნობებთ, რომ თქვენი ამანათი კოდით ${code} მიღებულია საწყობში`;
  }

  const core = warehousePhrase
    ? `თქვენი ამანათი ${warehousePhrase}, კოდით ${code}`
    : `თქვენი ამანათი კოდით ${code}`;
  switch (status) {
    case 'in_transit':
      return `კომპანია Postifly გაცნობებთ, რომ ${core} გზაშია`;
    case 'arrived':
      return `კომპანია Postifly გაცნობებთ, რომ ${core} ჩამოსულია`;
    case 'delivered':
      return `კომპანია Postifly გაცნობებთ, რომ ${core} გატანილია`;
    case 'stopped':
      return `კომპანია Postifly გაცნობებთ, რომ ${core} გაჩერდა საბაჟოზე`;
    default:
      return null;
  }
}

/**
 * სტატუსის ცვლილებისას SMS მფლობელის ნომერზე (თუ არის). ინახავს smsSent-ს წარმატების მიხედვით.
 */
export async function notifyParcelOwnerStatusSms(params: {
  parcelId: string;
  previousStatus: string;
  newStatus: string;
  trackingNumber: string;
  ownerPhone: string | null | undefined;
  /** საერთაშორისო საწყობის ქვეყანა — SMS-ში ჩანს მხოლოდ `in_warehouse` სტატუსზე */
  originCountry?: string | null;
}): Promise<void> {
  const { parcelId, previousStatus, newStatus, trackingNumber, ownerPhone, originCountry } =
    params;
  if (previousStatus === newStatus) return;
  if (!SMS_ON_STATUSES.has(newStatus)) return;

  const warehousePhrase =
    newStatus === 'in_warehouse' ? warehouseFromPhraseKa(originCountry) : null;
  const text = smsBodyForStatus(newStatus, trackingNumber, warehousePhrase);
  if (!text) return;

  const raw = ownerPhone?.trim();
  if (!raw) {
    return;
  }

  const to = normalizePhone(raw);
  const result = await sendSms(to, text);

  await prisma.parcel.update({
    where: { id: parcelId },
    data: { smsSent: result.ok },
  });

  if (result.ok) {
    console.log('[parcelStatusSms] SMS sent', {
      parcelId,
      newStatus,
      to,
      text,
      messageId: result.messageId,
    });
  } else {
    console.warn('[parcelStatusSms] SMS failed', {
      parcelId,
      newStatus,
      code: 'code' in result ? result.code : undefined,
      message: 'message' in result ? result.message : undefined,
    });
  }
}
