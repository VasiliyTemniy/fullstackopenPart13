// const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
// const logger = require('./utils/logger')
const blogsRouter = require('./controllers/blog')
// const usersRouter = require('./controllers/users')
// const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')


app.use(cors())
// app.use(express.static('build'))
app.use(express.json())


app.use(middleware.requestLogger)

// app.use('/api/login', loginRouter)
app.use('/api/blogs', blogsRouter)
// app.use('/api/users', usersRouter)

// eslint-disable-next-line no-undef
// if (process.env.NODE_ENV === 'test') {
//   const testingRouter = require('./controllers/testing')
//   app.use('/api/testing', testingRouter)
// }

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app