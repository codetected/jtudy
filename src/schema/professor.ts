import mongoose, { Document } from 'mongoose';

export interface Professor extends Document {
    type: string;
    name: string;
    age: number;
    phone: string;
}

const professorSchema = new mongoose.Schema({
    type: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    phone: { type: String, required: true, unique: true },
});

const professorModel = mongoose.model<Professor>('Professor', professorSchema);

export default professorModel;
