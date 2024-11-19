// server.js

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
const multer = require('multer');
const socketIO = require('socket.io');
const mercadopago = require('mercadopago');
const io = socketIO(server);

// Configuración de MercadoPago usando variables de entorno
mercadopago.configure({
    sandbox: true,
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-6173977767324392-111512-c62c335be7040baea50f33f1bfc64cea-1063637350' // Default para desarrollo
});

/*
* IMPORTAR SOCKETS
*/
const ordersSocket = require('./sockets/ordersSocket');

/*
* IMPORTAR RUTAS
*/
const usersRoutes = require('./routes/userRoutes');
const categoriesRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const addressRoutes = require('./routes/addressRoutes');
const ordersRoutes = require('./routes/orderRoutes');
const mercadoPagoRoutes = require('./routes/mercadoPagoRoutes');

// Puerto dinámico asignado por Railway o 3000 en desarrollo local
const port = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.disable('x-powered-by');

app.set('port', port);

/*
* LLAMADO A LOS SOCKETS
*/
ordersSocket(io);

const upload = multer({
    storage: multer.memoryStorage()
});

/*
* LLAMADO DE LAS RUTAS
*/
usersRoutes(app, upload);
categoriesRoutes(app);
addressRoutes(app);
productRoutes(app, upload);
ordersRoutes(app);
mercadoPagoRoutes(app);

// ERROR HANDLER
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).send(err.stack);
});

// Ruta raíz para verificar si el servidor está corriendo
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ruta Raíz</title>
        </head>
        <body>
            <h1>Ruta raíz del backend</h1>
            <p>Este es un pedazo de texto en HTML para verificar si se está ejecutando correctamente.</p>
        </body>
        </html>
    `);
});

// Levantar el servidor en el puerto dinámico asignado por Railway
server.listen(port, () => {
    console.log(`Aplicación de NodeJS iniciada en el puerto ${port}...`);
});

module.exports = {
    app: app,
    server: server
};