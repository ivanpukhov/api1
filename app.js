const express = require('express');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const searchRoutes = require('./routes/searchRoutes');

const orderRoutes = require('./routes/orders');
const app = express();
app.use(cors());


app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use('/api/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/search', searchRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
