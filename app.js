const express = require('express');
const app = express();
const cors = require('cors');
const router = require('./router.js');
const PORT = process.env.PORT || 3020;

app.use(cors());
app.use(router);

app.listen(PORT, () => console.log(`EURO 2020 on PORT ${PORT}`));
