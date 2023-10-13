// pages/api/pdfProcessor.js

const fs = require('fs')
const path = require('path')
const pdf = require("pdf-parse");
const csv = require("csv-parser");
const { pipeline,Readable  } = require("stream/promises");
const { createReadStream, createWriteStream } = require("fs");
const { promisify } = require("util");
const express = require("express");
const multer = require("multer");
const cors = require('cors');
const stream = require('stream');



const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Use the cors middleware before defining your routes
app.use(cors());

 

app.post('/api/pdfProcessor', upload.single('pdfFile'), async (req, res) => {
    try {
      let { keywords } = req.body;
        console.log(keywords)
         
      const pdfFile = req.file.buffer;
      const pdfName = req.file.filename
  
      const parsedPDF = await pdf(pdfFile);
      const pdfText = parsedPDF.text;
  
      const keywordCounts = {};
  
      keywords.split(',').forEach((keyword) => {
        const keywordRegex = new RegExp(keyword, 'gi');
        const matches = pdfText.match(keywordRegex);
        keywordCounts[keyword] = matches ? matches.length : 0;
      });
      
  
      const outputCSV = [];
      outputCSV.push({ 'PDF File': 'Uploaded PDF', ...keywordCounts });
  
      const csvFilePath = path.join(__dirname, 'pdfResults.csv');
  
      // Create a readable stream from the generated CSV data
      const readableStream = stream.Readable.from(
        outputCSV.map((row) => JSON.stringify(row))
      );
  
      // Create a writable stream to the CSV file
      const writableStream = fs.createWriteStream(csvFilePath);
  
      await pipeline(readableStream, writableStream);

       console.log(csvFilePath)
  
      res.status(200).json({ success: true ,csvFilePath});
    } catch (error) {
      console.error('Error processing PDF:', error);
      res
        .status(500)
        .json({ error: 'An error occurred while processing the PDF.' });
    }
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
