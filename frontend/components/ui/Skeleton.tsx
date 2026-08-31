export default function Skeleton() {
  return (
    <div className="animate-pulse rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-4 h-48 w-full rounded-md bg-gray-200" />

      <div className="mb-2 h-5 w-3/4 rounded bg-gray-200" />

      <div className="h-4 w-full rounded bg-gray-200" />
      <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
    </div>
  );
}