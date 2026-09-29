'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Preguntas y opciones actualizadas según la plantilla HTML
const questions = [
  {
    id: 3,
    tag: '// módulo: Lugar.exe',
    text: '🚕 Lugares — ¿Que lugar te Gustaria ir?',
    options: [
      'Jampy 🌭',
      'Budapest 🍩',
      'Geralds 🍗',
      'Pollos Robby 🍕',
      'La NASA 🚀',
      'Lola Pop 🍨',
    ],
  },
  {
    id: 4,
    tag: '// módulo: actividades_sociales.config',
    text: '📍 Primera cita — ¿Que te gustaria hacer?',
    options: [
      '☕ Conocernos y Charlar',
      '🎥 Pelis, Serie y Anime',
      '💓 Gustos y Anhelos',
      '🎮 Games',
    ],
  },
  {
    id: 5,
    tag: '// módulo: nutrición_social.dat',
    text: '🍽 Escoge el stack gastronómico de la noche',
    options: [
      '🍕 Pizza — el stack más sólido de la gastronomía 🍕',
      '🍗 Pollo frito — raw data sin procesar 🍗',
      '🍔 Burger — arquitectura en capas de sabor 🍔',
      '🌭 Hotdog — open source & altamente customizable 🌭',
    ],
  },
  {
    id: 6,
    tag: '// módulo: nivel_compromiso.final',
    text: '✨ Después de la cita... ¿qué hacemos? 👀',
    options: [
      '🌙 Paseo nocturno mientras esperamos regresar 🌙',
      '🫣 Seguir convensando',
      '🎲 Game Rank Juntos',
      '🥰 Pensar Proxima Cita',
    ],
  },
];

const questionHeaderImages: Record<number, string> = {
  3: '/memes/gatito3.png',
  4: '/memes/gatito4.png',
  5: '/memes/gatito5.png',
  6: '/memes/gatito6.png',
};
const catHeaderImg = '/memes/gatito9.png';
const catImagesStep1 = ['/memes/1.png', '/memes/2.png', '/memes/5.png'];
const catImagesStep2 = ['/memes/3.png', '/memes/4.png'];

const floatCatSrcs = [
  '/memes/1.png',
  '/memes/2.png',
  '/memes/3.png',
  '/memes/4.png',
  '/memes/5.png',
  '/memes/gatito1.png',
  '/memes/gatito4.png',
  '/memes/gatito9.png',
];

