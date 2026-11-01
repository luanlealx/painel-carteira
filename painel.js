/*! painel-carteira v1.0.0 · núcleo do painel de carteira cripto · Luan Leal · luanlealx.com
 * Só leitura: lê endereços públicos e saldos, nunca assina, nunca pede seed.
 * Uso: a casca define DATA e carrega este arquivo:
 *   <script>const DATA = {...}</script>
 *   <script src="https://cdn.jsdelivr.net/gh/luanlealx/painel-carteira@1/painel.js"></script>
 * Sem DATA, lê os dados do hash da URL (#<JSON em encodeURIComponent>), e sem nada mostra o exemplo.
 * Formato do DATA: ver README. Mudança de formato = versão maior (@2).
 */
(function(){
  "use strict";
  var VERSAO="1.0.0";
  if(window.PainelCarteira&&window.PainelCarteira.montado)return;

  var CSS=`/* Painel de carteira · visual "Vidro". NÃO EDITE ESTE CSS: a IA só troca o objeto DATA no script. */
:root{
  --bg:#091214;--surface:rgba(255,255,255,.055);--sunk:rgba(255,255,255,.07);--ink:#F1F7F6;--muted:#9FB3B1;--line:rgba(255,255,255,.09);
  --accent:#2CC9C0;--accent-ink:#071312;--accent-soft:rgba(44,201,192,.16);
  --btc:#FF8A3D;--stable:#2CC9C0;--alt:#8FA3B8;
  --good:#4FD18B;--good-soft:rgba(79,209,139,.14);--warn:#F5B840;--warn-soft:rgba(245,184,64,.15);--bad:#FF7A7A;--bad-soft:rgba(255,122,122,.15);
  --glow1:rgba(255,138,61,.30);--glow2:rgba(44,201,192,.22);--shadow:0 10px 30px rgba(0,0,0,.28);
  --f:"Sora",system-ui,-apple-system,"Segoe UI",sans-serif;--mono:"JetBrains Mono",ui-monospace,Menlo,monospace;
  --r:24px;color-scheme:dark}
@media (prefers-color-scheme:light){:root:not([data-theme="dark"]){
  --bg:#EEF4F3;--surface:rgba(255,255,255,.9);--sunk:rgba(10,50,50,.06);--ink:#0C1F1E;--muted:#4C5F5D;--line:rgba(10,50,50,.10);
  --accent:#0B7A80;--accent-ink:#FFFFFF;--accent-soft:#D5EFEE;--btc:#EA6A12;--stable:#0B7A80;--alt:#64748B;
  --good:#15803D;--good-soft:#DCF3E4;--warn:#A85A00;--warn-soft:#FDF0D5;--bad:#C62828;--bad-soft:#FDE3E3;
  --glow1:rgba(255,138,61,.20);--glow2:rgba(44,201,192,.20);--shadow:0 10px 30px rgba(10,80,80,.10);color-scheme:light}}
:root[data-theme="light"]{
  --bg:#EEF4F3;--surface:rgba(255,255,255,.9);--sunk:rgba(10,50,50,.06);--ink:#0C1F1E;--muted:#4C5F5D;--line:rgba(10,50,50,.10);
  --accent:#0B7A80;--accent-ink:#FFFFFF;--accent-soft:#D5EFEE;--btc:#EA6A12;--stable:#0B7A80;--alt:#64748B;
  --good:#15803D;--good-soft:#DCF3E4;--warn:#A85A00;--warn-soft:#FDF0D5;--bad:#C62828;--bad-soft:#FDE3E3;
  --glow1:rgba(255,138,61,.20);--glow2:rgba(44,201,192,.20);--shadow:0 10px 30px rgba(10,80,80,.10);color-scheme:light}
*{box-sizing:border-box}
html,body{max-width:100%;overflow-x:hidden;margin:0}
body{background:radial-gradient(120% 55% at 90% -8%,var(--glow1),transparent 60%),radial-gradient(90% 50% at -12% 28%,var(--glow2),transparent 62%),var(--bg);background-attachment:fixed;min-height:100vh;color:var(--ink);font:15px/1.45 var(--f);font-variant-numeric:tabular-nums;padding-block:16px 48px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
button{font:inherit;color:inherit}
.app{max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:16px}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px}
.acct{display:flex;align-items:center;gap:10px;min-width:0}
.avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--btc),var(--accent));flex:none}
.acct b{display:block;font-weight:600;line-height:1.2}
.acct small{color:var(--muted);font-size:12px}
.tools{display:flex;gap:8px}
.icon{border:1px solid var(--line);background:var(--surface);border-radius:999px;width:38px;height:38px;display:grid;place-items:center;cursor:pointer;color:var(--ink);backdrop-filter:blur(18px)}
.icon[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink);border-color:transparent}
.icon svg{width:18px;height:18px}
.banner{background:var(--warn-soft);color:var(--warn);border-radius:14px;padding:10px 14px;font-size:13.5px;font-weight:600}
.hero{text-align:center;display:flex;flex-direction:column;gap:6px;padding-top:6px}
.label{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600}
.total{font:600 clamp(40px,12vw,56px)/1.05 var(--f);letter-spacing:-.03em}
.sub{color:var(--muted);font-size:14px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:18px;backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);box-shadow:var(--shadow)}
h3{margin:0 0 12px;font:700 15px var(--f)}
.split{display:flex;height:12px;border-radius:999px;overflow:hidden;gap:2px;background:var(--sunk)}
.split i{display:block;height:100%}
.legend{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:10px;font-size:13px;color:var(--muted)}
.legend span{display:inline-flex;align-items:center;gap:6px}
.legend i{width:8px;height:8px;border-radius:50%}
.legend b{color:var(--ink)}
.alloc{display:flex;gap:18px;align-items:center}
.donut{flex:none;width:120px;height:120px;border-radius:50%;position:relative}
.donut::after{content:"";position:absolute;inset:22px;border-radius:50%;background:var(--bg)}
.rows{display:flex;flex-direction:column;gap:8px;flex:1;min-width:0}
.row{display:grid;grid-template-columns:10px minmax(0,1fr) auto;gap:10px;align-items:center;font-size:14px}
.row i{width:10px;height:10px;border-radius:3px}
.place{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;padding-block:12px;border-bottom:1px solid var(--line)}
.place:last-child{border-bottom:0}
.place b{font-weight:600;display:block}
.place .addr{font:12px var(--mono);color:var(--muted);overflow-wrap:anywhere}
.place .v{text-align:right;font-weight:600}
.tag{display:inline-block;font-size:11.5px;font-weight:600;border-radius:999px;padding:2px 8px;margin-top:4px;background:var(--sunk);color:var(--muted)}
.tag.read{background:var(--good-soft);color:var(--good)}
.tag.told{background:var(--accent-soft);color:var(--accent)}
.tag.pend{background:var(--warn-soft);color:var(--warn)}
.prog{height:10px;border-radius:999px;background:var(--sunk);overflow:hidden;margin:12px 0}
.prog i{display:block;height:100%;background:var(--btc);border-radius:999px}
.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.stat{background:var(--sunk);border-radius:14px;padding:10px 12px}
.stat span{display:block;font-size:11.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
.stat b{font-size:18px}
.sem{display:flex;gap:12px;align-items:flex-start}
.light{width:12px;height:12px;border-radius:50%;margin-top:6px;flex:none;background:var(--good);box-shadow:0 0 0 5px var(--good-soft)}
.sem.yellow .light{background:var(--warn);box-shadow:0 0 0 5px var(--warn-soft)}
.sem.red .light{background:var(--bad);box-shadow:0 0 0 5px var(--bad-soft)}
.sem h4{margin:0;font:700 16px var(--f)}
.sem p{margin:4px 0 0;color:var(--muted);font-size:14px}
.pills{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:4px;backdrop-filter:blur(18px)}
.pills button{border:0;background:none;color:var(--muted);font-weight:600;font-size:13px;padding:9px 0;border-radius:999px;cursor:pointer}
.pills button[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink);box-shadow:0 4px 14px var(--accent-soft)}
.foot{font-size:12px;color:var(--muted);text-align:center}
.foot a{color:var(--accent);text-decoration:none;font-weight:600}
.foot a:hover{text-decoration:underline}
.cold{display:flex;gap:14px;align-items:flex-start}
.cold .ic{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent)}
.cold p{margin:4px 0 10px;color:var(--muted);font-size:14px}
.cold a{display:inline-block;background:var(--accent);color:var(--accent-ink);font-weight:700;font-size:14px;text-decoration:none;border-radius:999px;padding:9px 16px}
.cold small{display:block;margin-top:8px;color:var(--muted);font-size:12px}
.start{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent),var(--shadow)}
.start h3{font-size:19px;margin:6px 0 4px}
.start p{margin:0 0 12px;color:var(--muted);font-size:14px}
.add{display:flex;gap:8px;flex-wrap:wrap}
.add input{flex:1 1 220px;min-width:0;font:13px var(--mono);color:var(--ink);background:var(--sunk);border:1px solid var(--line);border-radius:14px;padding:12px 14px}
.add input:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.add button{flex:none;border:0;background:var(--accent);color:var(--accent-ink);font-weight:700;font-size:14px;border-radius:999px;padding:11px 18px;cursor:pointer}
.hint{min-height:1.2em;margin:8px 0 0;font-size:13px;color:var(--muted);overflow-wrap:anywhere}
.hint.ok{color:var(--good)}.hint.bad{color:var(--bad)}
.hint code{font:12px var(--mono);user-select:all;background:var(--sunk);border-radius:6px;padding:2px 6px}
.where{margin-top:10px;font-size:13.5px;color:var(--muted)}
.where summary{cursor:pointer;font-weight:600;color:var(--ink)}
.where ul{margin:8px 0 0;padding-left:18px;display:grid;gap:4px}
.addMore{margin-top:14px;padding-top:14px;border-top:1px solid var(--line)}
.addMore b{display:block;font-size:14px;margin-bottom:8px}
.share .add,.share .addMore,.share .start,.share .acts,.share #liveMsg{display:none}
.acts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.act{display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--line);background:var(--surface);backdrop-filter:blur(18px);border-radius:999px;padding:11px 10px;font-weight:600;font-size:14px;cursor:pointer;color:var(--ink)}
.act.main{background:var(--accent);color:var(--accent-ink);border-color:transparent}
.act svg{width:17px;height:17px;flex:none}
.act[aria-busy="true"] svg{animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
#liveMsg{margin:-6px 0 0;text-align:center}
@media (prefers-reduced-motion:reduce){.act[aria-busy="true"] svg{animation:none}}
:is(input,summary):focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.priv .money{color:transparent!important;background:var(--sunk);border-radius:6px;user-select:none}
.share .money,.share .addr,.share .nm{display:none}
:is(button):focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.manual{display:block;width:100%;margin-top:6px;font:12px var(--mono);color:var(--ink);background:var(--sunk);border:1px solid var(--accent);border-radius:10px;padding:8px 10px}
`;
  var HTML=`<main class="app" id="app">
  <div class="top">
    <div class="acct"><span class="avatar"></span><div><b id="titulo">Minha carteira</b><small id="upd"></small></div></div>
    <div class="tools">
      <button class="icon" id="eye" type="button" aria-pressed="false" aria-label="Esconder valores"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button>
      <button class="icon" id="theme" type="button" aria-label="Trocar tema"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>
    </div>
  </div>
  <section class="card start" id="exemplo" hidden><span class="label">Comece aqui</span><h3>Esses números são de exemplo. Bora ver os seus?</h3><p>Cole o endereço público de 1 carteira sua. É o endereço de receber, nunca a seed.</p><div class="add"><input id="addr1" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="0x... ou bc1..." aria-label="Endereço público da carteira"><button type="button" id="go1">Copiar pedido</button></div><p class="hint" id="hint1" aria-live="polite">Depois é só colar na conversa com a IA.</p><details class="where"><summary>Onde acho meu endereço?</summary><ul><li><b>MetaMask / Rabby:</b> toque no nome da conta lá em cima, copia o 0x...</li><li><b>Phantom:</b> Receber, escolha a rede, copiar.</li><li><b>Trust Wallet:</b> Receber, escolha a moeda, copiar.</li><li><b>Carteira de Bitcoin:</b> Receber, copiar o bc1...</li><li><b>Corretora:</b> não tem endereço. Mande um print do saldo pra IA.</li></ul></details></section>
  <div class="pills" role="group" aria-label="Modo"><button type="button" id="mFull" aria-pressed="true">Completo</button><button type="button" id="mShare" aria-pressed="false">Só porcentagens</button></div>
  <section class="hero"><span class="label">Patrimônio total</span><div class="total money" id="total"></div><div class="sub money" id="conv"></div></section>
  <div class="acts"><button type="button" class="act main" id="live"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5"/></svg>Atualizar agora</button><button type="button" class="act" id="askai"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>Atualizar com IA</button></div>
  <p class="hint" id="liveMsg" aria-live="polite"></p>
  <section class="card"><h3>Alocação</h3><div class="split" id="split"></div><div class="legend" id="legend"></div></section>
  <section class="card"><h3>Por classe</h3><div class="alloc"><div class="donut" id="donut" role="img"></div><div class="rows" id="classes"></div></div></section>
  <section class="card"><h3>Por lugar</h3><div id="places"></div><div class="addMore" id="addMore" hidden><b>Adicionar outra carteira</b><div class="add"><input id="addr2" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="0x... ou bc1..." aria-label="Endereço público de outra carteira"><button type="button" id="go2">Copiar pedido</button></div><p class="hint" id="hint2" aria-live="polite">Copie e cole na conversa com a IA. Corretora? Mande um print do saldo.</p></div></section>
  <section class="card" id="dcaCard"><h3>DCA do mês</h3><div class="stats" id="dcaStats"></div><div class="prog"><i id="dcaBar"></i></div><div class="sub" id="dcaNext"></div></section>
  <section class="card" id="coldCard" hidden><div class="cold"><span class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></span><div><h3 style="margin:0">Ainda sem cold wallet?</h3><p>O bitcoin fica mais seguro numa carteira offline, com a chave só com você. Uma opção que o Luan usa e indica é o Coldkit X, da DSEC.</p><a href="https://dseclab.io/br/products/coldkit-x" target="_blank" rel="noopener">Ver o Coldkit X</a><small>Use o cupom <b>LUAN</b> no carrinho: 10% de desconto.</small></div></div></section>
  <section class="card" id="p2pCard"><div class="cold"><span class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 7h11l-3-3M17 17H6l3 3"/></svg></span><div><h3 style="margin:0">Real ↔ dólar digital com Pix</h3><p>Pra comprar dólar digital (USDC) pro DCA ou sacar pro mês pagando com Pix, o Luan usa a P2P.me.</p><a href="https://p2pme.short.gy/luanleal" target="_blank" rel="noopener">Abrir a P2P.me</a><small>Link de indicação do Luan.</small></div></div></section>
  <section class="card"><h3>Segurança</h3><div class="sem" id="sem"><span class="light"></span><div><h4 id="semT"></h4><p id="semD"></p></div></div></section>
  <p class="foot">Só leitura. Nenhuma transação sai deste painel.<br>Modelo feito por <a href="https://luanlealx.com" target="_blank" rel="noopener">Luan Leal · luanlealx.com</a></p>
</main>
`;

  var EXEMPLO={
    exemplo:true,titulo:"Minha carteira",moeda:"USD",cambio:5.45,atualizado:"2026-11-01T21:00:00Z",
    lugares:[
      {nome:"Cold wallet",tipo:"autocustodia",endereco:"bc1q...exemplo",origem:"lido",fonte:"mempool.space",hora:"2026-11-01T21:00:00Z",ativos:[{simbolo:"BTC",grupo:"bitcoin",valor:4800}]},
      {nome:"Cofre de stablecoin",tipo:"defi",endereco:"0x12...exemplo",origem:"lido",fonte:"app do protocolo",hora:"2026-11-01T21:00:00Z",ativos:[{simbolo:"USDC",grupo:"estavel",valor:3100}]},
      {nome:"Carteira do dia a dia",tipo:"carteira",endereco:"0x34...exemplo",origem:"lido",fonte:"basescan.org",hora:"2026-11-01T21:00:00Z",ativos:[{simbolo:"USDC",grupo:"estavel",valor:1200},{simbolo:"ETH",grupo:"altcoins",valor:1500},{simbolo:"Outras",grupo:"altcoins",valor:900}]},
      {nome:"Banco",tipo:"banco",origem:"informado",data:"2026-11-01",ativos:[{simbolo:"Renda fixa",grupo:"estavel",valor:900}]},
      {nome:"Carteira nova",tipo:"carteira",endereco:"0x56...exemplo",origem:"pendente",ativos:[{simbolo:"?",grupo:"altcoins",valor:null}]}
    ],
    dca:{ativo:"BTC",por_compra:100,frequencia:"semanal",teto_mes:500,proxima:"2026-11-08",compras_mes:[{data:"2026-11-01",valor:200}]}
  };

  /* Dados no hash: #<encodeURIComponent(JSON)>, #d=<...> ou #b64:<base64url do JSON> */
  function doHash(){
    var h=(location.hash||"").replace(/^#/,"").replace(/^d=/,"");
    if(!h)return null;
    try{
      if(h.indexOf("b64:")===0){
        var s=h.slice(4).replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";
        var bin=atob(s),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
        return JSON.parse(new TextDecoder().decode(u));
      }
      return JSON.parse(decodeURIComponent(h));
    }catch(e){return {erro:"hash"}}
  }

  /* Normaliza o que veio da IA: números viram número, campos faltando ganham padrão. */
  function normalizar(d){
    var GR={bitcoin:1,estavel:1,altcoins:1};
    var n=function(v){if(v===null||v===undefined||v==="")return null;var x=Number(String(v).replace(",","."));return isFinite(x)?x:null};
    var o={exemplo:!!d.exemplo,titulo:String(d.titulo||"Minha carteira"),moeda:d.moeda==="BRL"?"BRL":"USD",cambio:n(d.cambio),atualizado:d.atualizado||new Date().toISOString(),lugares:[],dca:null};
    (Array.isArray(d.lugares)?d.lugares:[]).forEach(function(l){
      if(!l||typeof l!=="object")return;
      var ativos=(Array.isArray(l.ativos)?l.ativos:[]).map(function(a){return {simbolo:String(a&&a.simbolo||"?"),grupo:GR[a&&a.grupo]?a.grupo:"altcoins",valor:n(a&&a.valor)}});
      if(!ativos.length)ativos=[{simbolo:"?",grupo:"altcoins",valor:null}];
      var origem=l.origem==="lido"||l.origem==="informado"?l.origem:"pendente";
      var x={nome:String(l.nome||"Carteira"),tipo:String(l.tipo||"carteira"),origem:origem,ativos:ativos};
      if(l.endereco)x.endereco=String(l.endereco);
      if(l.fonte)x.fonte=String(l.fonte);
      if(l.hora)x.hora=String(l.hora);
      if(l.data)x.data=String(l.data);
      o.lugares.push(x);
    });
    if(d.dca&&typeof d.dca==="object"){
      o.dca={ativo:String(d.dca.ativo||"BTC"),por_compra:n(d.dca.por_compra),frequencia:String(d.dca.frequencia||""),teto_mes:n(d.dca.teto_mes)||0,proxima:d.dca.proxima?String(d.dca.proxima):null,
        compras_mes:(Array.isArray(d.dca.compras_mes)?d.dca.compras_mes:[]).map(function(c){return {data:String(c&&c.data||""),valor:n(c&&c.valor)||0}})};
    }
    return o;
  }

  function montar(){
    var fonte=(typeof DATA!=="undefined"&&DATA)||window.DATA||doHash();
    var avisoHash=fonte&&fonte.erro==="hash";
    var DATA_=normalizar(!fonte||avisoHash?EXEMPLO:fonte);
    if(!DATA_.lugares.length)DATA_=normalizar(EXEMPLO);

    var root=document.documentElement;
    if(!root.dataset.theme)root.dataset.theme="light";
    if(!root.lang)root.lang="pt-BR";
    if(!document.querySelector('meta[name="viewport"]')){var mv=document.createElement("meta");mv.name="viewport";mv.content="width=device-width,initial-scale=1,viewport-fit=cover";document.head.appendChild(mv)}
    if(!document.querySelector('link[data-pc-font]')){
      var lf=document.createElement("link");lf.rel="stylesheet";lf.setAttribute("data-pc-font","");
      lf.href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";document.head.appendChild(lf);
    }
    var st=document.createElement("style");st.setAttribute("data-painel-carteira",VERSAO);st.textContent=CSS;document.head.appendChild(st);
    var boot=document.getElementById("pc-boot");if(boot)boot.remove();
    var host=document.createElement("div");host.innerHTML=HTML;
    while(host.firstChild)document.body.appendChild(host.firstChild);
    if(!document.title||document.title==="")document.title="Minha Carteira";

    start(DATA_);
    if(avisoHash){var m=document.getElementById("liveMsg");if(m){m.className="hint bad";m.textContent="O link veio quebrado, então o painel mostra o exemplo. Peça pra IA gerar o link de novo."}}
    window.PainelCarteira.montado=true;
  }

  function start(DATA){

  const $=id=>document.getElementById(id), G={bitcoin:["Bitcoin","var(--btc)"],estavel:["Estável","var(--stable)"],altcoins:["Altcoins","var(--alt)"]};
  const sym=()=>DATA.moeda==="BRL"?"R$ ":"US$ ";
  const fmt=(n,d=0)=>Number(n).toLocaleString("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d});
  const money=n=>sym()+fmt(n);
  const dt=s=>{try{return new Date(s).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}catch(e){return s}};
  const dd=s=>{const p=String(s).split("-");return p.length===3?p[2]+"/"+p[1]:s};
  const el=(t,c,txt)=>{const e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e};
  const sumL=l=>l.ativos.reduce((a,x)=>a+(x.valor||0),0);
  const net=a=>/^0x[0-9a-fA-F]{40}$/.test(a)?"evm":/^(bc1[02-9ac-hj-np-z]{11,71}|[13][1-9A-HJ-NP-Za-km-z]{25,34})$/.test(a)?"btc":/^[xyz]pub[1-9A-HJ-NP-Za-km-z]{100,112}$/.test(a)?"xpub":/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a)?"sol":"";
  const NETNAME={evm:"Ethereum, Base e outras redes 0x",btc:"Bitcoin",xpub:"Bitcoin (chave pública estendida)",sol:"Solana"};

  function render(){
    $("titulo").textContent=DATA.titulo||"Minha carteira";
    $("upd").textContent="Atualizado "+dt(DATA.atualizado);
    $("exemplo").hidden=!DATA.exemplo;$("addMore").hidden=!!DATA.exemplo;
    const L=DATA.lugares.map(l=>({...l,total:sumL(l)}));
    const T=L.reduce((a,l)=>a+l.total,0)||1;
    const byG={bitcoin:0,estavel:0,altcoins:0};
    L.forEach(l=>l.ativos.forEach(x=>{if(x.valor)byG[x.grupo]=(byG[x.grupo]||0)+x.valor}));
    const pct=v=>v/T*100;
    $("total").textContent=money(T);
    $("conv").textContent=DATA.moeda==="USD"&&DATA.cambio?"≈ R$ "+fmt(T*DATA.cambio)+" · dólar a R$ "+fmt(DATA.cambio,2):DATA.moeda==="BRL"&&DATA.cambio?"≈ US$ "+fmt(T/DATA.cambio)+" · dólar a R$ "+fmt(DATA.cambio,2):"";
    const keys=Object.keys(G);
    $("split").innerHTML=keys.map(k=>`<i style="width:${pct(byG[k])}%;background:${G[k][1]}"></i>`).join("");
    $("legend").innerHTML=keys.map(k=>`<span><i style="background:${G[k][1]}"></i>${G[k][0]} <b>${fmt(pct(byG[k]))}%</b></span>`).join("");
    let acc=0;const stops=keys.map(k=>{const a=acc;acc+=pct(byG[k]);return `${G[k][1]} ${a}% ${acc}%`});
    $("donut").style.background=`conic-gradient(${stops.join(",")})`;
    $("donut").setAttribute("aria-label",keys.map(k=>G[k][0]+" "+fmt(pct(byG[k]))+"%").join(", "));
    $("classes").replaceChildren(...keys.map(k=>{const r=el("div","row");r.append(el("i"),el("span","",G[k][0]),el("span","",fmt(pct(byG[k]))+"%"));r.firstChild.style.background=G[k][1];return r}));
    $("places").replaceChildren(...L.slice().sort((a,b)=>b.total-a.total).map(l=>{
      const r=el("div","place"),left=el("div"),right=el("div","v");
      left.append(el("b","nm",l.nome));
      if(l.endereco)left.append(el("div","addr",l.endereco));
      const tag=l.origem==="lido"?el("span","tag read","lido · "+(l.fonte||"")+" · "+dt(l.hora)):l.origem==="informado"?el("span","tag told","informado em "+dd(l.data)):el("span","tag pend","pendente");
      left.append(tag);
      right.append(el("div","money",l.origem==="pendente"?"—":money(l.total)),el("div","sub",fmt(pct(l.total))+"%"));
      r.append(left,right);return r}));
    const d=DATA.dca;
    if(!d){$("dcaCard").hidden=true}else{
      $("dcaCard").hidden=false;
      const feito=(d.compras_mes||[]).reduce((a,x)=>a+x.valor,0),teto=d.teto_mes||0;
      $("dcaStats").innerHTML=`<div class="stat"><span>Comprado no mês</span><b class="money">${money(feito)}</b></div><div class="stat"><span>Teto do mês</span><b class="money">${money(teto)}</b></div>`;
      $("dcaBar").style.width=Math.min(100,teto?feito/teto*100:0)+"%";
      $("dcaNext").textContent=`${d.ativo} · ${d.frequencia}`+(d.proxima?` · próxima compra em ${dd(d.proxima)}`:"")+(teto?` · falta ${sym()}${fmt(Math.max(0,teto-feito))} pro teto`:"");}
    const btc=byG.bitcoin||0;let btcSelf=0,exch=0,pend=0;
    L.forEach(l=>{if(l.origem==="pendente")pend++;if(l.tipo==="corretora")exch+=l.total;if(l.tipo==="autocustodia")l.ativos.forEach(x=>{if(x.grupo==="bitcoin")btcSelf+=x.valor||0})});
    const selfShare=btc?btcSelf/btc:1,exShare=exch/T,sem=$("sem");let c="green",t="Tudo em ordem",ds=[];
    ds.push(btc?fmt(selfShare*100)+"% do bitcoin em autocustódia":"nenhum bitcoin ainda");ds.push(exShare>0?fmt(exShare*100)+"% do total em corretora":"nada parado em corretora");
    if(exShare>.3||selfShare<.5){c="red";t="Atenção agora"}else if(exShare>.1||selfShare<.8||pend){c="yellow";t="Vale olhar"}
    if(pend)ds.push(pend+" lugar(es) com leitura pendente");
    sem.className="sem "+(c==="green"?"":c);
    $("coldCard").hidden=!L.every(l=>l.tipo!=="autocustodia");$("semT").textContent=t;$("semD").textContent=ds.join(" · ")+".";
  }

  /* ---------- Atualizar agora: lê direto da blockchain (só leitura) ---------- */
  const PN=c=>"https://"+c+"-rpc.publicnode.com";
  const CH={ethereum:{rpc:PN("ethereum"),gas:"ETH",tk:[["USDC","0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",6],["USDT","0xdAC17F958D2ee523a2206206994597C13D831ec7",6],["WBTC","0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",8],["cbBTC","0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",8]]},
    base:{rpc:PN("base"),gas:"ETH",tk:[["USDC","0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",6],["cbBTC","0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",8]]},
    arbitrum:{rpc:PN("arbitrum-one"),gas:"ETH",tk:[["USDC","0xaf88d065e77c8cC2239327C5EDb3A432268e5831",6],["USDT","0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",6],["WBTC","0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",8]]},
    bsc:{rpc:PN("bsc"),gas:"BNB",tk:[]}};
  const GRP={BTC:"bitcoin",WBTC:"bitcoin",cbBTC:"bitcoin",USDC:"estavel",USDT:"estavel",ETH:"altcoins",BNB:"altcoins",SOL:"altcoins"};
  const PID={BTC:"bitcoin",WBTC:"bitcoin",cbBTC:"bitcoin",ETH:"ethereum",BNB:"binancecoin",SOL:"solana",USDC:"usd-coin",USDT:"tether"};
  const COVER={evm:["ETH","BNB","USDC","USDT","WBTC","cbBTC"],btc:["BTC"],sol:["SOL","USDC"]};
  const getJ=(u,o)=>{const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),9000);return fetch(u,{...(o||{}),signal:ac.signal}).then(r=>{clearTimeout(tm);if(!r.ok)throw new Error(r.status);return r.json()})};
  const rpc=(u,m,p)=>getJ(u,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:m,params:p})}).then(j=>{if(j.error)throw new Error(j.error.message);return j.result});
  const big=(h,dec)=>Number(BigInt(h&&h!=="0x"?h:"0x0"))/Math.pow(10,dec);
  async function readEvm(a){const q={};let ok=0;
    await Promise.all(Object.values(CH).map(async c=>{try{
      q[c.gas]=(q[c.gas]||0)+big(await rpc(c.rpc,"eth_getBalance",[a,"latest"]),18);
      const data="0x70a08231"+a.slice(2).toLowerCase().padStart(64,"0");
      for(const [s,to,dec] of c.tk){q[s]=(q[s]||0)+big(await rpc(c.rpc,"eth_call",[{to,data},"latest"]),dec)}ok++}catch(e){}}));
    if(!ok)throw new Error("evm");return {q,parcial:ok<Object.keys(CH).length}}
  async function readBtc(a){const j=await getJ("https://mempool.space/api/address/"+a);const s=j.chain_stats,m=j.mempool_stats;
    return {q:{BTC:(s.funded_txo_sum-s.spent_txo_sum+m.funded_txo_sum-m.spent_txo_sum)/1e8},parcial:false}}
  async function readSol(a){const u=PN("solana"),q={SOL:(await rpc(u,"getBalance",[a])).value/1e9};
    try{const r=await rpc(u,"getTokenAccountsByOwner",[a,{mint:"EPjFWdd5AufqSSqeM2qJ1kyhKM7GgPZXzL5bVZ3xkcvQ"},{encoding:"jsonParsed"}]);
      q.USDC=r.value.reduce((s,x)=>s+(x.account.data.parsed.info.tokenAmount.uiAmount||0),0);return {q,parcial:false}}catch(e){return {q,parcial:true}}}
  const LIVEKEY="painel-carteira-ao-vivo";
  const sig=()=>DATA.lugares.map(l=>l.endereco||"").join("|");
  const say=(cls,msg)=>{const h=$("liveMsg");h.className="hint "+cls;h.textContent=msg};
  let busy=false;
  async function atualizarAgora(manual){
    if(busy)return;
    if(DATA.exemplo){if(manual)say("bad","Isso ainda é exemplo. Cole o endereço da sua carteira lá em cima primeiro.");return}
    const alvos=DATA.lugares.filter(l=>l.endereco&&COVER[net(l.endereco)]);
    if(!alvos.length){if(manual)say("","Nenhuma carteira com endereço pra ler. Use Atualizar com IA.");return}
    busy=true;$("live").setAttribute("aria-busy","true");say("","Lendo a blockchain…");
    let px;
    try{px=await getJ("https://api.coingecko.com/api/v3/simple/price?ids="+[...new Set(Object.values(PID))].join(",")+"&vs_currencies=usd,brl")}
    catch(e){busy=false;$("live").removeAttribute("aria-busy");say("bad","Esta janela não deixa o painel buscar dados sozinho. Use Atualizar com IA.");return}
    const cur=DATA.moeda==="BRL"?"brl":"usd",agora=new Date().toISOString();let lidos=0,falhas=0,parcial=false;
    await Promise.all(alvos.map(async l=>{const n=net(l.endereco);
      try{const r=n==="evm"?await readEvm(l.endereco):n==="btc"?await readBtc(l.endereco):await readSol(l.endereco);
        const cobre=COVER[n],novos=Object.entries(r.q).map(([s,qt])=>({simbolo:s,grupo:GRP[s],valor:Math.round(qt*((px[PID[s]]||{})[cur]||0)*100)/100})).filter(x=>x.valor>=1);
        l.ativos=l.ativos.filter(x=>!cobre.includes(x.simbolo)&&x.simbolo!=="?").concat(novos);
        if(!l.ativos.length)l.ativos=[{simbolo:"—",grupo:"altcoins",valor:0}];
        l.origem="lido";l.fonte=r.parcial?"ao vivo (parcial)":"ao vivo";l.hora=agora;if(r.parcial)parcial=true;lidos++}
      catch(e){falhas++}}));
    if(px.tether&&px.tether.brl&&px.tether.usd)DATA.cambio=Math.round(px.tether.brl/px.tether.usd*100)/100;
    if(lidos)DATA.atualizado=agora;
    try{localStorage.setItem(LIVEKEY,JSON.stringify({sig:sig(),t:Date.now(),lugares:DATA.lugares,cambio:DATA.cambio,atualizado:DATA.atualizado}))}catch(e){}
    render();busy=false;$("live").removeAttribute("aria-busy");
    if(!lidos)say("bad","Não deu pra ler agora. Tente de novo em instantes ou use Atualizar com IA.");
    else say(falhas||parcial?"":"ok","Atualizado agora"+(falhas?", mas "+falhas+" carteira(s) não responderam":"")+(parcial?", com alguma rede fora do ar":"")+". Lê BTC, ETH, BNB, SOL, USDC, USDT, WBTC e cbBTC; o resto fica com o valor da última atualização da IA.");
  }
  try{const s=JSON.parse(localStorage.getItem(LIVEKEY)||"null");if(s&&s.sig===sig()&&s.t>Date.parse(DATA.atualizado||0)){DATA.lugares=s.lugares;DATA.cambio=s.cambio;DATA.atualizado=s.atualizado}}catch(e){}
  render();

  /* Copiar: 1) API de clipboard  2) textarea + execCommand  3) texto selecionado pra copiar na mão.
     Gemini Canvas bloqueia o 1 (iframe sem permissão de clipboard), por isso os planos B e C. */
  async function copyTxt(t){
    try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(t);return true}}catch(e){}
    try{const x=document.createElement("textarea");x.value=t;x.setAttribute("readonly","");x.style.cssText="position:fixed;top:0;left:0;opacity:0;pointer-events:none";
      document.body.appendChild(x);x.focus();x.select();x.setSelectionRange(0,t.length);const r=document.execCommand("copy");x.remove();if(r)return true}catch(e){}
    return false}
  function manual(h,msg,t){h.className="hint";h.textContent=msg;const m=el("input","manual");m.type="text";m.readOnly=true;m.value=t;m.setAttribute("aria-label","Texto para copiar");
    h.append(m);const sel=()=>{m.focus();m.select();m.setSelectionRange(0,t.length)};m.addEventListener("focus",sel);m.addEventListener("click",sel);setTimeout(sel,0)}
  $("live").addEventListener("click",()=>atualizarAgora(true));
  $("askai").addEventListener("click",async()=>{const t="Atualiza meu painel";
    if(await copyTxt(t))say("ok","Copiado. Cole na conversa com a IA e mande: ela relê tudo, inclusive tokens fora da lista, e salva.");
    else manual($("liveMsg"),"Não deu pra copiar sozinho aqui. Copie o texto abaixo (já está selecionado) e mande na conversa com a IA:",t)});
  if(!DATA.exemplo&&Date.now()-Date.parse(DATA.atualizado||0)>15*60*1000)atualizarAgora(false);

  const app=$("app"),eye=$("eye");
  eye.addEventListener("click",()=>{const on=eye.getAttribute("aria-pressed")!=="true";eye.setAttribute("aria-pressed",on);app.classList.toggle("priv",on)});
  $("theme").addEventListener("click",()=>{const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;r.dataset.theme=dark?"light":"dark"});
  const mF=$("mFull"),mS=$("mShare");
  const mode=s=>{mF.setAttribute("aria-pressed",!s);mS.setAttribute("aria-pressed",s);app.classList.toggle("share",s)};
  mF.addEventListener("click",()=>mode(false));mS.addEventListener("click",()=>mode(true));
  const wire=(i,b,h)=>{const inp=$(i),btn=$(b),hint=$(h),base=hint.textContent;
    const s2=(cls,msg)=>{hint.className="hint "+cls;hint.textContent=msg};
    inp.addEventListener("input",()=>{const a=inp.value.trim();if(!a){s2("",base);return}
      if(a.split(/\s+/).length>=11){s2("bad","Isso parece uma seed. Apague daqui e nunca cole em lugar nenhum.");return}
      const n=net(a);n?s2("ok","Rede: "+NETNAME[n]+". Agora toque em Copiar pedido."):s2("","Confira se copiou o endereço inteiro.")});
    btn.addEventListener("click",async()=>{const a=inp.value.trim();
      if(!a){s2("bad","Cole o endereço primeiro.");inp.focus();return}
      if(a.split(/\s+/).length>=11){s2("bad","Isso parece uma seed. Não mande pra ninguém.");return}
      const t="Adiciona esta carteira no meu painel: "+a;
      if(await copyTxt(t))s2("ok","Copiado. Agora cole na conversa com a IA e mande.");
      else manual(hint,"Não deu pra copiar sozinho aqui. Copie o texto abaixo (já está selecionado) e mande na conversa:",t)})};
  wire("addr1","go1","hint1");wire("addr2","go2","hint2");

  }

  window.PainelCarteira={versao:VERSAO,montado:false};
  window.addEventListener("hashchange",function(){if(typeof DATA==="undefined"&&!window.DATA)location.reload()});
  if(document.body)montar();else document.addEventListener("DOMContentLoaded",montar);
})();
