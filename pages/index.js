// pages/index.js
import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [keywords, setKeywords] = useState('');
  const [processing, setProcessing] = useState(false);
  const [csvFilePath, setCsvFilePath] = useState('');


  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleKeywordsChange = (e) => {
    setKeywords(e.target.value);
  };

  const handleSubmit = async (e) => {
   
    e.preventDefault();
    setProcessing(true);
     console.log('hi')
    const formData = new FormData();
    formData.append('pdfFile', pdfFile);
    formData.append('keywords', keywords.split(','));

    try {
    const res =  await axios.post('/api/pdfProcessor', formData);
    setCsvFilePath(res.data.csvFilePath);
      setProcessing(false);
    } catch (error) {
      console.error('Error processing PDF:', error);
      setProcessing(false);
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
          <a href="/api/download-csv" download>
            Download CSV
          </a>
        </div>
      )}
    </div>
  );
}
