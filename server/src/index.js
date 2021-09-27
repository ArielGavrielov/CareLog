const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv').config({path: path.join(__dirname, '..', '.env')});
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const pushNotifications = require('./utils/pushNotification');
const PORT = process.env.PORT || 3001;

if(dotenv.error)
    throw dotenv.error;

process.env.TZ = 'Asia/Jerusalem';

const doctorPath = path.join(__dirname, '..', 'build');
console.log(doctorPath)

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', authRoutes);
app.use('/notifications', pushNotifications);

app.use(express.static(doctorPath));
app.get('*', (req, res) => {
    res.sendFile(path.join(doctorPath, 'index.html'));
 });

const mongoUri = 'mongodb+srv://Carelog-db:im6C8vwvJUNzeA0J@cluster0.0sbxa.mongodb.net/CareLog?retryWrites=true&w=majority';
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});
mongoose.connection.on('connected', () => {
    console.log('connected to mongodb instance');
});
mongoose.connection.on('error', (err) => {
    console.error('mongodb error', err);
});

app.listen(PORT, () => console.log('Listening to ' + PORT));