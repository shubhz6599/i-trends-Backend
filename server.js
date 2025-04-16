const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // remove .js extension
const authRoutes = require('./routes/authRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: ["http://localhost:4200", "https://i-trends-backend-production.up.railway.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // Allow credentials if needed
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("E-Commerce API Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
