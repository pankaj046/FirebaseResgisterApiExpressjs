const express = require('express')
const router = express.Router();
const admin = require('firebase-admin')
const db = admin.firestore();


router.get('/', async(req, res) => {
    var keyUUID = req.query.key;
    try {
        let data = await db.collection("tokenVerification").where('key', '==', keyUUID).get()
        if (!data.empty) {
            const { uid, createdAt, expireAt } = data.docs[0].data()
            if (expireAt > (new Date().getTime())) {
                await admin.auth().updateUser(uid, {
                    emailVerified: true,
                    disabled: false,
                }).then((userRecord) => {
                    console.log('Successfully updated user', userRecord.toJSON());
                    return res.status(200).json({ 'code': 200, 'error': true, 'message': 'your account is verified successfully...' })
                }).catch((error) => {
                    return res.status(200).json({ 'code': 500, 'error': true, 'message': 'Link is invalid...' })
                });
            } else {
                return res.status(200).json({ 'code': 400, 'error': true, 'message': 'like is expired...' })
            }
        } else {
            return res.status(200).json({ 'code': 500, 'error': true, 'message': 'Link is invalid...' })
        }
    } catch (error) {
        return res.status(200).json({ 'code': 500, 'error': true, 'message': error.message })
    }
})
module.exports = router;