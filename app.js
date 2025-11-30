const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Hello DevOps World!');
});

// 題目要求必須要有這個 health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
