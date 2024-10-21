require('dotenv').config();
const express = require('express');
const { readdirSync } = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const bodyParse = require('body-parser');
const port = process.env.PORT || 8000;

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParse.json({limit: '10mb'}));
app.use('/uploads', express.static('Uploads'));

readdirSync('./Routes').map((r)=>app.use('/api', require('./Routes/'+r)));
app.listen(port,()=> console.log('Server Is Running On Port '+ port))