import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GOAL_TYPES, AWAY_TYPES, RED_REASONS, H1_F1, H1_F2, H1_F3, H2_F1, H2_F2, H2_F3, ALG_BEELD, BIJZ, MOTM_REDENEN } from './constants/options';
import { THEMES } from './constants/themes';
import { LAYOUT_REGISTRY } from './constants/layouts';
import { IG_ICON, FB_ICON } from './constants/icons';
import { WEATHER, M, U, T, hex } from './constants/colors';
import { usePersistedState } from './hooks/usePersistedState';

export function PlayerSelect({ value, onChange, squad, placeholder }) {
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState(false);
  const display = value || placeholder;
  const inpStyle = {
    width:"100%", background:"rgba(255,255,255,0.06)",
    border:`1px solid ${T.border3}`, borderRadius:14,
    padding:"13px 16px", color:T.text,
    fontFamily:"Barlow,sans-serif", fontSize:14, outline:"none",
    backdropFilter:"blur(8px)",
  };
  if (manual) return (
    <div style={{display:"flex",gap:8}}>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} autoFocus style={{...inpStyle,flex:1}} />
      <button onClick={()=>{setManual(false);onChange("");}} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border3}`,borderRadius:14,color:T.text3,cursor:"pointer",padding:"0 14px",fontSize:15}}>↩</button>
    </div>
  );
  return (
    <div style={{position:"relative",flex:1}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",padding:"13px 16px",background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border3}`,borderRadius:14,color:value?T.text:T.text3,fontFamily:"Barlow,sans-serif",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",backdropFilter:"blur(8px)",textAlign:"left"}}>
        <span>{display}</span>
        <span style={{fontSize:10,opacity:0.5}}>{open?"▲":"▼"}</span>
      </button>
      {open && (
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:999,background:T.bg3,border:`1px solid ${T.border3}`,borderRadius:14,overflow:"hidden",boxShadow:"0 12px 40px rgba(0,0,0,0.7)",maxHeight:220,overflowY:"auto"}}>
          <button onClick={()=>{onChange("");setOpen(false);}} style={{width:"100%",padding:"12px 16px",background:"transparent",border:"none",borderBottom:`1px solid ${T.border}`,color:T.text3,fontFamily:"Barlow,sans-serif",fontSize:13,cursor:"pointer",textAlign:"left"}}>{placeholder}</button>
          {squad.map((p,i)=>(
            <button key={i} onClick={()=>{onChange(p);setOpen(false);}} style={{width:"100%",padding:"12px 16px",background:value===p?hex(T.green,0.1):"transparent",border:"none",borderBottom:`1px solid ${T.border}`,color:value===p?T.text:T.text2,fontFamily:"Barlow,sans-serif",fontSize:13,fontWeight:value===p?700:400,cursor:"pointer",textAlign:"left"}}>{p}</button>
          ))}
          <button onClick={()=>{setManual(true);setOpen(false);onChange("");}} style={{width:"100%",padding:"12px 16px",background:"transparent",border:"none",color:T.text4,fontFamily:"Barlow,sans-serif",fontSize:12,cursor:"pointer",textAlign:"left"}}>✏️ Handmatig invoeren</button>
        </div>
      )}
    </div>
  );
}

export function Chip({ label, active, onClick, color, xs, gradient }) {
  const c = color || U;
  const activeBg = gradient ? `linear-gradient(135deg, ${c} 0%, ${hex(c,0.5)} 100%)` : c;
  return (
    <button onClick={onClick} style={{padding:xs?"6px 13px":"10px 18px",borderRadius:100,border:`1px solid ${active?c:T.border3}`,background:active?activeBg:"rgba(255,255,255,0.04)",color:active?"#fff":T.text3,fontSize:xs?11:13,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.4,whiteSpace:"nowrap",transition:"all 0.18s cubic-bezier(0.4,0,0.2,1)",backdropFilter:"blur(8px)",boxShadow:active?`0 0 16px ${hex(c,0.35)}`:"none"}}>
      {label}
    </button>
  );
}

