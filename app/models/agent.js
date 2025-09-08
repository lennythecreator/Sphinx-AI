import mongoose from "mongoose";
const AgentSchema = new mongoose.Schema({
    name:{type: String, required: true},
    role:{type: String, required: true},
    users_advised: {type:mongoose.Schema.Types.Mixed, default: ""},
}, { collection: "agents" });
const Agent = mongoose.models.Agent || mongoose.model('Agent', AgentSchema);
export default Agent