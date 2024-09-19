const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const searchRoutes = require('./routes/searchRoutes');
const orderRoutes = require('./routes/orders');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());

// Проверка наличия директории uploads при запуске сервера
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    console.log('Создание директории uploads');
    fs.mkdirSync(uploadsDir, { recursive: true });
} else {
    console.log('Директория uploads уже существует');
}

// Настройка multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(`Установка директории назначения файла на ${uploadsDir}`);
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const filename = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        console.log(`Установка имени файла на ${filename}`);
        cb(null, filename);
    }
});
const upload = multer({ storage: storage });

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/uploads', function (req, res, next) {
    console.log(`Получен запрос к ${req.path}`);
    next();
}, express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/search', searchRoutes);

// Маршрут для загрузки файлов
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        console.error('Ошибка загрузки файла: файл не найден в запросе');
        return res.status(400).json({ error: 'Ошибка загрузки файла: файл не найден в запросе' });
    }
    console.log(`Файл успешно загружен: ${req.file.path}`);
    res.send({ file: req.file });
});

// Маршрут для проверки наличия файла
app.get('/api/check-file/:filename', (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    console.log(`Проверка наличия файла по пути: ${filePath}`);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`Файл не найден: ${filePath}`);
            return res.status(404).json({ error: `Файл не найден: ${filePath}`, details: err.message });
        }
        res.json({ message: 'Файл существует' });
    });
});

// Маршрут для получения файла
app.get('/api/file/:filename', (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    console.log(`Попытка получить файл по пути: ${filePath}`);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`Файл не найден: ${filePath}`);
            return res.status(404).json({ error: `Файл не найден: ${filePath}`, details: err.message });
        }
        console.log(`Файл найден, отправка файла: ${filePath}`);
        res.sendFile(filePath);
    });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Произошла ошибка:', err);
    res.status(500).json({ error: 'Произошла ошибка', details: err.message });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
