import XLSX from "node-xlsx"

export default function exportExcel({data, headers}: {data: string[][], headers: string[]}) {
    const content = new Blob([XLSX.build([{name: "Sheet1", data: [headers, ...data], options: {}}])]);
    const downloadFile = () => {
        if (!content) {
          return;
        }
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = "result.xlsx";
        a.click();
      };
    return downloadFile
}