import { useEffect, useRef, useState } from "react";

import ArrowDownTray from "../icons/ArrowDownTray";
import useFileContext from "../contexts/FileContext";
import xlsx from "node-xlsx";
import LoadingPage from "./LoadingPage";
import { API_SERVER } from "../config/config";
import ErrorPage from "./ErrorPage";
import HomeIcon from "../icons/Home";
import PreviewTable from "../components/PreviewTable";
import AIModel from "../components/AIModel";

const loadingMessages = [
  "Uploading...",
  "Processing...",
  "Analyzing...",
  "Fetching data...",
  "Preparing data...",
  "Packaging data...",
];

export default function ResultPage() {
  const [data, setData] = useState<string[][]>([]);
  const [selectedFile, setSelectedFile] = useState<Blob | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isErrored, setIsErrored] = useState<boolean>(false);
  const [aiTaskId, setAITaskId] = useState<string | null>(null);
  const { taskId } = useFileContext() ?? { taskId: null };
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState<number>(0);

  useEffect(() => {
    if (!taskId) {
      return;
    }
    const fetchStatus = () =>
      fetch(`${API_SERVER}/tasks/${taskId}/status`)
        .then((res) => {
          if (res.ok) {
            res.json().then((data) => {
              console.log(data);
              if (data["status"] === "SUCCESS") {
                setDataLoaded(true);
                stopPolling();
                console.log("stopping polling");
              } else if (data["status"] === "FAILURE") {
                console.log("Task failed");
                stopPolling();
                setIsErrored(true);
                setDataLoaded(true);
              } else {
                console.log("Task not completed (working)");
                setLoadingMessageIdx(
                  (prev) =>
                    (prev + Math.ceil(Math.random() * 1.75)) %
                    loadingMessages.length
                );
              }
            });
          }
        })
        .catch((err) => {
          console.log(err);
          setIsErrored(true);
        });
    const interval = setInterval(fetchStatus, 1500);
    timerRef.current = interval;
    const stopPolling = () => {
      clearInterval(timerRef.current ?? undefined);
    };
    return () => {
      stopPolling();
    };
  }, [taskId]);

  useEffect(() => {
    if (!dataLoaded || isErrored) {
      return;
    }
    fetch(`${API_SERVER}/tasks/${taskId}/result`)
      .then((res) => {
        if (res.ok) {
          res.blob().then((data) => {
            console.log(res.headers)
            console.log(res.headers.get("X-Task-Id"));
            setAITaskId(res.headers.get("X-Task-Id"));

            console.log(data);
            setLoadingMessageIdx(loadingMessages.length - 2);
            setSelectedFile(data as Blob);
          });
        }
      })
      .catch((err) => {
        console.log(err);
        setDataLoaded(true);
      });
  }, [taskId, dataLoaded]);

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = xlsx.parse(data);
        const workbookData = workbook[0].data.slice(1, 50);
        setData(workbookData);
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      setData([]);
    }
  }, [selectedFile]);

  if ((!dataLoaded && !isErrored) || data.length === 0) {
    return (
      <LoadingPage key="loading" message={loadingMessages[loadingMessageIdx]} />
    );
  }

  if (dataLoaded && isErrored) {
    return <ErrorPage error="An error occurred while fetching data" />;
  }

  const downloadFile = () => {
    if (!selectedFile) {
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = "result.xlsx";
    a.click();
  };

  const backToHome = () => {
    window.location.href = "/";
  };

  const headers = ["Author", "Title", "Venue (Type)", "Year"];
  return (
    <div className="transition-all flex bg-white dark:bg-black pt-24 h-full w-screen overflow-x-hidden overflow-y-scroll justify-center items-center flex-col gap-4">
      <p className="text-5xl text-black dark:text-white font-bold text-center select-none">
        PUBLICATION RECORDS
      </p>
      <div className="flex h-10 w-11/12 justify-between">
        <button
          onClick={backToHome}
          className="transition-all flex items-center gap-2 flex-row text-neutral-600 hover:text-black active:outline-black active:text-white active:bg-neutral-950 dark:text-white rounded-xl outline outline-neutral-600 hover:outline-neutral-950 dark:hover:text-white dark:outline-neutral-700 dark:hover:outline-neutral-400 dark:active:outline-neutral-600 dark:active:bg-neutral-600 px-4"
        >
          <HomeIcon className="size-6" /> Home
        </button>
        <button
          onClick={downloadFile}
          className="transition-all flex items-center gap-2 flex-row text-neutral-600 hover:text-black active:outline-black active:text-white active:bg-neutral-950 dark:text-white rounded-xl outline outline-neutral-600 hover:outline-neutral-950 dark:hover:text-white dark:outline-neutral-700 dark:hover:outline-neutral-400 dark:active:outline-neutral-600 dark:active:bg-neutral-600 px-4"
        >
          <ArrowDownTray className="size-6" /> Download as Excel
        </button>
      </div>
      <p className="text-neutral-700 dark:text-neutral-500 -mb-4 -mt-4">
        Preview only
      </p>
      <div className="w-full flex flex-row items-start p-4 gap-2">
        <div className="w-1/2">
          {
            <PreviewTable
              data={data}
              headers={headers}
              footer={data.length === 0 ? "No publication records found." : ""}
            />
          }
        </div>
        <div className="w-1/2 flex flex-grow bg-neutral-900 text-white rounded-2xl p-4">
          {
            <AIModel aiTaskId={aiTaskId} />
          }
        </div>
      </div>
    </div>
  );
}
