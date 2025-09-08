import { MongoConnection } from "../db/mongodb";
import Agent from "@/app/models/agent";
import { NextResponse } from "next/server";

export async function GET (request){
    try{
        await MongoConnection();
        const agents = await Agent.find();
        console.log(agents)
        return NextResponse.json(agents)
    }
    catch(error){
        console.log(error)
        return NextResponse.json({error: 'Failed to fetch agents'}, {status: 500})
    }
}