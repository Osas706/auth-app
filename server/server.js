import express from 'express';
import cors from "cors";
import morgan from 'morgan';
import connect from './database/conn.js';
import router from './router/route.js';

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
