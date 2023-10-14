
const express = require('express');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/products');
const app = express();
app.use(bodyParser.json());
app.use('/api/products', productRoutes);
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
