import { useMemo, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { mutate } from 'swr';

import { LoadingDots } from '@/components/shared/icons';
import { AppSettingsProps } from '@/lib/types';
import { flattenErrors } from '@/lib/utils';

export default function AdminAuthentication({ appSettings, providers }: { appSettings: AppSettingsProps; providers: string[] }) {
  const [saving, setSaving] = useState(false);
  const [emailFilters, setEmailFilters] = useState(appSettings.registerEmailFilters.join('\n'));
  const [error, setError] = useState(null);

  async function save(data?: any) {
    if (!data) data = { registerEmailFilters: emailFilters ? emailFilters.split('\n') : [] };
    setSaving(true);
    setError(null);

    const response = await fetch('/api/admin/app-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => null);

    if (!response) {
      setError({ message: 'Unexpected request error' });
      setSaving(false);
      return;
    }

    const body = await response.json().catch(() => null);
    if (!body) {
      setError({ message: 'Unexpected body parsing error' });
      setSaving(false);
      return;
    }

    if (response.status !== 200) setError(body);
    else mutate('/api/admin/app-settings', body, { revalidate: false });
    setSaving(false);
  }

  const dataChanged = useMemo(() => {
    return appSettings.registerEmailFilters.join('\n') !== emailFilters;
  }, [emailFilters, appSettings]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 py-10">
      <div className="flex flex-col space-y-3 px-10">
        <h2 className="text-xl font-medium">Authentication</h2>
        <p className="text-gray-500 text-sm">Manage logins from this instance.</p>
      </div>
      <div className="border-b border-gray-200 my-8" />
      <div className="flex flex-col gap-8 px-10">
        <div className="flex justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-medium text-gray-800">Allow New Users</h2>
            <p className="text-gray-500 text-sm">If this is disabled, new users trying to sign up will not be accepted.</p>
          </div>
          <div className="flex gap-4 items-center flex-row-reverse sm:flex-row">
            <span className="text-sm text-gray-500">
              Sign-ups are{' '}
              <span className={appSettings.allowNewUsers ? 'text-green-700' : 'text-red-700'}>
                {appSettings.allowNewUsers ? 'enabled' : 'disabled'}
              </span>
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                save({ allowNewUsers: !appSettings.allowNewUsers });
              }}
              disabled={saving}
              className="bg-black text-white border-black hover:text-black hover:bg-white disabled:cursor-not-allowed disabled:bg-neutral-500 disabled:text-white disabled:border-transparent h-9 w-24 text-sm border-solid border rounded-md focus:outline-none transition-all ease-in-out duration-150"
            >
              {saving ? <LoadingDots /> : appSettings.allowNewUsers ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-col gap-1">
            <label htmlFor="registerEmails" className="block font-medium text-gray-800">
              Whitelisted E-mails
            </label>
            <p className="text-gray-500 text-sm">
              If left blank, any user with any e-mail can sign-up. Separate patterns with new lines. Use * as a wildcard in your pattern. This uses{' '}
              <a href="https://github.com/sindresorhus/matcher" target="_blank" rel="noreferer noopener" className="text-blue-500 hover:underline">
                matcher
              </a>{' '}
              internally.
            </p>
          </div>
          <div className="flex flex-col mt-1">
            <TextareaAutosize
              name="registerEmails"
              id="registerEmails"
              minRows={3}
              className="border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-500 focus:ring-gray-500 pr-10 block w-full rounded-md focus:outline-none sm:text-sm min-h-[7em] shadow-sm"
              placeholder={['*@business.com', 'something@example.com'].join('\n')}
              value={emailFilters}
              onChange={(e) => setEmailFilters(e.target.value)}
            />
            {error?.data?.registerEmailFilters &&
              flattenErrors(error?.data?.registerEmailFilters, 'Line ').map((line, i) => (
                <span key={i} className="text-red-700 text-sm">
                  {line}
                </span>
              ))}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            save();
          }}
          disabled={saving || !dataChanged}
          className="bg-black text-white border-black hover:text-black hover:bg-white disabled:cursor-not-allowed disabled:bg-neutral-500 disabled:text-white disabled:border-transparent h-9 w-24 text-sm border-solid border rounded-md focus:outline-none transition-all ease-in-out duration-150"
        >
          {saving ? <LoadingDots /> : 'Save'}
        </button>
        <div className="border-b border-gray-200" />
        <div className="flex flex-col gap-1">
          <h2 className="font-medium text-gray-800">Authentication Providers</h2>
          <p className={`${[providers.length === 0 ? 'text-red-800' : 'text-gray-500']} text-sm capitalize`}>
            {providers.length === 0 ? 'None provided!' : providers.join(', ')}
          </p>
        </div>
      </div>
    </div>
  );
}
