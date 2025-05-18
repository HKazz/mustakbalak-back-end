require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const authRoutes = require("./controllers/auth.routes");
const hiringManagerRoutes = require("./controllers/hiringManager.routes");
const jobRoutes = require("./controllers/job.routes");
const applicationRoutes = require("./routes/application.routes");
const testJwtRouter = require("./controllers/test-jwt")
const verifyToken = require("./middleware/verify-token")
const userRoutes = require("./controllers/user.routes")
const companyRoutes = require("./controllers/company.routes")
const jobRoutes = require("./controllers/joblisting.routes")

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(morgan("dev"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/hiring-manager", hiringManagerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
=======
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));

// Routes go here
app.use("/auth",authRoutes)
app.use("/user", userRoutes)
app.use("/company", companyRoutes)
app.use("/company/:companyid/job" , jobRoutes)


app.use("/test-jwt",verifyToken,testJwtRouter)

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);


app.listen(3000, () => {
  console.log('The express app is ready!');

});
