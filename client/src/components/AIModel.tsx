import { API_SERVER } from "../config/config";
import Markdown from 'react-markdown'
import useStream from "../hooks/useStream";

export default function AIModel({aiTaskId}: {aiTaskId: string | null}) {
  const {
    data: aiData,
    loading,
    error,
  } = useStream<string>(`${API_SERVER}/tasks/ai/${aiTaskId}/result`);
  console.log(aiData)

    return (
    <div className="flex flex-col h-full w-full">
        {aiData && <Markdown>{aiData}</Markdown>}
        {(!aiData || loading) && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
    </div>)
}