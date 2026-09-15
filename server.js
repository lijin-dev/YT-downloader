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

    const downloadsFolder = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadsFolder)){
        fs.mkdirSync(downloadsFolder, { recursive: true });
    }

    exec(`python downloader.py "${videoUrl}"`, (error, stdout, stderr) => {
        console.log("Python stdout logs:", stdout);
        if (stderr) console.error("Python stderr logs:", stderr);

        if (error) {
            console.error(`Execution Error: ${error.message}`);
            return res.status(500).send('Server failed to process download.');
        }

        // 1. Check the /downloads subfolder first
        fs.readdir(downloadsFolder, (err, files) => {
            const videoFiles = (files || []).filter(file => file.endsWith('.mp4') || file.endsWith('.mkv') || file.endsWith('.webm'));

            // ⚠️ FALLBACK STRATEGY: If empty, check the main server root folder!
            if (err || videoFiles.length === 0) {
                console.log("Checking main root folder instead...");
                
                fs.readdir(process.cwd(), (rootErr, rootFiles) => {
                    const rootVideoFiles = (rootFiles || []).filter(file => file.endsWith('.mp4') || file.endsWith('.mkv') || file.endsWith('.webm'));
                    
                    if (rootErr || rootVideoFiles.length === 0) {
                        console.error("❌ No video file found anywhere on server filesystem."); 
                        return res.status(500).send('Could not find downloaded file.');
                    }

                    // Map files by time to grab the newest video compiled
                    const timedRootFiles = rootVideoFiles
                        .map(file => ({ name: file, time: fs.statSync(path.join(process.cwd(), file)).mtime.getTime() }))
                        .sort((a, b) => b.time - a.time);

                    // ✅ FIXED: Grab the first object out of the sorted array structure explicitly
                    const newestRootFile = timedRootFiles[0].name;

                    const rootFilePath = path.join(process.cwd(), newestRootFile);
                    console.log(`📦 Found inside root! Streaming file to mobile browser: ${newestRootFile}`);

                    return res.download(rootFilePath, newestRootFile, (downloadError) => {
                        if (!downloadError) {
                            try {
                                fs.unlinkSync(rootFilePath);
                                console.log(`🧹 Cleaned up root space file: ${newestRootFile}`);
                            } catch (e) { console.error("Cleanup error:", e); }
                        }
                    });
                });
                return;
            }

            // Normal path: Find the newest file inside the /downloads subfolder
            const timedFiles = videoFiles
                .map(file => ({ name: file, time: fs.statSync(path.join(downloadsFolder, file)).mtime.getTime() }))
                .sort((a, b) => b.time - a.time);

            // ✅ FIXED: Grab the first item from the array configuration map cleanly
            const newestFile = timedFiles[0].name;

            const filePath = path.join(downloadsFolder, newestFile);
            console.log(`📦 Found inside downloads folder! Streaming file: ${newestFile}`);

            res.download(filePath, newestFile, (downloadError) => {
                if (!downloadError) {
                    try {
                        fs.unlinkSync(filePath);
                        console.log(`🧹 Cleaned up folder space file: ${newestFile}`);
                    } catch (e) { console.error("Cleanup error:", e); }
                }
            });
        });
    });
});

app.listen(4000, () => console.log('🌐 Backend Server running on port 4000'));
