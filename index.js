const express = require('express')
const morgan = require('morgan') // Import morgan
const cors = require('cors')


const app = express()

app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())



let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

// 3.1: Route to get all persons
app.get('/api/persons', (request, response) => {
  response.json(persons)
})

// 3.2: Info route
app.get('/info', (request, response) => {
  const currentDate = new Date()
  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${currentDate}</p>
  `)
})

// 3.3: Get single person
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id) // Convert string param to number
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})




// 3.4: Delete person
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

// Function to generate random ID
const generateId = () => {
  return Math.floor(Math.random() * 1000000) // Using random large number as requested
}

// 3.5: Post new person
app.post('/api/persons', (request, response) => {
  const body = request.body

  // Check 1: Missing content
  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  // Check 2: Name must be unique
  const nameExists = persons.find(p => p.name === body.name)
  if (nameExists) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  // Note: We will handle validation in 3.6, for now just create the object
  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)
  response.json(person)
})




const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})