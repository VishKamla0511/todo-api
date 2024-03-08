const express = require("express");
const connection = require('../database');

const router = express.Router();

const createTask = async (req, res, next) => {
    try {
        const { name, description, due_date, status } = req.body

        if (!name) {
            res.status(400).send({
                message: "name is required"
            })
        }

        if (!description) {
            res.status(400).send({
                message: "description is required"
            })
        }

        if (!due_date) {
            res.status(400).send({
                message: "due is required"
            })
        }

        if (!status ) {
            res.status(400).send({
                message: "status is required and it should be incomplete or complete"
            })
            return;
        }

        if  (status !== "incomplete" && status !== "complete") {
            res.status(400).send({
                message: "status is required and it should be incomplete or complete"
            })
            return;
        }

        const queryString = `insert into tasks (name, description, due_date, status) values (?,?,?,?)`
        const [results] = await connection.promise().query(queryString, [name, description, due_date, status]);

        if (!results.affectedRows) {
            res.status(500).send({
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

const getTasks = async (req, res, next) => {
    try {
        let { due_date,status,status_sort,due_date_sort, limit, offset } = req.query

        if (!limit && !offset) {
            limit = 10;
            offset = 1;
        }

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



        const queryString = `select name, description, due_date, status from tasks ${orderString} limit ${limit} offset ${offset}`;

        const [results] = await connection.promise().execute(queryString, [...orderData]);

        const contQueryString = `select count(1) as count from tasks ${orderString}`;

        const [countResults] = await connection.promise().execute(contQueryString, [...orderData]);

        res.status(200).send({
            message: "tasks lists",
            response: results,
            count: countResults[0].count || null
        })

    } catch (error) {
        res.status(500).send({
            message: "internal server error",
        })
    }
}

const getTaskById = async (req, res, next) => {
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

router.get("/", getTasks);
router.post("/", createTask);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);

module.exports = router;