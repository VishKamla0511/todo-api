const express = require("express");
const connection = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 5;

const router = express.Router();

const registereuser = async (req, res, next) => {
    try {
        console.log("Register user")
        const { email, password } = req.body

        if (!email) {
            res.send({
                message: "email is required"
            })
        }

        if (!password) {
            res.send({
                message: "password is required"
            })
        }

        const sqlstr = `insert into users (email, password) values (?,?)`

        console.log({ password, saltRounds })
        const hashPassword = await bcrypt.hash(password, saltRounds) //encrypt password and store in database

        const [results] = await connection.promise().query(sqlstr, [email, hashPassword]);

        if (!results.insertId) {
            res.send({
                message: "data not inserted"
            })
        }

        res.status(200).send({
            message: "user register",
            response: results[0]
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            res.send({
                message: "email required"
            })
        }

        if (!password) {
            res.send({
                message: "password required"
            })
        }

        const sql = `select user_id,email,password from users where email = ? `;
        const [results] = await connection.promise().execute(sql, [email]);

        if (results.length == 0) {
            res.send({
                message: "wrong password"
            })
        }

        const hashPassword = results[0].password;
        const match = await bcrypt.compare(password, hashPassword); //decrypt password

        if (!match) {
            res.send({
                message: "email or password are incorrect please try again"
            })
        }

        let token = jwt.sign({ user_id: results[0].user_id }, 'server'); //generate token
        console.log(token);

        res.status(200).send({
            message: "login succesful",
            validToken: token
        })

        res.status(200).send({
            message: "successfully login",
            response: results
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "interenal server error"
        })
    }
}

router.post("/login", login)
router.post("/register", registereuser);

module.exports = router;