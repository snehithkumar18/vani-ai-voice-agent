import { useState } from 'react'

function App() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en-US')
  const [voiceModel, setVoiceModel] = useState('gpt-4o-mini-realtime')
  const [agentPersonality, setAgentPersonality] = useState('friendly')

  const toggleConnection = () => {
    if (isConnected) {
      setIsConnected(false)
    } else {
      setIsConnecting(true)
      setTimeout(() => {
        setIsConnecting(false)
        setIsConnected(true)
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-[#090a0f]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white animate-pulse">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 via-indigo-200 to-white bg-clip-text text-transparent tracking-tight">VANI AI</h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Voice Assistant Agent</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
            <span className="text-slate-400 font-semibold">{isConnected ? 'Agent Online' : 'Agent Ready'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Controls & Visualizer */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* Visualizer Card */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950/80 border border-slate-800/80 rounded-3xl p-8 flex flex-col items-center justify-between min-h-[400px] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-violet-600/5 blur-[120px] rounded-full -top-40 -left-40"></div>
            <div className="absolute inset-0 bg-indigo-600/5 blur-[120px] rounded-full -bottom-40 -right-40"></div>
            
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/40 px-4 py-1.5 rounded-full border border-slate-700/30">
              {isConnected ? 'Conversation Active' : isConnecting ? 'Connecting...' : 'Click below to start'}
            </span>

            {/* Core Interaction Sphere / Waves */}
            <div className="my-10 relative flex items-center justify-center h-48 w-48">
              {isConnected && !isMuted ? (
                <>
                  <div className="absolute inset-0 rounded-full bg-violet-600/20 animate-ping scale-150"></div>
                  <div className="absolute inset-4 rounded-full bg-indigo-600/20 animate-ping scale-125"></div>
                  <div className="absolute inset-8 rounded-full bg-violet-500/30 animate-pulse"></div>
                </>
              ) : null}
              
              <div className={`h-36 w-36 rounded-full flex items-center justify-center transition-all duration-500 ${
                isConnected 
                  ? isMuted 
                    ? 'bg-slate-800 border-4 border-slate-700 shadow-lg' 
                    : 'bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-2xl shadow-violet-500/40 border-4 border-violet-400/30 scale-105'
                  : 'bg-slate-900 border-4 border-slate-800 hover:border-slate-700 shadow-inner'
              }`}>
                {isConnecting ? (
                  <svg className="animate-spin h-12 w-12 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-16 h-16 ${isConnected ? 'text-white' : 'text-slate-500'}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Equalizer Bars */}
            <div className="h-8 flex items-end justify-center gap-1.5 w-full max-w-xs px-4">
              {isConnected && !isMuted ? (
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => {
                  const randomHeight = [24, 16, 32, 12, 28, 20, 36, 14, 26, 18, 30, 10][i % 12];
                  return (
                    <div
                      key={i}
                      style={{ height: `${randomHeight}px` }}
                      className="w-1 bg-gradient-to-t from-violet-600 to-indigo-400 rounded-full animate-bounce"
                    ></div>
                  );
                })
              ) : (
                <div className="h-[2px] bg-slate-800 w-full rounded-full"></div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex gap-4">
            <button
              onClick={toggleConnection}
              disabled={isConnecting}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 ${
                isConnected
                  ? 'bg-rose-600 hover:bg-rose-500 text-white hover:shadow-lg hover:shadow-rose-500/25 active:scale-[0.98]'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xl shadow-violet-600/20 hover:shadow-violet-600/35 active:scale-[0.98]'
              }`}
            >
              {isConnected ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
                  </svg>
                  Disconnect Agent
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                  </svg>
                  Connect Voice Agent
                </>
              )}
            </button>

            {isConnected && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  isMuted
                    ? 'bg-rose-950/60 border-rose-800 text-rose-400 hover:bg-rose-900/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </section>

        {/* Right Side: Configuration & Details */}
        <section className="lg:col-span-5 flex flex-col gap-6 w-full">
          {/* Agent Parameters */}
          <div className="bg-[#0e0f17] border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
            <h2 className="text-md font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-violet-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Agent Parameters
            </h2>

            {/* Model Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400">Realtime Model</label>
              <select 
                value={voiceModel} 
                onChange={(e) => setVoiceModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              >
                <option value="gpt-4o-mini-realtime">GPT-4o Mini Realtime (Fastest)</option>
                <option value="gpt-4o-realtime">GPT-4o Realtime (Smartest)</option>
                <option value="llama-voice-3.1">Llama 3.1 Voice (Open Source)</option>
              </select>
            </div>

            {/* Language Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400">Language</label>
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              >
                <option value="en-US">English (United States)</option>
                <option value="es-ES">Spanish (Spain)</option>
                <option value="fr-FR">French (France)</option>
                <option value="de-DE">German (Germany)</option>
                <option value="hi-IN">Hindi (India)</option>
              </select>
            </div>

            {/* Personality Settings */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400">Agent Persona</label>
              <div className="grid grid-cols-3 gap-2">
                {['friendly', 'professional', 'casual'].map((persona) => (
                  <button
                    key={persona}
                    onClick={() => setAgentPersonality(persona)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border capitalize transition-all ${
                      agentPersonality === persona
                        ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {persona}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* System Environment */}
          <div className="bg-[#0e0f17] border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Environment Setup</h3>
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500">LiveKit Connection</span>
                <span className="text-slate-300 font-mono">ws://localhost:7880</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500">FastAPI Server</span>
                <span className="text-slate-300 font-mono">http://localhost:8000</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-500">Audio Format</span>
                <span className="text-slate-300 font-mono">PCM 24kHz 16-bit Mono</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-[#090a0f] py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Vani AI. Powered by LiveKit & FastAPI.</p>
      </footer>
    </div>
  )
}

export default App