export function AutoMinRow({ liveMinute, paused, half, setHalf, minute, setMinute, extra, setExtra, color }) {
  const c = color || U;
  const [editing, setEditing] = useState(false);
  // Auto-fill: bij eerste render, gebruik liveMinute als nog niks gezet
  useEffect(() => {
    if (minute === "" && liveMinute > 0) {
      setMinute(String(liveMinute));
      setHalf(liveMinute <= 45 ? "1" : "2");
    }
  }, []);
  const displayMin = minute || (liveMinute > 0 ? String(liveMinute) : "—");
  const displayHalf = half || (liveMinute > 45 ? "2" : "1");
  const displayMinFmt = extra && minute ? `${displayHalf==="2"?90:45}+${minute}'` : `${displayMin}'`;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:hex(c,0.08),border:`1px solid ${hex(c,0.25)}`,borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:54,padding:"6px 10px",background:hex(c,0.18),borderRadius:10,border:`1px solid ${hex(c,0.3)}`}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,color:c,lineHeight:1}}>{displayMinFmt}</div>
          <div style={{fontSize:8,fontWeight:800,color:hex(c,0.7),letterSpacing:1,marginTop:1}}>{displayHalf==="1"?"1E HELFT":"2E HELFT"}</div>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:10,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>Tijdregistratie</div>
          <div style={{fontSize:11,color:T.text3,fontFamily:"Barlow,sans-serif",lineHeight:1.4}}>
            {paused ? "⏸ Klok staat op pauze" : "🔴 Live timer wordt automatisch gebruikt"}
          </div>
        </div>
        <button onClick={()=>setEditing(!editing)} style={{background:"none",border:`1px solid ${T.border3}`,borderRadius:8,padding:"5px 10px",color:T.text4,fontSize:10,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:0.5}}>{editing?"✓ Klaar":"✏️ Corrigeer"}</button>
      </div>
      {editing && (
        <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border2}`,borderRadius:14,padding:"12px 14px"}}>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            {[["1","1e Helft"],["2","2e Helft"]].map(([v,lbl])=>(
              <button key={v} onClick={()=>{setHalf(v);setMinute("");}} style={{flex:1,padding:"10px 8px",background:displayHalf===v?hex(c,0.15):"rgba(255,255,255,0.04)",border:`1px solid ${displayHalf===v?c:T.border3}`,borderRadius:10,color:displayHalf===v?c:T.text3,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:800,cursor:"pointer"}}>{lbl}</button>
            ))}
          </div>
          <input type="number" inputMode="numeric" value={minute} onChange={e=>setMinute(e.target.value.replace(/\D/g,"").slice(0,3))} placeholder="Minuut" style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border3}`,borderRadius:10,padding:"10px 12px",color:T.text,fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:800,outline:"none",textAlign:"center",letterSpacing:0.5}}/>
          <button onClick={()=>setExtra(!extra)} style={{marginTop:8,padding:"6px 14px",background:extra?hex(c,0.15):"transparent",border:`1px solid ${extra?c:T.border3}`,borderRadius:8,color:extra?c:T.text4,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>+ Blessuretijd</button>
        </div>
      )}
    </div>
  );
}

export function MinRow({ half, setHalf, minute, setMinute, extra, setExtra, color }) {
  const c = color || U;
  const mins = half==="1"?Array.from({length:45},(_,n)=>n+1):half==="2"?Array.from({length:45},(_,n)=>n+46):[];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{display:"flex",gap:8}}>
        {[["1","1e Helft"],["2","2e Helft"]].map(([v,lbl])=>(
          <button key={v} onClick={()=>{setHalf(v===half?"":v);setMinute("");}} style={{flex:1,padding:"13px 10px",background:half===v?hex(c,0.15):"rgba(255,255,255,0.04)",border:`1px solid ${half===v?c:T.border3}`,borderRadius:14,color:half===v?c:T.text3,fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:800,cursor:"pointer",transition:"all 0.18s",boxShadow:half===v?`0 0 14px ${hex(c,0.25)}`:"none"}}>{lbl}</button>
        ))}
      </div>
      {half && (
        <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border2}`,borderRadius:16,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Minuut</div>
          <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:10}}>
            <div style={{display:"flex",gap:5,width:"max-content",paddingBottom:2}}>
              {mins.map(m=>(
                <button key={m} onClick={()=>setMinute(minute===String(m)?"":String(m))} style={{width:34,height:32,borderRadius:8,flexShrink:0,background:minute===String(m)?c:"rgba(255,255,255,0.05)",border:`1px solid ${minute===String(m)?c:T.border2}`,color:minute===String(m)?"#000":T.text3,fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:800,cursor:"pointer",transition:"all 0.12s"}}>{m}</button>
              ))}
            </div>
          </div>
          <button onClick={()=>setExtra(!extra)} style={{padding:"6px 14px",background:extra?hex(c,0.15):"transparent",border:`1px solid ${extra?c:T.border3}`,borderRadius:8,color:extra?c:T.text4,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",transition:"all 0.18s"}}>+ Blessuretijd</button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SHEETS
══════════════════════════════════════════════ */
export function Sheet({ title, onClose, children, accentColor }) {
  const c = accentColor || T.green;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(16px)",padding:"20px 16px"}}>
      <div style={{background:`linear-gradient(160deg,${T.bg3} 0%,${T.bg2} 100%)`,borderRadius:28,width:"100%",maxWidth:420,border:`1px solid ${T.border3}`,boxShadow:`0 40px 100px rgba(0,0,0,0.8),inset 0 1px 0 ${T.border2}`,maxHeight:"88vh",overflowY:"auto",animation:"slideUp 0.2s cubic-bezier(0.4,0,0.2,1)"}}>
        <div style={{height:3,background:`linear-gradient(90deg,${c},${hex(c,0.3)},transparent)`,borderRadius:"28px 28px 0 0"}} />
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 16px"}}>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,color:T.text,letterSpacing:0.3}}>{title}</span>
          <button onClick={onClose} style={{width:36,height:36,background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border3}`,borderRadius:12,color:T.text3,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{padding:"0 24px 28px"}}>{children}</div>
      </div>
    </div>
  );
}

