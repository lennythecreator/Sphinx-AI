

import "./globals.css";

//const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Spinx AI",
  description: "The next generation of career guidance",
};

import { ChatProvider } from "@/app/context/ChatContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ChatProvider>
          {children}
        </ChatProvider>
      </body>
    </html>
  );
}
