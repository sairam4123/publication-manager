import { API_SERVER } from "../config/config";
import usePolling from "../hooks/usePolling";
import Markdown from 'react-markdown'

export default function AIModel({aiTaskId}: {aiTaskId: string | null}) {
  const {
    data: aiData,
    loading,
    error,
  } = usePolling<{status: "PENDING" | "FAILURE" | "SUCCESS"} | {text: string}>(`${API_SERVER}/tasks/ai/${aiTaskId}/result`, 1500, {
    enabled: aiTaskId?.length !== 0,
  });
  console.log(aiData)

    return (
    <div className="flex flex-col h-full w-full">
        {aiData && ("text" in aiData) && <Markdown>{aiData.text}</Markdown>}
        {(!aiData || loading) && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
    </div>)
}