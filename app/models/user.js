import mongoose  from "mongoose";
const UserSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    name:{type: String, required: true},
    major:{type: String, required: true},
    grad_year:{type: Number, required: true},
    password: {type: String, required: true},
    role: {type: String, default: 'user'},
    createdAt: {type: Date, default: Date.now}
})

export default mongoose.models.User || mongoose.model('User', UserSchema);