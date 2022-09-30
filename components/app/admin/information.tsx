export default function AdminInformation({ appId, appVersion, appRevision }: { appId: string; appVersion: string; appRevision: string }) {
  const revisionAvailable = appRevision !== '<revision unknown>';
  return (
    <div className="bg-gray-100 rounded-lg border border-gray-200 p-5 text-sm text-gray-500">
      <div className="flex flex-col gap-2">
        <span>
          App Version: v{appVersion}{' '}
          {revisionAvailable ? (
            <a
              className="text-xs text-gray-400 font-mono hover:underline hover:text-blue-400"
              href={`https://github.com/Snazzah/stub/commit/${appRevision}`}
              target="_blank"
            >
              ({appRevision})
            </a>
          ) : (
            <code className="text-xs text-gray-400">({appRevision})</code>
          )}
        </span>
        <span>
          App ID: <code>{appId}</code>
        </span>
      </div>
    </div>
  );
}
