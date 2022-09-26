import { PrismaClient } from '@prisma/client';
import { prompt } from 'enquirer';

const prisma = new PrismaClient();

// TODO if this gets more detailed, i'd probably use yargs

(async () => {
  switch (process.argv[2]?.toLowerCase()) {
    case 'set-superadmin': {
      if (!process.argv[3]) console.log('Enter the email of the user you want to set as a superadmin.');

      const email =
        process.argv[3] ||
        (
          await prompt<Record<string, string>>([
            {
              type: 'input',
              name: 'email',
              message: 'E-mail'
            }
          ])
        ).email;
      if (!email) return console.log('Invalid e-mail.');

      process.stdin.write('Updating superadmin user ... ');
      prisma.user
        .update({
          where: { email },
          data: { superadmin: true }
        })
        .then(() => process.stdout.write('OK\n'))
        .catch((e) => {
          process.stdout.write('ERR\n');
          console.error(e);
          process.exit(1);
        });
      return;
    }
    default: {
      console.log('Unknown command, commands available: set-superadmin');
    }
  }
})();
