import { useState } from "react";

type Filter = "journal" | "conference" | "all";
export default function FilterByRecordModal({ visible, setVisible, onFilter }: { visible: boolean, setVisible: React.Dispatch<React.SetStateAction<boolean>>, onFilter: (filter: Filter) => void }) {
    const [filter, setFilter] = useState<{
        journal: boolean;
        conference: boolean;
        all: boolean;
    }>({journal: false, conference: false, all: true});
    return (
        visible && (
            <div
                onClick={() => setVisible(false)}
                className="transition-all fixed inset-0 text-white bg-black bg-opacity-40 flex justify-center items-center"
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-neutral-950 rounded-3xl w-1/3 h-1/2 flex flex-col justify-center items-center gap-4"
                >
                    <div className="flex flex-grow items-center">
                        <p className="text-2xl font-bold">Filter By Record Type</p>
                    </div>
                    <div className="flex flex-grow flex-col gap-4">
                        <div className="flex gap-2">
                        <button
                                onClick={() => setFilter({journal: false, conference: false, all: true})}
                                className={`flex-1 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900 text-white px-4 py-2 select-none rounded-md ${filter.all ? 'bg-neutral-700' : ''}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter({journal: true, conference: false, all: false})}
                                className={`flex-1 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900 text-white px-4 py-2 select-none rounded-md ${filter.journal ? 'bg-neutral-700' : ''}`}
                            >
                                Journal
                            </button>
                            <button
                                onClick={() => setFilter({journal: false, conference: true, all: false})}
                                className={`flex-1 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900 text-white px-4 py-2 select-none rounded-md ${filter.conference ? 'bg-neutral-700' : ''}`}
                            >
                                Conference
                            </button>
                            
                        </div>
                        <button
                            onClick={() => {
                                onFilter(filter.journal ? 'journal' : filter.conference ? 'conference' : 'all');
                                setVisible(false);
                            }}
                            className="bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900 text-white px-4 py-2 select-none rounded-md"
                        >
                            Filter
                        </button>
                    </div>
                </div>
            </div>
        )
    )
};