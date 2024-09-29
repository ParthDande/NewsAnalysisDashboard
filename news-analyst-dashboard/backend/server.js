const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/analyze', (req, res) => {
  const { text, tool } = req.body;
  
  const python = spawn('python', ['analyze.py', tool, text]);
  
  let output = '';
  python.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  python.on('close', (code) => {
    res.json({ result: output });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));