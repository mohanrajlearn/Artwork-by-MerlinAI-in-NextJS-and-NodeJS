const express = require('express');
const { Merlin } = require('merlin-node');
const dotenv = require('dotenv');
const cors = require('cors');
const fetch = require('node-fetch');  // Use the CommonJS version

dotenv.config();

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

const merlin = new Merlin({
  apiKey: "",
  merlinConfig: {
    apiKey: process.env.MERLIN_API_KEY || "",
  },
});

async function generateImage(req, res) {
  try {
    const { prompt } = req.query;
    const response = await merlin.images.generate({
      prompt,
      model: 'dall-e-2',
      size: '256x256',
      response_format: 'b64_json',
    });

    res.json(response);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

app.get('/generate-image', generateImage);

app.get('/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    const response = await fetch(imageUrl);
    const buffer = await response.buffer();

    res.setHeader('Content-Disposition', 'attachment; filename=generated_image.png');
    res.setHeader('Content-Type', 'image/png');

    res.send(buffer);
  } catch (error) {
    console.error('Error fetching/proxying image:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
