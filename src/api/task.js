const express = require("express");
const connection = require('../database');

const router = express.Router();

const createTask = async (req, res, next) => {
    try {
        // const { id } = req.headers;
        console.log("task created")
        const { name, description, due_date, status } = req.body

        // if (!req.body.name) {
        //     res.send({
        //         message: "name is required"
        //     })
        // }

        // if (!req.body.description) {
        //     res.send({
        //         message: "phone number is required"
        //     })
        // }

        const sqlstr = `insert into tasks (name, description, due_date, status) values (?,?,?,?)`
        const [results] = await connection.promise().query(sqlstr, [name, description, due_date, status]);

        if (!results.affectedRows) {
            res.send({
                message: "data not inserted"
            })
        }

        res.status(200).send({
            message: "task created",
            response: results[0]
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params
        const { name, description, due_date, status } = req.body

        if ((!id)) {
            res.send({
                message: "id required"
            })
        }

        let setArray = [];
        let values = [];

        if (name) {
            setArray.push('name=?');
            values.push(name)
        }

        if (description) {
            setArray.push('description=?');
            values.push(description)
        }

        if (due_date) {
            setArray.push('due_date=?');
            values.push(due_date)
        }

        if (status) {
            setArray.push('status=?');
            values.push(status)
        }

        const setstr = setArray.join(',')

        const sqlstr = `update tasks set ${setstr} where id = ?`;
        const [results] = await connection.promise().execute(sqlstr, [...values, id]);

        if (!res.changedRows === 0) {
            res.send({
                message: "not upadated"
            })
        }

        if (results.length === 0) {
            res.send({
                message: "task not found"
            })
        }

        res.status(200).send({
            message: "update successfully",
            response: results
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

const gettaskDetails = async (req, res, next) => {
    try {
        console.log("task show")
        const { due_date,status,status_sort,due_date_sort } = req.query

        // if (!req.query) {
        //     res.status(400).send({
        //         message: "Bad Request"
        //     })
        // }

        let orderArr = [];
        let orderData = [];

        if (due_date) {
            orderArr.push('due_date');
            orderData.push(due_date,due_date_sort);
        }

        if (status) {
            orderArr.push('status');
            orderData.push(status,status_sort);
        }


        let orderString = ''

        if (orderArr.length) {
            orderString = `order by ${orderArr.join(',')}`
        }

        const sql = `select name, description, due_date, status from tasks ${orderString} limit 2 offset 1`;

        const [results] = await connection.promise().execute(sql, [...orderData]);

        res.status(200).send({
            message: "tasks lists",
            Data: results[0]
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "internal server error",
        })
    }
}

const gettaskById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).send({
                message: 'id is required'
            })
        }

        const sql = `select name, description, due_date, status from tasks where id = ?`;

        const [results] = await connection.promise().execute(sql, [id]);

        if (results.length == 0) {
            res.status(404).send({
                message: "task not found"
            })
        }

        res.status(200).send({
            message: "task details",
            response: results
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "internal server error"
        })
    }
}

router.get("/", gettaskDetails);
router.get("/:id", gettaskById);

router.put("/edit/:id", updateTask)
router.post("/add", createTask)

module.exports = router;