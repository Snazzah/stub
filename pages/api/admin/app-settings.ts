import { z } from 'zod';

import { withUserAuth } from '@/lib/auth';
import { getAppSettings, setAppSettings } from '@/lib/prisma';

const schema = z.object({
  allowNewUsers: z.boolean().optional(),
  registerEmailFilters: z
    .string()
    .regex(/^[a-zA-Z0-9@.+*!-]{1,500}$/)
    .array()
    .max(50)
    .optional()
});

export default withUserAuth(
  async (req, res) => {
    // GET /api/admin/app-settings
    if (req.method === 'GET') {
      const [appSettings] = await getAppSettings();
      return res.status(200).json({
        appId: appSettings.appId,
        allowNewUsers: appSettings.allowNewUsers,
        registerEmailFilters: appSettings.registerEmailFilters
      });

      // PUT /api/admin/app-settings – edit app settings
    } else if (req.method === 'PUT') {
      const data = schema.safeParse(req.body);
      if (data.success === false) return res.status(400).send({ message: 'Schema validation error', data: data.error.format() });

      const appSettings = await setAppSettings(data.data);
      return res.status(200).json({
        appId: appSettings.appId,
        allowNewUsers: appSettings.allowNewUsers,
        registerEmailFilters: appSettings.registerEmailFilters
      });
    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  },
  { needSuperadmin: true }
);
