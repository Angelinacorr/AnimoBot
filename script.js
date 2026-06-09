const API = "http://localhost:3000";
const K_EMO='ab_emos',K_REC='ab_recs';
const EM={'Muy feliz':'😄','Feliz':'😊','Neutral':'😐','Triste':'😢','Ansioso':'😰','Enojado':'😠','Cansado':'😴','Esperanza':'🌟','Amado':'🥰','Confuso':'😕'};
let selEmo=null,breathIv=null,breathPhase='idle';
const secs=['educacion','sobre','asistente','actividades','comunidad'];
function goTo(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('sec-'+id).classList.add('active');
  document.querySelectorAll('.nav-btn')[secs.indexOf(id)].classList.add('active');
  document.querySelector('.main').scrollTop=0;
}
function openDrw(id){document.getElementById(id).classList.add('open');if(id==='drw-seguimiento')renderSeg();if(id==='drw-historial')renderHist();if(id==='drw-recordatorios')renderDrwRecs();}
function closeDrw(id){document.getElementById(id).classList.remove('open');if(id==='drw-juegos'){clearInterval(breathIv);breathIv=null;}}
function ckOverlay(e,id){if(e.target===e.currentTarget)closeDrw(id);}
function pickEmo(btn){document.querySelectorAll('.ep-btn').forEach(b=>b.classList.remove('sel'));btn.classList.add('sel');selEmo=btn.dataset.e;}

async function saveEmo(){

  if(!selEmo){
    showToast('⚠️ Selecciona un estado primero');
    return;
  }

  const nota = document.getElementById('emo-note').value.trim();

  const response = await fetch(`${API}/emociones`,{
      method:'POST',
      headers:{
          'Content-Type':'application/json'
      },
      body:JSON.stringify({
          emocion:selEmo,
          nota:nota
      })
  });

  if(response.ok){

      document.querySelectorAll('.ep-btn')
      .forEach(b=>b.classList.remove('sel'));

      document.getElementById('emo-note').value='';

      selEmo=null;

      closeDrw('drw-registro');

      showToast('✅ Estado registrado');
  }
}


async function renderSeg(){

  const body=document.getElementById('seg-body');

  const response = await fetch(`${API}/emociones`);

  const arr = await response.json();

  if(!arr.length){

    body.innerHTML=
    '<p style="text-align:center;color:var(--light-text);padding:30px 0;font-size:13px">Sin registros aún.<br>¡Registra tu estado primero! 📊</p>';

    return;
  }

  const counts={};

  arr.forEach(e=>{
      counts[e.emocion]=(counts[e.emocion]||0)+1;
  });

  const max=Math.max(...Object.values(counts));

  const sorted=Object.entries(counts)
  .sort((a,b)=>b[1]-a[1]);

  let h=`<p style="font-size:12.5px;color:var(--mid-text);margin-bottom:12px">Total: <strong>${arr.length}</strong></p>`;

  h+=`<p style="font-size:12.5px;font-weight:800;color:var(--dark-text);margin-bottom:9px">Frecuencia:</p><div class="emo-bars">`;

  sorted.forEach(([e,c])=>{

      const pct=Math.round(c/max*100);

      h+=`
      <div class="ebar-row">

        <span class="ebar-ic">${EM[e]||'❓'}</span>

        <span class="ebar-nm">${e}</span>

        <div class="ebar-track">
          <div class="ebar-fill" style="width:${pct}%"></div>
        </div>

        <span class="ebar-n">${c}</span>

      </div>`;
  });

  h+='</div>';

  body.innerHTML=h;
}

async function renderHist(){

  const body=document.getElementById('hist-body');

  const response = await fetch(`${API}/emociones`);

  const arr = await response.json();

  if(!arr.length){
      body.innerHTML='<p style="text-align:center;color:var(--light-text);padding:30px 0;font-size:13px">Sin registros aún. 📁</p>';
      return;
  }

  let h=`<p style="font-size:12.5px;color:var(--mid-text);margin-bottom:12px">${arr.length} registros</p><div class="hist-list">`;

  arr.forEach((e)=>{

      h+=`
      <div class="hist-item">

        <span class="hist-em">${EM[e.emocion]||'❓'}</span>

        <div class="hist-info">

          <strong>${e.emocion}</strong>

          <time>${fmtDate(e.fecha)}</time>

          ${e.nota ? `<p>"${e.nota}"</p>` : ''}

        </div>

        <button
          class="hist-del"
          onclick="delEmo(${e.id})">
          🗑️
        </button>

      </div>`;
  });

  h+='</div>';

  body.innerHTML=h;
}

