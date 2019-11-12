import cors from "cors";
import express from 'express';
import cspComponent from "./config/csp-component";
import routes from "./routes";
const app = express();
const port = 8080; // default port to listen

app.use(cors());
app.use(cspComponent);

app.get("/", (req, res, next) => {
    res.send("Backend is up and running");
});

app.use('/', routes);

app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );
