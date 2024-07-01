const express = require('express');
const axios = require('axios');
const cors = require('cors');

require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

const API_KEY = process.env.IBM_API_KEY;

const SCORING_URL = process.env.SCORE_URL;


app.use(cors());
app.use(express.json());

app.get('/api/token', async (req, res) => {
  try {
    const response = await axios.post('https://iam.cloud.ibm.com/identity/token', `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${API_KEY}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/predict', async (req, res) => {
  try {
    const { token, payload } = req.body;
    req.body.payload.input_data[0].fields[7]="RNFL4.mean";
    const response = await axios.post(SCORING_URL, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
