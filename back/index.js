const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken')
const sendmail = require('./mailer');
const passwordMail = require('./mailerpassword')

mongoose.connect('mongodb://localhost:27017/meanSatck', {})
    .then(() => { console.log(`Database is connected`); })
    .catch((error) => { console.log(error); })
app.use(cors());

app.use(express.json())

const User = new mongoose.model('/user', mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    days: Number,
    days_in_leave: Number,
    role: {
        type: String,
        default: "super-admin"
    },
    image: String,
    manager_email: { type: String, default: "superadmin@gmail.com" },
    manager_name: { type: String, default: "Super" },
}, { timestamps: true }))

const Leave1 = new mongoose.model('leave1', mongoose.Schema({
    leaveRequesterId: String,
    firstName: String,
    lastName: String,
    email: String,
    status_of_leave: { type: String, default: 'pending' },
    days_in_leave: Number,
    start: String,
    end: String,
    message: String,
    manager_email: { type: String, default: "superadmin@gmail.com" },
    manager_name: { type: String, default: "Super" },
    total_leaves: { type: Number, default: 30 },
    count: Number
}))

const Leave2 = new mongoose.model('leave2', mongoose.Schema({
    leaveRequesterId: String,
    firstName: String,
    lastName: String,
    email: String,
    status_of_leave: { type: String, default: 'pending' },
    days_in_leave: Number,
    start: String,
    end: String,
    message: String,
    manager_email: { type: String, default: "superadmin@gmail.com" },
    manager_name: { type: String, default: "Super" },
    total_leaves: { type: Number, default: 30 },
    count: Number
}))

const LeaveStatus = new mongoose.model('leaveStatus', mongoose.Schema({
    firstName: String,
    email: String,
    start: String,
    end: String,
    days_in_leave: Number,
    status: String,
    manager_name: String,
    leave_days: Number,
    days_in_leave: Number,
    total_leaves: { type: Number, default: 30 },
}))

app.get('/all', async (req, res) => {
    const user = await User.find()
    res.send(user)
})

app.post('/signup', async (req, res) => {
    const { first_name, last_name, email, password, role, image, manager_email, manager_name } = req.body;
    if (!first_name || !last_name || !email || !password || !image) {
        res.status(400).send({ msg: "Please enter complete detail" })
    } else {
        const emp = await User({ first_name, last_name, image, email, role, password, manager_email, manager_name });
        if (emp) {
            const findEmail = await User.findOne({ email })
            if (findEmail) {
                res.status(401).send({ msg: 'Email exist in database' })
            } else {
                const employee = await emp.save();
                if (employee) {
                    console.log(employee.first_name);
                    sendmail(`${employee.email}`, `${employee.first_name}`, '')
                    res.status(200).send(employee)
                } else {
                    res.status(402).send({ msg: "error in saving data" })
                }
            }
        }
    }
})

app.post('/signin', async (req, res) => {
    const { email, password, role } = req.body
    if (!email || !password || !role) {
        res.status(400).send({ msg: 'please enter complete detail' });
    } else {
        const user = await User.findOne({ email, password, role })
        if (user) {
            if (role === "general") {
                let payload = { subject: user._id }
                let token = jwt.sign(payload, 'secretkey')
                res.status(200).send({ data: user, token: token })
            } else {
                let payload = { subject: user._id }
                let token = jwt.sign(payload, 'secretkey')
                const data = await User.find({})
                res.status(200).send({ data: data, token: token })
            }
        } else {
            res.status(401).send({ msg: 'Either email or password or role does not match' })
        }
    }
})

app.put('/update/:id', (req, res) => {
    const { first_name, last_name, email, image } = req.body;
    User.findByIdAndUpdate(req.params.id, {
        $set: { first_name, last_name, email, image }
    }, {
        new: true
    },
        (error, update) => {
            if (error) {
                res.status(400).send({ msg: error })
            } else {
                res.status(200).json(update)
            }
        }
    )
})

app.delete('/delete/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id, (error, deleted) => {
        if (error) {
            res.status(400).send({ msg: error })
        } else {
            res.status(200).send({ msg: deleted })
        }
    })
})

app.get('/generalUser', async (req, res) => {
    const role = 'general'
    const user = await User.find({ role }).sort({ first_name: 1 })
    if (role === 'general') {
        res.send(user)
    }
})
app.get('/adminUser', async (req, res) => {
    const role = 'admin'
    const user = await User.find({ role }).sort({ first_name: 1 })
    if (user) {
        if (role === 'admin') {
            res.send(user)
        }
    }
})


