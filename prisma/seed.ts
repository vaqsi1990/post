import 'dotenv/config';
import prisma from '../lib/prisma';

const ORIGIN_COUNTRIES = ['GB', 'US', 'CN', 'IT', 'GR', 'ES', 'FR', 'DE', 'TR'] as const;

async function main() {
  for (const code of ORIGIN_COUNTRIES) {
    const existing = await prisma.tariff.findFirst({
      where: {
        originCountry: code,
        destinationCountry: 'GE',
        minWeight: 0,
        maxWeight: null,
      },
    });
    if (!existing) {
      await prisma.tariff.create({
        data: {
          originCountry: code,
          destinationCountry: 'GE',
          minWeight: 0,
          maxWeight: null,
          pricePerKg: 0,
          currency: 'GEL',
          isActive: true,
        },
      });
      console.log(`Created tariff for ${code}`);
    }
  }
  console.log('Tariffs seed done.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
