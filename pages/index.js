// pages/index.js
import { useState } from "react";
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
    console.log("hi");
    const formData = new FormData();
    formData.append("pdfFile", pdfFile);
    formData.append("keywords", keywords.split(","));
 
    try {
      const res = await axios.post(
        `https://pdf-keyword-counter.vercel.app/pdf/processPdf`,
        formData
      );
      console.log(res.data);
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
      
      // Create a download link
      const url = URL.createObjectURL(csvBlob);
      const a = document.createElement("a");
      
      a.href = url;
      a.download = `Result_${downloadDate}.csv`;
      
      // Trigger a click event to initiate the download
      a.style.display = "none"; // Hide the link
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Clean up by revoking the object URL
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>PDF Keyword Counter</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="pdfFile">Upload PDF:</label>
          <input
            type="file"
            id="pdfFile"
            accept=".pdf"
            onChange={handleFileChange}
            required
          />
        </div>
        <div>
          <label htmlFor="keywords">Keywords (comma-separated):</label>
          <input
            type="text"
            id="keywords"
            value={keywords}
            onChange={handleKeywordsChange}
            required
          />
        </div>
        <button type="submit" disabled={processing}>
          Process PDF
        </button>
      </form>
      {csvFilePath && (
        <div>
          <p>CSV file is ready for download:</p>
          <button onClick={handleCsvDownload}>Download </button>
        </div>
      )}
    </div>
  );
}
