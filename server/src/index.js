const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const pushNotifications = require('./utils/pushNotification');
const path = require('path');
const PORT = process.env.PORT || 3001;

process.env.TZ = 'Asia/Jerusalem';
process.env.TOKEN_SECRET = 'cc4abceca1c30919c4255a43ee3a2805d5802080990353228942d4b1a6af52553ddb084ccda84fd493f8bfc14feb3ab42cacf68b1ade7da51f62dba3b56da659ca870aef9b802c8896161b357b92b905911e878ccee10215a2e1a071bdd755f70b35f54ba32a4e7fdfc8e531535a6be06679edeb4fb12632f31c2938aa3129ffac577e3b75a67fdec25a9f582452d1c9bf5d80dbe68f2dc3d76919593e1528412754775d98eaaf6d75185943bff566e8f222a098ec599d90ec83afa654b5a689a571be4594ca5490f832baebd9d9874fe160671321f2056e3a56134873a3ee8b0c14439f3e3e8446ab1ceabff8fe5ac459175523ee479cd40a5c0312783d7dd1';


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
    useFindAndModify: false
});
mongoose.connection.on('connected', () => {
    console.log('connected to mongodb instance');
});
mongoose.connection.on('error', (err) => {
    console.error('mongodb error', err);
});

app.listen(PORT, () => console.log('Listening to ' + PORT));