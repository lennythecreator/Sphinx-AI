"use client"
import Navbar from "@/components/ui/Navbar";
import AdvisorChat from "@/components/ui/advisor/advisor-chat";

export default function New() {
  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <AdvisorChat />
    </main>
  )
}