import express, { type Application } from "express"

const app: Application = express()

app.get('/', (req, res) =>{
    res.send("This is DevPulse server")
})

export default app