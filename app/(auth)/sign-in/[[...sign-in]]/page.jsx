import { SignIn } from '@clerk/nextjs'

export default function SigninPage() {
  return(
    <div className='flex items-center justify-center h-screen bg-gradient-to-r from-blue-100 via-white to-gray-100 min-h-screen'>
    <SignIn />
    </div>
  )
}