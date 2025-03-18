const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Endpoint to handle the YouTube video conversion
app.post('/convert', async (req, res) => {
  const { url } = req.body;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const videoStream = ytdl(url, { quality: 'highestaudio' });

    // Generate a temporary file name
    const tempFilePath = path.join(__dirname, 'temp.mp3');

    ffmpeg(videoStream)
      .audioCodec('libmp3lame')
      .format('mp3')
      .on('end', () => {
        res.json({ downloadUrl: `/downloads/temp.mp3` });
      })
      .on('error', (err) => {
        console.error(err);
        res.status(500).json({ error: 'Failed to convert video' });
      })
      .save(tempFilePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process the video' });
  }
});

// Serve the converted file for download
app.use('/downloads', express.static(path.join(__dirname, '')));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});