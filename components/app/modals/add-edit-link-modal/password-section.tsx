import { motion } from 'framer-motion';
import { Dispatch, SetStateAction } from 'react';

import { LinkProps } from '@/lib/types';

import { AnimationSettings } from './advanced-settings';

export default function PasswordSection({ data, setData }: { data: LinkProps; setData: Dispatch<SetStateAction<LinkProps>> }) {
  const { password } = data;
  return (
    <motion.div key="password" {...AnimationSettings}>
      <label htmlFor="password" className="block my-2 text-sm text-gray-500">
        Protect your links with a password. Users will need to enter the password to access the link.
      </label>
      <div className="flex rounded-md shadow-sm mb-3">
        <input
          name="password"
          id="password"
          type="password"
          className="border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-500 focus:ring-gray-500 block w-full rounded-md focus:outline-none sm:text-sm"
          value={password || ''}
          onChange={(e) => {
            setData({ ...data, password: e.target.value });
          }}
          aria-invalid="true"
        />
      </div>
    </motion.div>
  );
}
