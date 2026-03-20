import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;

    const [user, addresses, recentParcels, parcelsCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          phoneVerified: true,
          personalIdNumber: true,
          city: true,
          address: true,
          balance: true,
              roomNumber: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.address.findMany({
        where: { userId: id },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          type: true,
          country: true,
          city: true,
          street: true,
          building: true,
          apartment: true,
          postalCode: true,
          isDefault: true,
          createdAt: true,
        },
      }),
      prisma.parcel.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          trackingNumber: true,
          status: true,
          price: true,
          shippingAmount: true,
          currency: true,
          weight: true,
          originCountry: true,
          createdAt: true,
        },
      }),
      prisma.parcel.count({ where: { userId: id } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'მომხმარებელი ვერ მოიძებნა' }, { status: 404 });
    }

    return NextResponse.json(
      {
        user,
        addresses,
        parcels: recentParcels,
        parcelsCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user details error:', error);
    return NextResponse.json(
      { error: 'შეცდომა მომხმარებლის დეტალების წამოღებისას' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Prevent admin from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'თქვენ ვერ წაშლით საკუთარ თავს' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: 'მომხმარებელი ვერ მოიძებნა' }, { status: 404 });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'მომხმარებელი წარმატებით წაიშალა' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'მომხმარებლის წაშლისას მოხდა შეცდომა' },
      { status: 500 }
    );
  }
}
