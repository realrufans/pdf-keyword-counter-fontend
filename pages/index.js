import React, { useState } from "react";
import axios from "axios";
import {
  AiOutlineCloudDownload,
  AiOutlineCloudUpload,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";
import { ToastContainer } from "react-toastify";
import Toastify from "../components/toastify";
import Link from "next/link";

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

    if (!pdfFile || !keywords) {
      return Toastify("e", "A Pdf file, and at least a keyword is required");
    }
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
      Toastify("s", "Processed successfuly");
      setProcessing(false);
    } catch (error) {
      console.error("Error processing PDF:", error);
      if (error.response.data) {
        setProcessing(false);
        console.log(error.response.data.error);
        return Toastify("e", error.response.data.error);
      } else if (error.message) {
        console.log(error.message);
        Toastify("e", error.message);
      }
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
      setCsvFilePath("");
      setKeywords("");
    } catch (error) {
      console.log(error);
      Toastify("Please try again later...");
    }
  };

  return (
    <div
      className=" h-scrDeen  border-red-100  px-2 w-screen sm:px-8 md:px-16 sm:py-8"
      style={{ fontFamily: "IBM Plex Mono, monospace" }}
    >
      <main className="container mx-auto max-w-screen-lg  border-red-100   ">
        <div className="my-10 text-center">
          <h1 className="text-3xl font-semibold text-gray-700 ">
            PDF Keyword to Analyzer
          </h1>
          <p className="text-base text-gray-600">
            Perform a comprehensive keyword analysis on your PDF documents to
            determine their frequency and occurrences.
          </p>
          <p className="text-sm italic mt-2 text-gray-600">
            Download the results as a CSV file.
          </p>
        </div>

        <article
          aria-label="File Upload Modal"
          className="relative  flex flex-col bg-white shadow-xl rounded-md"
        >
          <section className="  overflow-auto p-8 w-full h-full flex flex-col">
            <form onSubmit={handleSubmit}>
              <header className="border-dashed  border-gray-400 py-2 flex flex-col justify-center items-center">
                <div>
                  <label
                    htmlFor="hidden-input"
                    className="mt-2  rounded-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 focus:shadow-outline focus:outline-none cursor-pointer"
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
                <p className="mt-4 text-center overflow-hidden text-ellipsis w-full text-green-600 font-semibold italic  ">
                  {pdfFile && pdfFile.name}
                </p>
                <div className="mt-10">
                  {processing && (
                    <AiOutlineLoading3Quarters className="text-3xl  mx-auto animate-spin  text-blue-600" />
                  )}
                </div>
              </header>
              {!csvFilePath && (
                <div>
                  <label
                    htmlFor="keywords"
                    className="block text-gray-700 mt-4 font-semibold"
                  >
                    Keywords (comma-separated):
                  </label>
                  <input
                    disabled={processing}
                    type="text"
                    id="keywords"
                    value={keywords}
                    onChange={handleKeywordsChange}
                    className="w-full p-2 mt-1 rounded-md border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400"
                    required
                  />
                </div>
              )}
            </form>
            <div className="mt-5  mx-auto">
              {!csvFilePath ? (
                <>
                  {" "}
                  <button
                    className="bg-blue-600 py-2 px-5   rounded-md text-white w-full max-w-xl mx-auto"
                    onClick={handleSubmit}
                  >
                    {processing ? "Processing" : "Process"}
                  </button>
                </>
              ) : (
                <div className=" flex flex-col space-y-2">
                  <p>CSV file is ready for download:</p>
                  <button
                    className="bg-blue-600 p-2 flex justify-center space-x-2 rounded-md text-white w-full cursor-pointer pointer-events-auto"
                    onClick={handleCsvDownload}
                  >
                    <p> Download</p>{" "}
                    <AiOutlineCloudDownload className="text-2xl" />
                  </button>
                </div>
              )}
            </div>
          </section>
        </article>
        <footer className="text-xs text-center my-10">
          Made with <span className="text-blue-600">❤️</span> by{" "}
          <Link href="https://github.com/realrufans/realrufans">
            <span className="text-blue-600">Emetonjo Solomon</span>
          </Link>
        </footer>
      </main>
      <ToastContainer />
    </div>
  );
}
