import { SignUp } from '@clerk/nextjs'

export default function SignupPage() {
  return(
  <div className='flex items-center justify-center h-screen bg-gradient-to-r from-blue-100 via-white to-gray-100 min-h-screen'>
    <SignUp />
  </div> )
}