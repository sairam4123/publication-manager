export default function PreviewTable({headers, data, footer}:{headers: string[], data: string[][], footer: string}) {
    return (
        <div className="flex bg-neutral-200 dark:bg-neutral-900 rounded-3xl outline outline-2 outline-neutral-800 text-black dark:outline-neutral-400 gap-4 dark:text-white">
            <div className="overflow-x-auto w-full table-fixed">
                <table className="table-auto w-full divide-y-2 divide-neutral-800 dark:divide-neutral-400">
                    <thead className="">
                        <tr className="divide-x-2 divide-neutral-700 dark:divide-neutral-400">
                            {headers.map((header, index) => <th key={index} className="px-4 py-2">{header}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-neutral-800">
                        {data.map((row, index) => (
                            row.length === 6 && <tr key={index} className="dark:odd:bg-neutral-950 odd:bg-neutral-50 divide-x-2 dark:divide-neutral-800 divide-neutral-700 dark:even:bg-neutral-900 even:bg-neutral-100">
                                <td className="px-4 py-2 w-fit max-w-sm">{row[0]}</td>
                                <td className="px-4 py-2 w-fit max-w-sm"><a href={row[4]} className="text-blue-500 hover:underline">{row[1]}</a></td>
                                <td className="px-4 py-2 w-fit max-w-sm">{row[2]}<br /><span className="text-neutral-400">({row[5]})</span></td>
                                <td className="px-4 py-2 w-fit max-w-sm">{row[3]}</td>
                            </tr>
                        ))}
                        {footer && footer.length !== 0 && <tr className="divide-x-2 divide-neutral-700 dark:divide-neutral-400">
                            <td colSpan={headers.length} className="px-4 py-2 text-center">{footer}</td>
                        </tr>}
                    </tbody>
                </table>
            </div>
        </div>
    )
}