"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/appointment.ts
const mongoose_1 = require("mongoose");
const appointmentSchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    bookedBy: { type: String, default: null }
});
exports.default = (0, mongoose_1.model)('Appointment', appointmentSchema);
