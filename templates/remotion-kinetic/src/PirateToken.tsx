// « Jeton de la Boutique Pirate » — TikTok 10 s, 9:16, 60 fps.
// Habillage motion original autour des CAPTURES DE JEU de l'utilisateur (aucun faux jeton dessiné).
// Props : chestClip (ouverture de coffre), tokenClip (le jeton à l'écran), chestsClip (coffres en rafale).
// Sans clip → carte « CAPTURE À INSÉRER » (version brouillon uniquement, jamais publiée).
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, random, Easing} from 'remotion';

export type PirateProps = {
  chestClip?: string; chestStart?: number;
  tokenClip?: string; tokenStart?: number;
  chestsClip?: string; chestsStart?: number;
  audio?: string;
  odds?: string; // texte du chiffre officiel
  source?: string;
};
export const pirateDefaults: PirateProps = {odds: '137 500', source: 'Taux officiel Epic Games · par coffre'};

const GOLD = '#FFC93C', YEL = '#FFE600', BLUE = '#1EA7FF', RED = '#FE2C55';
const FONT = 'AntonLocal';

const fontCss = `@font-face{font-family:'${FONT}';src:url('${staticFile('fonts/anton.woff2')}') format('woff2');font-weight:400;}`;

// ---------- utilitaires temps (en secondes) ----------
const useT = () => { const f = useCurrentFrame(); const {fps} = useVideoConfig(); return {t: f / fps, f, fps}; };
const between = (t: number, a: number, b: number) => t >= a && t < b;
const pop = (t: number, at: number, fps: number, damping = 9) =>
  t < at ? 0 : spring({frame: Math.round((t - at) * fps), fps, config: {damping, stiffness: 220, mass: 0.6}});
// tremblement amorti après chaque impact
const IMPACTS = [0, 0.55, 1.2, 2.0, 4.25, 5.95, 8.0, 9.85];
const shakeAt = (t: number) => {
  let amp = 0;
  for (const i of IMPACTS) if (t >= i) amp = Math.max(amp, 26 * Math.exp(-(t - i) * 9));
  return {x: amp * Math.sin(t * 93), y: amp * Math.cos(t * 71), r: amp * 0.05 * Math.sin(t * 57)};
};
const flashAt = (t: number) => {
  let o = 0;
  for (const i of [0, 1.2, 2.0, 4.25, 5.95, 8.0]) if (t >= i) o = Math.max(o, Math.exp(-(t - i) * 14));
  if (t > 9.85) o = Math.max(o, (t - 9.85) / 0.15); // dernier frame = flash blanc = premier frame → boucle
  return Math.min(1, o);
};

// ---------- texte massif blanc contour noir ----------
const Big: React.FC<{children: React.ReactNode; size: number; color?: string; s?: number; y?: number; rot?: number; o?: number}> =
  ({children, size, color = '#fff', s = 1, y = 0, rot = 0, o = 1}) => (
    <div style={{position: 'absolute', left: 40, right: 40, top: `calc(50% + ${y}px)`, transform: `translateY(-50%) scale(${s}) rotate(${rot}deg)`,
      textAlign: 'center', fontFamily: FONT, fontSize: size, lineHeight: 0.98, color, opacity: o, textTransform: 'uppercase',
      WebkitTextStroke: `${Math.round(size * 0.11)}px #000`, paintOrder: 'stroke fill', letterSpacing: 1,
      filter: 'drop-shadow(0 10px 0 rgba(0,0,0,0.85)) drop-shadow(0 0 30px rgba(0,0,0,0.6))'}}>{children}</div>
  );
const Emo: React.FC<{c: string}> = ({c}) => <span style={{fontFamily: 'Noto Color Emoji', WebkitTextStroke: 0}}>{c}</span>;

