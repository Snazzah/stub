import { AppSettings, PrismaClient } from '@prisma/client';

export let prisma: PrismaClient;

if (typeof window === 'undefined') {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
  } else {
    if (!(global as any).prisma) (global as any).prisma = new PrismaClient();
    prisma = (global as any).prisma;
  }
}

export default prisma;

export async function getAppSettings(): Promise<[AppSettings, boolean]> {
  const currentAppSettings = await prisma.appSettings.findUnique({
    where: { id: 1 }
  });
  if (!currentAppSettings) return [await prisma.appSettings.create({ data: {} }), true];
  return [currentAppSettings, false];
}

export async function setAppSettings(data: Partial<AppSettings>): Promise<AppSettings> {
  return await prisma.appSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data }
  });
}
