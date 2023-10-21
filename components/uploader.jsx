"use client";

import { useState, useCallback, useMemo, ChangeEvent } from "react";

import Toastify from "./toastify";
import LoadingDots from "./loading-dots";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import {
  AiOutlineCloudDownload,
  AiOutlineCloudUpload,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";

export default function Uploader() {
  const [keywords, setKeywords] = useState("");
  const [file, setFile] = useState(null);
  const [csvFilePath, setCsvFilePath] = useState("");
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const BASE_URL = "https://pdf-keyword-counter.vercel.app";

  const handleKeywordsChange = (e) => {
    setKeywords(e.target.value);
  };

  const onChangePicture = useCallback(
    (event) => {
      const file = event.currentTarget.files && event.currentTarget.files[0];
      if (file) {
        if (file.size / 1024 / 1024 > 10) {
          Toastify("e", "File size too big (max 10MB)");
        } else {
          setFile(file);
        }
      }
    },
    [setFile]
  );

  const disableBtn = useMemo(() => {
    return !file?.name || !keywords || processing;
  }, [file?.name, keywords, processing]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !keywords) {
      return Toastify("e", "A Pdf file, and at least a keyword is required");
    }
    setProcessing(true);

    const formData = new FormData();
    formData.append("pdfFile", file);
    formData.append("keywords", keywords.split(","));

    try {
      const res = await axios.post(`${BASE_URL}/pdf/processPdf`, formData);

      setCsvFilePath(res.data.csvFilePath);
      setProcessing(false);
      setFile(null);
      Toastify("s", res.data.message);
    } catch (error) {
      console.error("Error processing PDF:", error);
      if (error.response) {
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

  // download csv file
  const handleCsvDownload = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/csv/download`, {
        responseType: "blob",
      });

      console.log(res.data);

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
    <form className="grid gap-1 border-2" onSubmit={handleSubmit}>
      <div>
        <div className="space-y-1 mb-4">
          <h2 className="text-xl font-semibold">Upload a file</h2>
        </div>
        <label
          htmlFor="image-upload"
          className="group relative mt-2 flex h-72 cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-white shadow-sm transition-all hover:bg-gray-50"
        >
          <div
            className="absolute z-[5] h-full w-full rounded-md"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);

              const file = e.dataTransfer.files && e.dataTransfer.files[0];
              if (file) {
                if (file.size / 1024 / 1024 > 10) {
                  toast.error("File size too big (max 50MB)");
                } else {
                  setFile(file);
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setData((prev) => ({
                      ...prev,
                      image: e.target?.result,
                    }));
                  };
                  reader.readAsDataURL(file);
                }
              }
            }}
          />
          <div
            className={`${
              dragActive ? "border-2 border-black" : ""
            } absolute z-[3] flex h-full w-full flex-col items-center justify-center rounded-md px-10 transition-all ${
              file
                ? "bg-white/80 opacity-0 hover:opacity-100 hover:backdrop-blur-md"
                : "bg-white opacity-100 hover:bg-gray-50"
            }`}
          >
            <svg
              className={`${
                dragActive ? "scale-110" : "scale-100"
              } h-7 w-7 text-gray-500 transition-all duration-75 group-hover:scale-110 group-active:scale-95`}
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
              <path d="M12 12v9"></path>
              <path d="m16 16-4-4-4 4"></path>
            </svg>
            <p className="mt-2 text-center text-sm text-gray-500">
              Drag and drop or click to upload.
            </p>
            <p className="mt-2 text-center text-sm text-gray-500">
              Max file size: 10MB
            </p>
            <span className="sr-only">Photo upload</span>
          </div>
          <p className="mt-4 text-center overflow-hidden text-ellipsis w-full text-green-600 font-semibold italic  ">
            {file && file.name}
          </p>
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            id="image-upload"
            name="image"
            type="file"
            accept=".pdf"
            className="sr-only"
            onChange={onChangePicture}
          />
        </div>
      </div>

      {csvFilePath ? (
        <div className=" flex my-5 flex-col space-y-2">
          <p>CSV file is ready for download</p>
          <button
            type="button"
            className="bg-blue-600 p-2 flex justify-center space-x-2 rounded-md text-white w-full cursor-pointer pointer-events-auto"
            onClick={handleCsvDownload}
          >
            <p> Download</p> <AiOutlineCloudDownload className="text-2xl" />
          </button>
        </div>
      ) : (
        <>
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
          <button
            disabled={disableBtn}
            className={`${
              disableBtn
                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                : "border-black bg-black text-white hover:bg-white hover:text-black"
            } flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none`}
          >
            {processing ? (
              <span className="flex  items-center   space-x-1">
                {" "}
                <LoadingDots color="#808080" /> <span>Processing</span>
              </span>
            ) : (
              <p className="text-sm">Process Keywords</p>
            )}
          </button>
        </>
      )}
    </form>
  );
}