// ---------- capture de jeu (ou carte brouillon) ----------
const Clip: React.FC<{src?: string; start?: number; label: string; zoom: number}> = ({src, start = 0, label, zoom}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{transform: `scale(${zoom})`}}>
      {src ? <OffthreadVideo src={staticFile(src)} startFrom={Math.round(start * fps)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        : <AbsoluteFill style={{background: 'repeating-linear-gradient(45deg,#101624 0 40px,#0b0f18 40px 80px)', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{border: '6px dashed #ffffff55', borderRadius: 30, padding: '30px 40px', color: '#ffffff88', fontFamily: 'Inter', fontWeight: 800, fontSize: 46, textAlign: 'center'}}>
              CAPTURE À INSÉRER<br />{label}</div>
          </AbsoluteFill>}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.75) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------- particules dorées / explosion ----------
const Burst: React.FC<{t: number; at: number; n?: number; color?: string; cy?: number}> = ({t, at, n = 46, color = GOLD, cy = 960}) => {
  if (t < at || t > at + 1.2) return null;
  const k = t - at;
  return <>{Array.from({length: n}).map((_, i) => {
    const a = random(`a${at}${i}`) * Math.PI * 2, v = 700 + random(`v${at}${i}`) * 1500;
    const x = 540 + Math.cos(a) * v * k, y = cy + Math.sin(a) * v * k + 900 * k * k;
    const sz = 8 + random(`s${at}${i}`) * 22;
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: sz, height: sz, borderRadius: i % 3 ? '50%' : 3,
      background: i % 4 === 0 ? '#fff' : color, opacity: Math.max(0, 1 - k / 1.2), boxShadow: `0 0 18px ${color}`, transform: `rotate(${k * 600 + i * 20}deg)`}} />;
  })}</>;
};
const Dust: React.FC<{t: number}> = ({t}) => <>{Array.from({length: 40}).map((_, i) => {
  const x = random(`dx${i}`) * 1080, sp = 40 + random(`ds${i}`) * 120, y = (random(`dy${i}`) * 2100 - t * sp) % 2100;
  return <div key={i} style={{position: 'absolute', left: x, top: (y + 2100) % 2100 - 90, width: 6, height: 6, borderRadius: 3,
    background: i % 2 ? GOLD : BLUE, opacity: 0.35 + 0.35 * Math.sin(t * 3 + i), boxShadow: `0 0 12px ${i % 2 ? GOLD : BLUE}`}} />;
})}</>;

// ---------- aura de rayons dorés ----------
const Rays: React.FC<{t: number; o: number; size?: number}> = ({t, o, size = 1500}) => (
  <div style={{position: 'absolute', left: 540 - size / 2, top: 900 - size / 2, width: size, height: size, opacity: o, borderRadius: '50%',
    background: `repeating-conic-gradient(from ${t * 40}deg, ${GOLD}55 0deg 8deg, transparent 8deg 22deg)`,
    WebkitMaskImage: 'radial-gradient(circle, #000 15%, transparent 70%)', maskImage: 'radial-gradient(circle, #000 15%, transparent 70%)'}} />
);

