"use client"
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { UserButton, useUser } from "@clerk/nextjs";
import { useAction, useMutation } from "convex/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Mail, Linkedin, Github } from "lucide-react"; 
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import uuid4 from "uuid4";
import axios from "axios";

export default function Home() {
  const router = useRouter();
  const {user} = useUser();
  const createUser = useMutation(api.user.createUser)
  const generateUploadUrl = useMutation(api.pdfStorage.generateUploadUrl)
  const AddFileEntry = useMutation(api.pdfStorage.AddFileEntry)
  const getFileUrl = useMutation(api.pdfStorage.getFileUrl)
  const embedDoc = useAction(api.myActions.ingest)

  const [Loading,setLoading] = useState(false)

  useEffect(()=>{
    user&&checkUser();
  },[user])

  const checkUser = async ()=>{
    // console.log("new")
    setLoading(true)

    const res = await createUser({
      email:user.primaryEmailAddress.emailAddress,
      imageurl:user.imageUrl,
      userName:user.fullName
    })

    if(res==0){
      router.push("/dashboard");
    }

    else{
      // console.log(res)

      const response = await fetch("/Sample.pdf")
  
      const blob = await response.blob()

      const DeFile = new File([blob], "Sample.pdf", { type: "application/pdf" });

      // console.log("hi")
      //Get a short-lived upload URL
      const postUrl = await generateUploadUrl();

      //POST the file to the URL
      const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": DeFile.type },
          body: DeFile,
      });

      // console.log(result)

      const { storageId } = await result.json();
      const fileId = uuid4()
      const fileUrl = await getFileUrl({storageId:storageId})

      //Save the newly allocated storage id to the database
      const resp = await AddFileEntry({
          fileId:fileId,
          storageId:storageId,
          fileName:"SamplePDF",
          createdBy:user.primaryEmailAddress.emailAddress,
          fileUrl:fileUrl
      })

      //Api Call to Process Pdf
      const apiresp = await axios.get(`/api/pdf-loader?pdfUrl=${fileUrl}`)
      await embedDoc({
        splittedText:apiresp.data.result,
        fileId:{fileId:fileId}
      })

      router.push("/dashboard");

    }

    setLoading(false)

  }

  return (
    <div className="bg-gradient-to-r from-blue-100 via-white to-gray-100 min-h-screen">
      <div>
      {Loading ? (
        <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-blue-300">
        {/* Spinner Animation */}
        <motion.div
          className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        ></motion.div>
  
        {/* Loading Text */}
        <h1 className="mt-8 text-2xl font-bold text-blue-800 animate-pulse">
          Please wait, setting things up for you...
        </h1>
      </div>
      ) : 
      <div>
      <header className="w-full px-8 py-4 flex justify-between items-center">
        <div className='flex grid grid-cols-4 justify-between mt-5'>
            <Image src={'/logo.svg'} alt='logo' width={50} height={50}/>
            <div className='m-2 col-span-3 flex justify-center font-bold text-2xl'>AI Assistant</div>
        </div>
          <div className="mt-5">
          <a href="/sign-in">
          <Button className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800">
            Sign-In
            </Button>
            </a>
            <a href="/sign-up">
            <Button className="ml-7 px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800">
            Sign-Up
            </Button>
            </a>
          </div>
      </header>

      <div className="text-center px-4 mt-36">
        <h1 className="text-4xl font-bold tracking-tight text-gray-800 md:text-7xl leading-tight">
          Simplify <span className="text-red-500">PDF</span>{" "}
          <span className="text-blue-500">Note-Taking</span> <br />
          with AI-Assistant
        </h1>
        <p className="mt-20 text-gray-600 max-w-xl mx-auto">
          Elevate your note-taking experience with our AI-powered PDF app.
          Seamlessly extract key insights, summaries, and annotations from any
          PDF with just a few clicks.
        </p>
        <div className="mt-20 flex justify-center space-x-4">
          <a href="/sign-up">
          <Button className="px-6 py-3 rounded-lg">
            Get Started
          </Button>
          </a>
        </div>
        </div>
        <footer className="bg-gray-800 text-white py-6 mt-28">
      <div className="max-w-4xl mx-auto text-center">
        {/* Name */}
        <p className="text-lg font-medium mb-4">Created by <span className="font-bold">Aditya Luthra</span></p>
        
        {/* Social Icons */}
        <div className="flex justify-center space-x-6">
          {/* Email */}
          <a
            href="mailto:luthraaditya283@example.com"
            className="hover:text-gray-400 transition"
            aria-label="Email"
          >
            <Mail size={24} />
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/aditya-luthra-3b5b681bb/"
            className="hover:text-gray-400 transition"
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Linkedin size={24} />
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/Adiiii02"
            className="hover:text-gray-400 transition"
            aria-label="GitHub"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={24} />
          </a>
        </div>
      </div>
    </footer>
    </div>
}</div>
    </div>
  );
}
