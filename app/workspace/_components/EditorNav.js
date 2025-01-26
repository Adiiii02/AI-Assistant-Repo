import { Button } from '@/components/ui/button'
import { chatSession } from '@/configs/AIModel'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { useAction, useMutation } from 'convex/react'
import { AlignCenter, AlignLeft, AlignRight, Bold, Heading1, Heading2, Heading3, Highlighter, Italic, List, Save, Subscript, Superscript, Underline } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { debounce } from "lodash";
import { useCallback } from "react";

const EditorNav = ({editor}) => {

  const SearchVec = useAction(api.myActions.search)
  const { fileId } = useParams()
  const {user} = useUser()
  const [Answering,SetAnswering] = useState(false)
  const SaveNotes = useMutation(api.notes.AddNotes)

  const debouncedSave = useCallback(
    debounce((notes) => {
      SaveNotes({
        notes,
        fileId,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      });
      toast("Auto-Saved Successfully");
    }, 5000), // 5-second debounce
    [fileId, user]
  );

  // Handling editor updates for auto-save
  useEffect(() => {
    if (editor) {
      const handleUpdate = () => {
        const currentContent = editor.getHTML();
        debouncedSave(currentContent);
      };

      editor.on("update", handleUpdate);

      return () => {
        editor.off("update", handleUpdate);
      };
    }
  }, [editor, debouncedSave]);
  

  const Save = ()=>{
    const TextPresent = editor.getHTML()
    SaveNotes({
      notes:TextPresent,
      fileId:fileId,
      createdBy:user?.primaryEmailAddress?.emailAddress
    })
    toast("Saved Successfully")
  }

  const onAiClick = async () => {

    if(Answering){
      toast("Previous Question in Progress")
      return ;
    }

    SetAnswering(true)

    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' '
    )

    if(selectedText==''){
      toast('Please Select Text To Ask')
    }

    else{

      toast("Getting Your Answer")

      const result = await SearchVec({
        query:selectedText,
        fileId:fileId
      })

      const UnformattedAns = JSON.parse(result)
      let Ans = ''
      UnformattedAns && UnformattedAns.forEach(item => {
        Ans = Ans + item.pageContent
      })

      // console.log(selectedText)
      // console.log(Ans)

      if(Ans.length==0){
        toast("Ask Questions Related to the PDF")
      }

      else{
        const Prompt = `For question : ${selectedText} and
        with the given content as answer , please give appropriate ans
        in HTML format . The answer content is ${Ans}`

        const AiResult = await chatSession.sendMessage(Prompt)
        const Output = AiResult.response.text().replace('```','').replace('html','').replace('```','')

        const TextPresent = editor.getHTML()
        editor.commands.setContent(`${TextPresent} <p> <strong> Answer : </strong> ${Output} </p>`)

        debouncedSave(editor.getHTML());

      }
    }

    SetAnswering(false)

  }

  return editor && (
    <div className='flex mt-7 ml-5 mr-5 g-3'>
        <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'text-blue-700' : ''}
          >
            <Heading1/>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'text-blue-700' : ''}
          >
            <Heading2 className='ml-3'/>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'text-blue-700' : ''}
          >
            <Heading3 className='ml-3'/>
          </button>
      </div>
      </div>
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'text-blue-700' : ''}
          >
            <Bold className='ml-3'/>
          </button>
        </div>
      </div>
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'text-blue-700' : ''}
          >
            <Italic className='ml-3'/>
          </button>
        </div>
       </div>
       <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'text-blue-700' : ''}
          >
            <Underline className='ml-3'/>
          </button>
        </div>
       </div>
       <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'text-blue-700' : ''}
          >
            <AlignLeft className='ml-3'/>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'text-blue-700' : ''}
          >
            <AlignCenter className='ml-3'/>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'text-blue-700' : ''}
          >
            <AlignRight className='ml-3'/>
          </button>
          {/* <button onClick={() => editor.chain().focus().unsetTextAlign().run()}>
            <div className='ml-3'>Align</div>
          </button> */}
        </div>
       </div>
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={editor.isActive('subscript') ? 'text-blue-700' : ''}
          >
            <Subscript className='ml-3'/>
          </button>
        </div>
       </div>
       <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={editor.isActive('superscript') ? 'text-blue-700' : ''}
          >
            <Superscript className='ml-3'/>
          </button>
        </div>
        </div>
        <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={editor.isActive('highlight') ? 'text-blue-700' : ''}
          >
            <Highlighter className='ml-3'/>
          </button>
          </div>
          </div>
          <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'text-blue-700' : ''}
          >
            <List className='ml-3'/>
          </button>
          </div>
          </div>
          <Button onClick={() => onAiClick()}
            className={'hover:text-blue-500 ml-5'} >
              Select Text and Get Answer
          </Button>
          <Button onClick={
            () => Save()
          } className={'hover:text-blue-500 ml-3'}>
            Save Notes
          </Button>
    </div>
  )
}

export default EditorNav