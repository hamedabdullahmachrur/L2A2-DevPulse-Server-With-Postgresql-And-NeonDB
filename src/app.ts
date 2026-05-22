import express, { type Application } from "express"
import { authRouter } from "./modules/auth/auth.route";
import { issuesRoute } from "./modules/issues/issues.route";
import { errorHandler } from "./middlewere/errorHandler";

const app: Application = express()

app.get('/', (req, res) =>{
    res.send("This is DevPulse server")
})
app.use(express.json())

// Routes
app.use('/api/auth', authRouter);
app.use('/api/issues', issuesRoute);

app.use(errorHandler)

export default app