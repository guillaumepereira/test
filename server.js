const Joi = require('joi')
const app = require('express')()

const port = 3003

app.use('/products', require('./routes/routes'))

app.listen(port, err => {
  if (err) {
    throw err
  }

  console.log(`\napp started on ${port}\n`)
});


module.exports = app; // for testing