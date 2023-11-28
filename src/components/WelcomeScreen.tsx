import { UserButton,auth } from "@clerk/nextjs"
import { Button } from "./ui/button"
import Link from 'next/link'
import { ArrowRight, LogIn } from "lucide-react"
import FileUpload from "./FileUpload"
import { checkSubscription } from "@/lib/subscription"
import { db } from "@/lib/db"
import { chats } from "@/lib/db/schema"
import {eq} from "drizzle-orm"
import Subscription from "./Subscription"

export const WelcomeScreen  = async() => {
  const { userId } = auth();
  const isAuth = !!userId;
  const isPremium = await checkSubscription();
  let firstChat;
  if (userId) {
    firstChat = await db.select().from(chats).where(eq(chats.userId, userId));
    if (firstChat) {
      firstChat = firstChat[0];
    }
  }
  return (
        <div className="w-screen min-h-screen bg-gradient-to-r from-rose-300 to-rose-500">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center">
                    <h1 className="mr-3 text-5xl font-semibold">Talk with any PDF</h1>
                    <UserButton afterSignOutUrl="/"/>
                  </div>
                  <div className="flex mt-2">
                  {isAuth && firstChat && (
              <>
                <Link href={`/chat/${firstChat.id}`}>
                  <Button>
                    Go to Chats <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <div className="ml-3">
                  <Subscription isPremium={isPremium} />
                </div>
              </>
            )}
                  </div>
                  <p className="max-w-xl mt-1 text-white font-serif">
                    Join millions of students, researchers and professionals to instantly answer questions and understand pdf documents with help of an AI
                  </p>

                  <div className="w-full mt-4">
                    {isAuth ? (
                      <FileUpload/>
                    ):(
                      <Link href="/sign-in">
                        <Button>Sign in to Get Started
                          <LogIn className="w-4 h-4 ml-2"/>
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
            </div>
        </div>
  )
}
