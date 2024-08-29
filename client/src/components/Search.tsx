import ArrowRightIcon from "../icons/ArrowRight";
import ArrowUpTrayIcon from "../icons/ArrowUpTray";
import { FilterIcon } from "../icons/Filter";

export default function Search({
  query,
  setQuery,
  filterEnabled,
  filterIconPressed,
  uploadIconPressed,
  className,
  goIconPressed,
}: {
  filterIconPressed: () => void;
  filterEnabled: boolean;
  uploadIconPressed: () => void;
  className?: string;
  query: string;
  setQuery: (query: string) => void;
    goIconPressed: () => void;
}) {
  return (
    <div
      className={`flex h-10 w-1/2 bg-neutral-100 dark:bg-neutral-900 hover:ring-1 dark:hover:ring-neutral-400 hover:ring-neutral-800 focus-within:outline focus-within:outline-2 text-white rounded-3xl flex-row px-4 ${className}`}
    >
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-full flex-1 bg-transparent text-black dark:text-white outline-none dark:placeholder:text-neutral-400 placeholder:text-neutral-800"
        type="search"
        placeholder="Search for a person..."
      />
      <div className="flex gap-2">
        <button onClick={filterIconPressed}>
          <FilterIcon
            filled={filterEnabled}
            className="h-full size-6 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
          />
        </button>
        <button onClick={uploadIconPressed}>
          <ArrowUpTrayIcon className="h-full size-6 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white" />
        </button>
        <button onClick={goIconPressed}>
          <ArrowRightIcon className="h-full size-6 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white" />
        </button>
      </div>
    </div>
  );
}
