require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const connectDB = require("./db/connect");

const app = express();

app.use(cors());
app.use(express.json());

global.serverStartTime = Date.now();

const mainRouter = require("./routes/user");
app.use("/api/v1", mainRouter);

const alertRoutes = require("./routes/alert");
app.use("/api/v1/alerts", alertRoutes);

app.use("/uploads", express.static("uploads"));

/* ONLY run background systems outside tests */

if (process.env.NODE_ENV !== "test") {

  const sensorRoutes = require("./routes/sensor");
  app.use("/api/sensors", sensorRoutes);

  require("./jobs/weeklySummary");

}

const start = async () => {
  try {

    await connectDB(process.env.MONGO_URI);

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });

  } catch (error) {
    console.log(error);
  }
};

if (process.env.NODE_ENV !== "test") {
  start();
}

module.exports = app;

// require("dotenv").config();
// require("express-async-errors");
// const sensorRoutes = require("./routes/sensor");
// const alertRoutes = require("./routes/alert");

// const express = require("express");
// const cors = require("cors");
// const connectDB = require("./db/connect");

// const app = express();

// app.use(cors());
// app.use(express.json());

// global.serverStartTime = Date.now();

// const mainRouter = require("./routes/user");
// app.use("/api/v1", mainRouter);

// app.use("/api/sensors", sensorRoutes);
// app.use("/api/v1/alerts", alertRoutes);
// app.use("/uploads", express.static("uploads"));

// require("./jobs/weeklySummary");

// const start = async () => {
//   try {
//     await connectDB(process.env.MONGO_URI);

//     const port = process.env.PORT || 3000;

//     app.listen(port, () => {
//       console.log(`Server is listening on port ${port}`);
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

// if (process.env.NODE_ENV !== "test") {
//   start();
// }

// module.exports = app;