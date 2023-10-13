import React, { useState } from "react";
import axios from "axios";

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [keywords, setKeywords] = useState("");
  const [processing, setProcessing] = useState(false);
  const [csvFilePath, setCsvFilePath] = useState("");

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleKeywordsChange = (e) => {
    setKeywords(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    const formData = new FormData();
    formData.append("pdfFile", pdfFile);
    formData.append("keywords", keywords.split(","));

    try {
      const res = await axios.post(
        `https://pdf-keyword-counter.vercel.app/pdf/processPdf`,
        formData
      );
      setCsvFilePath(res.data.message);
      setProcessing(false);
    } catch (error) {
      console.error("Error processing PDF:", error);
      setProcessing(false);
    }
  };

  const handleCsvDownload = async () => {
    try {
      const res = await axios.get(
        "https://pdf-keyword-counter.vercel.app/csv/download",
        {
          responseType: "blob",
        }
      );

      const csvBlob = new Blob([res.data], {
        type: "text/csv",
      });

      const downloadDate = new Date().toLocaleString().replace(/:/g, "-");

      const url = URL.createObjectURL(csvBlob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `Result_${downloadDate}.csv`;

      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setCsvFilePath('')
    } catch (error) {
      console.log(error);
    }
  };

  const dropHandler = (e) => {
    // Handle the drop event here
  };

  const dragOverHandler = (e) => {
    // Handle the drag over event here
  };

  const dragLeaveHandler = (e) => {
    // Handle the drag leave event here
  };

  const dragEnterHandler = (e) => {
    // Handle the drag enter event here
  };

  return (
    <div className="bg-gray-500 h-screen w-screen sm:px-8 md:px-16 sm:py-8">
      <main className="container mx-auto max-w-screen-lg h-full">
        <article
          aria-label="File Upload Modal"
          className="relative h-full flex flex-col bg-white shadow-xl rounded-md"
          onDrop={dropHandler}
          onDragOver={dragOverHandler}
          onDragLeave={dragLeaveHandler}
          onDragEnter={dragEnterHandler}
        >
          <div className="w-full h-full absolute top-0 left-0 pointer-events-none z-50 flex flex-col items-center justify-center rounded-md">
            {csvFilePath && (
              <div className="mt-40">
                <p>CSV file is ready for download:</p>
                <button
                  className="bg-blue-600 p-2 rounded-md text-white w-full cursor-pointer pointer-events-auto"
                  onClick={handleCsvDownload}
                >
                  Download
                </button>
              </div>
            )}
          </div>
          <section className="h-full overflow-auto p-8 w-full h-full flex flex-col">
            <header className="border-dashed border-2 border-gray-400 py-12 flex flex-col justify-center items-center">
              <p className="mb-3 font-semibold text-gray-900 flex flex-wrap justify-center">
                <span>Upload your PDF file</span>&nbsp;
                <span>for processing</span>
              </p>
              <div>
                <label
                  htmlFor="hidden-input"
                  className="mt-2 rounded-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 focus:shadow-outline focus:outline-none cursor-pointer"
                >
                  Upload a file
                </label>
                <input
                  id="hidden-input"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <p className="mt-2 text-center font-semibold italic text-gray-600">
                {pdfFile && pdfFile.name}
              </p>
            </header>
            <div>
              <label
                htmlFor="keywords"
                className="block text-gray-700 mt-4 font-semibold"
              >
                Keywords (comma-separated):
              </label>
              <input
                type="text"
                id="keywords"
                value={keywords}
                onChange={handleKeywordsChange}
                className="w-full p-2 mt-1 rounded-md border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400"
                required
              />
            </div>
            {!csvFilePath && (
              <button
                className="bg-blue-600 p-2 mt-5 rounded-md text-white w-full max-w-xl mx-auto"
                onClick={handleSubmit}
              >
                Process keyword count
              </button>
            )}
          </section>
        </article>
      </main>
    </div>
  );
}
