import { useEffect, useState } from "react";
import Search from "../components/Search";
import UploadDocumentModal from "../modals/UploadDocumentModal";
import FilterByRecordModal from "../modals/FilterByRecordModal";
import useFileContext from "../contexts/FileContext";
import useFetch from "../hooks/useFetch";
import { API_SERVER } from "../config/config";
import { useDebounced } from "../hooks/useDebounced";
import usePolling from "../hooks/usePolling";
import LoadingSpinner from "../components/LoadingSpinner";
import useMutation from "../hooks/useMutation";
import ErrorPage from "./ErrorPage";
import PreviewTable from "../components/PreviewTable";
import AIModel from "../components/AIModel";
import Button from "../components/Button";
import ArrowDownTray from "../icons/ArrowDownTray";
import exportExcel from "../utils/exportExcel";

export default function FrontPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiTaskId, setAITaskId] = useState<string | null>(null);
  const debouncedSearchQuery = useDebounced(searchQuery, 1000);

  const {
    data: task,
    error: errorTask,
    loading: loadingTask,
  } = useFetch<{ task_id: string }>(
    API_SERVER + `/tasks/search/${debouncedSearchQuery}`,
    { enabled: debouncedSearchQuery.trim().length !== 0 }
  );
  const mutation = useMutation<{ task_id: string }>({
    url: API_SERVER + "/tasks/customized",
    method: "POST",
  });
  const result_data = mutation.result;
  console.log("Test:", result_data, mutation);
  const {
    data: details,
    error,
    loading: loadingDetails,
    resetData: resetDetailsData,
    headers: resHeaders
  } = usePolling<string[][]>(
    API_SERVER + `/tasks/customized/${result_data?.task_id}/result`,
    1000,
    { enabled: (result_data?.task_id) !== undefined }
  );

  useEffect(() => {
    setAITaskId(resHeaders?.get("X-Task-Id") ?? null);
  }, [resHeaders])

  const {
    data: searchResult,
    error: errorSearch,
    loading: loadingSearch,
    resetData,
  } = usePolling<string[] | { status: "PENDING" | "FAILED" }>(
    API_SERVER + `/tasks/search/${task?.task_id}/result`,
    1000,
    { enabled: task?.task_id !== undefined }
  );

  const [documentModalIsVisible, setDocumentModalIsVisible] = useState(false);
  const [filterModalIsVisible, setFilterModalIsVisible] = useState(false);
  const [filterBy, setFilterBy] = useState<{
    filterBy: "journal" | "conference" | "all";
    fromYear: number;
    toYear: number;
  }>({ filterBy: "all", fromYear: 1970, toYear: 2024 });
  const filterEnabled =
    filterBy["filterBy"] !== "all" ||
    filterBy["fromYear"] !== 1970 ||
    filterBy["toYear"] !== 2024;

  useEffect(() => {
    resetData();
    resetDetailsData();
  }, [searchQuery, filterBy]);

  const { setFile } = useFileContext() ?? {
    setFile: (file: File) => {
      console.log(file);
    },
  };

  useEffect(() => {
    if (debouncedSearchQuery.trim().length === 0) {
      return;
    }
    mutation.mutate({
      author_name: debouncedSearchQuery,
      publication_type: filterBy["filterBy"],
      from_year: filterBy.fromYear,
      to_year: filterBy.toYear,
    });
  }, [debouncedSearchQuery, filterBy]);

  const headers = ["Author", "Title", "Venue (Type)", "Year"];

  console.log(result_data?.task_id, debouncedSearchQuery.trim().length !== 0);
  return (
    <div className="flex transition-all text-black bg-white min-h-screen dark:text-white dark:bg-black overflow-y-scroll h-full p-10 pt-36 w-screen justify-center items-center flex-col gap-4">
      <p className="text-5xl font-bold text-center select-none">
        PUBLICATION DATA EXTRACTOR
      </p>
      <p className="text-xl text-center p-4 -mt-4 mb-4 select-none">
        Get the publication records you need in minutes
      </p>
      <div className="flex flex-row items-center justify-center h-fit w-9/12 gap-4">
      <Search
        query={searchQuery}
        setQuery={setSearchQuery}
        filterEnabled={filterEnabled}
        filterIconPressed={() => setFilterModalIsVisible(true)}
        uploadIconPressed={() => setDocumentModalIsVisible(true)}
        goIconPressed={() => {
          console.log("Go pressed");
        }}
      />
      {
        details && <Button onClick={() => exportExcel({headers: details[0], data: details?.slice(1)})()} className="py-2 px-4 rounded-3xl"><ArrowDownTray className="size-6" /> Download</Button>
      }
      </div>
      <div className="flex max-h-96 overflow-y-auto mx-2 overflow-x-visible flex-col w-1/2 bg-neutral-100 dark:bg-neutral-900 rounded-2xl">
        {searchQuery && !Array.isArray(searchResult) && (
          <LoadingSpinner
            message={
              loadingTask || loadingSearch || !searchResult
                ? "Loading..."
                : "Waiting for input..."
            }
          />
        )}
        {searchQuery &&
          Array.isArray(searchResult) &&
          searchResult.length !== 1 &&
          searchResult[0] !== searchQuery &&
          searchResult.map((result, idx) => (
            <div key={idx} className="flex bg-neutral-100 dark:bg-neutral-900">
              <p
                onClick={() => {
                  setSearchQuery(result);
                }}
                className="p-2 select-none hover:bg-neutral-50 active:bg-neutral-200 dark:hover:bg-neutral-800 dark:active:bg-neutral-950 w-full cursor-pointer"
              >
                {result}
              </p>
            </div>
          ))}
      </div>

      <div className="flex flex-col justify-center items-center w-11/12">
        {Array.isArray(details) && (
          <div className="w-full flex flex-row items-start p-4 gap-4">
          <div className="w-7/12 justify-center rounded-3xl items-center">
            {
              <PreviewTable
                data={details.slice(1)}
                headers={headers}
                footer={details.length === 1 ? "No publication records found." : ""}
              />
            }
          </div>
          <div className="w-5/12 flex flex-grow bg-neutral-900 outline outline-neutral-400 text-white rounded-3xl p-4">
            {
              <AIModel aiTaskId={aiTaskId} />
            }
          </div>
        </div>
        )}
        {(loadingDetails && (debouncedSearchQuery.trim().length !== 0 && !details)) && (
          <LoadingSpinner message="Loading..." />
        )}
        {error && <ErrorPage error="Error loading the details.." />}
      </div>

      <div className="flex flex-col gap-4">
        {loadingTask && <p className="text-white">Loading...</p>}
        {(errorTask || errorSearch) && (
          <p className="text-white">
            Error: {errorTask?.message || errorSearch?.message}
          </p>
        )}
        {task && <p className="text-white">Task ID: {task.task_id}</p>}
      </div>

      <UploadDocumentModal
        onFileSelected={(file) => {
          setFile(file as File);
        }}
        visible={documentModalIsVisible}
        setVisible={setDocumentModalIsVisible}
      />
      <FilterByRecordModal
        visible={filterModalIsVisible}
        setVisible={setFilterModalIsVisible}
        onFilter={(fil) => {
          setFilterBy(fil);
          resetDetailsData();
        }}
      />
    </div>
  );
}
