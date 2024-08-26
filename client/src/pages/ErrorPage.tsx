export default function ErrorPage({error}: {error: string}) {
    return (
        <div className="flex bg-black text-white items-center justify-center h-screen">
        <div className="flex flex-col items-center space-x-2">
            <p className="text-2xl">Error</p>
            <p className="text-2xl">Something went wrong.. please try again later.</p>
            <p className="text-lg">{error}</p>
        </div>
        </div>
    );
}