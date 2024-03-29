const testingRouter = require('express').Router()
const { Blog } = require('../models')
const { User } = require('../models')

testingRouter.post('/reset', async (request, response) => {
  await Blog.sync({force: true})
  await User.sync({force: true})

  response.status(204).end()
})

testingRouter.put('/:id&lotlikes', async (request, response) => {

  const { likes } = request.body

  const blog = await Blog.findByPk(request.params.id)

  if (blog) {

    blog.likes = likes

    await blog.save()

    response.json(blog)
  } else {
    throw new Error('No entry')
  }

})

testingRouter.put('/admin/:id', async (request, response) => {

  const user = await User.findByPk(request.params.id)

  if (user) {

    user.admin = request.body.admin

    await user.save()

    response.json(user)
  } else {
    throw new Error('No entry')
  }

})

module.exports = testingRouter