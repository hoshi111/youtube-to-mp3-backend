const express = require('express');
const cors = require('cors');
const YTDlpWrap = require('yt-dlp-wrap').default;
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());

const ytDlpPath = "/tmp/yt-dlp"; 
const cookiesPath = "/app/youtube_cookies.txt"; // Railway allows /app/ for persistent storage

// Function to check and install yt-dlp
function installYtDlp() {
    if (!fs.existsSync(ytDlpPath)) {
        console.log("⚠️ yt-dlp not found. Downloading...");
        execSync(`curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ${ytDlpPath} && chmod +x ${ytDlpPath}`);
        console.log("✅ yt-dlp installed successfully.");
    } else {
        console.log("✅ yt-dlp is already installed.");
    }
}

// Install yt-dlp on startup
installYtDlp();

const ytDlp = new YTDlpWrap(ytDlpPath);

app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ error: "Missing YouTube URL parameter" });
    }

    const outputFileName = `audio_${Date.now()}.mp3`;
    const outputPath = path.join('/tmp', outputFileName); // Store temporary files in /tmp/

    try {
        const args = [
            videoUrl,
            '-x', '--audio-format', 'mp3',
            '-o', outputPath
        ];

        // Use YouTube cookies if available
        if (fs.existsSync(cookiesPath)) {
            args.push("--cookies", cookiesPath);
        }

        await ytDlp.execPromise(args);

        res.download(outputPath, outputFileName, () => {
            fs.unlinkSync(outputPath); // Clean up after download
        });
    } catch (error) {
        console.error("Download error:", error);
        res.status(500).json({ error: "Failed to download audio" });
    }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
