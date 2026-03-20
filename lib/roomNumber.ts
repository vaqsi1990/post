import prisma from './prisma';

export async function generateNextRoomNumber(): Promise<string> {
  // Stored in DB as "PO1", "PO2", ... in the order users are created.
  const count = await prisma.user.count();
  return `PO${count + 1}`;
}

