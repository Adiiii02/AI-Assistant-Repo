"use client"
import React, { Children, use, useState } from 'react'
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
  } from "@/components/ui/dialog"

import { Button } from '@/components/ui/button'
import { useAction, useMutation } from 'convex/react'
import { Loader2Icon } from 'lucide-react'
import { api } from '@/convex/_generated/api'
import uuid4 from 'uuid4'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { toast } from 'sonner'
  

const UploadPdfDialog = ({children,isMaxFile}) => {
    const generateUploadUrl = useMutation(api.pdfStorage.generateUploadUrl)
    const AddFileEntry = useMutation(api.pdfStorage.AddFileEntry)
    const getFileUrl = useMutation(api.pdfStorage.getFileUrl)
    const embedDoc = useAction(api.myActions.ingest)
    const {user} = useUser()
    const [File,setFile] = useState()
    const [Loading,setLoading] = useState(false)
    const [FileName,setFileName] = useState('')
    const [Open,setOpen] = useState(false) //dialog box

    const onFileSelect = (event) =>{
        setFile(event.target.files[0])
    }

    const onUpload = async () => {

        setLoading(true)

        //Get a short-lived upload URL
        const postUrl = await generateUploadUrl();

        //POST the file to the URL
        const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": File.type },
            body: File,
        });
        const { storageId } = await result.json();
        const fileId = uuid4()
        const fileUrl = await getFileUrl({storageId:storageId})

        //Save the newly allocated storage id to the database
        const resp = await AddFileEntry({
            fileId:fileId,
            storageId:storageId,
            fileName:FileName,
            createdBy:user.primaryEmailAddress.emailAddress,
            fileUrl:fileUrl
        })

        //Api Call to Process Pdf
        const apiresp = await axios.get(`/api/pdf-loader?pdfUrl=${fileUrl}`)
        await embedDoc({
          splittedText:apiresp.data.result,
          fileId:{fileId:fileId}
        })

        setLoading(false)
        setOpen(false)

        toast('File Uploaded Successfully')
    }

  return (
    <Dialog open={Open}>
    <DialogTrigger asChild>
      <Button onClick={()=>setOpen(true)} disabled={isMaxFile} className='w-full'>
        + Upload Pdf File
      </Button>
    </DialogTrigger>
    <DialogContent>
        <DialogHeader>
        <DialogTitle>Upload Pdf File</DialogTitle>
        <DialogDescription asChild>
            <div>
                <h2 className='mt-5'>Select a File to Upload *</h2>
                <div className='gap-2 p-3 rounded-md border'>
                    <input type='file' accept='application/pdf'
                    onChange={onFileSelect}/>
                </div>
                <div className='mt-2'>
                    <label>File Name *</label>
                    <Input placeholder="File Name" 
                    onChange = {(e)=>setFileName(e.target.value)}/>
                </div>
            </div>
        </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button onClick = { () => setOpen(false)} type="button" variant="secondary" disabled = {Loading}>
              Close
            </Button>
          </DialogClose>
          <Button onClick = {onUpload} disabled = {Loading}>
            {Loading ? 
            <Loader2Icon className='animate-spin'/>:'Upload'
            }
            </Button>
        </DialogFooter>
    </DialogContent>
    </Dialog>
  )
}

export default UploadPdfDialog