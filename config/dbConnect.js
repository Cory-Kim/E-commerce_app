const {default: mongoose} = require("mongoose")

const dbConnect = () =>
{
  try {
    const connect = mongoose.connect(process.env.MONGODB_URL);
    console.log('Database Connected Successfully')

  } catch (error) {
    console.log(error)
  }
  
};

module.exports = dbConnect