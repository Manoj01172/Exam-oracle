import { useState, useEffect, useRef } from "react";
import { pdfAPI } from "./services/api";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  .cb-wrap { display:flex; flex-direction:column; height:calc(100vh - 64px); font-family:'Sora',sans-serif; }

  /* HEADER */
  .cb-header { padding:16px 24px; background:var(--card); border-bottom:1px solid var(--border); display:flex; align-items:center; gap:12px; flex-shrink:0; }
  .cb-header-icon { width:42px; height:42px; border-radius:14px; background:linear-gradient(135deg,var(--purple),var(--purple2)); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .cb-header-title { font-size:16px; font-weight:700; }
  .cb-header-sub { font-size:12px; color:var(--text3); }
  .cb-online { width:8px; height:8px; border-radius:50%; background:var(--teal); margin-left:auto; box-shadow:0 0 6px var(--teal); animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  /* PDF SELECTOR */
  .cb-pdf-bar { padding:10px 16px; background:var(--card2); border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px; flex-wrap:wrap; flex-shrink:0; }
  .cb-pdf-label { font-size:11px; color:var(--text3); font-weight:600; white-space:nowrap; }
  .cb-pdf-chip { padding:5px 12px; border-radius:20px; border:1.5px solid var(--border2); font-size:12px; font-weight:500; cursor:pointer; transition:all 0.2s; color:var(--text2); white-space:nowrap; max-width:160px; overflow:hidden; text-overflow:ellipsis; }
  .cb-pdf-chip:hover { border-color:var(--purple); color:var(--purple); }
  .cb-pdf-chip.active { border-color:var(--purple); background:rgba(124,92,252,0.1); color:var(--purple); }

  /* MESSAGES */
  .cb-messages { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:16px; }
  .cb-messages::-webkit-scrollbar { width:4px; }
  .cb-messages::-webkit-scrollbar-thumb { background:var(--purple); border-radius:2px; }

  /* MESSAGE BUBBLES */
  .cb-msg { display:flex; gap:10px; align-items:flex-start; animation:msgIn 0.2s ease; }
  @keyframes msgIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .cb-msg.user { flex-direction:row-reverse; }
  .cb-msg-avatar { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; flex-shrink:0; }
  .cb-msg-avatar.bot { background:linear-gradient(135deg,var(--purple),var(--purple2)); color:#fff; }
  .cb-msg-avatar.user { background:linear-gradient(135deg,var(--teal),#00a888); color:#000; }
  .cb-msg-bubble { max-width:72%; padding:12px 16px; border-radius:16px; font-size:13.5px; line-height:1.7; }
  .cb-msg-bubble.bot { background:var(--card); border:1px solid var(--border); border-top-left-radius:4px; color:var(--text); }
  .cb-msg-bubble.user { background:linear-gradient(135deg,var(--purple),var(--purple2)); color:#fff; border-top-right-radius:4px; }
  .cb-msg-bubble.error { background:rgba(239,68,68,0.08); border-color:rgba(239,68,68,0.2); color:var(--danger); }
  .cb-msg-time { font-size:10px; color:var(--text3); margin-top:4px; }
  .cb-msg-time.user { text-align:right; }

  /* TYPING */
  .cb-typing { display:flex; gap:4px; align-items:center; padding:14px 16px; }
  .cb-dot { width:7px; height:7px; border-radius:50%; background:var(--purple); animation:typing 1.2s infinite; }
  .cb-dot:nth-child(2) { animation-delay:0.2s; }
  .cb-dot:nth-child(3) { animation-delay:0.4s; }
  @keyframes typing { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-6px);opacity:1} }

  /* SUGGESTIONS */
  .cb-suggestions { padding:0 20px 12px; display:flex; gap:8px; flex-wrap:wrap; flex-shrink:0; }
  .cb-sugg { padding:7px 14px; border-radius:20px; border:1.5px solid var(--border2); font-size:12px; font-weight:500; cursor:pointer; color:var(--text2); transition:all 0.2s; background:var(--card2); white-space:nowrap; }
  .cb-sugg:hover { border-color:var(--purple); color:var(--purple); background:rgba(124,92,252,0.05); }

  /* INPUT */
  .cb-input-wrap { padding:16px 20px; background:var(--card); border-top:1px solid var(--border); display:flex; gap:10px; align-items:flex-end; flex-shrink:0; }
  .cb-input { flex:1; background:var(--card2); border:1.5px solid var(--border2); border-radius:14px; padding:12px 16px; color:var(--text); font-size:14px; font-family:'Sora',sans-serif; outline:none; resize:none; max-height:120px; line-height:1.5; transition:border 0.2s; }
  .cb-input:focus { border-color:var(--purple); }
  .cb-input::placeholder { color:var(--text3); }
  .cb-send { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,var(--purple),var(--purple2)); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; }
  .cb-send:hover:not(:disabled) { transform:scale(1.05); box-shadow:0 4px 14px rgba(124,92,252,0.4); }
  .cb-send:disabled { opacity:0.5; cursor:not-allowed; }

  /* WELCOME */
  .cb-welcome { text-align:center; padding:32px 20px; }
  .cb-welcome-icon { font-size:52px; margin-bottom:12px; }
  .cb-welcome-title { font-size:20px; font-weight:800; margin-bottom:8px; }
  .cb-welcome-sub { font-size:13px; color:var(--text3); line-height:1.6; max-width:400px; margin:0 auto 20px; }
  .cb-example-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; max-width:480px; margin:0 auto; }
  .cb-example { padding:12px 14px; background:var(--card2); border:1px solid var(--border); border-radius:12px; font-size:12.5px; color:var(--text2); cursor:pointer; text-align:left; transition:all 0.2s; }
  .cb-example:hover { border-color:var(--purple); color:var(--purple); background:rgba(124,92,252,0.05); }
  .cb-example-icon { font-size:16px; margin-bottom:4px; }

  @media(max-width:600px) {
    .cb-msg-bubble { max-width:85%; }
    .cb-example-grid { grid-template-columns:1fr; }
    .cb-wrap { height:calc(100vh - 56px); }
  }
`;

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
const GROQ_URL = process.env.REACT_APP_GROQ_URL;
const EXAMPLE_QUESTIONS = [
  { icon:"🔮", text:"What are the most important topics for exam?" },
  { icon:"📝", text:"Give me 5 predicted questions with answers" },
  { icon:"📊", text:"Which unit has highest weightage?" },
  { icon:"💡", text:"Explain the top topic in simple words" },
  { icon:"⏱️", text:"How should I prepare in last 3 days?" },
  { icon:"📖", text:"Give me key definitions to remember" },
];

const QUICK_SUGGESTIONS = [
  "Most important topics?",
  "Predicted questions?",
  "Key definitions",
  "Exam tips",
  "Unit summary",
];

function formatTime(date) {
  return date.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
}

// Format bot message — convert markdown-like to readable
function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^#{1,3} (.+)$/gm, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "• $1")
    .replace(/^\d+\. (.+)$/gm, "• $1")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

export default function Chatbot({ user }) {
  const [pdfs,       setPdfs]       = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [context,    setContext]    = useState("");
  const [messages,   setMessages]  = useState([]);
  const [input,      setInput]      = useState("");
  const [typing,     setTyping]     = useState(false);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const historyRef = useRef([]); // conversation history for Groq

  // Load analyzed PDFs
  useEffect(() => {
    fetch(`http://localhost:5000/api/pdf/list/${user.id}`)
      .then(r => r.json())
      .then(d => {
        const analyzed = (d.pdfs || []).filter(p => p.status === "analyzed");
        setPdfs(analyzed);
        if (analyzed.length > 0) setSelectedId(analyzed[0].id);
      }).catch(() => {});
  }, [user.id]);

  // Load context when PDF changes
  useEffect(() => {
    if (!selectedId) return;
    fetch(`http://localhost:5000/api/analysis/full/${selectedId}`)
      .then(r => r.json())
      .then(data => {
        const ctx = buildContext(data);
        setContext(ctx);
        setMessages([]);
        historyRef.current = [];
      }).catch(() => {});
  }, [selectedId]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, typing]);

  function buildContext(data) {
    const lines = [];
    if (data.subject)  lines.push(`Subject: ${data.subject}`);
    if (data.summary)  lines.push(`Overview: ${data.summary}`);

    if (data.topic_weightage?.length) {
      lines.push("\nTopic Weightage:");
      data.topic_weightage.slice(0,8).forEach(t => {
        lines.push(`- ${t.topic}: ${t.weightage}% (${t.importance} importance, ${t.unit})`);
      });
    }

    if (data.predicted_questions?.length) {
      lines.push("\nPredicted Questions:");
      data.predicted_questions.slice(0,6).forEach((q,i) => {
        lines.push(`Q${i+1} [${q.marks}m, ${q.importance}]: ${q.question}`);
        if (q.answer) lines.push(`Answer: ${q.answer.slice(0,200)}`);
      });
    }

    if (data.frequently_asked?.length) {
      lines.push("\nFrequently Asked:");
      data.frequently_asked.forEach(q => {
        lines.push(`- ${q.question} (${q.times_appeared}× appeared, ${q.marks} marks)`);
      });
    }

    if (data.marks_distribution?.length) {
      lines.push("\nMarks Distribution:");
      data.marks_distribution.forEach(m => {
        lines.push(`- ${m.marks} marks: ${m.question_count} questions — ${m.guidance}`);
      });
    }

    return lines.join("\n");
  }

  const sendMessage = async (text = input.trim()) => {
    if (!text || typing) return;
    if (!context) {
      setMessages(m => [...m, {
        role:"bot", text:"Please select an analyzed PDF first to ask questions about it.",
        time: new Date(), error:false
      }]);
      return;
    }

    const userMsg = { role:"user", text, time: new Date() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setTyping(true);

    // Add to history
    historyRef.current.push({ role:"user", content: text });

    try {
      const systemPrompt = `You are an expert exam preparation assistant for Exam Oracle.
You have detailed knowledge about the student's uploaded exam paper.

EXAM PAPER CONTEXT:
${context}

Instructions:
- Answer only based on the exam paper context provided
- Be specific, helpful and concise
- For predicted questions, provide model answers with proper length guidance
- For topic explanations, use simple language
- Format answers clearly with bullet points when listing
- Always be encouraging and supportive
- If asked about something not in the context, say so politely`;

      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role:"system", content: systemPrompt },
            ...historyRef.current.slice(-6), // last 6 messages for context
          ],
          temperature: 0.5,
          max_tokens: 600,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data    = await response.json();
      const botText = data.choices?.[0]?.message?.content || "Sorry, I could not generate a response.";

      historyRef.current.push({ role:"assistant", content: botText });

      setMessages(m => [...m, {
        role:"bot", text: botText, time: new Date(), error:false
      }]);
    } catch (err) {
  setMessages(m => [...m, {
    role:"bot",
    text: err.message === "RATE_LIMIT" 
      ? "Rate limit reached. Please wait 10 seconds and try again." 
      : "Sorry, encountered an error. Please try again.",
    time: new Date(),
    error: true
  }]);
} finally {
      setTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentPdf = pdfs.find(p => p.id === selectedId);

  return (
    <>
      <style>{CSS}</style>
      <div className="cb-wrap">

        {/* Header */}
        <div className="cb-header">
          <div className="cb-header-icon">🤖</div>
          <div>
            <div className="cb-header-title">Exam Oracle AI</div>
            <div className="cb-header-sub">
              {currentPdf ? `Analyzing: ${currentPdf.original_name}` : "Select a PDF to start"}
            </div>
          </div>
          <div className="cb-online" />
        </div>

        {/* PDF Selector */}
        {pdfs.length > 0 && (
          <div className="cb-pdf-bar">
            <span className="cb-pdf-label">PDF:</span>
            {pdfs.map(p => (
              <div key={p.id}
                className={`cb-pdf-chip ${selectedId===p.id?"active":""}`}
                onClick={() => setSelectedId(p.id)}
                title={p.original_name}>
                📄 {p.original_name.replace(".pdf","")}
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="cb-messages">
          {messages.length === 0 && (
            <div className="cb-welcome">
              <div className="cb-welcome-icon">🤖</div>
              <div className="cb-welcome-title">Ask me anything!</div>
              <div className="cb-welcome-sub">
                {context
                  ? `I have analyzed your exam paper. Ask me about topics, predictions, answers, or study tips!`
                  : "Upload and analyze a PDF first, then come back to chat!"}
              </div>
              {context && (
                <div className="cb-example-grid">
                  {EXAMPLE_QUESTIONS.map((eq, i) => (
                    <div key={i} className="cb-example" onClick={() => sendMessage(eq.text)}>
                      <div className="cb-example-icon">{eq.icon}</div>
                      {eq.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`cb-msg ${msg.role}`}>
              <div className={`cb-msg-avatar ${msg.role}`}>
                {msg.role === "bot" ? "🤖" : user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <div
                  className={`cb-msg-bubble ${msg.role} ${msg.error?"error":""}`}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                />
                <div className={`cb-msg-time ${msg.role}`}>{formatTime(msg.time)}</div>
              </div>
            </div>
          ))}

          {typing && (
            <div className="cb-msg">
              <div className="cb-msg-avatar bot">🤖</div>
              <div className="cb-msg-bubble bot">
                <div className="cb-typing">
                  <div className="cb-dot" />
                  <div className="cb-dot" />
                  <div className="cb-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick suggestions */}
        {messages.length > 0 && !typing && context && (
          <div className="cb-suggestions">
            {QUICK_SUGGESTIONS.map((s, i) => (
              <div key={i} className="cb-sugg" onClick={() => sendMessage(s)}>{s}</div>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="cb-input-wrap">
          <textarea
            ref={inputRef}
            className="cb-input"
            placeholder={context ? "Ask about topics, predictions, answers..." : "Select a PDF first..."}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={!context}
          />
          <button className="cb-send" onClick={() => sendMessage()} disabled={!input.trim() || typing || !context}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
