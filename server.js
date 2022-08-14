require('dotenv').config()

const express = require('express')
const jwt = require('jsonwebtoken')
const verityToken = require('./middleware/auth')

const app = express()

app.use(express.json())

const posts = [
    {
        userId: 1,
        post: 'post henry'
    },
    {
        userId: 2,
        post: 'post jim'
    }
]

app.get('/posts', verityToken, (req, res) => {
    res.json(posts.filter(post => post.userId === req.userId))
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => console.log(`Running Server http://localhost:${PORT}`))