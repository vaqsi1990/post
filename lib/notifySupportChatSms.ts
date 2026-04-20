import prisma from '@/lib/prisma';
import { sendSms, normalizePhone } from '@/lib/sms';

/**
 * Sends one SMS to each ADMIN user with a phone number when a new public chat thread starts.
 * Does not throw — logs failures so the chat webhook can still return 200.
 */
export async function notifySupportUsersNewChat(params: {
  fromLabel: string;
}): Promise<void> {
  try {
    const supporters = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        phone: { not: null },
      },
      select: { phone: true },
    });

    const text = `მომხმარებელმა დაიწყო ჩათი: ${params.fromLabel}`.slice(0, 480);
    const seen = new Set<string>();

    for (const u of supporters) {
      const raw = u.phone?.trim();
      if (!raw) continue;
      const to = normalizePhone(raw);
      if (seen.has(to)) continue;
      seen.add(to);

      const result = await sendSms(to, text);
      if (!result.ok) {
        console.warn('[notifySupportUsersNewChat] SMS failed', { to, code: result.code, message: result.message });
      }
    }
  } catch (e) {
    console.error('[notifySupportUsersNewChat]', e);
  }
}
