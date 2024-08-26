import { useState } from "react";
import Search from "../components/Search";
import UploadDocumentModal from "../modals/UploadDocumentModal";
import FilterByRecordModal from "../modals/FilterByRecordModal";
import useFileContext from "../contexts/FileContext";
import Button from "../components/Button";
import ArrowUpTrayIcon from "../icons/ArrowUpTray";

export default function FrontPage() {
  const [documentModalIsVisible, setDocumentModalIsVisible] = useState(false);
  const [filterModalIsVisible, setFilterModalIsVisible] = useState(false);
  const [filterBy, setFilterBy] = useState<"journal" | "conference" | "all">("all");
  const filterEnabled = filterBy !== "all";

  const {setFile} = useFileContext() ?? {setFile: (file: File) => {console.log(file)}};

  return (
    <div className="flex bg-black h-screen w-screen justify-center items-center flex-col gap-4">
      <p className="text-7xl text-white font-bold text-center select-none">
        PUBLICATION EXTRACTOR
      </p>
      <Button className="text-white" onClick={() => setDocumentModalIsVisible(true)}><ArrowUpTrayIcon className="h-full size-6 text-white" /> Upload Excel Document</Button>
      
      <Search className="hidden" filterEnabled={filterEnabled} filterIconPressed={() => setFilterModalIsVisible(true)} uploadIconPressed={() => setDocumentModalIsVisible(true)} />
      <UploadDocumentModal
        onFileSelected={(file) => {setFile(file as File)}}
        visible={documentModalIsVisible}
        setVisible={setDocumentModalIsVisible}
      />
      <FilterByRecordModal
        visible={filterModalIsVisible}
        setVisible={setFilterModalIsVisible}
        onFilter={setFilterBy}
      />
    </div>
  );
}
