import 'boxicons/css/boxicons.min.css';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
      <div className="flex flex-col items-center">
        <i className="bx bx-leaf text-green-600 text-7xl animate-leaf-spin-pulse mb-4" />
        <span className="text-green-900 dark:text-green-200 font-bold text-xl tracking-wide animate-pulse">Loading...</span>
      </div>
    </div>
  );
}