async function delEmo(id){

    await fetch(`${API}/emociones/${id}`,{
        method:'DELETE'
    });

    renderHist();

    showToast('🗑️ Eliminado');
}

const quotes=["Cada día es una nueva oportunidad para ser mejor que ayer. 🌅","Tu fortaleza es mayor de lo que crees. 💪","Los pequeños pasos también cuentan. Sigue adelante. 🌱","Mereces amor, empezando por el que te das a ti mismo. 💙","Los tiempos difíciles también pasan. Resiste. 🌈","No tienes que ser perfecto para ser increíble. ✨","Pedir ayuda es un acto de valentía, no de debilidad. 🤝","Eres suficiente, exactamente como eres hoy. 🌸"];
const dColors=['#7b9df0','#b8e4d8','#f2c4d0','#fde9a2','#ffd4b8','#d0c8f8','#a8d8a8','#f8c0a0'];
let rxSeq=[],rxUsr=[],rxScore=0,rxPlaying=false;
function loadGame(type){
  clearInterval(breathIv);breathIv=null;
  const area=document.getElementById('game-area');
  if(type==='breath'){area.innerHTML=`<div class="breath-wrap"><div class="breath-c" id="bc">Presiona<br>iniciar</div><button class="btn-pri" id="bbtn" onclick="toggleBreath()" style="max-width:190px;margin:0 auto">🌬️ Iniciar</button><p style="font-size:11px;color:var(--light-text);margin-top:9px">Inhala 4s · Sostén 4s · Exhala 4s</p></div>`;}
  else if(type==='quotes'){const q=quotes[Math.floor(Math.random()*quotes.length)];area.innerHTML=`<div class="quote-box" id="qb">${q}</div><button class="btn-pri" onclick="nextQuote()">✨ Otra frase</button>`;}
  else{rxScore=0;rxSeq=[Math.floor(Math.random()*8)];rxUsr=[];rxPlaying=true;area.innerHTML=`<div class="relax-score">🌈 Puntos: <span id="rxs">0</span></div><div class="relax-grid">${dColors.map((c,i)=>`<button class="rdot" style="background:${c}" id="rd${i}" onclick="rxTap(${i})"></button>`).join('')}</div><p style="font-size:11px;color:var(--light-text);text-align:center">Repite la secuencia de colores</p>`;setTimeout(rxPlay,400);}
}
function toggleBreath(){if(breathPhase!=='idle'){clearInterval(breathIv);breathIv=null;breathPhase='idle';document.getElementById('bbtn').textContent='🌬️ Iniciar';document.getElementById('bc').className='breath-c';return;}startBreath();}
function startBreath(){
  breathPhase='running';document.getElementById('bbtn').textContent='⏹ Detener';
  const phases=[{t:'Inhala...',c:'inhale'},{t:'Sostén...',c:''},{t:'Exhala...',c:'exhale'}];let i=0;
  function tick(){const bc=document.getElementById('bc');if(!bc){clearInterval(breathIv);return;}const p=phases[i%3];bc.className='breath-c '+(p.c||'');bc.innerHTML=p.t;i++;}
  tick();breathIv=setInterval(tick,4000);
}
function nextQuote(){const el=document.getElementById('qb');if(!el)return;el.style.opacity=0;setTimeout(()=>{el.textContent=quotes[Math.floor(Math.random()*quotes.length)];el.style.opacity=1;},250);}
function rxPlay(){rxUsr=[];let i=0;const iv=setInterval(()=>{if(i>=rxSeq.length){clearInterval(iv);rxPlaying=false;return;}const d=document.getElementById('rd'+rxSeq[i]);if(d){d.classList.add('lit');setTimeout(()=>d.classList.remove('lit'),480);}i++;},700);}
function rxTap(idx){
  if(rxPlaying)return;
  const d=document.getElementById('rd'+idx);if(d){d.classList.add('lit');setTimeout(()=>d.classList.remove('lit'),300);}
  rxUsr.push(idx);const pos=rxUsr.length-1;
  if(rxUsr[pos]!==rxSeq[pos]){showToast('❌ Incorrecto. ¡Intenta de nuevo!');rxScore=0;document.getElementById('rxs').textContent=0;rxSeq=[Math.floor(Math.random()*8)];rxUsr=[];rxPlaying=true;setTimeout(rxPlay,600);return;}
  if(rxUsr.length===rxSeq.length){rxScore++;document.getElementById('rxs').textContent=rxScore;showToast('✅ ¡Correcto! +1 🌟');rxSeq.push(Math.floor(Math.random()*8));rxPlaying=true;setTimeout(rxPlay,700);}
}
async function renderHomeRecCol(){

  const col=document.getElementById('home-rec-col');

  if(!col)return;

  const response = await fetch(`${API}/recordatorios`);

  const arr = await response.json();

  let h='';

 arr.slice(0,3).forEach((r)=>{

  const emoji =
    r.texto.match(/[\u{1F300}-\u{1FAFF}]/u)?.[0] || '📌';

  const textoSinEmoji =
    r.texto.replace(/[\u{1F300}-\u{1FAFF}]/gu,'').trim();

h+=`
  <div
    class="rec-item-card"
    onclick="toggleRec(${r.id}, ${r.completado})">

    ${r.completado ? '<div class="check">✓</div>' : ''}

    <div class="ic">${emoji}</div>

    <div class="lbl">${textoSinEmoji}</div>

  </div>
`;
});

  h+=`<button class="btn-add-rec" onclick="openHQA()">+ AGREGAR</button>`;

  col.innerHTML=h;
}

