// components/RichTextEditor.js
import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { cn } from '../utils/cn'

export default function RichTextEditor({ content, onChange, type }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose focus:outline-none',
          type === 'heading'    && 'text-3xl font-playfair font-bold',
          type === 'subheading' && 'text-xl font-medium',
          type === 'text'       && 'text-base'
        )
      }
    }
  })

  // keep editor in sync if `content` prop changes
  React.useEffect(() => {
    if (editor) {
      editor.commands.setContent(content || '')
    }
  }, [content, editor])

  return <EditorContent editor={editor} />
}
