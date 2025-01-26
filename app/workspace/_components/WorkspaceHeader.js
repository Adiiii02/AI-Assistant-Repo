import { UserButton, useUser } from '@clerk/nextjs'
import React, { useContext } from 'react'
import Image from 'next/image'

const WorkSpaceHeader = ({fileName,fileId}) => {
  const {user} = useUser()
  return (
    <div className='flex justify-between p-4 shadow-md'>
        <div className='flex grid grid-cols-4 justify-between'>
            <Image src={'/logo.svg'} alt='logo' width={50} height={50}/>
            <div className='m-2 col-span-3 flex justify-center font-bold text-2xl'>AI Assistant</div>
        </div>
        <div className='m-3 font-bold'>
          <h2>{fileName}</h2>
        </div>
        <div className='flex justify-end m-3'>
            <UserButton/>
        </div>
    </div>
  )
}

export default WorkSpaceHeader