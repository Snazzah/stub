import { AppSettings, PrismaClient } from '@prisma/client';

const prisma: PrismaClient = (global as any).prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') (global as any).prisma = prisma;

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
