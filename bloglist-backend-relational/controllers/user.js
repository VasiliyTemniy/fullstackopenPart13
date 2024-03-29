const bcryptjs = require('bcryptjs')
const usersRouter = require('express').Router()
const { User, Blog } = require('../models')
const middleware = require('../utils/middleware')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const existingUser = await User.findOne({
    where: {
      username: username
    }
  })
  if (existingUser) {
    return response.status(400).json({ error: 'username must be unique' })
  }

  if (password === undefined || password.length <= 3) {
    return response.status(400).json({ error: 'password must be longer than 3 symbols' })
  } else {
    const saltRounds = 10
    const passwordHash = await bcryptjs.hash(password, saltRounds)

    const user = {
      username,
      name,
      passwordHash
    }

    const savedUser = await User.create(user)

    response.status(201).json(savedUser)
  }
})

usersRouter.get('/', async (request, response) => {
  const users = await User.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt', 'passwordHash', 'disabled', 'admin'] },
    include: [
      {
        model: Blog,
        attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] }
      }
    ],
  })

  response.json(users)
})

usersRouter.put(
  '/:id',
  middleware.verifyToken,
  middleware.userExtractor,
  middleware.sessionCheck,
  async (request, response) => {
    const { username, name, password } = request.body

    if (password === undefined || password.length <= 3) {
      return response
        .status(400)
        .json({ error: 'Username and password must be longer than 3 symbols' })
    } else {
      if (request.userId !== request.params.id) {
        return response.status(401).json({ error: 'User attempts to change another users data or invalid user id' })
      } else {
        const saltRounds = 10
        const passwordHash = await bcryptjs.hash(password, saltRounds)

        const user = await User.findByPk(request.params.id)

        user.username = username
        user.name = name
        user.passwordHash = passwordHash

        await user.save()

        response.json(user)
      }
    }
  },
)

usersRouter.get('/:id', async (request, response) => {

  let where = {}
  if (request.query.read) {
    where = { read: request.query.read === 'true' }
  }

  const user = await User.findByPk(request.params.id, {
    attributes: { exclude: ['createdAt', 'updatedAt', 'passwordHash', 'disabled', 'admin'] },
    include: [
      {
        model: Blog,
        attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] }
      },
      {
        model: Blog,
        as: 'readings',
        attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
        through: {
          attributes: ['read', 'id'],
          where
        },
      }
    ]
  })

  if (user) {
    response.json(user)
  } else {
    throw new Error('No user entry')
  }
})

module.exports = usersRouter