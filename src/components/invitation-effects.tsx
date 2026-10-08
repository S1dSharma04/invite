import { useEffect, useRef } from 'react';

export function InvitationEffects({ opened }: { opened: boolean }) {
 const canvasRef = useRef<HTMLCanvasElement>(null);
 useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let width = window.innerWidth, height = window.innerHeight, frame = 0, last = 0, scroll = window.scrollY, impulse = 0;
  const colors = getComputedStyle(document.documentElement);
  const pink = colors.getPropertyValue('--rose').trim(), light = colors.getPropertyValue('--petal-light').trim(), gold = colors.getPropertyValue('--primary').trim();
  type Petal = { x:number; y:number; size:number; speed:number; angle:number; spin:number; phase:number; burst:boolean };
  const make = (randomY = true):Petal => ({x:Math.random()*width,y:randomY?Math.random()*height:-30,size:4+Math.random()*8,speed:15+Math.random()*25,angle:Math.random()*6.28,spin:(Math.random()-.5)*1.5,phase:Math.random()*6.28,burst:false});
  const petals:Petal[] = Array.from({length:width<700?25:42},()=>make());
  const resize=()=>{width=window.innerWidth;height=window.innerHeight; const ratio=Math.min(window.devicePixelRatio,2); canvas.width=width*ratio;canvas.height=height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0)};
  resize();
  const sections = [...document.querySelectorAll<HTMLElement>('[data-scene]')];
  const draw=(time:number)=>{
   const dt=Math.min((time-last)/1000,.04);last=time;
   const current=window.scrollY;impulse+=(Math.max(-12,Math.min(12,(current-scroll)*.12))-impulse)*.08;scroll=current;
   ctx.clearRect(0,0,width,height);
   petals.forEach((p,i)=>{p.y+=(p.speed+impulse*24)*dt;p.x+=(Math.sin(time*.0007+p.phase)*13+impulse*6)*dt;p.angle+=p.spin*dt;
    if(p.y>height+30){Object.assign(p,make(false));} if(p.y<-60)p.y=height+20;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.scale(1,.6+Math.abs(Math.sin(time*.0006+p.phase))*.5);ctx.globalAlpha=p.burst?.9:.58;ctx.fillStyle=i%3===0?light:pink;ctx.beginPath();ctx.moveTo(0,-p.size);ctx.bezierCurveTo(p.size*1.5,-p.size,p.size,p.size,0,p.size*.7);ctx.bezierCurveTo(-p.size,p.size*.3,-p.size*.6,-p.size,0,-p.size);ctx.fill();ctx.restore();
   });
   if(opened) sections.forEach(section=>{const rect=section.getBoundingClientRect();if(rect.bottom< -100||rect.top>height+100)return;const center=(rect.top+rect.height/2-height/2)/height;const entry=Math.max(0,Math.min(1,(height-rect.top)/(height*.6)));section.style.setProperty('--art-y',`${center*65}px`);section.style.setProperty('--art-scale',`${1.06+Math.abs(center)*.025}`);section.style.setProperty('--reveal-y',`${(1-entry)*80}px`);section.style.setProperty('--reveal-scale',`${.92+entry*.08}`);section.style.setProperty('--reveal-opacity',`${.15+entry*.85}`);});
   ctx.fillStyle=gold;ctx.globalAlpha=.3;
   for(let i=0;i<16;i++){const x=((i*193.7)%width)+Math.sin(time*.0003+i)*8;const y=(height-((time*.012+i*119)%height));ctx.beginPath();ctx.arc(x,y,1,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
   frame=requestAnimationFrame(draw);
  };
  const burst=(event:MouseEvent)=>{const target=event.target;if(!(target instanceof Element)||!target.closest('button,a,[data-interactive]'))return;for(let i=0;i<8;i++){const p=make();p.x=event.clientX+(Math.random()-.5)*90;p.y=event.clientY+(Math.random()-.5)*70;p.speed=35+Math.random()*40;p.burst=true;petals.push(p)}if(petals.length>90)petals.splice(0,8)};
  window.addEventListener('resize',resize);document.addEventListener('click',burst);frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);document.removeEventListener('click',burst)};
 },[opened]);
 return <canvas ref={canvasRef} className="petals-canvas" aria-hidden="true" />;
}
