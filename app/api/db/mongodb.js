import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGO_DB_URI;
if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    )
}

let cached = global.mongoose;

export async function MongoConnection(){
    if(!cached){
        cached = global.mongoose = {conn: null, promise: null};
    }
    if(cached.conn){
        console.log('MongoDB already connected to:', cached.conn.connection.name);
        return cached.conn;
    }
    if(!cached.promise){
        cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
            console.log('MongoDB connected to:', mongoose.connection.name);
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}