require('./models/User');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const requireAuth = require('./middlewares/requireAuth');
const authRoutes = require('./routes/authRoutes');
const pushNotifications = require('./utils/pushNotification');

process.env.TZ = 'Asia/Jerusalem';

const app = express();

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

app.listen(process.env.PORT || 3000, () => console.log('Listening to ' + process.env.PORT || 3000));