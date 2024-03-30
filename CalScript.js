const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const WINDOW_SIZE = 10;
const TIMEOUT = 500; // milliseconds

let window = [];

const isValidNumberId = (id) => {
  return ['p', 'f', 'e', 'r'].includes(id);
};

const fetchData = async (id) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/numbers/${id}`);
    return response.data.number;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

const calculateAverage = () => {
  if (window.length < WINDOW_SIZE) return null;
  const sum = window.reduce((acc, num) => acc + num, 0);
  return (sum / WINDOW_SIZE).toFixed(2);
};

app.get('/numbers/:numberId', async (req, res) => {
  const { numberId } = req.params;

  if (!isValidNumberId(numberId)) {
    return res.status(400).send('Invalid number ID');
  }

  const startTime = Date.now();

  const newNumber = await fetchData(numberId);
  if (newNumber === null || Date.now() - startTime > TIMEOUT) {
    return res.status(500).send('Failed to fetch data or request timed out');
  }

  window = [...new Set([...window, newNumber])].slice(-WINDOW_SIZE); // Enforce unique numbers and window size

  const windowPrevState = [...window];
  const windowCurrState = [...window];
  const avg = calculateAverage();

  res.json({
    windowPrevState,
    windowCurrState,
    numbers: newNumber,
    avg,
  });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));