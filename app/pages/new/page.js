"use client"
import  Navbar  from "@/components/ui/Navbar"; // Add curly braces for named import
import { AGENTS } from "@/app/Constants/agent-role";
import AdvisorCard from "@/components/ui/advisor/advisor-card";
import { motion } from "motion/react"
export default function New(){
    return(
        <main>
           <Navbar/>
           <div className="p-8 flex flex-col items-center mx-auto">
              <h1 className="text-Title text-zinc-800 font-medium">Tech Advisor</h1>
              <p className="text-zinc-600">Pick an Advisor to get started on your tech journey</p>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {AGENTS.map((agent) => (
                  <motion.div
                    className=" rounded-xl"
                    key={agent.id}
                    whileHover={{border:'2px solid #663bf5', scale: 1.05,transition: { duration: 0.3 }}}>
                    <AdvisorCard key={agent.id} agent={agent.role} description={agent.description} topic={agent.domain} imageUrl={agent.imageUrl} level={agent.level} />
                  </motion.div>
                  
                ))}
              </div>
           </div>
        </main>
    )
}