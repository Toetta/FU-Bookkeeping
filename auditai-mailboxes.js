(()=>{
  'use strict';
  const d=document,w=window;
  const q=id=>d.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const companyId=()=>{try{return w.CompanyManager?.getActiveCompanyId?.()||''}catch{return''}};
  const cfgKey=()=>`fu:auditai:addon:v1:${companyId()||'no-company'}`;
  const cfg=()=>{try{return JSON.parse(localStorage.getItem(cfgKey())||'{}')}catch{return{}}};
  const toast=(text,ms=5000)=>w.showToast?w.showToast(text,ms):alert(text);
  async function api(path,opts={}){
    const c=cfg();
    if(!c.enabled)throw new Error('AuditAI-tillägget är inte aktiverat.');
    if(!c.apiBaseUrl)throw new Error('AuditAI API-adress saknas.');
    const headers=Object.assign({'Content-Type':'application/json','X-FU-Organization-ID':companyId()},opts.headers||{});
    if(c.apiKey)headers.Authorization=`Bearer ${c.apiKey}`;
    const r=await fetch(c.apiBaseUrl.replace(/\/+$/,'')+path,Object.assign({},opts,{headers}));
    if(!r.ok)throw new Error((await r.text())||`HTTP ${r.status}`);
    return r.status===204?null:r.json();
  }
  function inject(){
    const home=q('tab-auditai_home');
    if(!home||q('auditAiMailboxCard'))return false;
    const host=home.querySelector('.auditAiHero')||home;
    host.insertAdjacentHTML('beforeend',`<div class="card" id="auditAiMailboxCard"><div class="row" style="justify-content:space-between;gap:10px"><div><h2>Anslutna e-postadresser</h2><div class="muted small">Sökningen börjar på prioritet 1. Om ingen säker match hittas fortsätter AI-boten automatiskt till nästa adress.</div></div><button class="btn secondary" id="btnAuditAiMailboxRefresh">Uppdatera</button></div><div class="grid two" style="margin-top:12px"><div><div class="row" style="gap:10px;align-items:end"><div class="field" style="flex:1"><label>E-postadress</label><input id="auditAiMailboxEmail" type="email" placeholder="faktura@foretag.se"></div><div class="field"><label>Leverantör</label><select id="auditAiMailboxProvider"><option value="gmail">Google / Gmail</option><option value="microsoft">Microsoft 365 / Outlook</option></select></div><div class="field" style="width:110px"><label>Prioritet</label><input id="auditAiMailboxPriority" type="number" min="1" max="9999" value="100"></div><button class="btn" id="btnAuditAiMailboxConnect">Anslut</button></div><div class="muted small" style="margin-top:8px">Varje adress ansluts med OAuth och läsrättighet. Lösenord lagras inte i FU-Bookkeeping.</div></div><div class="card" style="padding:10px;background:rgba(11,18,32,.9)"><div class="muted small"><b>Matchningsordning</b></div><div id="auditAiMailboxList" style="margin-top:8px"><div class="muted">Laddar…</div></div></div></div><div class="card" style="margin-top:12px;padding:10px;background:rgba(11,18,32,.9)"><div class="row" style="justify-content:space-between"><div><b>Provsök bankrad</b><div class="muted small">Exakt belopp är huvudsignal. Motpart, referens, datum, valuta och bilaga höjer säkerheten.</div></div><button class="btn" id="btnAuditAiRunMailboxMatch">Sök i ordning</button></div><div class="grid two" style="margin-top:10px"><div class="field"><label>Belopp</label><input id="auditAiMatchAmount" inputmode="decimal" placeholder="1250,00"></div><div class="field"><label>Datum</label><input id="auditAiMatchDate" type="date"></div><div class="field"><label>Motpart</label><input id="auditAiMatchCounterparty" placeholder="Hotel Nordic"></div><div class="field"><label>Referens</label><input id="auditAiMatchReference" placeholder="Fakturanummer eller bankreferens"></div></div><div id="auditAiMailboxMatchResult" class="muted small" style="margin-top:10px"></div></div></div>`);
    bind();refresh();return true;
  }
  function bind(){
    q('btnAuditAiMailboxRefresh').onclick=refresh;
    q('btnAuditAiMailboxConnect').onclick=connect;
    q('btnAuditAiRunMailboxMatch').onclick=match;
  }
  async function refresh(){
    const box=q('auditAiMailboxList');if(!box)return;
    box.innerHTML='<div class="muted">Hämtar…</div>';
    try{
      const rows=await api(`/api/v1/mailbox-connections?organization_id=${encodeURIComponent(companyId())}`);
      rows.sort((a,b)=>(a.priority||100)-(b.priority||100));
      box.innerHTML=rows.length?rows.map((r,i)=>`<div class="item" style="margin-top:7px"><div class="row" style="justify-content:space-between;gap:8px"><div><b>${i+1}. ${esc(r.email_address)}</b><div class="muted small">${esc(r.provider)} · prioritet ${esc(r.priority)} · ${esc(r.status)}</div></div><div class="row" style="gap:6px"><button class="btn secondary aiMbUp" data-id="${esc(r.id)}" data-priority="${Math.max(1,(r.priority||100)-10)}">↑</button><button class="btn secondary aiMbDown" data-id="${esc(r.id)}" data-priority="${(r.priority||100)+10}">↓</button><button class="btn danger aiMbDelete" data-id="${esc(r.id)}">Ta bort</button></div></div></div>`).join(''):'<div class="muted">Inga e-postadresser är anslutna ännu.</div>';
      box.querySelectorAll('.aiMbUp,.aiMbDown').forEach(b=>b.onclick=()=>setPriority(b.dataset.id,Number(b.dataset.priority)));
      box.querySelectorAll('.aiMbDelete').forEach(b=>b.onclick=()=>remove(b.dataset.id));
    }catch(e){box.innerHTML=`<div class="muted">${esc(e.message)}</div>`}
  }
  async function setPriority(id,priority){try{await api(`/api/v1/mailbox-connections/${encodeURIComponent(id)}/priority`,{method:'PUT',body:JSON.stringify({priority})});await refresh()}catch(e){toast(e.message)}}
  async function remove(id){try{await api(`/api/v1/mailbox-connections/${encodeURIComponent(id)}`,{method:'DELETE'});toast('E-postadressen kopplades bort.');await refresh()}catch(e){toast(e.message)}}
  async function connect(){
    const email=q('auditAiMailboxEmail').value.trim();if(!email){toast('Ange e-postadress.');return}
    try{
      const result=await api('/api/v1/mailbox-connections/oauth/start',{method:'POST',body:JSON.stringify({organization_id:companyId(),provider:q('auditAiMailboxProvider').value,email_address:email,priority:Number(q('auditAiMailboxPriority').value||100),terms:[],scan_interval_minutes:15,import_matching_attachments:true})});
      if(!result.authorization_url)throw new Error('OAuth-adress saknas i svaret.');
      location.href=result.authorization_url;
    }catch(e){toast(e.message)}
  }
  function parseAmount(v){return Number(String(v||'').replace(/\s/g,'').replace(',','.'))}
  async function match(){
    const out=q('auditAiMailboxMatchResult');out.textContent='Söker…';
    const amount=parseAmount(q('auditAiMatchAmount').value);if(!Number.isFinite(amount)){out.textContent='Ange ett giltigt belopp.';return}
    try{
      const result=await api('/api/v1/mailbox-connections/match-transaction',{method:'POST',body:JSON.stringify({organization_id:companyId(),amount:String(amount.toFixed(2)),currency:'SEK',transaction_date:q('auditAiMatchDate').value||null,counterparty:q('auditAiMatchCounterparty').value.trim(),reference:q('auditAiMatchReference').value.trim(),minimum_score:70})});
      const attempts=(result.attempts||[]).map(a=>`${a.priority}. ${esc(a.email_address)}: ${a.accepted?'träff':'ingen säker träff'} (${a.candidates} kandidater)`).join('<br>');
      if(result.matched&&result.selected){const s=result.selected;out.innerHTML=`<b>Träff i ${esc(s.email_address)}</b> · säkerhet ${esc(s.score)} %<br>${esc(s.subject||'utan ämne')} · ${esc(s.sender)}<br><span class="muted">${esc(s.snippet)}</span><hr style="border-color:var(--line)">${attempts}`}
      else out.innerHTML=`Ingen tillräckligt säker träff hittades.<br>${attempts}`;
    }catch(e){out.textContent=e.message}
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(inject()||tries>80)clearInterval(timer)},100);
})();