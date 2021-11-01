const express = require('express')
const router = express.Router();
const { uuid } = require('uuidv4');
// const bcrypte = require('bcryptjs')
// const jwt = require('jsonwebtoken')
// const config = require('config')

var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport("smtps://<email>:" + encodeURIComponent('<password>') + "@smtp.gmail.com:465", {
    service: "Gmail",
    auth: {
        user: "<email>",
        pass: "<password>"
    }
});

const { check, validationResult } = require('express-validator')

const admin = require('firebase-admin')
const db = admin.firestore();

router.post('/', [
    check('name', 'Name is required.').not().isEmpty(),
    check('mobileNo', 'phone number is required.').not().isEmpty(),
    check('email', 'Name is required.').not().isEmail(),
    check('password', 'password must be at least 8 characters and must contain an uppercase character').not().matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i"),
], async(req, res) => {
    const error = validationResult(req)
    if (!error.isEmpty) {
        return res.status(200).json({ 'code': 400, 'error': true, 'message': 'Some fields are missing or not valid' })
    } else {
        const { name, mobileNo, email, password } = req.body
        await admin.auth()
            .createUser({
                email: email,
                emailVerified: false,
                phoneNumber: mobileNo,
                password: password,
                displayName: name,
                photoURL: `https://ui-avatars.com/api/?name=${name}`,
                disabled: false,
            }).then((userRecord) => {
                admin.auth().setCustomUserClaims(userRecord.uid, { admin: true })
                var keyUUID = uuid()
                db.collection("tokenVerification").doc(userRecord.uid)
                    .set({
                        uid: userRecord.uid,
                        createdAt: new Date().getTime(),
                        expireAt: new Date().setTime(new Date().getTime() + (30 * 60 * 1000)),
                        key: keyUUID
                    }).then((value) => {
                        console.log(value)
                        sendEmail(email, keyUUID)
                        return res.status(200).json({ 'code': 200, 'error': false, 'message': 'Your account is successfully created please verify your email address' })
                    }).catch((error) => {
                        return res.status(200).json({ 'code': 500, 'error': true, 'message': error.message })
                    });
            }).catch((error) => {
                return res.status(200).json({ 'code': 500, 'error': true, 'message': error.message })
            });
    }
})

async function sendEmail(email, key) {
    var link = `http://localhost:5000/api/verify?key=${key}`
    mailOptions = {
        to: email,
        subject: "Please confirm your Email account",
        html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
    }
    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log(error);
            res.end("error");
        } else {
            console.log("Message sent: " + response);
            res.end("sent");
        }
    });
}

module.exports = router;