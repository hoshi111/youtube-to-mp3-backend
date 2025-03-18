const express = require('express');
const cors = require('cors');
const YTDlpWrap = require('yt-dlp-wrap').default;
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
app.use(cors());

const ytDlpPath = "/usr/local/bin/yt-dlp";

// Function to check and install yt-dlp if not found
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
    const outputPath = `/tmp/${outputFileName}`;

    try {
        await ytDlp.execPromise([
            videoUrl,
            '-x', '--audio-format', 'mp3',
            '-o', outputPath
        ]);

        res.download(outputPath, outputFileName, () => {
            fs.unlinkSync(outputPath);
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
