const express = require("express");
const ytdlp = require("ytdl-core");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post("/convert", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "YouTube URL is required" });

    try {
        const outputFileName = `audio-${Date.now()}.mp3`;
        const outputPath = path.join(__dirname, "downloads", outputFileName);

        await ytdlp(url, {
            output: outputPath,
            extractAudio: true,
            audioFormat: "mp3",
            audioQuality: "320k",
        });

        res.download(outputPath, outputFileName, (err) => {
            if (err) console.error("Download error:", err);
            fs.unlinkSync(outputPath); // Delete file after download
        });
    } catch (error) {
        res.status(500).json({ error: "Conversion failed", details: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
