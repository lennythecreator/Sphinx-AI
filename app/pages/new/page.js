"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import AdvisorChat from "@/components/ui/advisor/advisor-chat";

export default function New() {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/pages/auth");
      return;
    }
    setIsAllowed(true);
  }, [router]);

  if (!isAllowed) {
    return null;
  }

  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <AdvisorChat />
    </main>
  )
}
