const express = require('express')
const router = express.Router();
const admin = require('firebase-admin')
const db = admin.firestore();


router.post('/', async(req, res) => {
	//firebase not allow server side login
    const { email, password } = req.body;
    return res.status(200).json({ 'code': 200, 'error': false, 'message': "keyUUID" })

})
module.exports = router;