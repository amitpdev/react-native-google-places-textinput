// Example of a minimal Express proxy for Google Places Details API (v1) with CORS support

const express = require('express');
const axios = require('axios');
const app = express();

// CORS middleware for all routes and preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type,X-Goog-Api-Key,X-Goog-SessionToken,X-Goog-FieldMask'
  );
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.get('/places-details/:placeId', async (req, res) => {
  const { placeId } = req.params;
  const { languageCode } = req.query;

  // Forward required headers
  const headers = {};
  if (req.header('X-Goog-Api-Key'))
    headers['X-Goog-Api-Key'] = req.header('X-Goog-Api-Key');
  if (req.header('X-Goog-SessionToken'))
    headers['X-Goog-SessionToken'] = req.header('X-Goog-SessionToken');
  if (req.header('X-Goog-FieldMask'))
    headers['X-Goog-FieldMask'] = req.header('X-Goog-FieldMask');

  let url = `https://places.googleapis.com/v1/places/${placeId}`;
  if (languageCode) {
    url += `?languageCode=${encodeURIComponent(languageCode)}`;
  }

  try {
    const response = await axios.get(url, { headers });
    res.json(response.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(
    `Places Details proxy running on http://localhost:${PORT}/places-details/:placeId`
  );
});
