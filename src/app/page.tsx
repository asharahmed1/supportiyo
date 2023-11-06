import Image from "next/image"
import logo from "@/assets/logo.png"; 
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();

  if (userId) redirect("/notes");

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-4">
        <Image src={logo} alt="Supportiyo logo" width={100} height={130} />
        </div>
        <span className="text-4xl font-extrabold tracking-tight lg:text-5x1">
            SUPPORTIYO
          </span>
          <span className="tracking-tight lg:text-5x1">
            A project of <a href="https://trajan.digital" ><u>Trajan Digitals ©</u></a>
          </span>
          <p className="max-w-prose text-center">
          Leveraging cutting-edge natural language processing and massive neural networks, Supportiyo is pioneering intelligent customer service bots to automate repetitive support tasks, reduce human staffing costs, and optimize the customer experience.
          </p>
          <Button size="lg" asChild>
           <Link href="/notes">Get Started</Link>
          </Button>
    </main>
);
}
