// src/routes/appointments.ts
import express, { Router, Request, Response } from 'express';
import Appointment, { IAppointment } from '../models/appointment';
import moment, { Moment } from 'moment';

const router: Router = express.Router();

// Get all appointments
router.get('/', async (req: Request, res: Response) => {
    try {
        const appointments: IAppointment[] = await Appointment.find();
        res.json(appointments);
    } catch (err:any) {
        res.status(500).json({ message: err.message });
    }
});

// Book an appointment slot
router.post('/book', async (req: Request, res: Response) => {
    const { date, startTime, endTime, bookedBy } = req.body;

    try {
        // Check if slot is available
        const existingAppointment: IAppointment | null = await Appointment.findOne({ date, startTime, endTime });
        if (existingAppointment && existingAppointment.bookedBy) {
            return res.status(400).json({ message: 'Slot already booked' });
        }

        // Book the slot
        const updatedAppointment: IAppointment | null = await Appointment.findOneAndUpdate(
            { date, startTime, endTime },
            { bookedBy },
            { new: true }
        );

        res.json(updatedAppointment);
    } catch (err:any) {
        res.status(500).json({ message: err.message });
    }
});

export const generateSlotsForDate = (startDate: Moment, endDate: Moment, intervalInMinutes: number): Moment[] => {
    const slots: Moment[] = [];
    let currentTime = startDate.clone();

    while (currentTime.isSameOrBefore(endDate)) {
        slots.push(currentTime.clone());
        currentTime.add(intervalInMinutes, 'minutes');
    }

    return slots;
};

// Endpoint to generate available slots
router.get('/available-slots', async (req: Request, res: Response) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ message: 'Date parameter is required' });
        }

        // Parse date using Moment.js
        const selectedDate = moment(date.toString());

        // Define start and end times for slots (10 am to 9 pm)
        const startTime = selectedDate.clone().hour(10).minute(0).second(0);
        const endTime = selectedDate.clone().hour(21).minute(0).second(0);

        // Generate all available slots for the selected date
        const intervalInMinutes = 45;
        const allSlots = generateSlotsForDate(startTime, endTime, intervalInMinutes);

        // Fetch all booked slots for the selected date
        const bookedAppointments: IAppointment[] = await Appointment.find({
            slot: { $gte: startTime.toDate(), $lt: endTime.toDate() }
        });

        // Filter out booked slots and format the response
        const availableSlots = allSlots.filter(slot => {
            // Check if slot is not booked
            return !bookedAppointments.some(appointment => moment(appointment.date).isSame(slot));
        }).map(slot => ({
            date: slot.format('YYYY-MM-DD'),
            startTime: slot.format('HH:mm'),
            endTime: slot.clone().add(intervalInMinutes, 'minutes').format('HH:mm')
        }));

        res.json(availableSlots);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch available slots' });
    }
});

export default router;
