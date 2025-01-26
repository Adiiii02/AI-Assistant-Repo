"use client"
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect } from 'react'
import EditorNav from './EditorNav'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Highlight from '@tiptap/extension-highlight'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

const TextEditor = ({fileId}) => {
    const Notes = useQuery(api.notes.GetNotes,{
        fileId:fileId
    })
    const editor = useEditor({
        extensions: [StarterKit,Underline,Color,TextStyle,Subscript,
            Superscript , BulletList , OrderedList , ListItem ,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
              }),
              Highlight.configure({ multicolor: true })
        ],
        content:'Start Taking Your Notes Here .... ',
        editorProps:{
            attributes:{
                class:'editor-container focus:outline-none h-screen p-5'
            }
        }
    })

    useEffect(()=>{
        if (editor && Notes) {
            editor.commands.setContent(Notes);
        }
    },[Notes&&editor])

  return (
    <div>
        <div>
        <EditorNav editor={editor}/>
        </div>
        <div className='overflow-scroll h-[88vh] '>
        <EditorContent editor={editor} />
        </div>
    </div>
  )
}

export default TextEditor