export function isResultPending(result: unknown) {
    return (result as { status: string })?.status === "PENDING";
}

export function isResultFailed(result: unknown) {
    return (result as { status: string })?.status === "FAILURE";
}