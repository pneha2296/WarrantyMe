"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlotsForDate = void 0;
// src/routes/appointments.ts
const express_1 = __importDefault(require("express"));
const appointment_1 = __importDefault(require("../models/appointment"));
const moment_1 = __importDefault(require("moment"));
const router = express_1.default.Router();
// Get all appointments
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const appointments = yield appointment_1.default.find();
        res.json(appointments);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}));
// Book an appointment slot
router.post('/book', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date, startTime, endTime, bookedBy } = req.body;
    try {
        // Check if slot is available
        const existingAppointment = yield appointment_1.default.findOne({ date, startTime, endTime });
        if (existingAppointment && existingAppointment.bookedBy) {
            return res.status(400).json({ message: 'Slot already booked' });
        }
        // Book the slot
        const updatedAppointment = yield appointment_1.default.findOneAndUpdate({ date, startTime, endTime }, { bookedBy }, { new: true });
        res.json(updatedAppointment);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}));
const generateSlotsForDate = (startDate, endDate, intervalInMinutes) => {
    const slots = [];
    let currentTime = startDate.clone();
    while (currentTime.isSameOrBefore(endDate)) {
        slots.push(currentTime.clone());
        currentTime.add(intervalInMinutes, 'minutes');
    }
    return slots;
};
exports.generateSlotsForDate = generateSlotsForDate;
// Endpoint to generate available slots
router.get('/available-slots', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ message: 'Date parameter is required' });
        }
        // Parse date using Moment.js
        const selectedDate = (0, moment_1.default)(date.toString());
        // Define start and end times for slots (10 am to 9 pm)
        const startTime = selectedDate.clone().hour(10).minute(0).second(0);
        const endTime = selectedDate.clone().hour(21).minute(0).second(0);
        // Generate all available slots for the selected date
        const intervalInMinutes = 45;
        const allSlots = (0, exports.generateSlotsForDate)(startTime, endTime, intervalInMinutes);
        // Fetch all booked slots for the selected date
        const bookedAppointments = yield appointment_1.default.find({
            slot: { $gte: startTime.toDate(), $lt: endTime.toDate() }
        });
        // Filter out booked slots and format the response
        const availableSlots = allSlots.filter(slot => {
            // Check if slot is not booked
            return !bookedAppointments.some(appointment => (0, moment_1.default)(appointment.date).isSame(slot));
        }).map(slot => ({
            date: slot.format('YYYY-MM-DD'),
            startTime: slot.format('HH:mm'),
            endTime: slot.clone().add(intervalInMinutes, 'minutes').format('HH:mm')
        }));
        res.json(availableSlots);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch available slots' });
    }
}));
exports.default = router;
