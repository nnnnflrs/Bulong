"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="h-screen w-screen bg-bulong-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-xl text-white">Something went wrong</h2>
        <p className="text-bulong-400 text-sm">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-bulong-700 hover:bg-bulong-600 text-white rounded-lg text-sm transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
