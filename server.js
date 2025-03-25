const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static('.')); // ou '.' si index.html est à la racine

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
