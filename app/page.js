"use client"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { MessageCircle, Compass, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const fallbackTestimonials = [
  { quote: "Sphinx-AI helped me discover a career path I never even considered. I'm now interning at my dream company!", name: "Alex, Computer Science Major" },
  { quote: "The personalized advice I received was spot on. It's like having a career counselor in my pocket!", name: "Sam, Business Major" },
  { quote: "I was undecided about my major, but Sphinx-AI helped me explore options and find my passion.", name: "Jamie, Undeclared" }
];

export default function Component() {
  const [agentsData, setAgentsData] = useState([]);
  useEffect(() => {
    fetch('api/get-agents')
      .then(res => res.json())
      .then(data => setAgentsData(Array.isArray(data) ? data : []))
      .catch(() => setAgentsData([]));
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-white">
      <header className="px-4 lg:px-8 h-16 flex items-center justify-between bg-white shadow-sm">
        <Link className="flex items-center gap-2" href="#">
          <motion.span
            className="flex gap-2 items-center text-2xl font-bold text-teal-700"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <Image src='/lion_head_silhouette_ByzJz.svg'
              height={36} width={36} alt="lion head silhouette"
            />
            Sphinx-AI
          </motion.span>
        </Link>
        <nav className="flex gap-6">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="flex gap-6">
            <motion.div variants={fadeInUp}>
              <Link className="text-base font-medium text-teal-700 hover:text-blue-600 transition" href="#features">
                Features
              </Link>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Link className="text-base font-medium text-teal-700 hover:text-blue-600 transition" href="#how-it-works">
                How It Works
              </Link>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Link className="text-base font-medium text-teal-700 hover:text-blue-600 transition" href="#testimonials">
                Testimonials
              </Link>
            </motion.div>
          </motion.div>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center">
        <motion.section
          className="w-full py-16 md:py-28 xl:py-40 bg-gradient-to-r from-teal-400 via-blue-400 to-blue-600 flex items-center"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-4 flex flex-col items-center">
            <motion.div
              className="flex flex-col items-center space-y-6 text-center"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeInUp} className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
                  Discover Your Perfect Career Path
                </h1>
                <p className="mx-auto max-w-xl text-lg md:text-2xl text-blue-100">
                  Let our AI-powered chatbot guide you towards your dream career. Personalized advice for college students, by college students.
                </p>
              </motion.div>
              <motion.div variants={fadeInUp} className="w-full max-w-xs">
                <form className="flex justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-white text-teal-700 font-bold rounded-full px-6 py-3 shadow-lg hover:bg-blue-50 transition" type="submit">
                      <Link href="/pages/new">Get Started</Link>
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
        <section className="w-full py-16 md:py-24" id="features">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl md:text-5xl font-bold text-center text-teal-700 mb-14"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Why Choose Sphinx-AI?
            </motion.h2>
            <motion.div
              className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 justify-items-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(0,128,128,0.10)" }}
                className="flex flex-col items-center text-center bg-white rounded-2xl shadow-xl p-8 transition-all w-full max-w-xs"
              >
                <MessageCircle className="h-14 w-14 text-teal-500 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-teal-700">24/7 Availability</h3>
                <p className="text-gray-500">Get career advice anytime, anywhere. Our bot never sleeps!</p>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(0,128,128,0.10)" }}
                className="flex flex-col items-center text-center bg-white rounded-2xl shadow-xl p-8 transition-all w-full max-w-xs"
              >
                <Compass className="h-14 w-14 text-blue-500 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-blue-700">Personalized Guidance</h3>
                <p className="text-gray-500">Tailored advice based on your skills, interests, and goals.</p>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(0,0,128,0.10)" }}
                className="flex flex-col items-center text-center bg-white rounded-2xl shadow-xl p-8 transition-all w-full max-w-xs"
              >
                <Users className="h-14 w-14 text-indigo-500 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-indigo-700">Industry Insights</h3>
                <p className="text-gray-500">Stay updated with the latest trends and opportunities in various fields.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>
        <section className="w-full py-16 md:py-24 bg-blue-50" id="how-it-works">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl md:text-5xl font-bold text-center text-teal-700 mb-14"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              How It Works
            </motion.h2>
            <motion.div
              className="grid gap-6 lg:grid-cols-3 justify-items-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {[1, 2, 3].map((step, idx) => (
                <motion.div
                  key={step}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.04, boxShadow: "0 6px 24px rgba(0,0,0,0.10)" }}
                  className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-xl transition-all w-full max-w-xs"
                >
                  <div className="rounded-full bg-teal-500 text-white w-14 h-14 flex items-center justify-center mb-4 text-2xl font-bold">{step}</div>
                  <h3 className="text-xl font-bold mb-2 text-teal-700">
                    {step === 1 && "Sign Up"}
                    {step === 2 && "Chat with Sphinx-AI"}
                    {step === 3 && "Get Personalized Advice"}
                  </h3>
                  <p className="text-gray-500">
                    {step === 1 && "Create your account and tell us about your interests and goals."}
                    {step === 2 && "Engage in a conversation with our AI to explore career options."}
                    {step === 3 && "Receive tailored recommendations and actionable steps for your career journey."}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        <section className="w-full py-16 md:py-24" id="testimonials">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl md:text-5xl font-bold text-center text-teal-700 mb-14"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              What Students Say
            </motion.h2>
            <motion.div
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {(Array.isArray(agentsData) && agentsData.length > 0 ? agentsData : fallbackTestimonials).map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.03, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                  className="flex flex-col p-8 bg-white rounded-2xl shadow-xl transition-all w-full max-w-xs"
                >
                  <p className="text-gray-600 mb-4">&quot;{testimonial.quote}&quot;</p>
                  <p className="font-bold text-teal-700">- {testimonial.name}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        <motion.section
          className="w-full py-16 md:py-24 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-600 text-white"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="container mx-auto px-4 flex flex-col items-center">
            <motion.div
              className="flex flex-col items-center space-y-6 text-center"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeInUp} className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-extrabold">Ready to Shape Your Future?</h2>
                <p className="mx-auto max-w-lg text-blue-100 md:text-xl">
                  Join thousands of students who have found their path with Sphinx-AI. Your journey starts here.
                </p>
              </motion.div>
              <motion.div variants={fadeInUp} className="w-full max-w-xs">
                <form className="flex justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-white text-teal-700 font-bold rounded-full px-6 py-3 shadow-lg hover:bg-blue-50 transition" type="submit">
                      <Link href="/pages/new">Get Started</Link>
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </main>
      <footer className="flex flex-col sm:flex-row py-8 w-full items-center px-4 md:px-8 border-t bg-white shadow-inner">
        <motion.p
          className="text-sm text-gray-500"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          © 2023 Sphinx-AI Inc. All rights reserved.
        </motion.p>
        <nav className="sm:ml-auto flex gap-6 mt-2 sm:mt-0">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="flex gap-6">
            <motion.div variants={fadeInUp}>
              <Link className="text-sm text-teal-700 hover:underline underline-offset-4" href="#">
                Terms of Service
              </Link>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Link className="text-sm text-teal-700 hover:underline underline-offset-4" href="#">
                Privacy
              </Link>
            </motion.div>
          </motion.div>
        </nav>
      </footer>
    </div>
  )
}
