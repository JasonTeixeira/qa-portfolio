'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'

interface TerminalLine {
  text: string
  type: 'command' | 'output' | 'success'
}

const terminalLines: TerminalLine[] = [
  { text: '$ sage deploy nexural-platform', type: 'command' },
  { text: '185 tables migrated', type: 'success' },
  { text: '69 API endpoints verified', type: 'success' },
  { text: '61 test suites passing', type: 'success' },
  { text: 'Stripe integration live', type: 'success' },
  { text: 'Deployed to production', type: 'success' },
]

export function TypingTerminal() {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [showCursor, setShowCursor] = useState(true)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const typeCommand = async () => {
      const command = terminalLines[0].text
      for (let i = 0; i <= command.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 40))
        setTypedText(command.slice(0, i))
      }
      setIsTyping(false)
      
      // Start showing output lines
      for (let i = 1; i < terminalLines.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400))
        setVisibleLines(i)
      }
    }

    const timer = setTimeout(typeCommand, 800)
    return () => clearTimeout(timer)
  }, [])

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden shadow-2xl">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#09090B] border-b border-[#27272A]">
        <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
        <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
        <div className="w-3 h-3 rounded-full bg-[#10B981]" />
        <span className="ml-2 text-xs text-[#71717A] font-mono">terminal</span>
      </div>
      
      {/* Terminal Content */}
      <div className="p-6 font-mono text-sm space-y-3 min-h-[240px]">
        {/* Command Line */}
        <div className="text-[#71717A]">
          <span className="text-[#06B6D4]">$</span>{' '}
          <span className="text-[#A1A1AA]">
            {isTyping ? typedText : terminalLines[0].text.slice(2)}
          </span>
          {isTyping && (
            <span className={`inline-block w-2 h-4 bg-[#06B6D4] ml-0.5 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
          )}
        </div>

        {/* Output Lines */}
        <AnimatePresence>
          {!isTyping && (
            <div className="space-y-2">
              {terminalLines.slice(1, visibleLines + 1).map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4 text-[#10B981]" />
                  <span className="text-[#A1A1AA]">{line.text}</span>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Final cursor */}
        {visibleLines >= terminalLines.length - 1 && !isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-2 text-[#71717A]"
          >
            <span className="text-[#06B6D4]">$</span>{' '}
            <span className={`inline-block w-2 h-4 bg-[#06B6D4] ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
          </motion.div>
        )}
      </div>
    </div>
  )
}
