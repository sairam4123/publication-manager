import ArrowUpTrayIcon from "../icons/ArrowUpTray";
import { FilterIcon } from "../icons/Filter";

export default function Search({filterEnabled, filterIconPressed, uploadIconPressed, className}: {filterIconPressed: () => void; filterEnabled: boolean; uploadIconPressed: () => void, className?: string}) {
    return (
        <div className={`flex h-10 w-6/12 bg-neutral-900 hover:ring-1 hover:ring-neutral-400 focus-within:outline focus-within:outline-2 text-white rounded-3xl flex-row px-4 ${className}`}>
            <input className="h-full flex-1 bg-transparent text-white outline-none placeholder:text-neutral-400" type="search" placeholder="Search for a person..." />
            <div className="flex gap-2">
                <button onClick={filterIconPressed}>
                    <FilterIcon filled={filterEnabled} className="h-full size-6 text-neutral-400 hover:text-white" />
                </button>
                <button onClick={uploadIconPressed}>
                    <ArrowUpTrayIcon className="h-full size-6 text-neutral-400 hover:text-white" />
                </button>
            </div>
        </div>
    )
}