export function ConfirmSheet({ message, onConfirm, onCancel }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,backdropFilter:"blur(16px)",padding:24}}>
      <div style={{background:`linear-gradient(135deg,${T.bg3} 0%,${T.bg2} 100%)`,borderRadius:28,padding:32,maxWidth:340,width:"100%",border:`1px solid ${T.border3}`,textAlign:"center",boxShadow:"0 40px 100px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.06)"}}>
        <div style={{fontSize:44,marginBottom:14,lineHeight:1}}>🏁</div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,color:T.text,marginBottom:10,lineHeight:1.3}}>{message}</div>
        <div style={{fontSize:13,color:T.text3,marginBottom:28,lineHeight:1.6}}>Dit kan niet ongedaan worden gemaakt.</div>
        <div style={{display:"flex",gap:12}}>
          <button onClick={onCancel} style={{flex:1,padding:15,background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border3}`,borderRadius:16,color:T.text2,fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,cursor:"pointer"}}>Annuleren</button>
          <button onClick={onConfirm} style={{flex:1,padding:15,background:T.red,border:"none",borderRadius:16,color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:800,cursor:"pointer",boxShadow:`0 8px 24px ${hex(T.red,0.4)}`}}>Beëindigen</button>
        </div>
      </div>
    </div>
  );
}

export function GoalSheet({ type, onAdd, onClose, squad, C, liveMinute, paused }) {
  const isOwn = type==="OWN";
  const c = isOwn ? T.red : C;
  const [half,setHalf]=useState(""); const [min,setMin]=useState(""); const [xt,setXt]=useState(false);
  const [player,setPlayer]=useState(""); const [assist,setAssist]=useState(""); const [gtype,setGtype]=useState("");
  return (
    <Sheet title={isOwn?"⚽ Tegendoelpunt":"⚽ Doelpunt"} onClose={onClose} accentColor={c}>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <AutoMinRow liveMinute={liveMinute} paused={paused} half={half} setHalf={setHalf} minute={min} setMinute={setMin} extra={xt} setExtra={setXt} color={c} />
        {!isOwn && (
          <div style={{display:"flex",gap:10}}>
            <PlayerSelect value={player} onChange={setPlayer} squad={squad} placeholder="Scorer" />
            <PlayerSelect value={assist} onChange={setAssist} squad={squad} placeholder="Assist" />
          </div>
        )}
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {(isOwn?AWAY_TYPES:GOAL_TYPES).map(t=><Chip key={t} label={t} active={gtype===t} onClick={()=>setGtype(gtype===t?"":t)} color={c} xs />)}
        </div>
        <button onClick={()=>{
          const fHalf = half || (liveMinute>45?"2":"1");
          const fMin = min || (liveMinute>0?String(liveMinute):"");
          onAdd({id:Date.now(),type,half:fHalf,minute:fMin,extra:xt,player,assist,goalType:gtype});onClose();
        }} style={{width:"100%",padding:18,background:isOwn?T.red:C,border:"none",borderRadius:18,fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:900,color:isOwn?"#fff":"#000",cursor:"pointer",textTransform:"uppercase",letterSpacing:1.2,marginTop:4,boxShadow:`0 12px 32px ${hex(c,0.4)}`}}>
          ✓ Registreren
        </button>
      </div>
    </Sheet>
  );
}

export function CardSheet({ type, onAdd, onClose, squad, liveMinute, paused, opponent, openMoment, defaultOpponent }) {
  const isRed = type==="RED";
  const c = isRed ? T.red : T.yellow;
  const [half,setHalf]=useState(""); const [min,setMin]=useState(""); const [xt,setXt]=useState(false);
  const [player,setPlayer]=useState("");
  const [reason,setReason]=useState("");
  const [isOpponent,setIsOpponent]=useState(defaultOpponent||false);
  const canSubmit = isRed ? (!!reason && (isOpponent || !!player)) : (isOpponent || !!player);
  const showPenaltyHint = isRed && reason==="Overtreding in de 16";
  return (
    <Sheet title={isRed?"🟥 Rode kaart":"🟨 Gele kaart"} onClose={onClose} accentColor={c}>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <AutoMinRow liveMinute={liveMinute} paused={paused} half={half} setHalf={setHalf} minute={min} setMinute={setMin} extra={xt} setExtra={setXt} color={c} />

        {/* Wie krijgt de kaart? */}
        <div style={{display:"flex",gap:8}}>
          <Chip label="🏠 Eigen team" active={!isOpponent} onClick={()=>setIsOpponent(false)} color={c} />
          <Chip label="✈️ Tegenstander" active={isOpponent} onClick={()=>{setIsOpponent(true); setPlayer("");}} color={c} />
        </div>

        {!isOpponent && <PlayerSelect value={player} onChange={setPlayer} squad={squad} placeholder="Speler..." />}

        {isRed && (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:10,color:T.red,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:2,textTransform:"uppercase"}}>Reden</span>
              <span style={{fontSize:9,padding:"2px 7px",background:hex(T.red,0.15),border:`1px solid ${hex(T.red,0.3)}`,borderRadius:6,color:T.red,fontWeight:700,letterSpacing:0.5,fontFamily:"'Barlow Condensed',sans-serif"}}>verplicht</span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {RED_REASONS.map(r=>(
                <Chip key={r} label={r} active={reason===r} onClick={()=>setReason(reason===r?"":r)} color={c} xs />
              ))}
            </div>
          </div>
        )}

        {showPenaltyHint && (
          <div style={{background:hex(T.red,0.08),border:`1px solid ${hex(T.red,0.25)}`,borderRadius:12,padding:"12px 14px"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:openMoment?10:0}}>
              <span style={{fontSize:18,lineHeight:1}}>⚠️</span>
              <div style={{flex:1,fontSize:12,color:T.text2,fontFamily:"Barlow,sans-serif",lineHeight:1.5}}>
                <strong style={{color:T.red,fontWeight:800}}>Overtreding in de 16 leidt vaak tot een strafschop.</strong>
                {" "}{isOpponent?"Vergeet niet je doelpunt of gemiste penalty te registreren.":"De tegenstander krijgt mogelijk een strafschop."}
              </div>
            </div>
            {openMoment && (
              <button onClick={()=>{onClose(); openMoment({key:"penalty_miss",icon:"🥅",label:"Penalty gemist",needsPlayer:true});}} style={{width:"100%",padding:"10px 12px",background:hex(T.red,0.15),border:`1px solid ${hex(T.red,0.3)}`,borderRadius:10,color:T.red,fontSize:12,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,letterSpacing:0.5,cursor:"pointer"}}>
                + Wedstrijdmoment toevoegen
              </button>
            )}
          </div>
        )}

        <button
          disabled={!canSubmit}
          onClick={()=>{
            if (!canSubmit) return;
            const fHalf = half || (liveMinute>45?"2":"1");
            const fMin = min || (liveMinute>0?String(liveMinute):"");
            const finalPlayer = isOpponent ? (opponent||"Tegenstander") : player;
            onAdd({id:Date.now(),type,half:fHalf,minute:fMin,extra:xt,player:finalPlayer,reason:isRed?reason:undefined,isOpponent});
            onClose();
          }}
          style={{width:"100%",padding:18,background:canSubmit?c:"rgba(255,255,255,0.04)",border:`1px solid ${canSubmit?"transparent":T.border3}`,borderRadius:18,fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:900,letterSpacing:1,color:canSubmit?"#000":T.text4,cursor:canSubmit?"pointer":"not-allowed"}}
        >
          {canSubmit ? "✓ Registreren" : (isRed && !reason ? "Kies eerst een reden" : "Kies eerst een speler")}
        </button>
      </div>
    </Sheet>
  );
}


export function SubSheet({ onAdd, onClose, activeSquad, benchSquad, C, liveMinute, paused }) {
  const [half,setHalf]=useState(""); const [min,setMin]=useState(""); const [xt,setXt]=useState(false);
  const [out,setOut]=useState(""); const [inn,setInn]=useState("");
  return (
    <Sheet title="🔄 Wissel" onClose={onClose} accentColor={C}>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <AutoMinRow liveMinute={liveMinute} paused={paused} half={half} setHalf={setHalf} minute={min} setMinute={setMin} extra={xt} setExtra={setXt} color={U} />
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:10,alignItems:"end"}}>
          <div>
            <div style={{fontSize:10,color:T.red,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>↓ Eraf</div>
            <PlayerSelect value={out} onChange={setOut} squad={activeSquad} placeholder="Speler eraf" />
          </div>
          <div style={{fontSize:24,color:T.text4,paddingBottom:6,textAlign:"center",lineHeight:1}}>⇄</div>
          <div>
            <div style={{fontSize:10,color:T.green,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>↑ Erin</div>
            <PlayerSelect value={inn} onChange={setInn} squad={benchSquad} placeholder="Speler erin" />
          </div>
        </div>
        <button onClick={()=>{
          const fHalf = half || (liveMinute>45?"2":"1");
          const fMin = min || (liveMinute>0?String(liveMinute):"");
          onAdd({id:Date.now(),type:"SUB",half:fHalf,minute:fMin,extra:xt,playerOut:out,playerIn:inn});onClose();
        }} style={{width:"100%",padding:18,background:U,border:"none",borderRadius:18,fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:900,color:"#000",cursor:"pointer",textTransform:"uppercase",letterSpacing:1.2,marginTop:4,boxShadow:`0 12px 32px ${hex(U,0.4)}`}}>
          ✓ Wissel registreren
        </button>
      </div>
    </Sheet>
  );
}

export function MomentSheet({ config, liveMinute, squad, C, clubName, onClose, onAdd }) {
  const [min, setMin] = useState(liveMinute > 0 ? String(liveMinute) : "");
  const [player, setPlayer] = useState("");
  const [player2, setPlayer2] = useState("");
  const [team, setTeam] = useState("wij");
  const [editing, setEditing] = useState(false);
  const showPlayer = config.teamChoice ? (team === "wij") : config.needsPlayer;
  return (
    <Sheet title={`${config.icon} ${config.label}`} onClose={onClose} accentColor={C}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:hex(U,0.08),border:`1px solid ${hex(U,0.25)}`,borderRadius:12,padding:"10px 12px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{minWidth:48,padding:"5px 8px",background:hex(U,0.18),borderRadius:8,border:`1px solid ${hex(U,0.3)}`,textAlign:"center"}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:900,color:U,lineHeight:1}}>{min||"—"}'</div>
          </div>
          <div style={{flex:1,fontSize:11,color:T.text3,fontFamily:"Barlow,sans-serif"}}>Live timer wordt automatisch gebruikt</div>
          <button onClick={()=>setEditing(!editing)} style={{background:"none",border:`1px solid ${T.border3}`,borderRadius:8,padding:"4px 9px",color:T.text4,fontSize:10,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{editing?"✓":"✏️"}</button>
        </div>
        {editing && (
          <input type="number" inputMode="numeric" value={min} onChange={e=>setMin(e.target.value.replace(/\D/g,"").slice(0,3))} placeholder="Minuut" style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border3}`,borderRadius:10,padding:"10px 12px",color:T.text,fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:800,outline:"none",textAlign:"center"}}/>
        )}
        {config.teamChoice && (
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setTeam("wij")} style={{flex:1,padding:"11px",borderRadius:10,fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:900,cursor:"pointer",letterSpacing:0.5,border:team==="wij"?"none":`1px solid ${T.border3}`,background:team==="wij"?U:"rgba(255,255,255,0.04)",color:team==="wij"?"#000":T.text3}}>{clubName||"Wij"}</button>
            <button onClick={()=>setTeam("tegenstander")} style={{flex:1,padding:"11px",borderRadius:10,fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:900,cursor:"pointer",letterSpacing:0.5,border:team==="tegenstander"?"none":`1px solid ${T.border3}`,background:team==="tegenstander"?U:"rgba(255,255,255,0.04)",color:team==="tegenstander"?"#000":T.text3}}>Tegenstander</button>
          </div>
        )}
        {showPlayer && (
          <PlayerSelect value={player} onChange={setPlayer} squad={squad} placeholder={config.needsPlayer2?"Geblesseerde speler":"Speler..."} />
        )}
        {config.needsPlayer2 && (
          <PlayerSelect value={player2} onChange={setPlayer2} squad={squad} placeholder="Wisselspeler erin" />
        )}
        <button onClick={()=>onAdd({type:config,minute:min,player:showPlayer?player:"",player2,team:config.ownOnly?"wij":team})} style={{width:"100%",padding:16,background:U,border:"none",borderRadius:16,fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:900,color:"#000",cursor:"pointer",textTransform:"uppercase",letterSpacing:1,boxShadow:`0 12px 32px ${hex(U,0.4)}`}}>
          ✓ Toevoegen
        </button>
      </div>
    </Sheet>
  );
}

