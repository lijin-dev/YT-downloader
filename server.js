import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors()); // Lets your React app communicate with this server

app.get('/download', (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).send('URL is required');

    console.log(`🚀 Web Request Received! Processing URL: ${videoUrl}`);

    // Run your python script behind the scenes and pass the URL to it
    exec(`python downloader.py "${videoUrl}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Execution Error: ${error.message}`);
            return res.status(500).send('Server failed to process download.');
        }

        // Find the newly downloaded file inside the downloads folder
        const downloadsFolder = path.join(process.cwd(), 'downloads');
        
        fs.readdir(downloadsFolder, (err, files) => {
            if (err || files.length === 0) {
                return res.status(500).send('Could not find downloaded file.');
            }

            // Sort files by creation time to grab the newest downloaded video
            const newestFile = files
                .map(file => ({ name: file, time: fs.statSync(path.join(downloadsFolder, file)).mtime.getTime() }))
                .sort((a, b) => b.time - a.time)[0].name;

            const filePath = path.join(downloadsFolder, newestFile);

            // Send the file directly back to the React browser window for download
            res.download(filePath, newestFile, (err) => {
                if (!err) {
                    // Optional: Clean up the file on the server after user downloads it
                    fs.unlinkSync(filePath); 
                }
            });
        });
    });
});

app.listen(4000, () => console.log('🌐 Backend Server running on http://localhost:4000'));
