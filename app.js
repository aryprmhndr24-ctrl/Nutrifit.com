/* NutriFit – akun pengguna berbasis browser (localStorage). */
var NAV=[['dashboard','🏠','Beranda'],['nutrisi','🥗','Nutrisi'],['olahraga','🏃','Olahraga'],['jadwal','📅','Jadwal'],['riwayat','📊','Riwayat'],['target','🎯','Target'],['profil','👤','Profil']];
var FOODS=[['Nasi putih',200,4,0,44],['Telur rebus',75,6,5,1],['Dada ayam 100 g',165,31,4,0],['Tempe 2 potong',160,16,9,8],['Tahu 2 potong',80,8,5,2],['Pisang',105,1,0,27],['Alpukat ½',160,2,15,9],['Salmon 100 g',208,20,13,0],['Susu 250 ml',120,8,5,12],['Oatmeal 1 mangkuk',150,5,3,27],['Apel',95,0,0,25],['Gado-gado',295,11,15,29]];
var MET={'Lari':9.8,'Jalan cepat':3.8,'Bersepeda':7.5,'HIIT':8,'Renang':6,'Yoga':2.5,'Angkat beban':5};
var TIPS=['Minum segelas air sebelum makan membantu mengenali rasa kenyang.','Protein di setiap waktu makan menjaga massa otot saat diet.','Jalan kaki 10 menit setelah makan membantu gula darah stabil.','Tidur 7–8 jam membantu nafsu makan dan pemulihan otot.','Siapkan camilan sehat agar tidak tergoda gorengan.','Konsistensi kecil setiap hari mengalahkan usaha besar sesekali.','Catat makanan segera setelah makan, jangan menunggu malam.'];
var U=null,cur='dashboard',RUN={on:false,sec:0,km:0},SPL=[],iv=null,CH='k',SD=0,CHAT=[],mode='login';
var mem={};
function sget(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}}
function sset(k,v){try{localStorage.setItem(k,v)}catch(e){mem[k]=v}}
function sdel(k){try{localStorage.removeItem(k)}catch(e){delete mem[k]}}
function save(){if(U)sset('nf_u_'+U.email,JSON.stringify(U))}
var $=function(i){return document.getElementById(i)};
function p2(n){return (n<10?'0':'')+n}
function ymd(d){d=d||new Date();return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function pct(a,b){return b>0?Math.max(0,Math.min(100,Math.round(a/b*100))):0}
function fmt(s){return p2(Math.floor(s/60))+':'+p2(s%60)}
function toast(m){var t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove('show')},2200)}
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ---------- hitungan ---------- */
function bmi(){return U.w/Math.pow(U.h/100,2)}
function cat(b){return b<18.5?['Kurus','w']:b<25?['Normal (ideal)','ok']:b<30?['Berlebih','w']:['Obesitas','bad']}
function bmrOf(g,w,h,a){return Math.round(10*w+6.25*h-5*a+(g=='L'?5:-161))}
function tot(){return U.meals.reduce(function(a,m){a.k+=m.k;a.p+=m.p;a.l+=m.l;a.c+=m.c;return a},{k:0,p:0,l:0,c:0})}
function mt(){var p=Math.round(U.w*1.6),f=Math.round(U.kcalGoal*.25/9);return{p:p,l:f,c:Math.max(0,Math.round((U.kcalGoal-p*4-f*9)/4))}}
function burnToday(){return Math.round(U.sessions.filter(function(s){return s.d==U.date}).reduce(function(a,s){return a+s.kcal},0))}
function done(){return U.sched.filter(function(s){return s.done}).length}
function score(){var t=tot().k,g=U.kcalGoal,a=t<=g*1.1?Math.min(1,t/g):Math.max(0,2-t/g);var r=[a,Math.min(1,U.water/U.waterGoal),U.sched.length?done()/U.sched.length:0,Math.min(1,burnToday()/300)];return Math.round(r.reduce(function(x,y){return x+y},0)/4*100)}
function ftype(){var h=new Date().getHours();return h<10?'Sarapan':h<15?'Makan Siang':h<18?'Camilan':'Makan Malam'}

/* ---------- animasi ---------- */
function tween(a,b,ms,fn){if(reduce){fn(b);return}var s=performance.now();(function f(n){var k=Math.min(1,(n-s)/ms),e=1-Math.pow(1-k,3);fn(a+(b-a)*e);if(k<1)requestAnimationFrame(f)})(s)}
function anim(){
 document.querySelectorAll('[data-w]').forEach(function(e){requestAnimationFrame(function(){requestAnimationFrame(function(){e.style.width=e.dataset.w+'%'})})});
 document.querySelectorAll('[data-h]').forEach(function(e){requestAnimationFrame(function(){requestAnimationFrame(function(){e.style.height=e.dataset.h+'%'})})});
 document.querySelectorAll('[data-n]').forEach(function(e){var d=+e.dataset.d||0,v=+e.dataset.n;tween(0,v,800,function(x){e.textContent=x.toFixed(d).replace('.',',')})});
 document.querySelectorAll('[data-p]').forEach(function(e){tween(0,+e.dataset.p,900,function(x){e.style.setProperty('--p',x)})})}
