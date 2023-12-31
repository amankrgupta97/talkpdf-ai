import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation'
import { eq } from "drizzle-orm";
import React from 'react'
import ChatSidebar from '@/components/ChatSidebar';
import PDFViewer from '@/components/PDFViewer';
import ChatComponent from '@/components/ChatComponent';
import { checkSubscription } from '@/lib/subscription';

type Props = {
    params: {
        chatId: string;
    }
}

const Chatpage = async ({ params: { chatId } }: Props) => {
    const { userId } = auth()
    if (!userId) {
        return redirect('/sign-in')
    }
    const _chats = await db.select().from(chats).where(eq(chats.userId, userId))
    if (!_chats) {
        return redirect("/");
    }

    if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
        return redirect("/");
    }

    const currentChat=_chats.find((chat)=>chat.id===parseInt(chatId))
    const isPremium=await checkSubscription();

    return (
        <div className="flex max-h-screen">
            <div className="flex w-full max-h-screen overflow-scroll">
                {/* chat sidebar */}
                <div className="flex-[1] max-w-xs">
                    <ChatSidebar chats={_chats} chatId={parseInt(chatId)} isPremium={isPremium}/>
                </div>
                {/* PDF viewer */}
                <div className="max-h-screen p-4 oveflow-scroll flex-[5]">
                    <PDFViewer pdf_url={currentChat?.pdfUrl || ''}/>
                </div>
                {/* chat component */}
                <div className="flex-[3] border-l-4 border-l-slate-200">
                    <ChatComponent chatId={parseInt(chatId)}/>
                </div>
            </div>
        </div>
    )
}

export default Chatpage