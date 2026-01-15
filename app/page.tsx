"use client"
import { useState, useEffect, useCallback, useRef } from 'react'
import Pusher from 'pusher-js'
import { nanoid } from 'nanoid'

// คำถามเพิ่มเติมเพื่อความหลากหลาย
const QUESTIONS_POOL = [
{ q: "ปรากฏการณ์ 'Mpemba Effect' อธิบายถึงความขัดแย้งในเรื่องใด? ❄️", a: "น้ำร้อนสามารถกลายเป็นน้ำแข็งได้เร็วกว่าน้ำเย็น" },
  { q: "อนุภาคใดในร่างกายมนุษย์ที่ทำหน้าที่เป็น 'นาฬิกาชีวภาพ' กำหนดอายุขัยของเซลล์? 🧬", a: "เทโลเมียร์ (Telomeres)" },
  { q: "ชื่อธาตุลำดับที่ 101 ในตารางธาตุ ถูกตั้งเพื่อเป็นเกียรติแก่ผู้สร้างตารางธาตุคือใคร? 🧪", a: "เมนเดลีเวียม (Mendelevium)" },
  { q: "ขีดจำกัดความเร็วที่แสงเดินทางในสูญญากาศมีค่าประมาณเท่าใด? 🚀", a: "299,792,458 เมตรต่อวินาที" },
  { q: "ใครคือสตรีคนแรกที่ได้รับรางวัลโนเบลถึง 2 ครั้งใน 2 สาขาที่แตกต่างกัน? ☢️", a: "มารี กูว์รี (ฟิสิกส์และเคมี)" },
  { q: "ในทางฟิสิกส์ 'จุดสิงกูลาริตี้' (Singularity) พบได้ในใจกลางของสิ่งใด? 🕳️", a: "หลุมดำ" },
  { q: "ภาษาที่เก่าแก่ที่สุดในโลกที่ยังคงมีการพูดและเขียนมาจนถึงปัจจุบันคือภาษาใด? ✍️", a: "ภาษาทมิฬ (Tamil)" },
  { q: "ข้อตกลงใดที่ลงนามในปี 1987 เพื่อยับยั้งการขยายตัวของรูโหว่ในชั้นโอโซน? 🌍", a: "พิธีสารมอนทรีออล (Montreal Protocol)" },
  { q: "ระบบคอมพิวเตอร์ที่ใช้ 'คิวบิต' (Qubits) แทนการใช้บิตปกติเรียกว่าอะไร? 💻", a: "ควอนตัมคอมพิวเตอร์" },
  { q: "ทฤษฎีสัมพัทธภาพทั่วไป (General Relativity) เสนอว่าแรงโน้มถ่วงเกิดจากอะไร? 🌌", a: "ความโค้งของปริภูมิ-เวลา (Space-time)" },
  { q: "สิ่งมีชีวิตชนิดใดสามารถทนต่อรังสีและการอยู่ในอวกาศได้นานที่สุด? 🌌", a: "ทาร์ดิเกรด (หมีน้ำ)" },
  { q: "ใครคือนักคณิตศาสตร์ผู้อยู่เบื้องหลังการถอดรหัส Enigma ในสงครามโลกครั้งที่ 2? 🕵️", a: "อลัน ทัวริง" },
  { q: "สารประกอบชนิดใดที่มีโครงสร้างผลึกแข็งที่สุดที่เกิดขึ้นเองตามธรรมชาติ? 💎", a: "เพชร (Lonsdaleite แข็งกว่า 58%)" },
  { q: "ในอุณหภูมิ 'ศูนย์สัมบูรณ์' (Absolute Zero) มีค่าเท่ากับกี่องศาเซลเซียส? 🧊", a: "-273.15 องศาเซลเซียส" },
  { q: "ชื่อหน่วยวัดความเข้มเสียง 'เดซิเบล' ตั้งชื่อตามนักประดิษฐ์คนใด? 🔊", a: "อเล็กซานเดอร์ เกรแฮม เบลล์" },
  { q: "อารยธรรมใดที่ประดิษฐ์ตัวอักษร 'คูนิฟอร์ม' ขึ้นเป็นครั้งแรกของโลก? 📜", a: "ชาวซูเมเรียน (เมโสโปเตเมีย)" },
  { q: "นิวตรอนถูกค้นพบโดยนักวิทยาศาสตร์คนใดในปี 1932? ⚛️", a: "เจมส์ แชดวิก" },
  { q: "พืชชนิดใดคือพืชดอกที่มีขนาดเล็กที่สุดในโลก? 🌿", a: "ผำ (Wolffia)" },
  { q: "สมการชื่อดัง $E=mc^2$ ตัวอักษร 'c' หมายถึงค่าของอะไร? 💡", a: "ความเร็วแสง" },
  { q: "กระบวนการที่ดาวฤกษ์สร้างพลังงานจากการรวมตัวของนิวเคลียสไฮโดรเจนเรียกว่าอะไร? ☀️", a: "นิวเคลียร์ฟิวชัน" }
];

