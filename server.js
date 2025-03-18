const express = require('express');
const cors = require('cors');
const YTDlpWrap = require('yt-dlp-wrap').default;
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

// Automatically downloads the latest yt-dlp binary
const ytDlp = new YTDlpWrap();

app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ error: "Missing YouTube URL parameter" });
    }

    const outputFileName = `audio_${Date.now()}.mp3`;
    const outputPath = path.join('/tmp', outputFileName); // Use /tmp for temporary storage

    try {
        await ytDlp.execPromise([
            videoUrl,
            '-x', '--audio-format', 'mp3',
            '-o', outputPath
        ]);

        res.download(outputPath, outputFileName, () => {
            fs.unlinkSync(outputPath); // Delete file after sending
        });
    } catch (error) {
        console.error("Download error:", error);
        res.status(500).json({ error: "Failed to download audio" });
    }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
