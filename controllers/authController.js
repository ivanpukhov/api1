const jwt = require('jsonwebtoken');

// Заранее определённые данные для входа
const users = [
    {
        username: "admin",
        password: "password"
    }
];

exports.login = (req, res) => {
    const { username, password } = req.body;

    // Проверяем, есть ли пользователь с такими данными
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Генерация токена
        const accessToken = jwt.sign({ username: user.username }, 'dfghjkfghjhjkuhn');
        res.json({ accessToken });
    } else {
        res.send('Username or password incorrect');
    }
};

// Middleware для проверки JWT
exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, 'dfghjkfghjhjkuhn', (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }

};
