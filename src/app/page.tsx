"use client";

import Link from "next/link";
import { generateSpaceId, useLastSpaceId, setLastSpaceId } from "@/lib/store";

export default function HomePage() {
  const spaceId = useLastSpaceId();

  const createSpace = () => {
    setLastSpaceId(generateSpaceId());
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto text-center">
      <h1 className="text-3xl font-bold">Emotion Wheel</h1>
      <p className="text-gray-600 dark:text-gray-400">
        A private space for two. Tap how you feel — your partner sees what you need.
      </p>

      {spaceId ? (
        <div className="w-full flex flex-col gap-3">
          <div className="text-sm text-gray-500">Your space ID</div>
          <code className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-xs break-all">
            {spaceId}
          </code>
          <Link
            href={`/${spaceId}/log`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium"
          >
            Open my logging page
          </Link>
          <Link
            href={`/${spaceId}/view`}
            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-3 rounded-lg font-medium"
          >
            Open the viewer (share this with them)
          </Link>
          <Link
            href={`/${spaceId}/settings`}
            className="text-sm text-indigo-600 hover:underline"
          >
            Settings
          </Link>
          <button
            onClick={() => setLastSpaceId(null)}
            className="text-xs text-gray-500 hover:underline mt-2"
          >
            Start a new space
          </button>
        </div>
      ) : (
        <button
          onClick={createSpace}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          Create a new space
        </button>
      )}
    </main>
  );
}
