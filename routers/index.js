const routes = require('express').Router()
const lesson1Controller = require('../controllers/lesson1Controller')

routes.get('/', lesson1Controller.RobertRoute)
routes.get('/maddy', lesson1Controller.MaddyRoute)

module.exports = routes