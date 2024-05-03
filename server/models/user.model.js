import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Pls provide unique username'],
        unique: [true, "Username Exist"]
    },
    password: {
        type: String,
        required: [true, 'Pls provide a password'],
        unique: false
    },
    email: {
        type: String,
        required: [true, 'Pls provide a unique password'],
        unique: true
    },
    fistName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    mobile: {
        type: Number
    },
    address: {
        type: String
    },
    profile: {
        type: String
    },
});

export default mongoose.model('User', userSchema);