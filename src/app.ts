// src/app.ts
import express, { Application, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import appointmentRouter from "./routes/appointments";

const app: Application = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
mongoose.set("strictQuery", false);
mongoose
  .connect(`mongodb+srv://clinic2go:KSpJ4PeHcU1MxPJS@clinic2go.qaddppe.mongodb.net/appointment-booking-ts?retryWrites=true&w=majority`)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error:any) => {
    console.error("Error connecting to MongoDB", error);
    process.exit();
  });

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/appointments", appointmentRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
