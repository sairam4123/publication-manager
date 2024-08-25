import { createContext, useContext } from "react";

type FileContextType = {
    file: File | null;
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
    taskId: string | null;
}

export const FileContext = createContext<FileContextType | undefined>(undefined);

export default function useFileContext() {
    const context = useContext(FileContext);
    if (!context) {
        return null
    }
    return context;
}