function N(v,d){d=d||0;return '<span data-n="'+v+'" data-d="'+d+'">'+(+v).toFixed(d).replace('.',',')+'</span>'}
function bar(v,c){return '<div class="bar"><i class="'+(c||'')+'" data-w="'+v+'" style="width:0"></i></div>'}
function confetti(){if(reduce)return;var c=$('fx'),x=c.getContext('2d'),P=[],f=0;c.width=innerWidth;c.height=innerHeight;for(var i=0;i<100;i++)P.push({x:innerWidth/2,y:innerHeight*.6,vx:(Math.random()-.5)*14,vy:-Math.random()*14-3,c:'hsl('+Math.random()*360+',85%,60%)',s:5+Math.random()*5});(function L(){x.clearRect(0,0,c.width,c.height);P.forEach(function(p){p.vy+=.4;p.x+=p.vx;p.y+=p.vy;x.fillStyle=p.c;x.fillRect(p.x,p.y,p.s,p.s)});if(++f<110)requestAnimationFrame(L);else x.clearRect(0,0,c.width,c.height)})()}
function check(){var F=U.flags=U.flags||{};if(!F.w&&U.water>=U.waterGoal){F.w=1;confetti();toast('💧 Target air hari ini tercapai!')}if(!F.a&&U.sched.length&&done()==U.sched.length){F.a=1;confetti();toast('🎉 Semua agenda hari ini selesai!')}}

