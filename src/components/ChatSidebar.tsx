'use client'
import { DrizzleChat } from '@/lib/db/schema'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { MessageCircle, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Subscription from './Subscription'

type Props = {
    chats: DrizzleChat[],
    chatId: number,
    isPremium:boolean
}

const ChatSidebar = ({ chats, chatId,isPremium }: Props) => {
    return (
        <div className='w-full h-screen p-4 text-gray-200 bg-gray-800'>
            <Link href="/">
                <Button className="w-full border-dashed border-white border">
                    <PlusCircle className="mr-2 w-4 h-4" />
                    New Chat
                </Button>
            </Link>
            <div className='flex flex-col gap-2 mt-4'>
                {chats.map((chat) => (
                    <Link key={chat.id} href={`/chat/${chat.id}`}>
                        <div className={cn("rounded-lg p-3 text-slate-300 flex items-center", {
                            "bg-pink-600 text-slate-900": chat.id === chatId,
                            "hover:text-white": chat.id !== chatId,
                        })}>
                            <MessageCircle className='mr-2' />
                            <p className='w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis'>{chat.pdfName}</p>
                        </div>
                    </Link>
                ))}

            </div>

            <div className='absolute bottom-4 left-4'>
                    {/* Stripe Button */}
                    <Subscription isPremium={isPremium}/>
            </div>

        </div>
    )
}

export default ChatSidebar