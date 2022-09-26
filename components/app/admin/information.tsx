export default function AdminInformation({ appId, appVersion }: { appId: string; appVersion: string }) {
  return (
    <div className="bg-gray-100 rounded-lg border border-gray-200 p-5 text-sm text-gray-500">
      <div className="flex flex-col gap-2">
        <span>App Version: {appVersion}</span>
        <span>App ID: {appId}</span>
      </div>
    </div>
  );
}