// ---------- rouleaux de jackpot ----------
const Reels: React.FC<{t: number; text: string; start: number}> = ({t, text, start}) => {
  const chars = text.split('');
  let di = 0;
  return (
    <div style={{display: 'flex', justifyContent: 'center', gap: 10}}>
      {chars.map((ch, i) => {
        if (ch === ' ') return <div key={i} style={{width: 26}} />;
        const stop = start + 0.25 + (di++) * 0.14;
        const spinning = t < stop;
        const shown = spinning ? String(Math.floor(random(`r${i}${Math.floor(t * 30)}`) * 10)) : ch;
        const bounce = spinning ? 0 : 1 - Math.exp(-(t - stop) * 12) * Math.cos((t - stop) * 30);
        return (
          <div key={i} style={{width: 118, height: 170, borderRadius: 18, background: 'linear-gradient(#fff,#ffe9a8 45%,#f2b81c)', border: '7px solid #000',
            boxShadow: `0 8px 0 #000, 0 0 ${spinning ? 10 : 40}px ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
            <div style={{fontFamily: FONT, fontSize: 140, color: '#111', transform: `translateY(${spinning ? Math.sin(t * 90 + i) * 40 : (1 - bounce) * -40}px)`,
              filter: spinning ? 'blur(5px)' : 'none'}}>{shown}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- bouton S'abonner + doigt ----------
const SubButton: React.FC<{t: number; fps: number}> = ({t, fps}) => {
  const enter = pop(t, 5.2, fps, 10);
  const press = 5.95;
  const pressed = t >= press;
  const squish = pressed ? 1 - 0.12 * Math.exp(-(t - press) * 10) * Math.cos((t - press) * 25) : 1;
  const hand = interpolate(t, [5.35, 5.85, 5.95, 6.15, 6.6], [520, 40, 0, 30, 400], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1080, display: 'flex', justifyContent: 'center', transform: `scale(${enter * squish})`}}>
      <div style={{background: pressed ? '#2b2f3a' : RED, color: '#fff', fontFamily: FONT, fontSize: 118, padding: '18px 70px', borderRadius: 26,
        border: '8px solid #000', boxShadow: `0 12px 0 #000, 0 0 ${pressed ? 30 : 70}px ${pressed ? BLUE : RED}`, position: 'relative'}}>
        {pressed ? <>ABONNÉ <Emo c="✅" /></> : <>+ S'ABONNER</>}
        <div style={{position: 'absolute', right: 30, top: 70 + hand, fontSize: 190, fontFamily: 'Noto Color Emoji', transform: 'rotate(-15deg)',
          filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.6))'}}>👆</div>
      </div>
    </div>
  );
};

export const PirateToken: React.FC<PirateProps> = (p) => {
  const {t, fps} = useT();
  const sh = shakeAt(t);
  const fl = flashAt(t);
  // zoom de base : punch à chaque cut
  const punch = (at: number) => (t >= at ? 0.22 * Math.exp(-(t - at) * 6) : 0);

  // ---- fond / captures ----
  let bg: React.ReactNode = null;
  if (t < 0.55) bg = <Clip src={p.chestClip} start={p.chestStart} label="OUVERTURE DE COFFRE" zoom={1.05 + t * 0.9} />; // zoom violent
  else if (t < 2.0) bg = <Clip src={p.tokenClip} start={p.tokenStart} label="LE JETON À L'ÉCRAN" zoom={1.15 + (t - 0.55) * 0.12 + punch(1.2)} />;
  else if (t < 6.6) bg = <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #1a2a55 0%, #05070d 60%, #000 100%)'}} />;
  else if (t < 8.0) {
    const cut = t < 7.05 ? 0 : t < 7.5 ? 1 : 2; // 3 cuts rapides
    bg = <Clip src={p.chestsClip ?? p.chestClip} start={(p.chestsStart ?? p.chestStart ?? 0) + cut * 1.3} label="COFFRES QUI S'OUVRENT" zoom={1.1 + ((t - 6.6) % 0.45) * 0.4} />;
  } else bg = <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #10306a 0%, #04060c 65%)'}} />;

  // jeton en gros plan (2–5 s) : la capture dans un médaillon doré
  const tokenCard = between(t, 2.0, 5.0) && (() => {
    const e = pop(t, 2.0, fps, 8);
    return (
      <div style={{position: 'absolute', left: 540 - 330, top: 330, width: 660, height: 660, borderRadius: '50%', overflow: 'hidden', transform: `scale(${e}) rotate(${Math.sin(t * 2) * 3}deg)`,
        border: `14px solid ${GOLD}`, boxShadow: `0 0 0 8px #000, 0 0 90px ${GOLD}, 0 0 200px ${YEL}88`}}>
        <Clip src={p.tokenClip} start={(p.tokenStart ?? 0) + 0.5} label="LE JETON" zoom={1.25 + (t - 2) * 0.05} />
      </div>
    );
  })();

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <style>{fontCss}</style>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${1.03 + punch(0) * 0.3})`}}>
        {bg}
        <Dust t={t} />
        {between(t, 2.0, 5.0) && <Rays t={t} o={Math.min(1, (t - 2) * 4)} />}
        {tokenCard}
        <Burst t={t} at={0.0} />
        <Burst t={t} at={1.2} color={YEL} />
        <Burst t={t} at={4.25} n={70} cy={1240} />
        <Burst t={t} at={5.95} color={BLUE} cy={1160} />
        <Burst t={t} at={9.0} n={60} color={GOLD} />

        {/* 0–2 s HOOK */}
        {between(t, 0, 0.55) && <Big size={190} s={pop(t, 0.02, fps)} y={-80}>CE <span style={{color: GOLD}}>JETON</span></Big>}
        {between(t, 0.55, 1.2) && <Big size={128} s={pop(t, 0.55, fps)} y={-40}>PEUT T'OFFRIR<br />LA <span style={{color: YEL}}>BOUTIQUE</span></Big>}
        {between(t, 1.2, 2.0) && <Big size={176} s={pop(t, 1.2, fps, 7)} color={GOLD} rot={-4}>GRATUITE <Emo c="🤯" /></Big>}
        {between(t, 1.35, 2.0) && <Big size={84} s={pop(t, 1.35, fps)} y={190}>PENDANT <span style={{color: YEL}}>14 JOURS</span></Big>}

        {/* 2–5 s RARETÉ */}
        {between(t, 2.0, 5.0) && <Big size={104} s={pop(t, 2.15, fps)} y={-760}><span style={{color: GOLD}}>ULTRA</span> RARE</Big>}
        {between(t, 2.6, 5.0) && <Big size={110} s={pop(t, 2.6, fps)} y={220}>1 CHANCE SUR</Big>}
        {between(t, 2.9, 5.0) && <div style={{position: 'absolute', left: 0, right: 0, top: 1260, transform: `scale(${pop(t, 2.9, fps)})`}}><Reels t={t} text={p.odds ?? '137 500'} start={2.9} /></div>}
        {between(t, 4.25, 5.0) && <Big size={220} s={pop(t, 4.25, fps, 6)} y={560} color={YEL} rot={6}>?!</Big>}
        {between(t, 4.25, 5.0) && <div style={{position: 'absolute', bottom: 120, left: 0, right: 0, textAlign: 'center', fontFamily: 'Inter', fontWeight: 700,
          fontSize: 34, color: '#ffffffcc'}}>{p.source}</div>}

        {/* 5–8 s CTA */}
        {between(t, 5.0, 6.6) && <Big size={150} s={pop(t, 5.05, fps)} y={-330}>ABONNE<span style={{color: RED}}>-TOI</span></Big>}
        {between(t, 5.0, 6.6) && <SubButton t={t} fps={fps} />}
        {between(t, 6.6, 8.0) && <Big size={112} s={pop(t, 6.6, fps)} y={-80}>POUR NE PAS<br />RATER NOS<br /><span style={{color: GOLD}}>ASTUCES</span> <span style={{display: 'inline-block', transform: `rotate(${Math.sin(t * 28) * 18}deg)`}}><Emo c="🔔" /></span></Big>}

        {/* 8–10 s OBJECTIF */}
        {between(t, 8.0, 9.0) && <>
          <Big size={100} s={pop(t, 8.0, fps)} y={-330}>OBJECTIF :</Big>
          <Big size={200} s={pop(t, 8.05, fps)} color={GOLD}>{Math.round(interpolate(t, [8.05, 8.8], [0, 10000], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)})).toLocaleString('fr-FR').replace(/ | /g, ' ')}</Big>
          <Big size={110} s={pop(t, 8.15, fps)} y={230}>ABONNÉS <Emo c="🚀" /></Big>
        </>}
        {between(t, 9.0, 10.1) && <Big size={132} s={pop(t, 9.0, fps)}>ON VA LE<br /><span style={{color: GOLD}}>TROUVER</span><br />ENSEMBLE ?</Big>}

        {/* bandeau progression */}
        <div style={{position: 'absolute', left: 0, top: 0, height: 12, width: `${(t / 10) * 100}%`, background: `linear-gradient(90deg, ${BLUE}, ${GOLD})`}} />
      </AbsoluteFill>
      {/* transition « whip » 5.0 s */}
      {between(t, 4.9, 5.12) && <AbsoluteFill style={{background: `linear-gradient(90deg, transparent, ${BLUE}, #fff, ${BLUE}, transparent)`,
        transform: `translateX(${interpolate(t, [4.9, 5.12], [-1200, 1200])}px) skewX(-20deg)`}} />}
      <AbsoluteFill style={{background: '#fff', opacity: fl * 0.85, pointerEvents: 'none'}} />
      {p.audio ? <Audio src={staticFile(p.audio)} /> : null}
    </AbsoluteFill>
  );
};