app.post('/segrigate', async (req, res) => {
    const { email, password } = req.body
    const role = 'general';
    if (!email || !password) {
        res.status(400).send({ msg: 'please enter complete detail' });
    } else {
        const a = await User.findOne({ email, password })
        if (a) {
            if (role === 'general') {
                let payload = { subject: a._id }
                let token = jwt.sign(payload, 'secretkey')
                res.status(200).send({ data: a, token: token })
            } else {
                let payload = { subject: a._id }
                let token = jwt.sign(payload, 'secretkey')
                res.status(200).send({ data: a, token: token })
            }
        } else {
            res.status(401).send({ msg: 'Either email or password does not match' })
        }

    }
})

app.get('/search/:first_name', async (req, res) => {
    const regex = new RegExp(req.params.first_name, 'i');
    const a = await User.find({ first_name: regex })
    if (a) {
        res.status(200).json(a)
    } else if (a === '') {
        res.send({ msg: 'Nothing to show' })
    }
})

app.post('/forgetpassword', async (req, res) => {
    const email = req.body.email
    console.log(email);
    const user = await User.findOne({ email })
    if (user) {
        passwordMail(email, user.password, 'password', user.first_name)
        res.status(200).send({ msg: 'An email is send to your account containing password' });
    } else {
        res.status(400).send({ msgData: 'Email does not exist in database' });
    }
})

app.get('/cardData', async (req, res) => {
    const data = await User.find({}).sort({ createdAt: 1 })
    if (data) {
        res.send({ data: data })
    }
})

app.post('/leaverequest', async (req, res) => {
    const { leaveRequesterId, firstName, lastName, email, days_in_leave, start, end, total_leaves, manager_email, manager_name, message, count } = req.body

    const leave1 = await Leave1({ leaveRequesterId, firstName, lastName, email, days_in_leave, start, end, total_leaves, manager_email, manager_name, message, count })
    const leave2 = await Leave2({ leaveRequesterId, firstName, lastName, email, days_in_leave, start, end, total_leaves, manager_email, manager_name, message, count })
    if (total_leaves >= 0) {
        const a = await leave1.save()
        const b = await leave2.save()
        res.send(a)
    }
    else {
        res.status(404).send({ msg: "You have avail more leaves than given" })
    }
})

app.post('/leaverequests', async (req, res) => {
    const manager_email = req.body.manager_email
    const leave = await Leave1.find({ manager_email })
    if (leave) {
        res.send(leave)
    }
})

app.post('/deleteAfterLeaveCount', async (req, res) => {
    const { count, status_of_leave } = req.body
    if (status_of_leave === 'declined') {
        await Leave1.deleteOne({ count })
        // await Leave2.deleteOne({ count })
    }
    else {
        await Leave1.deleteOne({ count })
    }
})

app.post('/leaverequestdetail', async (req, res) => {
    const email = req.body.email
    const user = await Leave2.find({ email })
    if (user) {
        res.send(user)
    } else {
        res.send('Sorry no detail found')
    }
})

app.post('/leaverequestdetail2', async (req, res) => {
    const email = req.body.email
    const user = await Leave1.find({ email })
    if (user) {
        res.send(user)
    } else {
        res.send('Sorry no detail found')
    }
})

app.post('/leaveStatus', async (req, res) => {
    const email = req.body.email
    const data = await LeaveStatus.find({ email })
    if (data) {
        res.send(data)
    }
})

app.put('/leaverequestupdate/:id', async (req, res) => {
    const email = req.body.email
    const firstName = req.body.firstName
    const status = req.body.status_of_leave
    const start = req.body.start
    const end = req.body.end
    const count = req.body.count
    const manager_name = req.body.manager_name
    const total_leaves = req.body.total_leaves
    const days_in_leave = req.body.days_in_leave
    var leave = await LeaveStatus({ email, firstName, status, start, end, manager_name, total_leaves, days_in_leave })
    if (status === 'approved') {
        const leaveRequesterEmail = await Leave2.findOne({ email, count })
        if (leaveRequesterEmail) {
            const total_leaves = leaveRequesterEmail.total_leaves
            const leave = await LeaveStatus({ email, firstName, status, start, end, manager_name, total_leaves, days_in_leave })
            await leave.save()
        }
    }
    else {
        const leaveRequesterEmail = await Leave2.findOne({ email, count })
        if (leaveRequesterEmail) {
            const total_leaves = leaveRequesterEmail.total_leaves + leaveRequesterEmail.days_in_leave
            const leave = await LeaveStatus({ email, firstName, status, start, end, manager_name, total_leaves, days_in_leave })
            const update = await Leave2.updateOne({ count }, { $set: { total_leaves } })
            const leaves = await leave.save()
            console.log('declined'+total_leaves);
        }
    }

})

const port = 2000

app.listen(port, () => { console.log(`Server is listen on port ${port}`); });