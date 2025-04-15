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
      origin: ["http://localhost:4200"], // Add your frontend URLs here
      credentials: true, // optional, only if using cookies/session
    })
  );
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("E-Commerce API Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
