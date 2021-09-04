require('./models/User');
const express = require('express');
const cors = require('cors');
//const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const requireAuth = require('./middlewares/requireAuth');
const authRoutes = require('./routes/authRoutes');
const pushNotifications = require('./utils/pushNotification');

process.env.TZ = 'Asia/Jerusalem';
process.env.TOKEN_SECRET = '492a8890b096551f14e2138293dcde5fd84613b8a2154f4911cd607cc1e79289691121726bc1669dc070c96cb2363a61b16eca07093f86280ddc5f700fd0ad88';


const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', authRoutes);
app.use('/notifications', pushNotifications);

const mongoUri = 'mongodb+srv://Carelog-db:im6C8vwvJUNzeA0J@cluster0.0sbxa.mongodb.net/CareLog?retryWrites=true&w=majority';
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
mongoose.connection.on('connected', () => {
    console.log('connected to mongodb instance');
});
mongoose.connection.on('error', (err) => {
    console.error('mongodb error', err);
});

app.listen(process.env.PORT || 3001, () => console.log('Listening to ' + process.env.PORT || 3001));