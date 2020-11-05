import mongoose, { Schema, Document } from 'mongoose';
import Professor from './professor';

export interface Student extends Document {
    type: string;
    name: string;
    age: number;
    phone: string;
    sex: string;
    professor: string;
}

const studentSchema = new mongoose.Schema({
    type: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    phone: { type: String, required: true, unique: true },
    sex: { type: String, required: true },
    professor: { type: Schema.Types.ObjectId, ref: Professor, required: true },
});

const studentModel = mongoose.model<Student>('Student', studentSchema);

export default studentModel;
