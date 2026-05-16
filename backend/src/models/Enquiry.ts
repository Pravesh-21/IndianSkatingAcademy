import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEnquiry extends Document {
  name: string;
  age: number;
  phone: string;
  discipline: 'speed' | 'artistic' | 'slalom' | 'aggressive';
  method: 'email' | 'whatsapp';
  submittedAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    name:        { type: String, required: true, trim: true },
    age:         { type: Number, required: true, min: 4, max: 80 },
    phone:       { type: String, required: true, trim: true },
    discipline:  { type: String, required: true, enum: ['speed', 'artistic', 'slalom', 'aggressive'] },
    method:      { type: String, required: true, enum: ['email', 'whatsapp'] },
    submittedAt: { type: Date, default: () => new Date() },
  },
  { collection: 'enquiries' }
);

const Enquiry: Model<IEnquiry> = mongoose.model<IEnquiry>('Enquiry', EnquirySchema);

export default Enquiry;
