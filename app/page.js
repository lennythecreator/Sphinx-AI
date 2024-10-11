import { Button } from "@/components/ui/button"
import Image from "next/image"
import { MessageCircle, Rocket, Compass, Users } from "lucide-react"
import Link from "next/link"
export default function Component() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#"> 
          
          <span className=" flex gap-2 items-center ml-2 text-2xl font-bold text-primary sm:flex-row"> <Image src='/lion_head_silhouette_ByzJz.svg'
          height={30} width={30} alt="lion head silhouette"
          /> Sphinx-AI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#how-it-works">
            How It Works
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#testimonials">
            Testimonials
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                  Discover Your Perfect Career Path
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                  Let our AI-powered chatbot guide you towards your dream career. Personalized advice for college students, by college students.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  
                  <Button className="bg-white text-primary hover:bg-gray-100 mx-auto" type="submit">
                    <Link href="/mychat">Get Started</Link>
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32" id="features">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Why Choose Spinx-AI?</h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <MessageCircle className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">24/7 Availability</h3>
                <p className="text-gray-500">Get career advice anytime, anywhere. Our bot never sleeps!</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Compass className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Personalized Guidance</h3>
                <p className="text-gray-500">Tailored advice based on your skills, interests, and goals.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Industry Insights</h3>
                <p className="text-gray-500">Stay updated with the latest trends and opportunities in various fields.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100" id="how-it-works">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">How It Works</h2>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-lg">
                <div className="rounded-full bg-primary text-white w-12 h-12 flex items-center justify-center mb-4 text-xl font-bold">1</div>
                <h3 className="text-xl font-bold mb-2">Sign Up</h3>
                <p className="text-gray-500">Create your account and tell us about your interests and goals.</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-lg">
                <div className="rounded-full bg-primary text-white w-12 h-12 flex items-center justify-center mb-4 text-xl font-bold">2</div>
                <h3 className="text-xl font-bold mb-2">Chat with Spinx-AI</h3>
                <p className="text-gray-500">Engage in a conversation with our AI to explore career options.</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-lg">
                <div className="rounded-full bg-primary text-white w-12 h-12 flex items-center justify-center mb-4 text-xl font-bold">3</div>
                <h3 className="text-xl font-bold mb-2">Get Personalized Advice</h3>
                <p className="text-gray-500">Receive tailored recommendations and actionable steps for your career journey.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32" id="testimonials">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">What Students Say</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col p-6 bg-white rounded-lg shadow-lg">
                <p className="text-gray-500 mb-4">&quot; Spinx-AI helped me discover a career path I never even considered. I&apos;m now interning at my dream company!&quot;</p>
                <p className="font-bold">- Alex, Computer Science Major</p>
              </div>
              <div className="flex flex-col p-6 bg-white rounded-lg shadow-lg">
                <p className="text-gray-500 mb-4">&quot;The personalized advice I received was spot on. It&apos;s like having a career counselor in my pocket!&quot;</p>
                <p className="font-bold">- Sam, Business Major</p>
              </div>
              <div className="flex flex-col p-6 bg-white rounded-lg shadow-lg">
                <p className="text-gray-500 mb-4">&quot;I was undecided about my major, but Spinx-AI helped me explore options and find my passion.&quot;</p>
                <p className="font-bold">- Jamie, Undeclared</p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Shape Your Future?</h2>
                <p className="mx-auto max-w-[600px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of students who have found their path with Spinx-AI. Your journey starts here.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  
                  <Button className="bg-white text-primary hover:bg-gray-100 mx-auto" type="submit">
                  <Link href="/mychat">Get Started</Link>
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2023 Spinx-AI Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
