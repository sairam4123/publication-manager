export default function Button({children, onClick, className}: {children: React.ReactNode; onClick: () => void; className?: string}) {
    return (
        <button onClick={onClick} className={`transition-all flex items-center gap-2 flex-row text-black dark:text-white rounded-xl outline dark:outline-neutral-700 dark:hover:outline-neutral-600 dark:active:bg-neutral-600 px-4 py-2 ${className}`}>
            {children}
        </button>
    )
}