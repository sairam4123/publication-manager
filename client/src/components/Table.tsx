export default function Table({headers, data}:{headers: string[], data: string[][]}) {
    return (
        <div className="flex bg-neutral-200 dark:bg-neutral-900 rounded-3xl outline outline-2 outline-neutral-800 text-black dark:outline-neutral-400 gap-4 dark:text-white">
            <div className="overflow-x-auto">
                <table className="table-auto divide-y-2 divide-neutral-800 dark:divide-neutral-400">
                    <thead className="">
                        <tr className="divide-x-2 divide-neutral-700 dark:divide-neutral-400">
                            {headers.map((header, index) => <th key={index} className="px-4 py-2">{header}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-neutral-800">
                        {data.map((row, index) => (
                            <tr key={index} className="dark:odd:bg-neutral-950 odd:bg-neutral-50 divide-x-2 dark:divide-neutral-800 divide-neutral-700 dark:even:bg-neutral-900 even:bg-neutral-100">
                                {row.map((cell, index) => <td key={index} className="px-4 py-2 w-fit max-w-md">{
                                (cell.toString()).startsWith("http") ? <a href={`${cell}`} target="_blank" className="text-blue-500 hover:underline">{cell}</a> : cell
                                }</td>)
                            }
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}