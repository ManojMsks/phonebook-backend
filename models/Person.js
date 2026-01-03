const mongoose = require('mongoose')

mongoose.set('strictQuery', false)


const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url, { family: 4 })

  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name:{
    type: String,
    minLength : 3,
    required: true
  },
  number: {
    type: String,
    required: true,
    minLength: 8, // Requirement 1: Length of 8 or more
    validate: {
      // Requirement 2: Custom Validator for format XX-XXXX...
      validator: function(v) {
        // Regex explanation:
        // ^\d{2,3}  -> Starts with 2 or 3 digits
        // -         -> Followed by a hyphen
        // \d+$      -> Ends with one or more digits
        return /^\d{2,3}-\d+$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number! (e.g., 09-123456)`
    }
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})



module.exports = mongoose.model('Person', personSchema)