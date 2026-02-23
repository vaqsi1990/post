/**
 * MS Group SMS API 1.0 – send SMS via sendsms.php (HTTP GET).
 * Uses .env: SMSUSERNAME, SMSPASSWORD, SMSCLIENTID, SMSSERVICEID, optional SMS_OUTBOUND_HEADER.
 */

const SMS_BASE = 'http://bi.msg.ge/sendsms.php';

export type SendSmsResult =
  | { ok: true; messageId: string }
  | { ok: false; code: string; message?: string };

/**
 * Normalize phone to international format (995...). Accepts 5XX... or 9955XX...
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('995') && digits.length >= 11) return digits;
  if (digits.startsWith('5') && digits.length === 9) return '995' + digits;
  if (digits.length >= 9) return '995' + digits.slice(-9);
  return '995' + digits;
}

/**
 * Send SMS via MS Group API. Uses utf=1 for Georgian/non-ASCII text.
 */
export async function sendSms(to: string, text: string): Promise<SendSmsResult> {
  const username = process.env.SMSUSERNAME;
  const password = process.env.SMSPASSWORD;
  const clientId = process.env.SMSCLIENTID;
  const serviceId = process.env.SMSSERVICEID;

  if (!username || !password || !clientId || !serviceId) {
    return { ok: false, code: 'CONFIG', message: 'SMS credentials not configured' };
  }

  const normalizedTo = normalizePhone(to);
  const params = new URLSearchParams({
    username,
    password,
    client_id: clientId,
    service_id: serviceId,
    to: normalizedTo,
    text,
    utf: '1', // required for Georgian characters
  });

  const url = `${SMS_BASE}?${params.toString()}`;
  const headers: HeadersInit = {};
  const alternatePassword = process.env.SMS_OUTBOUND_HEADER;
  if (alternatePassword) {
    headers['MSG_HEADER'] = alternatePassword;
  }

  try {
    const res = await fetch(url, { method: 'GET', headers, cache: 'no-store' });
    const body = await res.text();

    // Response format: "CODE-MESSAGE_ID" e.g. "0000-000001"
    const parts = body.trim().split('-');
    const code = parts[0]?.trim() ?? '';
    const messageId = parts[1]?.trim() ?? '';

    if (code === '0000') {
      return { ok: true, messageId };
    }

    const messages: Record<string, string> = {
      '0001': 'Invalid password or nickname or restricted IP',
      '0003': 'Required fields empty',
      '0005': 'Blank message body',
      '0007': 'Invalid phone number',
      '0008': 'Insufficient balance',
      '0009': 'Invalid sender ID',
      '0010': 'Message contains banned word',
    };
    return {
      ok: false,
      code,
      message: messages[code] ?? body,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { ok: false, code: 'NETWORK', message };
  }
}
