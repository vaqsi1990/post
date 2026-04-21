import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const { handleAdminParcelsGet } = await import('./_get');
  return await handleAdminParcelsGet(request);
}

export async function POST(request: NextRequest) {
  const { handleAdminParcelsPost } = await import('./_post');
  return await handleAdminParcelsPost(request);
}

