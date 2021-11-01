const express = require('express')
const admin = require('firebase-admin')
import { checkIfAuthenticated } from './routes/middlewares/auth-middleware.js'

const serviceAccount = require('./config/ServiceAccount.json')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const app = express()
app.use(express.json())

app.use('/api/register', require('./routes/api/register'));
app.use('/api/verify', require('./routes/api/verify'));
//app.use('/api/login', require('./routes/api/login'));

//protecting routes
// app.use('/api/protected_routes', checkIfAuthenticated, require('./routes/api/login'));

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log('connected....')
})