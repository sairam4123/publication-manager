export default function Table({headers, data}:{headers: string[], data: string[][]}) {
    return (
        <div className="flex bg-neutral-900 rounded-3xl outline outline-2 outline-neutral-400 gap-4 text-white">
            <div className="overflow-x-auto">
                <table className="table-auto divide-y-2 divide-neutral-400">
                    <thead className="">
                        <tr className="divide-x-2 divide-neutral-400">
                            {headers.map((header, index) => <th key={index} className="px-4 py-2">{header}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-neutral-800">
                        {data.map((row, index) => (
                            <tr key={index} className="odd:bg-neutral-950 divide-x-2 divide-neutral-800 even:bg-neutral-900">
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