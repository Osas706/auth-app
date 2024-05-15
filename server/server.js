import express from 'express';
import cors from "cors";
import morgan from 'morgan';
import connect from './database/conn.js';
import router from './router/route.js';

import path from 'path';

const __dirname = path.resolve();

const app = express();
const PORT = 8080;

//middlewares.......
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by'); // less hackers know about our stack

//HTTP GET request
app.get('/', (req, res) => {
    res.status(201).json("Home Get Request")
});

//api routes
app.use('/api', router);

app.use(express.static(path.join(__dirname, '/client/dist')))

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'))
});


//start server only when we have a valid connection.
connect().then(() => {
    try {    
        //start server
        app.listen(PORT, () => {
            console.log(`Server connected to http://localhost:${PORT}`);
        })
    } catch (error) {
        console.log("Cant connect to the server");
    }
}).catch(error => {
    console.log("Invalid database connection");
})