/* ---------- akun ---------- */
function rnd(){var a=new Uint8Array(12);try{crypto.getRandomValues(a)}catch(e){for(var i=0;i<12;i++)a[i]=Math.random()*256}return Array.from(a).map(function(x){return ('0'+x.toString(16)).slice(-2)}).join('')}
async function hash(pw,salt){var t=salt+pw;try{var b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return Array.from(new Uint8Array(b)).map(function(x){return ('0'+x.toString(16)).slice(-2)}).join('')}catch(e){var h=5381;for(var i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return 'f'+h}}
function aerr(m){var e=$('aerr');e.textContent=m;e.classList.remove('hide')}
function authView(m){mode=m||mode;$('appwrap').classList.add('hide');var a=$('auth');a.classList.remove('hide');var r=mode=='reg';
 a.innerHTML='<div class="acard"><div class="logo" style="margin:0 0 4px">NutriFit<small>Kesehatan & kalori harianmu</small></div>'+
 '<div class="days" style="grid-template-columns:1fr 1fr;margin:14px 0"><button class="'+(r?'':'on')+'" onclick="authView(\'login\')">Masuk</button><button class="'+(r?'on':'')+'" onclick="authView(\'reg\')">Daftar</button></div>'+
 '<form onsubmit="'+(r?'doReg()':'doLogin()')+';return false" autocomplete="on">'+
 (r?'<div class="mb"><label for="rn">Nama lengkap</label><input id="rn" autocomplete="name" required></div>':'')+
 '<div class="mb"><label for="re">Email</label><input id="re" type="email" autocomplete="email" required></div>'+
 '<div class="mb"><label for="rp">Kata sandi'+(r?' (min. 6 karakter)':'')+'</label><input id="rp" type="password" autocomplete="'+(r?'new-password':'current-password')+'" required></div>'+
 (r?'<div class="f"><div><label for="rg">Jenis kelamin</label><select id="rg"><option value="P">Perempuan</option><option value="L">Laki-laki</option></select></div><div><label for="ra">Usia</label><input id="ra" type="number" value="24" min="10" max="99"></div><div><label for="rw">Berat (kg)</label><input id="rw" type="number" value="55" min="25" max="250"></div><div><label for="rh">Tinggi (cm)</label><input id="rh" type="number" value="162" min="100" max="230"></div></div>'+
 '<div class="f"><div><label for="rt">Tujuan</label><select id="rt"><option value="turun">Turunkan berat</option><option value="jaga" selected>Jaga berat</option><option value="naik">Naikkan berat</option></select></div><div><label for="rx">Target berat (kg)</label><input id="rx" type="number" value="55"></div></div>':'')+
 '<p id="aerr" class="tag bad hide" style="display:block;margin-bottom:10px;border-radius:10px"></p>'+
 '<button class="btn" style="width:100%">'+(r?'Buat akun':'Masuk')+'</button></form>'+
 '<p class="sub" style="margin:14px 0 0;font-size:12px">Akun disimpan di browser ini saja (tanpa server), jadi tidak bisa dibuka dari perangkat lain.</p></div>'}
async function doReg(){
 var n=$('rn').value.trim(),e=$('re').value.trim().toLowerCase(),pw=$('rp').value,g=$('rg').value,a=+$('ra').value,w=+$('rw').value,h=+$('rh').value,tg=$('rt').value,tw=+$('rx').value;
 if(n.length<2)return aerr('Isi nama lengkap.');if(!/^\S+@\S+\.\S+$/.test(e))return aerr('Format email belum benar.');if(pw.length<6)return aerr('Kata sandi minimal 6 karakter.');
 if(!(a>9&&w>24&&h>99&&tw>24))return aerr('Periksa usia, berat, tinggi, dan target berat.');
 if(sget('nf_u_'+e))return aerr('Email ini sudah terdaftar. Silakan masuk.');
 var salt=rnd(),kc=Math.round((bmrOf(g,w,h,a)*1.4+(tg=='turun'?-400:tg=='naik'?300:0))/50)*50,t=ymd();
 U={email:e,name:n,salt:salt,hash:await hash(pw,salt),g:g,age:a,w:w,h:h,goal:tg,tw:tw,kcalGoal:kc,waterGoal:Math.round(w*.04*10)/10,date:t,meals:[],water:0,flags:{},hist:[],sessions:[],streak:0,prof:{notif:true},wt:[{d:t,w:w}],
 sched:[['06:00','Air lemon hangat','250 ml · Hidrasi'],['06:30','Olahraga pagi','30 menit · Olahraga'],['08:00','Sarapan bergizi','Makan'],['12:30','Makan siang seimbang','Makan'],['16:00','Camilan sehat','Makan'],['19:00','Makan malam ringan','Makan'],['21:30','Evaluasi harian & tidur cukup','Rutinitas']].map(function(s){return{t:s[0],n:s[1],d:s[2],done:false}})};
 save();sset('nf_s',e);start(true)}
async function doLogin(){
 var e=$('re').value.trim().toLowerCase(),pw=$('rp').value,raw=sget('nf_u_'+e);
 if(!raw)return aerr('Akun tidak ditemukan di browser ini. Daftar dulu.');
 var u=JSON.parse(raw);if(await hash(pw,u.salt)!==u.hash)return aerr('Kata sandi salah.');
 U=u;sset('nf_s',e);start()}
function logout(){clearInterval(iv);RUN={on:false,sec:0,km:0};SPL=[];sdel('nf_s');U=null;CHAT=[];authView('login')}
function delAcc(){if(!confirm('Hapus akun dan semua datanya dari browser ini? Tindakan ini tidak bisa dibatalkan.'))return;sdel('nf_u_'+U.email);logout()}

/* ---------- hari baru & mulai ---------- */
function rollDay(){var t=ymd();if(U.date==t)return;var gap=Math.round((new Date(t+'T00:00')-new Date(U.date+'T00:00'))/864e5),e={d:U.date,k:tot().k,w:U.water,b:burnToday(),s:pct(done(),U.sched.length)};
 U.hist.push(e);U.hist=U.hist.slice(-60);U.streak=gap>1?0:((e.k>0||e.s>=50)?U.streak+1:0);U.date=t;U.meals=[];U.water=0;U.flags={};U.sched.forEach(function(s){s.done=false});save()}
function start(isNew){rollDay();U.lw=Date.now();SD=(new Date().getDay()+6)%7;CHAT=[{r:'m',t:'Halo '+U.name.split(' ')[0]+'! Saya Maya, coach nutrisimu. '+(isNew?'Target harianmu sudah saya hitung: '+U.kcalGoal+' kkal dan '+U.waterGoal+' L air.':'Tanya apa saja soal kalori, air, protein, atau olahraga.')}];
 $('auth').classList.add('hide');$('appwrap').classList.remove('hide');var h=location.hash.slice(1);cur=V[h]?h:'dashboard';render();if(isNew)toast('Akun dibuat. Selamat datang!')}

/* ---------- aksi ---------- */
function setWater(n){var f=Math.round(U.water/.25);U.water=(n==f?n-1:n)*.25;U.lw=Date.now();save();render();check()}
function setP(){var a=+$('ia').value,w=+$('iw').value,h=+$('ih').value;if(!(a>9&&w>24&&h>99))return;U.age=a;U.w=w;U.h=h;var c=cat(bmi());$('bv').textContent=bmi().toFixed(1).replace('.',',');$('bc').textContent=c[0];$('bc').className='tag '+c[1];$('bm').textContent='Estimasi BMR '+bmrOf(U.g,w,h,a)+' kkal/hari. Rentang ideal 18,5 – 24,9.';save()}
function addFood(i){var f=FOODS[i];U.meals.push({n:f[0],t:ftype(),k:f[1],p:f[2],l:f[3],c:f[4]});save();render();toast('+ '+f[0]);if(tot().k>=U.kcalGoal&&!U.flags.k){U.flags.k=1;toast('Target kalori hari ini terpenuhi')}}
function addMeal(){var n=$('mn').value.trim(),k=+$('mk').value;if(!n||!(k>0)){toast('Isi nama dan kalori dulu');return}U.meals.push({n:n,t:$('mt').value,k:k,p:+$('mp').value||0,l:+$('ml').value||0,c:+$('mc').value||0});save();render();toast('Makanan dicatat')}
function delMeal(i){U.meals.splice(i,1);save();render()}
function tgl(i){var s=U.sched[i];s.done=!s.done;save();render();if(s.done){toast('Mantap! '+s.n+' selesai ✓');check()}}
function delSched(i){U.sched.splice(i,1);save();render()}
function addSched(){var n=$('sn').value.trim();if(!n){toast('Tulis nama agenda');return}U.sched.push({t:$('st').value||'21:00',n:n,d:'Agenda pribadi',done:false});U.sched.sort(function(a,b){return a.t<b.t?-1:1});save();render();toast('Jadwal ditambahkan')}
function logWork(){var ty=$('wt').value,m=+$('wm').value;if(!(m>0)){toast('Isi durasi (menit)');return}var k=Math.round(MET[ty]*U.w*m/60);U.sessions.push({d:U.date,type:ty,min:m,km:0,kcal:k});save();render();toast(ty+' '+m+' mnt · '+k+' kkal')}
function saveWeight(){var w=+$('nw').value;if(!(w>24))return toast('Masukkan berat yang valid');U.w=w;var l=U.wt[U.wt.length-1];if(l.d==U.date)l.w=w;else U.wt.push({d:U.date,w:w});save();render();toast('Berat diperbarui')}
function saveTarget(){var w=+$('tw').value;if(!(w>24))return;U.tw=w;save();render()}
function saveProfile(){var n=$('pn').value.trim(),a=+$('pa').value,h=+$('ph').value,k=+$('pk').value,wg=+$('pw').value;if(n.length<2||!(a>9&&h>99&&k>800&&wg>0))return toast('Periksa isian profil');U.name=n;U.age=a;U.h=h;U.kcalGoal=k;U.waterGoal=wg;save();render();toast('Profil disimpan')}
function theme(){var d=document.documentElement,dk=d.getAttribute('data-theme')?d.getAttribute('data-theme')=='dark':matchMedia('(prefers-color-scheme:dark)').matches;d.setAttribute('data-theme',dk?'light':'dark');sset('nf_theme',dk?'light':'dark')}

/* ---------- pelacak lari ---------- */
function pace(){if(RUN.km<.03)return '--:--';var p=RUN.sec/RUN.km;return Math.floor(p/60)+':'+p2(Math.round(p%60))}
function toggleRun(){RUN.on=!RUN.on;if(RUN.on)iv=setInterval(tick,1000);else clearInterval(iv);if(cur=='olahraga')render()}
function tick(){RUN.sec++;RUN.km+=.0028*(1+Math.sin(RUN.sec/9)*.12);if(cur=='olahraga'&&$('rk')){$('rk').textContent=RUN.km.toFixed(2).replace('.',',');$('rp').textContent=pace();$('rt').textContent=fmt(RUN.sec);$('rc').textContent=Math.round(RUN.km*U.w);$('rh').textContent=Math.round(120+Math.min(40,RUN.sec/6)+Math.sin(RUN.sec/5)*4);$('rbar').style.width=pct(RUN.km,5)+'%'}}
function lap(){if(RUN.sec<3){toast('Mulai sesi dulu');return}var l=SPL.reduce(function(a,s){return a+s.km},0);SPL.push({km:RUN.km-l,p:pace(),t:fmt(RUN.sec)});$('sp').innerHTML=spl()}
function spl(){return SPL.length?SPL.map(function(s,i){return '<div class="item"><b style="flex:1">Putaran '+(i+1)+'</b><span>'+s.km.toFixed(2).replace('.',',')+' km · '+s.p+' /km · '+s.t+'</span></div>'}).join(''):'<p class="sub">Belum ada putaran. Tekan Mulai lalu Lap.</p>'}
function stopRun(){clearInterval(iv);if(RUN.sec>=10){var k=Math.round(RUN.km*U.w);U.sessions.push({d:U.date,type:'Lari',min:Math.max(1,Math.round(RUN.sec/60)),km:+RUN.km.toFixed(2),kcal:k});save();toast('Sesi disimpan: '+RUN.km.toFixed(2).replace('.',',')+' km · '+k+' kkal');confetti()}RUN={on:false,sec:0,km:0};SPL=[];if(cur=='olahraga')render()}

/* ---------- coach Maya ---------- */
function reply(q){q=q.toLowerCase();var t=tot(),left=U.kcalGoal-t.k,m=mt(),f=U.name.split(' ')[0];
 if(/terima kasih|makasih/.test(q))return 'Sama-sama, '+f+'! Semangat terus.';
 if(/air|minum|hidrasi/.test(q))return 'Kamu sudah minum '+U.water.toFixed(2).replace('.',',')+' L dari target '+U.waterGoal+' L. '+(U.water>=U.waterGoal?'Target tercapai, pertahankan!':'Sisa '+(U.waterGoal-U.water).toFixed(2).replace('.',',')+' L, coba segelas tiap jam.');
 if(/protein/.test(q))return 'Protein hari ini '+t.p+' dari '+m.p+' g. '+(t.p>=m.p?'Sudah cukup.':'Kurang '+(m.p-t.p)+' g. Coba dada ayam, telur, tempe, atau salmon.');
 if(/olahraga|workout|lari|bakar/.test(q))return 'Hari ini kamu membakar '+burnToday()+' kkal dari olahraga. '+(burnToday()<200?'Jalan cepat 30 menit sekitar '+Math.round(3.8*U.w*.5)+' kkal untuk bobot '+U.w+' kg.':'Bagus, lanjutkan dengan peregangan.');
 if(/berat|bmi|turun|naik|diet/.test(q))return 'BMI kamu '+bmi().toFixed(1).replace('.',',')+' ('+cat(bmi())[0]+'). Berat '+U.w+' kg, target '+U.tw+' kg. Target kalori harian '+U.kcalGoal+' kkal.';
 if(/makan|menu|saran|kalori|sisa|lapar/.test(q)){if(!t.k)return 'Belum ada makanan tercatat. Mulai dari sarapan: oatmeal, telur, atau pisang. Target hari ini '+U.kcalGoal+' kkal.';return left>0?'Sisa kuota '+left+' kkal. '+(left>400?'Cukup untuk makan utama, mis. nasi, ayam, dan sayur.':'Pilih camilan ringan, mis. apel atau yogurt.'):'Kamu sudah melewati target sebesar '+(-left)+' kkal. Pilih air putih dan aktivitas ringan.'}
 if(/^(halo|hai|hi|pagi|siang|malam)/.test(q))return 'Halo '+f+'! Mau cek kalori, air, protein, atau olahraga?';
 return 'Coba tanya soal air, protein, kalori, olahraga, atau berat badan.'}
function chatHtml(){return CHAT.map(function(c){return '<div class="bub '+c.r+'">'+esc(c.t)+'</div>'}).join('')}
function ask(q){var i=$('q');q=(q||i.value).trim();if(!q)return;i.value='';CHAT.push({r:'u',t:q},{r:'m',t:'…'});var b=$('chat');b.innerHTML=chatHtml();b.scrollTop=1e5;setTimeout(function(){CHAT[CHAT.length-1].t=reply(q);b.innerHTML=chatHtml();b.scrollTop=1e5},700)}

/* ---------- halaman ---------- */
var V={
dashboard:function(){var t=tot(),b=bmi(),c=cat(b),sc=score(),h=new Date().getHours(),g=h<11?'Selamat pagi':h<15?'Selamat siang':h<18?'Selamat sore':'Selamat malam',gl=Math.ceil(U.waterGoal/.25),fl=Math.round(U.water/.25),gs='';
 for(var i=0;i<gl;i++)gs+='<button class="gl'+(i<fl?' on':'')+'" aria-label="Gelas '+(i+1)+'" onclick="setWater('+(i+1)+')">💧</button>';
 var last=U.sessions.length?U.sessions[U.sessions.length-1]:null;
 return '<div class="row sp"><h1>'+g+', '+esc(U.name.split(' ')[0])+'!</h1><span class="tag w">🔥 '+U.streak+' hari beruntun</span></div><p class="sub">'+new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+'</p>'+
 '<div class="card tip">💡 '+TIPS[new Date().getDate()%TIPS.length]+'</div>'+
 '<div class="grid"><div class="card row"><div class="ring" data-p="'+sc+'"><div><span>'+N(sc)+'%</span><small>Skor hari ini</small></div></div><div><b>'+(sc>=80?'Sangat optimal':sc>=50?'Terus lanjutkan':'Ayo mulai hari ini')+'</b><br><span class="sub">gabungan kalori, air, agenda, olahraga</span></div></div>'+
 '<div class="card"><h3>Kalori masuk</h3><div class="big">'+N(t.k)+' <small>/ '+U.kcalGoal+' kkal</small></div>'+bar(pct(t.k,U.kcalGoal),t.k>U.kcalGoal*1.1?'w':'')+'<div class="row" style="margin-top:10px"><button class="btn alt" onclick="go(\'nutrisi\')">+ Catat makanan</button></div></div>'+
 '<div class="card"><h3>Terbakar hari ini</h3><div class="big">'+N(burnToday())+' <small>kkal</small></div>'+bar(pct(burnToday(),300),'g')+'<div class="row" style="margin-top:10px"><button class="btn alt" onclick="go(\'olahraga\')">'+(last&&last.d==U.date?'Tambah sesi':'Mulai workout')+'</button></div></div></div>'+
 '<div class="card" style="margin-bottom:14px"><div class="row sp"><h3>Hidrasi · '+U.water.toFixed(2).replace('.',',')+' / '+U.waterGoal+' L</h3><span class="sub">1 gelas = 250 ml</span></div><div class="glasses">'+gs+'</div></div>'+
 '<div class="card"><h3>Kalkulator BMI & metabolisme</h3><div class="f"><div><label for="ia">Usia</label><input id="ia" type="number" value="'+U.age+'" oninput="setP()"></div><div><label for="iw">Berat (kg)</label><input id="iw" type="number" value="'+U.w+'" oninput="setP()"></div><div><label for="ih">Tinggi (cm)</label><input id="ih" type="number" value="'+U.h+'" oninput="setP()"></div></div><div class="big"><span id="bv">'+b.toFixed(1).replace('.',',')+'</span> <small>kg/m²</small> <span class="tag '+c[1]+'" id="bc">'+c[0]+'</span></div><p class="sub" style="margin:8px 0 0" id="bm">Estimasi BMR '+bmrOf(U.g,U.w,U.h,U.age)+' kkal/hari. Rentang ideal 18,5 – 24,9.</p></div>'},

nutrisi:function(){var t=tot(),m=mt(),left=U.kcalGoal-t.k;
 return '<h1>Nutrisi & makanan</h1><p class="sub">Catat asupan, lihat makronutrien secara langsung.</p>'+
 '<div class="grid"><div class="card row"><div class="ring" data-p="'+pct(t.k,U.kcalGoal)+'"><div><span>'+N(t.k)+'</span><small>/ '+U.kcalGoal+' kkal</small></div></div><div><h3>'+(left>=0?'Sisa kuota':'Melebihi')+'</h3><div class="big">'+N(Math.abs(left))+' <small>kkal</small></div></div></div>'+
 '<div class="card"><h3>Makronutrien</h3>'+[['Protein',t.p,m.p],['Lemak',t.l,m.l],['Karbo',t.c,m.c]].map(function(x){return '<div class="row sp"><b>'+x[0]+'</b><span>'+x[1]+' / '+x[2]+' g</span></div>'+bar(pct(x[1],x[2]),'g')}).join('')+'</div></div>'+
 '<div class="card" style="margin-bottom:14px"><h3>Tambah cepat · '+ftype()+'</h3><div class="chips">'+FOODS.map(function(f,i){return '<button class="chip" onclick="addFood('+i+')">'+f[0]+' <small>'+f[1]+'</small></button>'}).join('')+'</div></div>'+
 '<div class="card"><div class="row sp"><h3>Makanan hari ini</h3><span class="tag">'+U.meals.length+' catatan</span></div>'+(U.meals.length?U.meals.map(function(m,i){return '<div class="item"><div style="flex:1"><b>'+esc(m.n)+'</b><span>'+m.t+' · P '+m.p+' g · L '+m.l+' g · K '+m.c+' g</span></div><b>'+m.k+' kkal</b><button class="btn alt" aria-label="Hapus" onclick="delMeal('+i+')">✕</button></div>'}).join(''):'<p class="sub">Belum ada makanan. Pilih dari tombol di atas atau isi manual.</p>')+
 '<div class="f" style="margin:14px 0 10px"><div style="grid-column:span 2"><label for="mn">Nama makanan</label><input id="mn" placeholder="mis. Tempe bacem"></div><div><label for="mk">Kalori</label><input id="mk" type="number"></div><div><label for="mt">Waktu</label><select id="mt"><option>Sarapan</option><option>Makan Siang</option><option>Camilan</option><option>Makan Malam</option></select></div><div><label for="mp">Protein (g)</label><input id="mp" type="number"></div><div><label for="ml">Lemak (g)</label><input id="ml" type="number"></div><div><label for="mc">Karbo (g)</label><input id="mc" type="number"></div></div><button class="btn" onclick="addMeal()">Catat manual</button></div>'},

olahraga:function(){var ss=U.sessions.slice(-5).reverse();
 return '<h1>Pelacak olahraga</h1><p class="sub">Sesi lari simulasi dengan data langsung, atau catat olahraga manual.</p>'+
 '<div class="grid"><div class="card"><h3>Jarak</h3><div class="big"><span id="rk">'+RUN.km.toFixed(2).replace('.',',')+'</span> <small>km</small></div><div class="bar"><i id="rbar" style="width:'+pct(RUN.km,5)+'%"></i></div><span class="sub">Target 5 km</span></div><div class="card"><h3>Pace</h3><div class="big" id="rp">'+pace()+'</div></div><div class="card"><h3>Durasi</h3><div class="big" id="rt">'+fmt(RUN.sec)+'</div></div><div class="card"><h3>Kalori · detak jantung</h3><div class="big"><span id="rc">'+Math.round(RUN.km*U.w)+'</span> <small>kkal · <span id="rh">'+(RUN.on?130:0)+'</span> BPM</small></div></div></div>'+
 '<div class="card" style="margin-bottom:14px"><div class="row"><button class="btn" onclick="toggleRun()">'+(RUN.on?'Jeda':RUN.sec?'Lanjut':'Mulai lari')+'</button><button class="btn alt" onclick="lap()">Lap</button><button class="btn alt" onclick="stopRun()">Selesai & simpan</button></div><h3 style="margin-top:16px">Putaran</h3><div id="sp">'+spl()+'</div></div>'+
 '<div class="grid"><div class="card"><h3>Catat olahraga manual</h3><div class="f"><div><label for="wt">Jenis</label><select id="wt">'+Object.keys(MET).map(function(k){return '<option>'+k+'</option>'}).join('')+'</select></div><div><label for="wm">Menit</label><input id="wm" type="number" value="30"></div></div><button class="btn" onclick="logWork()">Simpan sesi</button></div>'+
 '<div class="card"><h3>Sesi terakhir</h3>'+(ss.length?ss.map(function(s){return '<div class="item"><div style="flex:1"><b>'+s.type+'</b><span>'+s.d+' · '+s.min+' mnt'+(s.km?' · '+String(s.km).replace('.',',')+' km':'')+'</span></div><b>'+s.kcal+' kkal</b></div>'}).join(''):'<p class="sub">Belum ada sesi.</p>')+'</div></div>'},

jadwal:function(){var D=['Sen','Sel','Rab','Kam','Jum','Sab','Min'],tdi=(new Date().getDay()+6)%7,now=new Date(),ds=[];
 for(var i=0;i<7;i++){var d=new Date(now);d.setDate(now.getDate()-tdi+i);ds.push(d)}
 var strip='<div class="days">'+ds.map(function(d,i){return '<button class="'+(i==SD?'on':'')+'" onclick="SD='+i+';render()">'+D[i]+'<small>'+d.getDate()+'</small></button>'}).join('')+'</div>',body;
 if(SD==tdi){body='<div class="card"><div class="row sp"><h3>Agenda hari ini</h3><span class="tag ok">'+done()+' / '+U.sched.length+' selesai</span></div>'+bar(pct(done(),U.sched.length),'g')+(U.sched.length?U.sched.map(function(s,i){return '<div class="item"><button class="chk'+(s.done?' on':'')+'" aria-label="Tandai selesai" onclick="tgl('+i+')">'+(s.done?'✓':'')+'</button><div style="flex:1"><b style="'+(s.done?'text-decoration:line-through;color:var(--mute)':'')+'">'+esc(s.n)+'</b><span>'+s.t+' WIB · '+esc(s.d)+'</span></div><button class="btn alt" aria-label="Hapus" onclick="delSched('+i+')">✕</button></div>'}).join(''):'<p class="sub">Belum ada agenda. Tambahkan di bawah.</p>')+
 '<div class="f" style="margin:14px 0 10px"><div><label for="st">Jam</label><input id="st" type="time" value="21:00"></div><div style="grid-column:span 2"><label for="sn">Agenda baru</label><input id="sn" placeholder="mis. Yoga 20 menit"></div></div><button class="btn" onclick="addSched()">+ Tambah jadwal</button></div>'}
 else{var key=ymd(ds[SD]),e=U.hist.filter(function(x){return x.d==key})[0];body='<div class="card"><h3>'+ds[SD].toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'})+'</h3>'+(SD>tdi?'<p class="sub">Hari ini belum tiba.</p>':e?'<div class="big">'+e.k+' <small>kkal masuk · '+e.b+' kkal terbakar · agenda '+e.s+'%</small></div>':'<p class="sub">Belum ada data untuk hari ini.</p>')+'</div>'}
 return '<h1>Jadwal & konsultan AI</h1><p class="sub">Rencana harian dan tanya jawab dengan Maya.</p>'+strip+body+
 '<div class="card" style="margin-top:14px"><h3>Maya · NutriFit Coach</h3><div class="chat" id="chat">'+chatHtml()+'</div><div class="chips" style="margin:10px 0">'+['Sisa kalori?','Protein hari ini','Berapa air lagi?','Saran makan'].map(function(x){return '<button class="chip" onclick="ask(\''+x+'\')">'+x+'</button>'}).join('')+'</div><div class="row"><input id="q" placeholder="Tanyakan nutrisi atau workout…" style="flex:1" onkeydown="if(event.key==\'Enter\')ask()"><button class="btn" onclick="ask()">Kirim</button></div></div>'},

riwayat:function(){var D=U.hist.slice(-6).concat([{d:U.date,k:tot().k,b:burnToday(),s:pct(done(),U.sched.length),w:U.water,t:1}]),key=CH,mx=Math.max.apply(null,D.map(function(x){return x[key]}).concat(key=='k'?[U.kcalGoal]:[100])),
 avg=Math.round(D.reduce(function(a,x){return a+x.k},0)/D.length),bt=D.reduce(function(a,x){return a+x.b},0),ok=D.filter(function(x){return x.s>=70}).length;
 return '<h1>Riwayat & log</h1><p class="sub">Ringkasan hari-hari terakhir.</p>'+
 '<div class="grid"><div class="card"><h3>Rata-rata asupan</h3><div class="big">'+N(avg)+' <small>kkal</small></div></div><div class="card"><h3>Total terbakar</h3><div class="big">'+N(bt)+' <small>kkal</small></div></div><div class="card"><h3>Hari agenda ≥70%</h3><div class="big">'+N(ok)+' <small>dari '+D.length+'</small></div></div><div class="card"><h3>Beruntun</h3><div class="big">🔥 '+N(U.streak)+' <small>hari</small></div></div></div>'+
 '<div class="card" style="margin-bottom:14px"><div class="row sp"><h3>'+(key=='k'?'Asupan kalori':'Kalori terbakar')+'</h3><div class="row"><button class="chip'+(key=='k'?' on':'')+'" onclick="CH=\'k\';render()">Asupan</button><button class="chip'+(key=='b'?' on':'')+'" onclick="CH=\'b\';render()">Terbakar</button></div></div><div class="chart">'+(key=='k'?'<div class="goal" style="bottom:calc('+Math.round(U.kcalGoal/mx*100)+'% * .82 + 18px)"></div>':'')+D.map(function(x){return '<div><b>'+x[key]+'</b><i data-h="'+Math.round(x[key]/mx*100)+'" style="height:0"></i>'+(x.t?'Hari ini':new Date(x.d+'T00:00').toLocaleDateString('id-ID',{weekday:'short'}))+'</div>'}).join('')+'</div>'+(U.hist.length?'':'<p class="sub" style="margin:10px 0 0">Grafik akan terisi seiring hari berganti.</p>')+'</div>'+
 '<div class="card"><h3>Log hari ini</h3>'+(U.meals.length||U.sessions.some(function(s){return s.d==U.date})?U.meals.map(function(m){return '<div class="item"><div style="flex:1"><b>'+esc(m.n)+'</b><span>'+m.t+'</span></div><b>'+m.k+' kkal</b></div>'}).join('')+U.sessions.filter(function(s){return s.d==U.date}).map(function(s){return '<div class="item"><div style="flex:1"><b>🏃 '+s.type+'</b><span>'+s.min+' menit</span></div><b>−'+s.kcal+' kkal</b></div>'}).join(''):'<p class="sub">Belum ada catatan hari ini.</p>')+'</div>'},

target:function(){var s=U.wt[0].w,d=U.tw-s,pr=d==0?100:pct((U.w-s)/d*100,100),W=U.wt.slice(-12),mn=Math.min.apply(null,W.map(function(x){return x.w}))-1,mx=Math.max.apply(null,W.map(function(x){return x.w}))+1,
 pts=W.map(function(x,i){return (W.length>1?i/(W.length-1)*280:140)+10+','+(70-(x.w-mn)/(mx-mn)*60)}).join(' '),
 n=[U.water>=U.waterGoal,tot().k>=U.kcalGoal*.9&&tot().k<=U.kcalGoal*1.1,burnToday()>=200,done()==U.sched.length&&U.sched.length>0].filter(Boolean).length;
 return '<h1>Target kesehatan</h1><p class="sub">'+n+' dari 4 target harian tercapai hari ini.</p>'+
 '<div class="grid"><div class="card"><h3>Berat badan</h3><div class="big">'+N(U.w,1)+' <small>/ '+U.tw+' kg</small></div>'+bar(pr,'g')+'<span class="sub">Progres '+pr+'% dari '+s+' kg</span></div><div class="card"><h3>Air</h3><div class="big">'+N(U.water,2)+' <small>/ '+U.waterGoal+' L</small></div>'+bar(pct(U.water,U.waterGoal))+'</div><div class="card"><h3>Kalori</h3><div class="big">'+N(tot().k)+' <small>/ '+U.kcalGoal+' kkal</small></div>'+bar(pct(tot().k,U.kcalGoal))+'</div><div class="card"><h3>Olahraga</h3><div class="big">'+N(burnToday())+' <small>/ 200 kkal</small></div>'+bar(pct(burnToday(),200),'g')+'</div></div>'+
 '<div class="grid"><div class="card"><h3>Perbarui berat hari ini</h3><div class="row"><input id="nw" type="number" step="0.1" value="'+U.w+'" style="flex:1"><button class="btn" onclick="saveWeight()">Simpan</button></div><h3 style="margin-top:14px">Target berat (kg)</h3><div class="row"><input id="tw" type="number" step="0.1" value="'+U.tw+'" style="flex:1"><button class="btn alt" onclick="saveTarget()">Ubah</button></div></div>'+
 '<div class="card"><h3>Tren berat</h3><svg viewBox="0 0 300 80" style="width:100%" role="img" aria-label="Grafik tren berat"><polyline points="'+pts+'" fill="none" stroke="var(--pri)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'+W.map(function(x,i){return '<circle cx="'+((W.length>1?i/(W.length-1)*280:140)+10)+'" cy="'+(70-(x.w-mn)/(mx-mn)*60)+'" r="4" fill="var(--pri)"/>'}).join('')+'</svg><span class="sub">'+W.length+' catatan berat</span></div></div>'},

profil:function(){var c=cat(bmi());
 return '<h1>Profil pengguna</h1><div class="card row" style="margin-bottom:14px"><div class="ring" data-p="100" style="width:64px;height:64px"><div style="width:52px;height:52px;font-size:18px">'+esc(U.name.split(' ').map(function(x){return x[0]}).slice(0,2).join('').toUpperCase())+'</div></div><div><b style="font-size:17px">'+esc(U.name)+'</b><br><span class="sub">'+esc(U.email)+'</span><br><span class="tag '+c[1]+'">BMI '+bmi().toFixed(1).replace('.',',')+' · '+c[0]+'</span></div></div>'+
 '<div class="card" style="margin-bottom:14px"><h3>Ubah data</h3><div class="f"><div style="grid-column:span 2"><label for="pn">Nama</label><input id="pn" value="'+esc(U.name)+'"></div><div><label for="pa">Usia</label><input id="pa" type="number" value="'+U.age+'"></div><div><label for="ph">Tinggi (cm)</label><input id="ph" type="number" value="'+U.h+'"></div><div><label for="pk">Target kalori</label><input id="pk" type="number" value="'+U.kcalGoal+'"></div><div><label for="pw">Target air (L)</label><input id="pw" type="number" step="0.1" value="'+U.waterGoal+'"></div></div><button class="btn" onclick="saveProfile()">Simpan perubahan</button></div>'+
 '<div class="card"><h3>Preferensi</h3><div class="item"><b style="flex:1">Pengingat minum air</b><label class="sw"><input type="checkbox" '+(U.prof.notif?'checked':'')+' onchange="U.prof.notif=this.checked;save()" aria-label="Pengingat minum air"><span></span></label></div><div class="item"><b style="flex:1">Mode tampilan</b><button class="btn alt" onclick="theme()">Terang / gelap</button></div><div class="item"><b style="flex:1">Akun</b><button class="btn alt" onclick="logout()">Keluar</button><button class="btn alt" style="color:var(--bad)" onclick="delAcc()">Hapus akun</button></div></div>'}
};

/* ---------- router ---------- */
function go(v){cur=v;try{location.hash=v}catch(e){}render()}
function render(){if(!U)return;$('nav').innerHTML='<div class="logo">NutriFit<small>'+esc(U.name.split(' ')[0])+'</small></div>'+NAV.map(function(n){return '<button class="'+(n[0]==cur?'on':'')+'" onclick="go(\''+n[0]+'\')"'+(n[0]==cur?' aria-current="page"':'')+'><span aria-hidden="true">'+n[1]+'</span>'+n[2]+'</button>'}).join('');
 var m=$('main');m.innerHTML=V[cur]();m.classList.remove('in');void m.offsetWidth;m.classList.add('in');window.scrollTo(0,0);anim();var c=$('chat');if(c)c.scrollTop=1e5}
window.addEventListener('hashchange',function(){var h=location.hash.slice(1);if(U&&V[h]&&h!=cur){cur=h;render()}});
setInterval(function(){if(!U||!U.prof.notif)return;var h=new Date().getHours();if(h>=7&&h<21&&Date.now()-(U.lw||0)>90*60000&&U.water<U.waterGoal){U.lw=Date.now();toast('💧 Sudah lama tidak minum. Segelas air dulu?')}},60000);
(function(){var t=sget('nf_theme');if(t)document.documentElement.setAttribute('data-theme',t);var e=sget('nf_s'),raw=e&&sget('nf_u_'+e);if(raw){try{U=JSON.parse(raw);start()}catch(x){U=null;authView('login')}}else authView('login')})();
