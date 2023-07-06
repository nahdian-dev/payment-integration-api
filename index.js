const express = require('express');
require('dotenv').config();
const errorHandling = require('./middlewares/error_handling_middleware');
const users_routes = require('./routes/users_routes');

const app = express();
const port = process.env.PORT || 5001;

app.use('/users', users_routes);

app.use(errorHandling);

app.listen(port, () => {
    console.log(`- Server are listening on port ${port}`);
});