"use client"
import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'
import WorkSpaceHeader from '../_components/WorkspaceHeader'
import PdfViewer from '../_components/PdfViewer'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import TextEditor from '../_components/TextEditor'

const WorkSpace = () => {

  const { fileId } = useParams()
  const FileInfo = useQuery(api.pdfStorage.getFileInfo,{
    fileId:fileId
  })

  if (FileInfo === undefined) {
    return (
    <div className='h-screen flex justify-center items-center'>
        Loading...
    </div>
    ) 
    // Display a loading spinner or placeholder
  }

  if (FileInfo === null) {
    return <div className='h-screen flex justify-center items-center'>Error: File not found!</div>; 
    // Handle cases where the file is not found
  }

//   useEffect(()=>{
//     console.log(FileInfo)
//   },[FileInfo])

  return (
    <div>
        <WorkSpaceHeader fileName = {FileInfo.fileName}/>
        <div className='grid grid-cols-2 g-5'>
            <div>
                {/* Text Editor */}
                <TextEditor fileId={fileId}/>
            </div>
            <div>
                {/* Pdf Viewer */}
                <PdfViewer fileUrl={FileInfo?.fileUrl}/>
            </div>
        </div>
    </div>
  )
}

export default WorkSpace