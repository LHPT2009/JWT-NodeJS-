require('dotenv').config()

const express = require('express')
const jwt = require('jsonwebtoken')
const verityToken = require('./middleware/auth')


const app = express()

app.use(express.json())

let users = [
    {
        id: 1,
        username: 'henry',
        refreshToken: null
    },
    {
        id: 2,
        username: 'jim',
        refreshToken: null
    },
]

const generateTokens = payload => {

    const { id, username } = payload

    const accessToken = jwt.sign({ id, username }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '5m'
    })
    const refreshToken = jwt.sign({ id, username }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '1h'
    })
    return { accessToken, refreshToken }
}

const updateRefreshToken = (username, refreshToken) => {
    users = users.map(user => {
        if (user.username === username)
            return {
                ...user,
                refreshToken
            }
        return user
    })
}

app.post('/login', (req, res) => {
    const username = req.body.username
    const user = users.find(user => user.username === username)
    if (!user) {
        return res.sendStatus(401)
    }

    const tokens = generateTokens(user)
    updateRefreshToken(username, tokens.refreshToken)

    console.log(users)

    res.json(tokens)
})

app.post('/token', (req, res) => {
    const refreshToken = req.body.refreshToken
    if (!refreshToken) return res.sendStatus(401)

    const user = users.find(user => user.refreshToken === refreshToken)
    if (!user) return res.sendStatus(401)

    try {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

        const tokens = generateTokens(user)
        updateRefreshToken(user.username, tokens.refreshToken)

        res.json(tokens)
    }
    catch (error) {
        console.log(error)
        res.sendStatus(403)
    }
})

app.delete('/logout', verityToken, (req, res) => {
    const user = users.find(user => user.id === req.userId)
    updateRefreshToken(user.username, null)
    //console.log(users)

    res.sendStatus(204)
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Running Server http://localhost:${PORT}`))