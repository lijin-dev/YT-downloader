import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/download', (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).send('URL is required');

    console.log(`🚀 Web Request Received! Processing URL: ${videoUrl}`);

    // Create the downloads folder structure if it doesn't exist
    const downloadsFolder = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadsFolder)){
        fs.mkdirSync(downloadsFolder, { recursive: true });
    }

    // Run your python script securely behind the scenes
    exec(`python downloader.py "${videoUrl}"`, (error, stdout, stderr) => {
        // Log Python outputs directly to your Render dashboard log panel for easy viewing
        console.log("Python output stdout:", stdout);
        if (stderr) console.error("Python error stderr:", stderr);

        if (error) {
            console.error(`Execution Error: ${error.message}`);
            return res.status(500).send('Server failed to process download.');
        }

        // Look for the finished video inside the /downloads folder first
        fs.readdir(downloadsFolder, (err, files) => {
            const videoFiles = (files || []).filter(file => file.endsWith('.mp4') || file.endsWith('.mkv') || file.endsWith('.webm'));

            // ⚠️ FALLBACK STRATEGY: If the downloads folder is empty, check the main server root folder!
            if (err || videoFiles.length === 0) {
                console.log("Looking for file inside main root folder instead...");
                
                fs.readdir(process.cwd(), (rootErr, rootFiles) => {
                    const rootVideoFiles = (rootFiles || []).filter(file => file.endsWith('.mp4') || file.endsWith('.mkv') || file.endsWith('.webm'));
                    
                    if (rootErr || rootVideoFiles.length === 0) {
                        console.error("❌ Python completed but no video file was found anywhere on the server filesystem.");
                        return res.status(500).send('Could not find downloaded file.');
                    }

                    // Sort files to grab the absolute newest video compiled in the root
                    const newestRootFile = rootVideoFiles
                        .map(file => ({ name: file, time: fs.statSync(path.join(process.cwd(), file)).mtime.getTime() }))
                        .sort((a, b) => b.time - a.time)[0].name;

                    const rootFilePath = path.join(process.cwd(), newestRootFile);
                    console.log(`📦 Found inside root! Streaming video to user: ${newestRootFile}`);

                    return res.download(rootFilePath, newestRootFile, (downloadError) => {
                        if (!downloadError) {
                            try {
                                fs.unlinkSync(rootFilePath); // Clear space
                                console.log(`🧹 Cleaned up root file: ${newestRootFile}`);
                            } catch (e) { console.error(e); }
                        }
                    });
                });
                return;
            }

            // Normal path: Find the newest file inside the /downloads subfolder
            const newestFile = videoFiles
                .map(file => ({ name: file, time: fs.statSync(path.join(downloadsFolder, file)).mtime.getTime() }))
                .sort((a, b) => b.time - a.time)[0].name;

            const filePath = path.join(downloadsFolder, newestFile);
            console.log(`📦 Found inside downloads folder! Streaming video to user: ${newestFile}`);

            res.download(filePath, newestFile, (downloadError) => {
                if (!downloadError) {
                    try {
                        fs.unlinkSync(filePath); // Clear space
                        console.log(`🧹 Cleaned up folder file: ${newestFile}`);
                    } catch (e) { console.error(e); }
                }
            });
        });
    });
});

app.listen(4000, () => console.log('🌐 Backend Server running on port 4000'));
