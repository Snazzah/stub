export default function UserAdminPlaceholder() {
  return (
    <>
      <div className="flex gap-4 items-center md:flex-row flex-col">
        <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse flex-none" />
        <div className="flex flex-col gap-2 md:items-start items-center">
          <div className="w-36 h-9 rounded-md bg-gray-200 animate-pulse" />
          <div className="text-sm text-gray-500 flex flex-wrap md:justify-start justify-center gap-3">
            <div className="w-24 h-5 rounded-md bg-gray-200 animate-pulse" />
            <div className="w-24 h-5 rounded-md bg-gray-200 animate-pulse" />
            <div className="w-36 h-5 rounded-md bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    </>
  );
}
