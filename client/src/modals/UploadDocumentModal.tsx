import { useEffect, useState } from "react";
import xlsx from "node-xlsx";
import Table from "../components/Table";

export default function UploadDocumentModal({
  visible,
  setVisible,
  onFileSelected,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onFileSelected: (file?: File) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File>();

  const [tableData, setTableData] = useState<string[][]>([]);

  useEffect(() => {
    if (selectedFile) {
      if (
        selectedFile &&
        (selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          selectedFile.name.endsWith(".xlsx"))
      ) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = xlsx.parse(data);
          const workbookData = workbook[0].data.slice(1, 6);
          setTableData(workbookData);
        };
        reader.readAsArrayBuffer(selectedFile);
      }
      else {
        alert("Invalid file type");
        setTableData([]);
      }
    }
  }, [selectedFile]);

  return (
    visible && (
      <div
        onClick={() => {setVisible(false)
            setTableData([])
        }}
        className="transition-all backdrop-blur-md bg-opacity-40 fixed inset-0 text-black dark:text-white flex justify-center items-center"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-neutral-50 dark:bg-neutral-950 rounded-3xl w-1/3 h-2/3 flex flex-col justify-center items-center gap-4"
        >
          <div className="flex flex-grow items-center">
            <p className="text-2xl font-bold">Upload Document</p>
          </div>
          {tableData.length !== 0 && (
            <>
              <p className="dark:text-neutral-500 -mb-2 mt-2">Preview only</p>
              <Table data={tableData} headers={tableData[0]} />
            </>
          )}
          <div className="flex flex-grow flex-col gap-4">
            <input
              onChange={(e) => setSelectedFile(e.target.files?.[0])}
              type="file"
              className="border-2 border-black"
            />
            <button
              onClick={() => {
                setVisible(false);
                onFileSelected(selectedFile);
              }}
              className={
                "bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900 text-white px-4 py-2 select-none rounded-md" +
                `${selectedFile ? "" : "ring-2 ring-red-500"}`
              }
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    )
  );
}
