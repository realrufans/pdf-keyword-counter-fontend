// pages/api/download-csv.js
import fs from 'fs';
import path from 'path';
 

export default async (req, res) => {
  const filePath = path.join(process.cwd(), 'pages/api/pdfResults.csv');

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // Set the response headers for file download
    res.setHeader('Content-Disposition', `attachment; filename=pdfResultsAt${Date.now()}.csv`);
    res.setHeader('Content-Type', 'text/csv');

    // Create a read stream from the CSV file and pipe it to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    res.status(404).end('CSV file not found');
  }
};
