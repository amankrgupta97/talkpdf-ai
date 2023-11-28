'use client'
import { uploadToS3 } from '@/lib/s3'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Inbox, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

const FileUpload = () => {
    const router=useRouter()
    const [uploading,setUploading]=useState(false);
    const {mutate,isPending}=useMutation({
        mutationFn:async({file_key,file_name}:{file_key:string,file_name:string})=>{
            const response=await axios.post('/api/create-chat',{file_key,file_name})
           return response.data;
        }
    })
    const {getRootProps,getInputProps}=useDropzone({
        accept:{"application/pdf":[".pdf"]},
        maxFiles:1,
        onDrop:async (acceptedFiles)=>{
            console.log(acceptedFiles);
            const file=acceptedFiles[0];
            if(file.size>10*1024*1024){
                toast.error('file size must be less than 10mb')
                return
            }
            try {
                setUploading(true);
                const data =await uploadToS3(file);
                console.log("data",data);
                if(!data?.file_key || !data.file_name){
                    toast.error("something went wrong");
                    return
                }
                mutate(data,{
                    onSuccess:({chat_id})=>{
                        toast.success("Chat created!")
                        router.push(`/chat/${chat_id}`)

                    },
                    onError:(err)=>{
                        toast.error("Error while creating chat")
                    }
                })
            } catch (error) {
                console.log(error)
            }finally{
                setUploading(false)
            }
        }
    })
  return (
    <div className='p-2 bg-white rounded-xl'>
        <div {...getRootProps(
            {
                className:"flex flex-col justify-center items-center bg-gray-50 border-dashed border-2 rounded-xl cursor-pointer py-8 ",
            }
        )}>
            <input{...getInputProps()}/>
            {uploading || isPending? (
                <>
                <Loader2 className='h-10 w-10 text-pink-500 animate-spin'/>
                <p className='mt-2 text-sm text-slate-900'>uploading...</p>
                </>
            ):(
            <>
            <Inbox className='w-10 h-10 text-pink-500'/>
            <p className='mt-2 text-sm text-slate-400'>
                Drop PDF here
            </p>
            </>
            )}
        </div>
    </div>
  )
}

export default FileUpload