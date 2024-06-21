"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
// Connect to MongoDB
mongoose_1.default.set("strictQuery", false);
mongoose_1.default
    .connect(`mongodb+srv://clinic2go:KSpJ4PeHcU1MxPJS@clinic2go.qaddppe.mongodb.net/appointment-booking-ts?retryWrites=true&w=majority`)
    .then(() => {
    console.log("Connected to MongoDB");
})
    .catch((error) => {
    console.error("Error connecting to MongoDB", error);
    process.exit();
});
// Middleware
app.use(body_parser_1.default.json());
// Routes
app.use("/appointments", appointments_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});
exports.default = app;