const initialAns: Record<number, string> = {};

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>(initialAns);
  const [guestName, setGuestName] = useState("");
  const [noAttempts, setNoAttempts] = useState(0);
  const [showNoMsg, setShowNoMsg] = useState(false);
  const [pickError, setPickError] = useState<Record<number, boolean>>({});
  const [showFinale, setShowFinale] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ left: string; top: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [tempHour, setTempHour] = useState<number>(18);
  const [tempMinute, setTempMinute] = useState<number>(0);
  const noButtonRef = useRef<HTMLButtonElement | null>(null);
  const yesButtonRef = useRef<HTMLButtonElement | null>(null);
  const noMsgRef = useRef<HTMLParagraphElement | null>(null);
  const floatCatsContainer = useRef<HTMLDivElement | null>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showFinale) {
      spawnCats();
    }
  }, [showFinale]);

  function go(from: number, to: number) {
    // Validar nombre en el paso 0
    if (from === 0 && guestName.trim() === '') {
      alert("¡Por favor, dime tu nombre primero! 🥺"); // O usa un setPickError si prefieres
      return;
    }

    if (from >= 3 && !answers[from]) {
      setPickError((prev) => ({ ...prev, [from]: true }));
      return;
    }
    setPickError((prev) => ({ ...prev, [from]: false }));
    setCurrentStep(to);
  }

  function pick(step: number, idx: number, val: string) {
    setAnswers((prev) => ({ ...prev, [step]: val }));
    setPickError((prev) => ({ ...prev, [step]: false }));
  }

  function escapeNo() {
    setNoAttempts((prev) => Math.min(prev + 1, 5));
    setShowNoMsg(true);
    const btnNo = noButtonRef.current;
    const btnSi = yesButtonRef.current;
    const parent = btnNo?.parentElement;
    if (!btnNo || !btnSi || !parent) return;

    const newSize = 18 + (noAttempts + 1) * 4;
    const newPad = 16 + (noAttempts + 1) * 4;
    btnSi.style.fontSize = Math.min(newSize, 42) + 'px';
    btnSi.style.padding = Math.min(newPad, 32) + 'px ' + Math.min(newPad + 24, 64) + 'px';

    const maxX = parent.offsetWidth - btnNo.offsetWidth - 20;
    const maxY = 100;
    const left = Math.random() * Math.max(maxX, 50);
    const top = Math.random() * maxY - 20;
    setSelectedPosition({ left: `${left}px`, top: `${top}px` });
  }

  function pickDate() {
    if (!selectedDate || !selectedTime) {
      setPickError((prev) => ({ ...prev, 2: true }));
      return;
    }
    setPickError((prev) => ({ ...prev, 2: false }));
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = selectedDate.getFullYear();
    setAnswers((prev) => ({ ...prev, 2: `${day}/${month}/${year} a las ${selectedTime}` }));
    setCurrentStep(3);
  }

  async function celebrate() {
    setShowFinale(true);

    try {
      await fetch('https://formspree.io/f/mgogrpra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          nombre: guestName, // <-- AÑADIDO: Se envía el nombre
          respuesta_cita: answers[1] || '¡Sí! 💜',
          fecha_hora: answers[2] || 'No especificada',
          lugar: answers[3] || 'No seleccionado',
          plan: answers[4] || 'No seleccionado',
          comida: answers[5] || 'No seleccionado',
          despues: answers[6] || 'No seleccionado',
        }),
      });
    } catch (error) {
      console.error('Error enviando datos:', error);
    }
  }

  async function downloadPDF() {
    const element = document.getElementById('pdf-confirmation');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      const imgWidth = 148;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('cita-confirmada.pdf');
    } catch (error) {
      console.error('Error generando PDF:', error);
    }
  }

  function spawnCats() {
    if (!floatCatsContainer.current) return;
    for (let i = 0; i < 16; i += 1) {
      setTimeout(() => {
        const img = document.createElement('img');
        img.className = 'float-cat';
        img.src = floatCatSrcs[Math.floor(Math.random() * floatCatSrcs.length)];
        img.style.left = `${Math.random() * 95}%`;
        img.style.animationDuration = `${3 + Math.random() * 4}s`;
        if (floatCatsContainer.current) {
          floatCatsContainer.current.appendChild(img);
          setTimeout(() => img.remove(), 8000);
        }
      }, i * 200);
    }
  }

  const noButtonStyles = useMemo(() => {
    if (noAttempts === 0) return {};
    const size = Math.max(14 - noAttempts, 8);
    const pad = Math.max(12 - noAttempts * 2, 4);
    return {
      position: 'absolute' as const,
      left: selectedPosition?.left ?? 'auto',
      top: selectedPosition?.top ?? 'auto',
      fontSize: `${size}px`,
      padding: `${pad}px ${Math.max(24 - noAttempts * 3, 8)}px`,
    };
  }, [noAttempts, selectedPosition]);

  const yesButtonStyles = useMemo(() => {
    if (noAttempts === 0) return {};
    const size = Math.min(18 + noAttempts * 4, 42);
    const pad = Math.min(16 + noAttempts * 4, 32);
    return {
      fontSize: `${size}px`,
      padding: `${pad}px ${Math.min(pad + 24, 64)}px`,
    };
  }, [noAttempts]);

  return (
    <main className="app" style={{ width: '100%', maxWidth: 560, margin: '0 auto', minHeight: '100vh', padding: '16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%' }}>
        {/* HEADER */}
        <div className="header" style={{ textAlign: 'center', marginBottom: 20, animation: 'fadeDown 0.6s ease' }}>
          <img src="/memes/gatito1.png" alt="gatito1" style={{ width: 100, height: 'auto', borderRadius: 16, display: 'block', margin: '0 auto 12px', filter: 'drop-shadow(0 0 20px rgba(192, 132, 252, 0.5))' }} />
          <h1 style={{ fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.2 }}>
            ¿Saldrías conmigo?
          </h1>
          <p style={{ fontFamily: 'Fira Code, monospace', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            // ejecutando: AppCita
          </p>
        </div>

        {/* STEP 0: Intro y Nombre */}
        <div className={`step ${currentStep === 0 ? 'active' : ''}`} style={{ display: currentStep === 0 ? 'block' : 'none', animation: 'slideUp 0.4s cubic-bezier(.34,1.56,.64,1)' }} id="s0">
          <div className="plea-card" style={{ background: 'var(--primary-light)', border: '2px solid rgba(124,58,237,0.2)', borderRadius: 'var(--radius)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
              <span className="plea-emoji" style={{ flexShrink: 0 }}>
                <img src="/memes/gatito2.png" alt="Emoji gato" style={{ width: 56, height: 56, borderRadius: 12 }} />
              </span>
              <div className="plea-text" style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-dark)', lineHeight: 1.4, textAlign: 'left' }}>
                Antes de comenzar... ¿Cuál es tu nombre? 🥺
                <small style={{ display: 'block', fontSize: 11, fontFamily: 'Fira Code, monospace', color: 'var(--primary)', opacity: 0.8, fontWeight: 400, marginTop: 4 }}>
                  /* requerimos tu nombre para iniciar el protocolo */
                </small>
              </div>
            </div>
            
            {/* NUEVO INPUT PARA EL NOMBRE */}
            <input 
              type="text" 
              placeholder="Escribe tu nombre aquí..."
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '2px solid var(--border)',
                fontFamily: 'Nunito, sans-serif',
                fontSize: 15,
                fontWeight: 600,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <button className="btn-next" style={{ width: '100%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', padding: '14px 20px', fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s ease', letterSpacing: 0.5, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }} onClick={() => go(0, 1)}>
            [ INICIAR PROTOCOLO → ]
          </button>
        </div>

        {/* STEP 1: ¿Quieres una cita? */}
        <div className="step" style={{ display: currentStep === 1 ? 'block' : 'none' }} id="s1">
          <div className="q-card" style={{ background: 'var(--card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', padding: 16, marginBottom: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
              {catImagesStep1.map((src, index) => (
                <img key={index} src={src} alt={`Imagen ${index + 1}`} style={{ width: '30%', maxWidth: 90, height: 'auto', borderRadius: 12, animation: 'float 3s ease-in-out infinite', animationDelay: `${index * 0.5}s` }} />
              ))}
            </div>
            <div className="q-text" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', lineHeight: 1.4, marginBottom: 16 }}>
              ¿Quieres tener una cita conmigo? 🥺💕
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 12, minHeight: 70, position: 'relative', padding: '8px 0' }}>
              <button
                ref={yesButtonRef}
                className="btn-next"
                style={{
                  fontSize: 16,
                  padding: '12px 32px',
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(124,58,237,0.24)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, all 0.2s ease',
                  ...yesButtonStyles,
                }}
                onClick={() => {
                  setAnswers((prev) => ({ ...prev, 1: '¡Sí! 💜' }));
                  go(1, 2);
                }}
              >
                Sí 💜
              </button>
              {noAttempts < 5 && (
                <button
                  ref={noButtonRef}
                  className="btn-next"
                  style={{
                    fontSize: 12,
                    padding: '10px 20px',
                    borderRadius: 999,
                    background: 'linear-gradient(135deg, #ffd5d5, #ff9292)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.45)',
                    cursor: 'pointer',
                    boxShadow: '0 8px 16px rgba(75,85,99,0.18)',
                    transition: 'transform 0.2s ease, all 0.2s ease',
                    position: noAttempts === 0 ? 'relative' : 'absolute',
                    left: noAttempts === 0 ? undefined : selectedPosition?.left,
                    top: noAttempts === 0 ? undefined : selectedPosition?.top,
                    ...noButtonStyles,
                  }}
                  onMouseOver={escapeNo}
                  onTouchStart={escapeNo}
                >
                  No
                </button>
              )}
            </div>
            <p ref={noMsgRef} id="no-msg" style={{ display: showNoMsg ? 'block' : 'none', marginTop: 10, fontFamily: 'Fira Code, monospace', fontSize: 10, color: 'var(--accent)' }}>
              {noAttempts >= 5 ? '// el "No" ya no existe en el sistema 😅💜' : '// error: opción no válida'}
            </p>
          </div>
        </div>

        {/* STEP 2: ¿Cuándo estás disponible? */}
        <div className="step" style={{ display: currentStep === 2 ? 'block' : 'none' }} id="s2">
          <div className="q-card" style={{ background: 'var(--card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', padding: 16, marginBottom: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <img src={catImagesStep2[0]} alt="Emoji guiño" style={{ height: 60, width: 60, objectFit: 'contain', animation: 'pulse 2s ease-in-out infinite' }} />
              <img src={catImagesStep2[1]} alt="Emoji tímido" style={{ height: 64, width: 64, objectFit: 'contain', animation: 'pulse 2s ease-in-out infinite', animationDelay: '0.5s' }} />
            </div>
            <span className="q-tag" style={{ fontFamily: 'Fira Code, monospace', fontSize: 10, background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 8px', borderRadius: 100, display: 'inline-block', marginBottom: 10, fontWeight: 500 }}>
              // módulo: agenda.sync
            </span>
            <div className="q-text" style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', lineHeight: 1.4, marginTop: 8, marginBottom: 16 }}>
              ¿Cuándo estás disponible? 📅
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'stretch' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontFamily: 'Fira Code, monospace', fontSize: 11, color: 'var(--text-muted)', textAlign: 'left' }}>Fecha:</label>
                <button
                  onClick={() => { setShowPicker('date'); setTempDate(selectedDate || new Date()); }}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: selectedDate ? 'linear-gradient(135deg, var(--primary-light), #fff)' : 'var(--bg)',
                    border: `2px solid ${selectedDate ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 15,
                    fontWeight: 700,
                    color: selectedDate ? 'var(--primary-dark)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: selectedDate ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{selectedDate ? `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}` : 'Selecciona una fecha'}</span>
                  <span style={{ fontSize: 18 }}>📅</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontFamily: 'Fira Code, monospace', fontSize: 11, color: 'var(--text-muted)', textAlign: 'left' }}>Hora:</label>
                <button
                  onClick={() => { setShowPicker('time'); }}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: selectedTime ? 'linear-gradient(135deg, var(--primary-light), #fff)' : 'var(--bg)',
                    border: `2px solid ${selectedTime ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 15,
                    fontWeight: 700,
                    color: selectedTime ? 'var(--primary-dark)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: selectedTime ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{selectedTime || 'Selecciona una hora'}</span>
                  <span style={{ fontSize: 18 }}>⏰</span>
                </button>
              </div>
            </div>

            {showPicker === 'date' && (
              <div style={{ marginTop: 16, background: 'var(--card)', border: '2px solid var(--primary)', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <button onClick={() => { const d = new Date(tempDate); d.setMonth(d.getMonth() - 1); setTempDate(d); }} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)', border: 'none', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
                  <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--primary-dark)' }}>{tempDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                  <button onClick={() => { const d = new Date(tempDate); d.setMonth(d.getMonth() + 1); setTempDate(d); }} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)', border: 'none', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                  {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d) => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {(() => {
                    const firstDay = new Date(tempDate.getFullYear(), tempDate.getMonth(), 1).getDay();
                    const daysInMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getDate();
                    const cells = [];
                    for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} />);
                    for (let i = 1; i <= daysInMonth; i++) {
                      const date = new Date(tempDate.getFullYear(), tempDate.getMonth(), i);
                      const isSelected = selectedDate && selectedDate.getDate() === i && selectedDate.getMonth() === tempDate.getMonth() && selectedDate.getFullYear() === tempDate.getFullYear();
                      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                      cells.push(
                        <button
                          key={i}
                          onClick={() => { if (!isPast) { setSelectedDate(date); setShowPicker(null); } }}
                          disabled={isPast}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            border: 'none',
                            background: isSelected ? 'var(--primary)' : isPast ? 'var(--bg)' : 'transparent',
                            color: isSelected ? 'white' : isPast ? 'var(--text-muted)' : 'var(--text)',
                            fontSize: 12,
                            fontWeight: isSelected ? 800 : 600,
                            cursor: isPast ? 'not-allowed' : 'pointer',
                            opacity: isPast ? 0.4 : 1,
                          }}
                        >
                          {i}
                        </button>
                      );
                    }
                    return cells;
                  })()}
                </div>
                <button onClick={() => setShowPicker(null)} style={{ marginTop: 12, width: '100%', padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Listo ✓</button>
              </div>
            )}

            {showPicker === 'time' && (
              <div style={{ marginTop: 12, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 16px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {/* RELOJ ANALÓGICO */}
                <div style={{ position: 'relative', width: 100, height: 100, borderRadius: '50%', border: '4px solid var(--primary-light)', background: 'white', marginBottom: 20, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)' }}>
                  {/* Punto central */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', width: 8, height: 8, background: 'var(--primary-dark)', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}></div>
                  
                  {/* Manecilla de las HORAS (más corta y gruesa) */}
                  <div style={{ 
                    position: 'absolute', top: '50%', left: '50%', width: 4, height: 25, background: 'var(--primary-dark)', borderRadius: 2, 
                    transformOrigin: 'bottom center',
                    transform: `translate(-50%, -100%) rotate(${(tempHour % 12) * 30 + (tempMinute / 2)}deg)`,
                    transition: 'transform 0.4s cubic-bezier(0.4, 2.08, 0.55, 0.44)'
                  }}></div>

                  {/* Manecilla de los MINUTOS (más larga y fina) */}
                  <div style={{ 
                    position: 'absolute', top: '50%', left: '50%', width: 2, height: 35, background: 'var(--accent)', borderRadius: 1, 
                    transformOrigin: 'bottom center',
                    transform: `translate(-50%, -100%) rotate(${tempMinute * 6}deg)`,
                    transition: 'transform 0.4s cubic-bezier(0.4, 2.08, 0.55, 0.44)'
                  }}></div>
                </div>

                {/* TEXTO DE LA HORA SELECCIONADA (Formato 12h) */}
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary-dark)', marginBottom: 16 }}>
                  {tempHour === 12 ? 12 : tempHour % 12}:{tempMinute.toString().padStart(2, '0')} <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)' }}>{tempHour >= 12 ? 'PM' : 'AM'}</span>
                </div>

                {/* BOTONES DE SELECCIÓN (6:00 PM a 10:00 PM en intervalos de 30 min) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: '100%', marginBottom: 16 }}>
                  {[
                    { h: 18, m: 0, label: '6:00' },
                    { h: 18, m: 30, label: '6:30' },
                    { h: 19, m: 0, label: '7:00' },
                    { h: 19, m: 30, label: '7:30' },
                    { h: 20, m: 0, label: '8:00' },
                    { h: 20, m: 30, label: '8:30' },
                    { h: 21, m: 0, label: '9:00' },
                    { h: 21, m: 30, label: '9:30' },
                    { h: 22, m: 0, label: '10:00' }
                  ].map((timeObj, index) => {
                    const isSelected = tempHour === timeObj.h && tempMinute === timeObj.m;
                    return (
                      <button
                        key={index}
                        onClick={() => { setTempHour(timeObj.h); setTempMinute(timeObj.m); }}
                        style={{
                          padding: '8px 4px',
                          borderRadius: 'var(--radius-sm)',
                          border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                          background: isSelected ? 'var(--accent-light)' : 'var(--bg)',
                          color: isSelected ? 'var(--accent)' : 'var(--text)',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {timeObj.label} PM
                      </button>
                    );
                  })}
                </div>
                
                {/* BOTONES DE ACCIÓN */}
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                  <button onClick={() => setShowPicker(null)} style={{ flex: 1, padding: '10px', background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    Cancelar
                  </button>
                  <button onClick={() => { 
                    // Guardamos la hora en formato AM/PM para que se envíe así a Formspree y al PDF
                    const ampm = tempHour >= 12 ? 'PM' : 'AM';
                    const h12 = tempHour === 12 ? 12 : tempHour % 12;
                    setSelectedTime(`${h12}:${tempMinute.toString().padStart(2, '0')} ${ampm}`); 
                    setShowPicker(null); 
                  }} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, var(--accent), #db2777)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                    Listo ✓
                  </button>
                </div>
              </div>
            )}

            <div className="err-msg" style={{ display: pickError[2] ? 'block' : 'none', fontFamily: 'Fira Code, monospace', fontSize: 10, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '6px 10px', marginTop: 8 }}>
              // error: selecciona fecha y hora para continuar 🗓️
            </div>
            <button className="btn-next" style={{ marginTop: 16, width: '100%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', padding: '12px 20px', fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s ease', letterSpacing: 0.5, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }} onClick={pickDate}>
              [ CONFIRMAR FECHA → ]
            </button>
          </div>
        </div>

        {/* STEPS 3 a 6: Preguntas dinámicas */}
        {questions.map((question, index) => {
          const stepIndex = question.id;
          const progress = `${(index + 1) * 25}%`;
          const label = `pregunta ${index + 1} / 4`;
          const active = currentStep === stepIndex;
          return (
            <div key={stepIndex} className="step" style={{ display: active ? 'block' : 'none' }} id={`s${stepIndex}`}>
              <span className="progress-label" style={{ fontFamily: 'Fira Code, monospace', fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                {label}
              </span>
              <div className="progress-wrap" style={{ background: 'var(--border)', borderRadius: 100, height: 5, marginBottom: 16, overflow: 'hidden' }}>
                <div className="progress-fill" style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 100, transition: 'width 0.5s cubic-bezier(.34,1.56,.64,1)', width: progress }} />
              </div>
              <div style={{ textAlign: 'center', margin: '8px 0' }}>
                <img src={questionHeaderImages[stepIndex] ?? catHeaderImg} alt="Decoración" style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: 120, height: 'auto' }} />
              </div>
              <div className="q-card" style={{ background: 'var(--card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', padding: 16, marginBottom: 12, border: '1px solid var(--border)' }}>
                <span className="q-tag" style={{ fontFamily: 'Fira Code, monospace', fontSize: 10, background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 8px', borderRadius: 100, display: 'inline-block', marginBottom: 8, fontWeight: 500 }}>
                  {question.tag}
                </span>
                <div className="q-text" style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', lineHeight: 1.4 }}>
                  {question.text}
                </div>
              </div>
              <div className="options" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                {question.options.map((option, optionIndex) => {
                  const selected = answers[stepIndex] === option;
                  return (
                    <button key={optionIndex} className={`opt ${selected ? 'selected' : ''}`} style={{
                      background: 'var(--bg)',
                      border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'Nunito, sans-serif',
                      fontSize: 12,
                      fontWeight: 600,
                      color: selected ? 'var(--primary-dark)' : 'var(--text)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      transition: 'all 0.2s ease',
                      lineHeight: 1.3,
                      boxShadow: selected ? '0 0 0 2px rgba(124,58,237,0.15)' : undefined,
                    }}
                      onClick={() => pick(stepIndex, optionIndex, option)}>
                      <span className="opt-key" style={{ width: 22, height: 22, background: selected ? 'var(--primary)' : 'var(--border)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fira Code, monospace', fontSize: 10, fontWeight: 600, color: selected ? 'white' : 'var(--text)', flexShrink: 0 }}>
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span style={{ flex: 1, wordBreak: 'break-word' }}>{option}</span>
                    </button>
                  );
                })}
              </div>
              <p className="err-msg" style={{ display: pickError[stepIndex] ? 'block' : 'none', fontFamily: 'Fira Code, monospace', fontSize: 10, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '6px 10px', marginTop: 8 }}>
                ⚠ ¡Elige algo porfa! el algoritmo espera 🙏
              </p>
              <button className="btn-next" style={{ width: '100%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', padding: '12px 20px', fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s ease', letterSpacing: 0.5, boxShadow: '0 4px 12px rgba(124,58,237,0.3)', marginTop: 12 }} onClick={() => go(stepIndex, stepIndex + 1)}>
                [ SIGUIENTE PARÁMETRO → ]
              </button>
            </div>
          );
        })}

        {/* STEP 7: Resumen y Confirmación */}
        <div className="step" style={{ display: currentStep === 7 ? 'block' : 'none' }} id="s7">
          <div className="summary-header" style={{ textAlign: 'center', marginBottom: 16 }}>
            <span className="big-cat" style={{ display: 'block', animation: 'pulse 2s ease-in-out infinite', marginBottom: 10 }}>
              <img src={catHeaderImg} alt="Gato grande" style={{ display: 'block', margin: '0 auto', width: 120, height: 120, objectFit: 'contain' }} />
            </span>
            
            {/* TÍTULO MODIFICADO PARA INCLUIR EL NOMBRE */}
            <h2 style={{ fontSize: 20, fontWeight: 900, background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Resumen para {guestName || 'ti'}
            </h2>
            
            <p style={{ fontFamily: 'Fira Code, monospace', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
              // análisis de compatibilidad completado 💜
            </p>
          </div>

          <div className="summary-table" style={{ background: 'var(--card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 12, fontSize: 11 }}>
            <div className="summary-row" style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', gap: 8, borderBottom: '1px solid var(--border)' }}>
              <span className="s-icon" style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: 'center' }}>🚕</span>
              <span className="s-label" style={{ fontFamily: 'Fira Code, monospace', fontSize: 9, color: 'var(--text-muted)', flexShrink: 0 }}>
                Lugar://
              </span>
              <span className="s-value" style={{ fontWeight: 700, fontSize: 11, color: 'var(--text)', flex: 1, wordBreak: 'break-word' }}>
                {answers[3] ?? '—'}
              </span>
            </div>
            <div className="summary-row" style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', gap: 8, borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
              <span className="s-icon" style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: 'center' }}>📅</span>
              <span className="s-label" style={{ fontFamily: 'Fira Code, monospace', fontSize: 9, color: 'var(--text-muted)', flexShrink: 0 }}>
                cita://
              </span>
              <span className="s-value" style={{ fontWeight: 700, fontSize: 11, color: 'var(--text)', flex: 1, wordBreak: 'break-word' }}>
                {answers[2] ?? '—'}
              </span>
            </div>
            <div className="summary-row" style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', gap: 8, borderBottom: '1px solid var(--border)' }}>
              <span className="s-icon" style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: 'center' }}>📍</span>
              <span className="s-label" style={{ fontFamily: 'Fira Code, monospace', fontSize: 9, color: 'var(--text-muted)', flexShrink: 0 }}>
                plan://
              </span>
              <span className="s-value" style={{ fontWeight: 700, fontSize: 11, color: 'var(--text)', flex: 1, wordBreak: 'break-word' }}>
                {answers[4] ?? '—'}
              </span>
            </div>
            <div className="summary-row" style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', gap: 8, borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
              <span className="s-icon" style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: 'center' }}>🍽</span>
              <span className="s-label" style={{ fontFamily: 'Fira Code, monospace', fontSize: 9, color: 'var(--text-muted)', flexShrink: 0 }}>
                comida://
              </span>
              <span className="s-value" style={{ fontWeight: 700, fontSize: 11, color: 'var(--text)', flex: 1, wordBreak: 'break-word' }}>
                {answers[5] ?? '—'}
              </span>
            </div>
            <div className="summary-row" style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', gap: 8, background: 'var(--bg)' }}>
              <span className="s-icon" style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: 'center' }}>💫</span>
              <span className="s-label" style={{ fontFamily: 'Fira Code, monospace', fontSize: 9, color: 'var(--text-muted)', flexShrink: 0 }}>
                después://
              </span>
              <span className="s-value" style={{ fontWeight: 700, fontSize: 11, color: 'var(--text)', flex: 1, wordBreak: 'break-word' }}>
                {answers[6] ?? '—'}
              </span>
            </div>
          </div>

          <div className="q-card" style={{ border: '2px solid var(--accent)', textAlign: 'center', padding: 16, borderRadius: 'var(--radius)', background: 'var(--card)', boxShadow: 'var(--shadow)' }}>
            <span style={{ display: 'block', marginBottom: 8 }}>
              <img src="/memes/gatito0.png" alt="Pregunta final" style={{ display: 'block', margin: '0 auto', width: 80, height: 80, objectFit: 'contain' }} />
            </span>
            <div className="q-text" style={{ fontSize: 18, lineHeight: 1.4, fontWeight: 800, color: 'var(--text)' }}>
              Entonces... ¿saldrías conmigo?
            </div>
            <p style={{ fontFamily: 'Fira Code, monospace', fontSize: 9, color: 'var(--text-muted)', marginTop: 6 }}>
              // advertencia: respuesta_incorrecta no existe en este programa
            </p>
          </div>

          <button className="btn-next btn-confirm" style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent), #db2777)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', padding: '14px 20px', fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s ease', letterSpacing: 0.5, boxShadow: '0 4px 12px rgba(236,72,153,0.3)', marginTop: 12, display: showFinale ? 'none' : 'block' }} onClick={celebrate}>
            ✨ [ SÍ, ACEPTO LOS TÉRMINOS Y CONDICIONES ] ✨
          </button>

          <div className="finale" id="fmsg" style={{ display: showFinale ? 'block' : 'none', textAlign: 'center', padding: 16, background: 'var(--green-light)', border: '2px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius)', animation: 'pop 0.5s cubic-bezier(.34,1.56,.64,1)', marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <img src="/memes/gatito1.png" alt="gatito1" style={{ display: 'block', width: 80, height: 80, objectFit: 'contain' }} />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--green)', marginBottom: 6 }}>
              ¡Match confirmado!
            </h3>
            <p style={{ fontFamily: 'Fira Code, monospace', fontSize: 10, color: '#065f46', lineHeight: 1.5 }}>
              // status: ÉXITO<br />
              // romance.exe iniciado correctamente<br />
              // nos vemos pronto, estare contando los minutos 💜
            </p>
          </div>

          <div style={{ display: showFinale ? 'flex' : 'none', gap: 8, marginTop: 12 }}>
            <button onClick={downloadPDF} style={{ flex: 1, background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
              📄 Descargar PDF
            </button>
          </div>

          <div ref={floatCatsContainer} />

          {/* Plantilla oculta para generar el PDF */}
          <div id="pdf-confirmation" ref={pdfContentRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: '148mm', background: 'white', fontFamily: 'Nunito, sans-serif' }}>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <img src="/memes/gatito1.png" alt="gatito" style={{ width: 80, height: 'auto', margin: '0 auto 16px' }} />
              <h1 style={{ fontSize: 20, color: '#7c3aed', marginBottom: 4 }}>💜 ¡Cita Confirmada! 💜</h1>
              
              {/* NUEVA LÍNEA PARA EL NOMBRE */}
              <h2 style={{ fontSize: 16, color: '#4b5563', marginBottom: 4, fontWeight: 700 }}>Invitada VIP: {guestName}</h2>
              
              <p style={{ fontSize: 10, color: '#6b7280', marginBottom: 20 }}>// romance.exe iniciado correctamente</p>
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ border: '2px solid #ede9fe', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ background: '#f3e8ff', padding: '10px 14px', fontWeight: 800, fontSize: 11, color: '#7c3aed' }}>📋 Resumen de tu cita</div>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: 9, color: '#6b7280' }}>🚕 Lugar:// </span>
                  <span style={{ fontSize: 10, fontWeight: 700 }}>{answers[3] ?? '—'}</span>
                </div>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  <span style={{ fontSize: 9, color: '#6b7280' }}>📅 cita:// </span>
                  <span style={{ fontSize: 10, fontWeight: 700 }}>{answers[2] ?? '—'}</span>
                </div>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: 9, color: '#6b7280' }}>📍 plan:// </span>
                  <span style={{ fontSize: 10, fontWeight: 700 }}>{answers[4] ?? '—'}</span>
                </div>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  <span style={{ fontSize: 9, color: '#6b7280' }}>🍽 comida:// </span>
                  <span style={{ fontSize: 10, fontWeight: 700 }}>{answers[5] ?? '—'}</span>
                </div>
                <div style={{ padding: '10px 14px', background: '#f9fafb' }}>
                  <span style={{ fontSize: 9, color: '#6b7280' }}>💫 después:// </span>
                  <span style={{ fontSize: 10, fontWeight: 700 }}>{answers[6] ?? '—'}</span>
                </div>
              </div>
              <p style={{ fontSize: 9, color: '#6b7280', textAlign: 'center', lineHeight: 1.6 }}>
                Nos vemos pronto 💜<br />
                <span style={{ fontSize: 8 }}>// generado por AppCita</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