export default function Home() {
  const [name, setName] = useState('')
  const [step, setStep] = useState('NAME')
  const [roomCode, setRoomCode] = useState('')
  const [myId] = useState(nanoid(4))
  const [players, setPlayers] = useState<any[]>([])
  const [gameData, setGameData] = useState<any>(null)
  const [timer, setTimer] = useState(60)
  const [selectedTime, setSelectedTime] = useState(60)
  
  // เก็บสถานะคำถามที่ใช้ไปแล้ว
  const [usedQuestionIndexes, setUsedQuestionIndexes] = useState<number[]>([])
  const pusherRef = useRef<Pusher | null>(null);

  const playSound = (type: 'click' | 'ding' | 'success') => {
    try {
      const audio = new Audio(`/sounds/${type}.mp3`);
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (e) {}
  }

  const sendSignal = async (event: string, data: any) => {
    try {
      await fetch('/api/pusher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, roomCode, data })
      });
    } catch (err) { console.error("Signal Error:", err); }
  }

  // --- ระบบสุ่มคำถามไม่ซ้ำ ---
  const getNextQuestion = useCallback(() => {
    let availableIndexes = QUESTIONS_POOL.map((_, i) => i).filter(i => !usedQuestionIndexes.includes(i));
    
    // ถ้าใช้จนครบทุกข้อแล้ว ให้รีเซ็ตใหม่
    if (availableIndexes.length === 0) {
      availableIndexes = QUESTIONS_POOL.map((_, i) => i);
      setUsedQuestionIndexes([]);
    }

    const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    setUsedQuestionIndexes(prev => [...prev, randomIndex]);
    return QUESTIONS_POOL[randomIndex];
  }, [usedQuestionIndexes]);

  const startNewRound = useCallback((currentGuesserId: string, queue: string[], currentPlayers: any[]) => {
    const others = currentPlayers.filter(p => p.id !== currentGuesserId);
    if (others.length < 2) {
      alert("⚠️ ต้องการผู้เล่นอย่างน้อย 3 คน");
      return;
    }

    const bluePlayer = others[Math.floor(Math.random() * others.length)];
    const question = getNextQuestion();

    sendSignal('game-started', {
      guesserId: currentGuesserId,
      blueId: bluePlayer.id,
      question,
      startTime: selectedTime,
      speakerIndex: 0,
      speakers: others.map(p => p.id).sort(() => Math.random() - 0.5),
      phase: 'SPEAKING',
      queue,
      eliminatedIds: [],
      roundPoints: 0
    });
  }, [selectedTime, roomCode, getNextQuestion]);

  // --- ตรวจสอบความพร้อมทุกคน ---
  const isEveryoneReady = players.length >= 3 && players.every(p => p.isReady);

  const handleGuess = (targetId: string) => {
    playSound('click');
    const isBlue = targetId === gameData.blueId;
    if (isBlue) {
      sendSignal('round-ended', { reason: 'HIT_BLUE', caughtId: targetId, eliminatedIds: gameData.eliminatedIds });
    } else {
      const newEliminated = [...gameData.eliminatedIds, targetId];
      const newPoints = gameData.roundPoints + 1;
      if (newEliminated.length === players.length - 2) {
        sendSignal('round-ended', { reason: 'CLEARED_RED', eliminatedIds: newEliminated, pointsAwarded: newPoints + 1 });
      } else {
        sendSignal('guess-correct', { eliminatedIds: newEliminated, roundPoints: newPoints });
      }
    }
  }

  useEffect(() => {
    if (!roomCode) return;
    if (!pusherRef.current) pusherRef.current = new Pusher("c8dd0c376bfaa5d569b0", { cluster: 'ap1' });
    const channel = pusherRef.current.subscribe(`room-${roomCode}`);

    channel.bind('check-room', (data: any) => {
      if (players.find(p => p.id === myId)?.isHost) {
        sendSignal('player-joined', { id: data.requesterId, name: data.name, isHost: false, isReady: false, score: 0 });
      }
    });

    channel.bind('player-joined', (newP: any) => {
      setPlayers(prev => {
        if (prev.find(p => p.id === newP.id)) return prev;
        const updated = [...prev, newP];
        if (prev.find(p => p.id === myId)?.isHost) sendSignal('sync-players', updated);
        return updated;
      });
      setStep('LOBBY');
    });

    channel.bind('sync-players', (list: any) => setPlayers(list));
    channel.bind('player-ready', (id: string) => setPlayers(prev => prev.map(p => p.id === id ? {...p, isReady: !p.isReady} : p)));
    channel.bind('game-started', (data: any) => { setGameData(data); setTimer(data.startTime); setStep('PLAYING'); playSound('ding'); });
    channel.bind('next-turn', (data: any) => { setGameData((prev: any) => ({ ...prev, speakerIndex: data.speakerIndex })); setTimer(selectedTime); playSound('ding'); });
    channel.bind('guessing-phase', () => setGameData((prev: any) => ({ ...prev, phase: 'GUESSING' })));
    channel.bind('guess-correct', (data: any) => setGameData((prev: any) => ({ ...prev, eliminatedIds: data.eliminatedIds, roundPoints: data.roundPoints })));
    
    channel.bind('round-ended', (data: any) => {
      setPlayers(prev => prev.map(p => {
        let added = 0;
        const totalFishOnTable = prev.length - 1; 
        const eliminatedIds = data.eliminatedIds || [];
        const isHitBlue = data.reason === 'HIT_BLUE';
        const totalFlipped = isHitBlue ? eliminatedIds.length + 1 : eliminatedIds.length;
        const unflippedCount = totalFishOnTable - totalFlipped;

        if (p.id === gameData.guesserId) {
          added = isHitBlue ? 0 : (data.pointsAwarded || gameData.roundPoints);
        } else if (p.id !== gameData.blueId) {
          const wasFlipped = isHitBlue ? (eliminatedIds.includes(p.id) || data.caughtId === p.id) : eliminatedIds.includes(p.id);
          added = wasFlipped ? 0 : totalFlipped; 
        } else if (p.id === gameData.blueId) {
          added = isHitBlue ? 0 : unflippedCount;
        }
        return { ...p, score: (p.score || 0) + added, lastAdded: added };
      }));
      setGameData((prev: any) => ({ ...prev, phase: 'ROUND_RESULT', result: data }));
    });

    channel.bind('final-leaderboard', () => { setStep('FINAL_SCORE'); playSound('success'); });
    return () => { channel.unbind_all(); pusherRef.current?.unsubscribe(`room-${roomCode}`); };
  }, [roomCode, myId, gameData, players, selectedTime]);

  useEffect(() => {
    if (step === 'PLAYING' && gameData?.phase === 'SPEAKING' && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer, gameData?.phase]);

  const me = players.find(p => p.id === myId);
  const isHost = me?.isHost;
  const guesserIndex = gameData?.queue?.indexOf(gameData?.guesserId);
  const isFinalRound = guesserIndex === players.length - 1;

  return (
    <main className="min-h-screen bg-[#0f172a] bg-[radial-gradient(circle_at_50%_50%,_#1e293b_0%,_#020617_100%)] text-white flex flex-col items-center justify-center p-4 font-sans">
      
      {/* 🚀 STEP: NAME */}
      {step === 'NAME' && (
        <div className="w-full max-w-sm bg-slate-900/80 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl text-center animate-in fade-in zoom-in duration-500">
          <div className="text-6xl mb-6">🐠</div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-br from-cyan-400 to-blue-600 bg-clip-text text-transparent italic">FISHY AND CHIPS</h1>
          <p className="text-slate-500 text-sm mb-8 font-bold tracking-widest uppercase">เกมของ "พวกเรา"</p>
          <input type="text" placeholder="ชื่อของคุณ..." className="w-full bg-slate-800/50 border border-slate-700 p-4 rounded-2xl mb-6 text-center text-xl outline-none focus:ring-2 ring-cyan-500 transition-all shadow-inner" onChange={(e) => setName(e.target.value)} maxLength={12} />
          <button disabled={!name} onClick={() => { playSound('click'); setStep('MENU'); }} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 py-4 rounded-2xl font-black text-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95 transition-all disabled:opacity-50">เข้าร่วมเกม</button>
        </div>
      )}

      {/* 🏠 STEP: MENU */}
      {step === 'MENU' && (
        <div className="flex flex-col gap-6 w-full max-w-sm animate-in slide-in-from-bottom duration-500">
          <button onClick={() => { playSound('click'); setRoomCode(nanoid(6).toUpperCase()); setPlayers([{id:myId, name, isHost:true, isReady:true, score:0}]); setStep('LOBBY') }} className="bg-slate-900/80 backdrop-blur-md py-12 rounded-[3rem] font-black text-3xl shadow-xl hover:bg-slate-800 border border-white/5 transition-all group overflow-hidden relative">
            <span className="relative z-10">สร้างห้องใหม่ 🏰</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
          <div className="flex items-center gap-4 px-2">
            <input type="text" placeholder="รหัสห้อง" className="flex-1 bg-slate-900/80 p-5 rounded-2xl text-center text-2xl font-mono uppercase border border-slate-800 focus:border-blue-500 outline-none transition-all" onChange={(e) => setRoomCode(e.target.value.toUpperCase())} />
            <button onClick={() => { playSound('click'); if(roomCode) sendSignal('check-room', { requesterId: myId, name }); }} className="bg-blue-600 p-5 rounded-2xl font-black text-xl hover:bg-blue-500 transition-all shadow-lg active:scale-90">จอย 🤝</button>
          </div>
        </div>
      )}

      {/* ⏳ STEP: LOBBY */}
      {step === 'LOBBY' && (
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl p-8 rounded-[3.5rem] border border-white/10 shadow-2xl animate-in zoom-in duration-500">
          <div className="text-center mb-8">
            <p className="text-cyan-500 font-black text-xs uppercase tracking-[0.3em] mb-2">Room Code</p>
            <h2 className="text-6xl font-black font-mono tracking-tighter">{roomCode}</h2>
          </div>
          
          <div className="space-y-3 mb-10 min-h-[200px]">
            {players.map(p => (
              <div key={p.id} className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${p.id === myId ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-white/5'}`}>
                <span className="font-bold text-lg flex items-center gap-2">
                  {p.isHost ? '👑' : '👤'} {p.name}
                </span>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${p.isReady ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  {p.isReady ? 'READY' : 'WAITING'}
                </span>
              </div>
            ))}
          </div>

          <button 
            disabled={isHost ? !isEveryoneReady : false}
            onClick={() => {
              playSound('click');
              if(isHost) {
                const q = players.map(p=>p.id).sort(()=>Math.random()-0.5);
                startNewRound(q[0], q, players);
              } else { sendSignal('player-ready', myId); }
            }} 
            className={`w-full py-6 rounded-[2rem] font-black text-2xl transition-all shadow-xl ${
              isHost 
                ? (isEveryoneReady ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed')
                : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/20'
            }`}
          >
            {isHost 
              ? (isEveryoneReady ? 'เริ่มเกมเดี๋ยวนี้! 🎮' : 'รอทุกคนพร้อม...') 
              : (me?.isReady ? 'ยกเลิกพร้อม ❌' : 'ฉันพร้อมแล้ว ✨')}
          </button>
          {isHost && !isEveryoneReady && (
            <p className="text-center text-slate-500 text-[10px] mt-4 uppercase font-bold tracking-widest animate-pulse">
              * ต้องการผู้เล่น 3 คนขึ้นไป และทุกคนต้องกด Ready *
            </p>
          )}
        </div>
      )}

      {/* 🎮 STEP: PLAYING */}
      {step === 'PLAYING' && gameData && (
        <div className="w-full max-w-2xl text-center">
          {gameData.phase === 'SPEAKING' && (
            <div className="mb-10 animate-in fade-in duration-700">
              <div className={`text-[10rem] font-black leading-none mb-4 font-mono transition-all ${timer < 10 ? 'text-red-500 scale-110' : 'text-white/20'}`}>{timer}</div>
              <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 px-8 py-4 rounded-full shadow-2xl">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                <p className="font-bold tracking-widest uppercase text-sm">ผู้พูด: <span className="text-cyan-400 font-black">{players.find(p=>p.id===gameData.speakers[gameData.speakerIndex])?.name}</span></p>
              </div>
              {myId === gameData.speakers[gameData.speakerIndex] && (
                <button onClick={() => {
                  playSound('click');
                  const nextIdx = gameData.speakerIndex + 1;
                  if (nextIdx < gameData.speakers.length) sendSignal('next-turn', { speakerIndex: nextIdx });
                  else sendSignal('guessing-phase', {});
                }} className="block w-full mt-10 bg-emerald-500 py-8 rounded-[2.5rem] font-black text-4xl shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all border-b-8 border-emerald-700">พูดจบแล้ว! ✅</button>
              )}
            </div>
          )}

          <div className="bg-slate-900/90 backdrop-blur-3xl p-10 rounded-[4rem] border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-4 left-4 text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Question {guesserIndex + 1}/{players.length}</div>
            <h2 className="text-4xl font-bold mb-12 leading-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic">"{gameData.question.q}"</h2>

            <div className="bg-white/5 p-8 rounded-[3rem] mb-10 border border-white/5 shadow-inner">
              {myId === gameData.guesserId ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">🕵️</span>
                  <p className="text-orange-400 font-black text-xl uppercase tracking-widest">คุณคือคนทาย (The Detective)</p>
                </div>
              ) : (
                <div className="animate-in slide-in-from-top duration-500">
                   <p className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-[0.3em]">เฉลยคำตอบจริง</p>
                   <p className="text-5xl font-black text-emerald-400 italic mb-6 tracking-tighter">{gameData.question.a}</p>
                   <p className="text-[10px] font-black text-cyan-500 bg-cyan-500/10 py-3 px-6 rounded-2xl border border-cyan-500/20 inline-block uppercase tracking-widest">
                     🔵 THE BLUE KIPPER: {players.find(p=>p.id===gameData.blueId)?.name}
                   </p>
                </div>
              )}
            </div>

            {gameData.phase === 'GUESSING' && myId === gameData.guesserId && (
              <div className="space-y-6 animate-in zoom-in duration-500">
                <p className="text-white/40 font-black text-sm uppercase tracking-widest">เลือกคนที่คุณคิดว่า "โกหก" (ปลาแดง)</p>
                <div className="grid grid-cols-2 gap-4">
                  {players.filter(p => p.id !== myId && !gameData.eliminatedIds?.includes(p.id)).map(p => (
                    <button key={p.id} onClick={() => handleGuess(p.id)} className="bg-slate-800 p-8 rounded-[2rem] font-black text-2xl hover:bg-red-600 hover:scale-105 transition-all shadow-xl border-b-4 border-black/40">
                      {p.name}
                    </button>
                  ))}
                </div>
                {gameData.roundPoints > 0 && (
                  <button onClick={() => sendSignal('round-ended', { reason: 'STOPPED', pointsAwarded: gameData.roundPoints })} className="w-full mt-6 bg-emerald-600 py-6 rounded-2xl font-black text-xl shadow-lg">พอแค่นี้! เก็บ {gameData.roundPoints} แต้ม 💰</button>
                )}
              </div>
            )}

            {gameData.phase === 'ROUND_RESULT' && (
              <div className="py-4 animate-in slide-in-from-bottom duration-500">
                <div className="mb-10 p-10 bg-black/40 rounded-[3.5rem] border border-white/10">
                   <h3 className="text-xl font-black text-slate-500 mb-2 uppercase tracking-widest">แต้มของคุณในรอบนี้</h3>
                   <p className={`${me?.lastAdded > 0 ? 'text-emerald-400' : 'text-red-500'} font-black text-9xl tracking-tighter`}>+{me?.lastAdded}</p>
                </div>
                {isHost && (
                  <button onClick={() => {
                    if (isFinalRound) sendSignal('final-leaderboard', {});
                    else startNewRound(gameData.queue[guesserIndex + 1], gameData.queue, players);
                  }} className="w-full bg-cyan-600 py-6 rounded-3xl font-black text-2xl shadow-xl hover:bg-cyan-500 transition-all border-b-4 border-cyan-800">
                    {isFinalRound ? 'สรุปผลคะแนนรวม 🏆' : 'รอบถัดไป ⏭️'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🏆 STEP: FINAL SCORE */}
      {step === 'FINAL_SCORE' && (
        <div className="w-full max-w-md bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl text-center animate-in zoom-in duration-700">
           <h2 className="text-5xl font-black text-cyan-500 mb-10 italic uppercase tracking-tighter">Leaderboard</h2>
           <div className="space-y-4 mb-10">
              {players.sort((a,b) => (b.score || 0) - (a.score || 0)).map((p, i) => (
                <div key={p.id} className={`flex justify-between items-center p-6 rounded-[2.5rem] border-2 ${i === 0 ? 'bg-cyan-500/10 border-cyan-500 scale-105 shadow-2xl shadow-cyan-500/20' : 'bg-white/5 border-white/5 opacity-80'}`}>
                   <div className="flex items-center gap-4">
                     <span className="text-4xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🐟'}</span>
                     <span className="text-2xl font-black">{p.name}</span>
                   </div>
                   <span className="text-4xl font-black text-cyan-400">{p.score || 0}</span>
                </div>
              ))}
           </div>
           <button onClick={() => window.location.reload()} className="w-full bg-slate-800 py-4 rounded-3xl font-black opacity-40 hover:opacity-100 transition-all">กลับหน้าแรก</button>
        </div>
      )}
    </main>
  )
}