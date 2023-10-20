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

    // Проверка наличия данных
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        const accessToken = jwt.sign({ username: user.username }, 'dfghjkfghjhjkuhn');
        res.json({ accessToken });
    } else {
        res.status(401).send('Username or password incorrect');
    }
};

exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, 'dfghjkfghjhjkuhn', (err, user) => {
            if (err) {
                return res.status(403).send('Forbidden: Invalid or expired token');
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).send('Unauthorized: No token provided');
    }
};
