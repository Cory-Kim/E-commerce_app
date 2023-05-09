const {default: mongoose} = require("mongoose")

const dbConnect = () =>
{
  try {
    const connect = mongoose.connect('mongodb://localhost:27017/ecommerce');
    console.log('Database Connected Successfully')

  } catch (error) {
    console.log(error)
  }
  
};

module.exports = dbConnect