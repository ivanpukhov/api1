const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const searchRoutes = require('./routes/searchRoutes');
const orderRoutes = require('./routes/orders');
const path = require("path");
const app = express();
app.use(cors());

// Настройка multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }

});
const upload = multer({ storage: storage });

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use('/api/uploads', function(req, res, next) {
    console.log(`Получен запрос к ${req.path}`);
    next();
}, express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/search', searchRoutes);

// Добавьте эту строку, чтобы создать маршрут для загрузки файлов
app.post('/api/upload', upload.single('image'), (req, res) => {
    res.send({ file: req.file });
});



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