/* ══════════════════════════════════════════════
   MATCH HEADER
══════════════════════════════════════════════ */
export function MatchHeader({ clubName, opponent, homeScore, awayScore, status, elapsed, paused, clubLogo, hvLogoUrl, oppLogoUrl, C, sec, setElapsed, adjustTime }) {
  const isLive = status==="LIVE";
  const isDone = status==="FINISHED";
  const homeLogo = (clubLogo && clubLogo.trim()) || (hvLogoUrl && hvLogoUrl.trim()) || null;
  const oppLogo = (oppLogoUrl && oppLogoUrl.trim()) || null;
  const [homeFailed, setHomeFailed] = useState(false);
  const [oppFailed, setOppFailed] = useState(false);
  const [timeAdjustOpen, setTimeAdjustOpen] = useState(false);
  // Reset failed-states als de logo-URL verandert
  useEffect(() => { setHomeFailed(false); }, [homeLogo]);
  useEffect(() => { setOppFailed(false); }, [oppLogo]);
  return (
    <div style={{background:`linear-gradient(180deg,${T.bg0} 0%,${T.bg1} 100%)`,borderBottom:`1px solid ${T.border2}`,padding:"18px 20px 16px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"40%",left:"50%",transform:"translate(-50%,-50%)",width:280,height:160,borderRadius:"50%",background:hex(U,0.06),filter:"blur(40px)",pointerEvents:"none"}} />
      {isLive && <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${U},transparent)`,opacity:0.6}} />}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:isLive && timeAdjustOpen?8:16}}>
        <div style={{display:"flex",alignItems:"center",gap:7,background:isLive?(paused?hex("#ffc107",0.15):hex(T.red,0.12)):isDone?hex(U,0.1):"rgba(255,255,255,0.04)",border:`1px solid ${isLive?(paused?hex("#ffc107",0.4):hex(T.red,0.3)):isDone?hex(U,0.25):T.border2}`,borderRadius:100,padding:"5px 14px"}}>
          {isLive && !paused && <div style={{width:6,height:6,borderRadius:"50%",background:T.red,animation:"pulseDot 1.4s ease-in-out infinite"}} />}
          {isLive && paused && <span style={{fontSize:10}}>⏸</span>}
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:800,letterSpacing:3,color:isLive?(paused?"#ffc107":T.red):isDone?U:T.text3,textTransform:"uppercase"}}>
            {isLive?(paused?"PAUZE":"LIVE"):isDone?"AFGELOPEN":"AANKOMEND"}
          </span>
          {isLive && elapsed>0 && <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,color:T.text3}}>• {elapsed}'</span>}
          {isLive && adjustTime && (
            <button onClick={()=>setTimeAdjustOpen(o=>!o)} title="Wedstrijdtijd aanpassen" style={{background:timeAdjustOpen?hex(U,0.25):"transparent",border:"none",cursor:"pointer",padding:"2px 5px",marginLeft:2,borderRadius:100,fontSize:11,lineHeight:1,color:T.text3}}>
              {timeAdjustOpen?"✕":"✏️"}
            </button>
          )}
        </div>
      </div>
      {isLive && timeAdjustOpen && adjustTime && (
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:6,marginBottom:14}}>
          <button onClick={()=>adjustTime(-5)} title="5 minuten terug" style={{padding:"5px 10px",background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border2}`,borderRadius:8,color:T.text2,fontSize:11,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:"pointer"}}>−5</button>
          <button onClick={()=>adjustTime(-1)} title="1 minuut terug" style={{padding:"5px 10px",background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border2}`,borderRadius:8,color:T.text2,fontSize:11,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:"pointer"}}>−1</button>
          <button onClick={()=>adjustTime(1)} title="1 minuut vooruit" style={{padding:"5px 10px",background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border2}`,borderRadius:8,color:T.text2,fontSize:11,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:"pointer"}}>+1</button>
          <button onClick={()=>adjustTime(5)} title="5 minuten vooruit" style={{padding:"5px 10px",background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border2}`,borderRadius:8,color:T.text2,fontSize:11,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:"pointer"}}>+5</button>
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
        {/* Home */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:7}}>
          {homeLogo && !homeFailed
            ? <img src={homeLogo} onError={()=>setHomeFailed(true)} style={{width:44,height:44,objectFit:"contain",background:"#fff",borderRadius:12,padding:3,boxShadow:"0 4px 16px rgba(0,0,0,0.4)"}} />
            : <div style={{width:44,height:44,background:`linear-gradient(135deg,${C},${sec==="#ffffff"?hex(C,0.6):sec})`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:15,color:"#000",boxShadow:`0 4px 16px ${hex(U,0.35)}`}}>
                {clubName.replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase()}
              </div>
          }
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,color:T.text3,letterSpacing:1,textAlign:"center",maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{clubName.toUpperCase()}</span>
        </div>
        {/* Score */}
        <div style={{display:"flex",alignItems:"center",gap:2,flex:"0 0 auto"}}>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:72,fontWeight:900,color:T.text,lineHeight:1,letterSpacing:-4,textShadow:isLive?`0 0 40px ${hex(C,0.5)}`:"none"}}>{homeScore}</span>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,fontWeight:300,color:T.text4,margin:"0 4px",letterSpacing:0,lineHeight:1}}>:</span>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:72,fontWeight:900,color:T.text,lineHeight:1,letterSpacing:-4}}>{awayScore}</span>
        </div>
        {/* Away — now shows opponent logo if found */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:7}}>
          {oppLogo && !oppFailed
            ? <img src={oppLogo} onError={()=>setOppFailed(true)} style={{width:44,height:44,objectFit:"contain",background:"#fff",borderRadius:12,padding:3,boxShadow:"0 4px 16px rgba(0,0,0,0.4)"}} />
            : <div style={{width:44,height:44,background:"rgba(255,255,255,0.06)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${T.border2}`,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:15,color:T.text3}}>
                {(opponent||"TG").replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase()||"TG"}
              </div>
          }
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,color:T.text3,letterSpacing:1,textAlign:"center",maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{(opponent||"TEGENSTANDER").toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   TIMELINE ROW
══════════════════════════════════════════════ */
// Helper: formatteer minuut + extra/half naar leesbare weergave
// "23" niet-extra → "23'"
// "5" extra h=1 → "45+5'"
// "3" extra h=2 → "90+3'"
export function formatMinuut(minute, extra, half) {
  if (!minute && minute !== 0) return "";
  const m = String(minute);
  if (!extra) return `${m}'`;
  const base = half === "2" ? 90 : 45;
  return `${base}+${m}'`;
}

export function TimelineRow({ e, onDelete, live, C }) {
  const cfgs = {
    GOAL:{icon:"⚽",color:U,label:"Doelpunt"},
    OWN:{icon:"⚽",color:T.red,label:"Tegendoelpunt"},
    YELLOW:{icon:"🟨",color:T.yellow,label:"Gele kaart"},
    RED:{icon:"🟥",color:T.red,label:"Rode kaart"},
    SUB:{icon:"🔄",color:"#8888aa",label:"Wissel"},
  };
  const cf = cfgs[e.type]||{icon:"📝",color:T.text3,label:"Notitie"};
  return (
    <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0",borderBottom:`1px solid ${T.border}`}}>
      <div style={{width:42,flexShrink:0,textAlign:"right"}}>
        {e.minute ? <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:800,color:T.text3,letterSpacing:-0.5}}>{formatMinuut(e.minute,e.extra,e.half)}</span> : <span style={{fontSize:18}}>{cf.icon}</span>}
      </div>
      <div style={{width:9,height:9,borderRadius:"50%",background:cf.color,flexShrink:0,boxShadow:`0 0 8px ${hex(cf.color,0.7)}`}} />
      <div style={{flex:1,minWidth:0}}>
        {e.type==="SUB"
          ? <div style={{display:"flex",alignItems:"center",gap:8,fontSize:14,fontFamily:"Barlow,sans-serif"}}>
              <span style={{color:T.red,fontWeight:600}}>{e.playerOut||"—"}</span>
              <span style={{color:T.text4,fontSize:12}}>→</span>
              <span style={{color:T.green,fontWeight:600}}>{e.playerIn||"—"}</span>
            </div>
          : <div style={{fontFamily:"Barlow,sans-serif"}}>
              <span style={{fontSize:14,color:T.text,fontWeight:600}}>{e.player||""}</span>
              {e.assist && <span style={{fontSize:12,color:T.text3,marginLeft:8}}>({e.assist})</span>}
              {!e.player&&e.goalType && <span style={{fontSize:13,color:T.text3}}>{e.goalType}</span>}
            </div>
        }
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3,flexWrap:"wrap"}}>
          <span style={{fontSize:10,color:cf.color,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:1,textTransform:"uppercase"}}>{cf.label}</span>
          {e.goalType&&e.player && <span style={{fontSize:10,color:T.text4,fontFamily:"Barlow,sans-serif"}}>• {e.goalType}</span>}
          {e.reason && <span style={{fontSize:10,color:T.text4,fontFamily:"Barlow,sans-serif"}}>• {e.reason}</span>}
          {e.half && <span style={{fontSize:10,color:T.text4,fontFamily:"Barlow,sans-serif"}}>• {e.half}e helft</span>}
        </div>
      </div>
      {live && <button onClick={()=>onDelete(e.id)} style={{background:"none",border:"none",color:T.text4,cursor:"pointer",fontSize:20,padding:"4px 8px",flexShrink:0,lineHeight:1,transition:"color 0.15s"}}>×</button>}
    </div>
  );
}

