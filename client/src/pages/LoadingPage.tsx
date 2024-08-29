import ArrowPathIcon from "../icons/ArrowPath";


export default function LoadingPage({message}: {message: string}) {
    return (
        <div className="flex bg-white text-black dark:bg-black dark:text-white items-center justify-center h-screen">
        <div className="flex flex-col items-center space-x-2 animate-pulse">
            <ArrowPathIcon className="size-10 animate-spin" />
            <p className="text-2xl">{message ? message : "Loading..."}</p>
        </div>
        </div>
    );
}