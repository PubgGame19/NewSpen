import { useEffect, useMemo, useRef, useState } from 'react'
import { CornerDownLeft, RotateCcw, Send, Sparkles, UserRound } from 'lucide-react'
import { AI_FALLBACK, AI_KNOWLEDGE, AI_SUGGESTED_QUESTIONS } from '../data/mockData'
import { useApp } from '../context/AppContext'
import Button from './ui/Button'

function now() {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/** Canned-response matching — this is a frontend demo, no AI API is called */
function answerFor(question) {
  const text = question.toLowerCase()
  const hit = AI_KNOWLEDGE.find((entry) =>
    entry.keywords.some((keyword) => text.includes(keyword)),
  )
  return hit || AI_FALLBACK
}

export default function AIChat() {
  const { chat, pushChatMessage, clearChat, pushToast } = useApp()
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [chat, typing])

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const asked = useMemo(
    () =>
      new Set(
        chat.filter((m) => m.role === 'user').map((m) => m.text.toLowerCase()),
      ),
    [chat],
  )

  const send = (raw) => {
    const question = (raw ?? input).trim()
    if (!question || typing) return

    pushChatMessage({ role: 'user', text: question, time: now() })
    setInput('')
    setTyping(true)

    const answer = answerFor(question)
    timerRef.current = window.setTimeout(
      () => {
        pushChatMessage({
          role: 'ai',
          text: answer.response,
          highlights: answer.highlights || [],
          time: now(),
        })
        setTyping(false)
      },
      640 + Math.random() * 520,
    )
  }

  return (
    <section className="card flex h-[min(70vh,640px)] flex-col overflow-hidden">
      {/* chat header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5 dark:border-slate-800">
        <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
          <Sparkles size={18} strokeWidth={2.2} />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="heading text-[14px] font-semibold">SPENANCE AI</p>
          <p className="muted text-[11px] font-medium">
            {typing ? 'Analysing your spending…' : 'Online · demo responses'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={RotateCcw}
          onClick={() => {
            clearChat()
            pushToast({
              title: 'Conversation cleared',
              body: 'Start a new question with SPENANCE AI.',
              tone: 'sky',
            })
          }}
        >
          Clear
        </Button>
      </div>

      {/* messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5"
      >
        {chat.map((message) => {
          const isAI = message.role === 'ai'
          return (
            <div
              key={message.id}
              className={`animate-chat flex items-start gap-3 ${
                isAI ? '' : 'flex-row-reverse'
              }`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
                  isAI
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {isAI ? (
                  <Sparkles size={15} strokeWidth={2.2} />
                ) : (
                  <UserRound size={15} strokeWidth={2.2} />
                )}
              </span>

              <div className={`max-w-[min(100%,34rem)] ${isAI ? '' : 'items-end'}`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                    isAI
                      ? 'border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                      : 'bg-emerald-600 text-white shadow-sm'
                  }`}
                >
                  <p>{message.text}</p>

                  {message.highlights?.length ? (
                    <ul className="mt-2.5 space-y-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-800">
                      {message.highlights.map((item) => (
                        <li
                          key={item}
                          className="muted flex items-start gap-2 text-[12px] font-medium"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <p
                  className={`muted mt-1 text-[10px] font-semibold uppercase tracking-wide ${
                    isAI ? '' : 'text-right'
                  }`}
                >
                  {isAI ? 'SPENANCE AI' : 'You'} · {message.time}
                </p>
              </div>
            </div>
          )
        })}

        {typing ? (
          <div className="animate-chat flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
              <Sparkles size={15} strokeWidth={2.2} />
            </span>
            <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                  style={{ animationDelay: `${dot * 120}ms` }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* suggestions */}
      <div className="border-t border-slate-100 px-4 pt-3 sm:px-5 dark:border-slate-800">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-3">
          {AI_SUGGESTED_QUESTIONS.filter((q) => !asked.has(q.toLowerCase())).map(
            (question) => (
              <button
                key={question}
                type="button"
                onClick={() => send(question)}
                disabled={typing}
                className="chip chip-idle shrink-0 whitespace-nowrap disabled:opacity-50"
              >
                {question}
              </button>
            ),
          )}
        </div>
      </div>

      {/* composer */}
      <form
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
        className="flex items-center gap-2 border-t border-slate-100 px-4 py-3.5 sm:px-5 dark:border-slate-800"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about savings, budgets, EMIs or spending…"
          aria-label="Message SPENANCE AI"
          className="input h-11"
        />
        <Button
          type="submit"
          icon={Send}
          className="h-11 shrink-0 px-4"
          disabled={!input.trim() || typing}
        >
          <span className="hidden sm:inline">Send</span>
        </Button>
      </form>

      <div className="hidden items-center justify-center gap-1.5 border-t border-slate-100 px-4 py-2 text-[10px] font-medium text-slate-400 sm:flex dark:border-slate-800">
        <CornerDownLeft size={11} /> Press Enter to send · responses are
        predefined for this demo
      </div>
    </section>
  )
}
