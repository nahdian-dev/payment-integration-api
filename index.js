const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

app.listen(port, () => {
    console.log(`- Server are listening on port ${port}`);
});