async function toggleRec(id, estado){

  await fetch(`${API}/recordatorios/${id}`,{
      method:'PUT',
      headers:{
          'Content-Type':'application/json'
      },
      body:JSON.stringify({
          completado: !estado
      })
  });

  renderHomeRecCol();
  renderDrwRecs();
}

function openHQA(){document.getElementById('hqa-form').classList.add('open');document.getElementById('hqa-input').focus();}
function closeHQA(){document.getElementById('hqa-form').classList.remove('open');}

async function saveHQA(){

  const inp=document.getElementById('hqa-input');

  const t=inp.value.trim();

  if(!t){
    showToast('⚠️ Escribe un recordatorio');
    return;
  }

  await fetch(`${API}/recordatorios`,{
      method:'POST',
      headers:{
          'Content-Type':'application/json'
      },
      body:JSON.stringify({
          texto:t
      })
  });

  inp.value='';

  closeHQA();

  renderHomeRecCol();

  renderDrwRecs();

  showToast('✅ Recordatorio guardado');
}
document.getElementById('hqa-input').addEventListener('keydown',e=>{if(e.key==='Enter')saveHQA();});
function fillDrwRec(t){document.getElementById('drw-rec-input').value=t;document.getElementById('drw-rec-input').focus();}
async function saveDrwRec(){

  const inp=document.getElementById('drw-rec-input');

  const t=inp.value.trim();

  if(!t){
      showToast('⚠️ Escribe algo');
      return;
  }

  await fetch(`${API}/recordatorios`,{
      method:'POST',
      headers:{
          'Content-Type':'application/json'
      },
      body:JSON.stringify({
          texto:t
      })
  });

  inp.value='';

  renderDrwRecs();

  renderHomeRecCol();

  showToast('✅ Guardado');
}
document.getElementById('drw-rec-input').addEventListener('keydown',e=>{if(e.key==='Enter')saveDrwRec();});
async function renderDrwRecs(){

  const list=document.getElementById('drw-rec-list');

  const response = await fetch(`${API}/recordatorios`);

  const arr = await response.json();

  if(!arr.length){

      list.innerHTML='<p style="text-align:center;color:var(--light-text);font-size:12.5px;padding:18px 0">Sin recordatorios. ¡Agrega uno! 🔔</p>';

      return;
  }

list.innerHTML=arr.map(r=>`

<div class="rec-full-item">

    <button
      class="rc ${r.completado ? 'done' : ''}"
      onclick="drwToggle(${r.id},${r.completado})">

      ${r.completado ? '✓' : ''}

    </button>

    <span class="rt ${r.completado ? 'done' : ''}">
      ${r.texto}
    </span>

    <button
      class="rd"
      onclick="drwDel(${r.id})">

      🗑️

    </button>

</div>

`).join('');
}

async function drwToggle(id,estado){

    await fetch(`${API}/recordatorios/${id}`,{
        method:'PUT',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            completado: !estado
        })
    });

    renderDrwRecs();
    renderHomeRecCol();
}

async function drwDel(id){

    await fetch(`${API}/recordatorios/${id}`,{
        method:'DELETE'
    });

    renderDrwRecs();
    renderHomeRecCol();

    showToast('🗑️ Eliminado');
}

function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600);}
function fmtDate(ts){return new Date(ts).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});}
renderHomeRecCol();