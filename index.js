require('dotenv').config()
const Person = require('./models/Person')
 

const express = require('express')
const morgan = require('morgan') // Import morgan
const cors = require('cors')


const app = express()

app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())
app.use(express.static('dist'))    // tells it to use html files from dist directory

// 3.1: Route to get all persons
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons=>
  response.json(persons))
})

// 3.2: Info route
app.get('/info', (request, response) => {
  const currentDate = new Date()
  Person.countDocuments({})
    .then(count => {
      response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${currentDate}</p>
      `)
    })
})

// 3.3: Get single person
app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person=>{response.json(person)});
})




// 3.4: Delete person
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})



// 3.5: Post new person
app.post('/api/persons', (request, response,next) => {
  const body = request.body

  // Check 1: Missing content
  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  const person = new Person ({
    name: body.name,
    number: body.number
  })

  person.save().then(savedperson =>{response.json(savedperson)})
  .catch(error => next(error))
})


// update person

app.put('/api/persons/:id'  ,(request,response,next) => {
  const body=request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }
  const { name, number } = request.body
  const person = {
    name: name,
    number: number,
  }
  Person.findByIdAndUpdate(
    request.params.id, 
    person, 
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


//error hanlder middleware
// Handler for requests to non-existent routes
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// Central Error Handler
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
// This must be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

//connection
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})