export function GCard({ icon, label, sub, count, onClick, accent, disabled, labelSize, progress, progressMax }) {
  const hasProgress = typeof progress === "number" && typeof progressMax === "number" && progressMax > 0;
  const pct = hasProgress ? Math.round((progress / progressMax) * 100) : 0;
  return (
    <button onClick={disabled?undefined:onClick} style={{background:accent?`linear-gradient(135deg,${hex(accent,0.08)} 0%,${T.bg3} 100%)`:T.bg3,border:`1px solid ${accent?hex(accent,0.22):T.border2}`,borderRadius:22,padding:"20px 18px",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:10,cursor:disabled?"default":"pointer",position:"relative",overflow:"hidden",opacity:disabled?0.35:1,textAlign:"left",transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)",boxShadow:accent?`0 4px 24px ${hex(accent,0.12)},inset 0 1px 0 ${hex(accent,0.15)}`:`inset 0 1px 0 ${T.border}`,width:"100%"}}>
      {accent && <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${accent},${hex(accent,0.4)},transparent)`,borderRadius:"22px 22px 0 0"}} />}
      {count>0 && <div style={{position:"absolute",top:14,right:14,background:accent||"rgba(255,255,255,0.1)",borderRadius:20,padding:"3px 9px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,color:accent?"#000":T.text2,border:accent?"none":`1px solid ${T.border2}`,boxShadow:accent?`0 2px 8px ${hex(accent,0.4)}`:"none"}}>{count}</div>}
      <div style={{lineHeight:1,filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.5))"}}>{icon}</div>
      <div style={{minWidth:0,width:"100%"}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:labelSize||16,fontWeight:800,color:T.text,letterSpacing:0.3,lineHeight:1.2,wordBreak:"break-word",hyphens:"auto",overflowWrap:"break-word"}}>{label}</div>
        {sub && <div style={{fontSize:11,color:T.text4,marginTop:4,fontFamily:"Barlow,sans-serif",lineHeight:1.3}}>{sub}</div>}
      </div>
      {hasProgress && (
        <div style={{width:"100%",marginTop:2}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <span style={{fontSize:9,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:1,color:pct===100?accent:T.text4,textTransform:"uppercase"}}>
              {pct===100?"✓ Volledig ingevuld":`${progress}/${progressMax} fases`}
            </span>
            <span style={{fontSize:9,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,color:pct===100?accent:T.text4}}>{pct}%</span>
          </div>
          <div style={{width:"100%",height:4,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:pct===100?accent:`linear-gradient(90deg,${hex(accent,0.5)},${accent})`,borderRadius:4,transition:"width 0.4s cubic-bezier(0.4,0,0.2,1)",boxShadow:pct>0?`0 0 6px ${hex(accent,0.5)}`:"none"}} />
          </div>
        </div>
      )}
    </button>
  );
}

export function SHead({ label, C }) {
  return (
    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:800,letterSpacing:3,color:U||T.green,textTransform:"uppercase",marginBottom:12,marginTop:24,opacity:0.7,display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:20,height:1,background:U||T.green,opacity:0.4}} />
      {label}
    </div>
  );
}

export const INP = {
  width:"100%",background:"rgba(255,255,255,0.04)",
  border:`1px solid ${T.border3}`,borderRadius:14,
  padding:"14px 16px",color:T.text,
  fontFamily:"Barlow,sans-serif",fontSize:14,outline:"none",marginBottom:12,
  appearance:"none",backdropFilter:"blur(8px)",boxSizing:"border-box",
};

export function Empty({ icon, label }) {
  return (
    <div style={{textAlign:"center",padding:"60px 0"}}>
      <div style={{fontSize:40,marginBottom:12,opacity:0.15,filter:"grayscale(100%)"}}>{icon}</div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:2.5,textTransform:"uppercase",color:T.text4}}>{label}</div>
    </div>
  );
}

export function PBtn({ label, onClick, disabled, color, textColor, icon }) {
  const c = color||U;
  return (
    <button onClick={disabled?undefined:onClick} style={{width:"100%",padding:"18px 24px",background:disabled?"rgba(255,255,255,0.04)":(color?c:M.gradD),border:`1px solid ${disabled?T.border2:"transparent"}`,borderRadius:100,fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:900,color:disabled?T.text4:textColor||"#fff",cursor:disabled?"default":"pointer",textTransform:"uppercase",letterSpacing:1.2,boxShadow:disabled?"none":`0 12px 40px ${hex(c,0.45)},inset 0 1px 0 rgba(255,255,255,0.25)`,transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
      {icon&&<span style={{fontSize:20}}>{icon}</span>}{label}
    </button>
  );
}

export function BackBtn({ onClick, label }) {
  return (
    <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:T.text3,fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,letterSpacing:0.5,padding:"0 0 16px 0",textTransform:"uppercase",transition:"color 0.15s"}}>
      <span style={{fontSize:16,lineHeight:1}}>←</span> {label||"Terug"}
    </button>
  );
}

/* ══════════════════════════════════════════════
   CLUB NAV CARD (for club sub-screens)
══════════════════════════════════════════════ */
export function ClubCard({ emoji, label, sub, badge, onClick, C }) {
  return (
    <button onClick={onClick} style={{background:T.bg3,border:`1px solid ${T.border2}`,borderRadius:22,padding:"22px 18px",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:10,cursor:"pointer",position:"relative",overflow:"hidden",textAlign:"left",transition:"all 0.2s",boxShadow:`inset 0 1px 0 ${T.border}`,width:"100%"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${U},${hex(U,0.3)},transparent)`,borderRadius:"22px 22px 0 0",opacity:0.6}} />
      {badge>0 && <div style={{position:"absolute",top:14,right:14,background:hex(U,0.15),border:`1px solid ${hex(U,0.3)}`,borderRadius:20,padding:"3px 10px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,color:U}}>{badge}</div>}
      <div style={{fontSize:28,lineHeight:1}}>{emoji}</div>
      <div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:800,color:T.text,letterSpacing:0.3,lineHeight:1.2}}>{label}</div>
        {sub && <div style={{fontSize:11,color:T.text4,marginTop:5,fontFamily:"Barlow,sans-serif"}}>{sub}</div>}
      </div>
      <div style={{alignSelf:"flex-end",color:T.text4,fontSize:18,marginTop:-6}}>›</div>
    </button>
  );
}

/* ══════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════ */
