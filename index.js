const express = require("express")
const dotenv = require("dotenv").config()
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const URL = process.env.DB
const app = express()

app.use(express.json())

app.post("/student", async (req, res) => {
    try {
        //connect the database
        const connection = await mongoclient.connect(URL)

        //select the database
        const db = connection.db("studentMentor")

        //select the collection
        //Do operation
        const student = await db.collection("students").insertOne(req.body)

        //close the connection
        await connection.close()

        res.status(200).json({ message: "studentdetails created" })
    } catch (error) {
        res.status(500).json({ message: "something went wrong" })
    }
})

app.post("/mentor", async (req, res) => {
    try {
        //connect the db
        const connection = await mongoclient.connect(URL)

        //select the db
        const db = connection.db("studentMentor")

        //select the collection
        //Do operation
        const mentor = await db.collection("mentors").insertOne(req.body)

        //close connection
        await connection.close()

        res.status(200).json({ message: "mentordetails created" })

    } catch (error) {
        res.status(500).json({ message: "something went wrong" })
    }
})

//Assign a student to Mentor
app.put("/students_assign/:mId", async (req, res) => {
    try {
        const connection = await mongoclient.connect(URL);
        const db = connection.db("studentMentor");

        const assignStudent = await db.collection("mentors")
            .updateOne(
                { _id: mongodb.ObjectId(req.params.mId) },
                { $push: { sId: { $each: [req.body] } } });
        console.log(assignStudent)

        await connection.close();
        res.status(200).json({ message: "student assgined sucessfully" })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

//Assign or Change Mentor for particular Student
app.put("/mentor_assign/:sId", async (req, res) => {
    try {
        const connection = await mongoclient.connect(URL);
        const db = connection.db("studentMentor");
        await db
            .collection("students")
            .updateOne(
                { _id: mongodb.ObjectId(req.params.sId) },
                { $set: req.body });

        await connection.close();

        res.status(200).json({ message: "mentor assgined sucessfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});


// show all students for a particular mentor
app.get("/mentor_students/:mId", async (req, res) => {
    try {
        const connection = await mongoclient.connect(URL);
        const db = connection.db("studentMentor");

        const students_list = await db
            .collection("mentors")
            .aggregate([
                {
                    '$match': {
                        _id: mongodb.ObjectId(req.params.mId)
                    }
                }, {
                    '$lookup': {
                        'from': 'students',
                        'localField': 'sId',
                        'foreignField': '_id',
                        'as': 'students_list'
                    }
                }
            ])
            .toArray();

        await connection.close();
        res.json(students_list);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

app.listen(process.env.PORT || 3009)