// src/models/appointment.ts
import { Schema, model, Document } from 'mongoose';

export interface IAppointment extends Document {
    date: Date;
    startTime: String | null;
    endTime: String | null;
    bookedBy: string | null;
}

const appointmentSchema = new Schema({
    date: { type: Date, required: true },
    startTime: { type: String, required: true},
    endTime: { type: String, required: true},
    bookedBy: { type: String, default: null }
});

export default model<IAppointment>('Appointment', appointmentSchema);
