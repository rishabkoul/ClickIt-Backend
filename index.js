const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const authRoute = require("./routes/auth");
const nonGroupRoutes = require("./routes/nonGroupRoutes");
const agreementRoutes = require("./routes/agreement");
const profileRoutes = require("./routes/profile");
const locationRoutes = require("./routes/location");
const bookingRoutes = require("./routes/booking");

dotenv.config();

mongoose.connect(process.env.DB_CONNECT, () => console.log("connected to db!"));

app.use(express.json());

app.use("/api/user", authRoute);
app.use("/api/nongrouproutes", nonGroupRoutes);
app.use("/api/agreement", agreementRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/booking", bookingRoutes);

app.listen(process.env.PORT || 3000, () =>
  console.log(`Server running on port 3000 `)
);

module.exports = app;
