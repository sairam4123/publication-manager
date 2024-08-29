export default function LoadingSpinner({message}: {message?: string}) {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-neutral-400" />
            <p className="p-4">{message ? message : "Waiting for input..."}</p>
        </div>
    );
}