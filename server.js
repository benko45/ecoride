const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('.')); // ou '.' si index.html est à la racine

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});