import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { adminParcelInclude } from '@/lib/adminParcelInclude';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

function safeString(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'in_transit';

  // Only allow in_transit export for now (as requested).
  if (status !== 'in_transit') {
    return NextResponse.json({ error: 'Unsupported status' }, { status: 400 });
  }

  const parcels = await prisma.parcel.findMany({
    where: { status: 'in_transit' },
    orderBy: { createdAt: 'desc' },
    include: adminParcelInclude,
  });

  const columns: { headerKa: string; get: (p: any) => any }[] = [
    { headerKa: 'ID', get: (p) => safeString(p.id) },
    { headerKa: 'თრექინგი', get: (p) => safeString(p.trackingNumber) },
    { headerKa: 'სტატუსი', get: (p) => safeString(p.status) },
    {
      headerKa: 'თარიღი',
      get: (p) => (p.createdAt ? new Date(p.createdAt).toISOString() : ''),
    },
    { headerKa: 'მომხმარებელი', get: (p) => safeString(p.customerName) },
    { headerKa: 'ელ-ფოსტა', get: (p) => safeString(p.user?.email) },
    { headerKa: 'ტელეფონი', get: (p) => safeString(p.user?.phone) },
    { headerKa: 'ქვეყანა', get: (p) => safeString(p.originCountry) },
    { headerKa: 'წონა (კგ)', get: (p) => p.weight ?? null },
    { headerKa: 'რაოდენობა', get: (p) => p.quantity ?? null },
    { headerKa: 'ნივთის ღირებულება', get: (p) => p.price ?? null },
    { headerKa: 'ვალუტა', get: (p) => safeString(p.currency) },
    {
      headerKa: 'გადასახდელი (GEL)',
      get: (p) => p.shippingAmount ?? null,
    },
    {
      headerKa: 'საკურიერო ჩართულია',
      get: (p) => (p.courierServiceRequested ? 'კი' : 'არა'),
    },
    {
      headerKa: 'საკურიერო საფასური',
      get: (p) => p.courierFeeAmount ?? null,
    },
    {
      headerKa: 'payableAmount',
      get: (p) => p.payableAmount ?? null,
    },
    { headerKa: 'აღწერა', get: (p) => safeString(p.description) },
    { headerKa: 'ონლაინ მაღაზია', get: (p) => safeString(p.onlineShop) },
    { headerKa: 'კომენტარი', get: (p) => safeString(p.comment) },
  ];

  const headerRow = columns.map((c) => c.headerKa);
  const dataRows = parcels.map((p) => columns.map((c) => c.get(p)));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
  XLSX.utils.book_append_sheet(wb, ws, 'in_transit');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  const body = new Uint8Array(buf);

  const filename = `in_transit_parcels_${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

