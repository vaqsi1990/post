import { z } from 'zod';

export const ADMIN_CREATE_PARCEL_MAX_FILE_BYTES = 5 * 1024 * 1024;

const ORIGIN_CODES = ['uk', 'us', 'cn', 'gr', 'fr', 'tr'] as const;

export type AdminParcelFormMessages = {
  userEmailRequired: string;
  userEmailInvalid: string;
  customerNameRequired: string;
  trackingNumberRequired: string;
  priceInvalid: string;
  onlineShopRequired: string;
  quantityInvalid: string;
  originCountryRequired: string;
  weightInvalid: string;
  descriptionRequired: string;
  fileRequired: string;
  onlyPdf: string;
  maxFileSize: string;
};

export function issuesToFieldErrors(issues: z.core.$ZodIssue[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && out[key] === undefined) {
      out[key] = issue.message;
    }
  }
  return out;
}

export function buildAdminCreateParcelFormSchema(
  m: AdminParcelFormMessages,
  opts: { allowedOriginCodes?: readonly string[]; getFile: () => File | null },
) {
  return z
    .object({
      userEmail: z.string().trim().min(1, m.userEmailRequired).email(m.userEmailInvalid),
      customerName: z.string().trim().min(1, m.customerNameRequired),
      trackingNumber: z.string().trim().min(1, m.trackingNumberRequired),
      price: z
        .string()
        .trim()
        .min(1, m.priceInvalid)
        .transform((s) => Number(s.replace(',', '.')))
        .refine((n) => !Number.isNaN(n) && n >= 0, m.priceInvalid),
      onlineShop: z.string().trim().min(1, m.onlineShopRequired),
      quantity: z
        .string()
        .trim()
        .min(1, m.quantityInvalid)
        .transform((s) => parseInt(s, 10))
        .refine((n) => Number.isInteger(n) && n >= 1, m.quantityInvalid),
      originCountry: z
        .string()
        .trim()
        .min(1, m.originCountryRequired)
        .refine(
          (c) =>
            (ORIGIN_CODES as readonly string[]).includes(c) &&
            (!opts.allowedOriginCodes?.length || opts.allowedOriginCodes.includes(c)),
          m.originCountryRequired,
        ),
      city: z
        .string()
        .trim()
        .transform((s) => (s === '' ? undefined : s))
        .optional(),
      address: z
        .string()
        .trim()
        .transform((s) => (s === '' ? undefined : s))
        .optional(),
      phone: z
        .string()
        .trim()
        .transform((s) => (s === '' ? undefined : s))
        .optional(),
      comment: z
        .string()
        .trim()
        .transform((s) => (s === '' ? undefined : s))
        .optional(),
      weight: z.preprocess(
        (v) => {
          if (typeof v === 'string') {
            const trimmed = v.trim();
            if (!trimmed) return undefined;
            return Number(trimmed.replace(',', '.'));
          }
          return v;
        },
        z
          .number({ message: m.weightInvalid })
          .refine((n) => !Number.isNaN(n) && n > 0, m.weightInvalid)
          .optional(),
      )
        .optional(),
      description: z.string().trim().min(1, m.descriptionRequired),
    })
    .superRefine((data, ctx) => {
      const file = opts.getFile();
      const checkFile = (f: File) => {
        if (f.type !== 'application/pdf') {
          ctx.addIssue({ code: 'custom', path: ['file'], message: m.onlyPdf });
          return;
        }
        if (f.size > ADMIN_CREATE_PARCEL_MAX_FILE_BYTES) {
          ctx.addIssue({ code: 'custom', path: ['file'], message: m.maxFileSize });
        }
      };

      if (data.price >= 296) {
        if (!file) {
          ctx.addIssue({ code: 'custom', path: ['file'], message: m.fileRequired });
        } else {
          checkFile(file);
        }
      } else if (file) {
        checkFile(file);
      }
    });
}
