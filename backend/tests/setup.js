require("dotenv").config();
const mongoose = require("mongoose");

beforeAll(async () => {

  jest.setTimeout(30000);

  if (mongoose.connection.readyState === 0) {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Test DB connected");

  }

});

afterAll(async () => {

  await mongoose.connection.close();

  console.log("Test DB disconnected");

});