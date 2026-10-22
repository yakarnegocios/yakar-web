/* Simulated customer journeys. Static files only; external sends are intercepted. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require(process.env.YAKAR_PLAYWRIGHT_PATH||'playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.YAKAR_CHROMIUM_EXECUTABLE?{executablePath:process.env.YAKAR_CHROMIUM_EXECUTABLE}:{})});
 const report={date:'2026-10-21',environment:'Chromium; sesiones ficticias; sin envío ni Supabase',checks:[],layouts:[],accessibility:[]};
 const out=process.env.YAKAR_REQUEST_REPORT_DIR;
 if(out)fs.mkdirSync(out,{recursive:true});
 const check=(name)=>report.checks.push(name);
 async function page(options={}){
  const p=await browser.newPage({viewport:{width:390,height:900},locale:'es-PE',reducedMotion:'reduce',...options});
  const unwanted=[];
  p.on('dialog', dialog => dialog.accept()); // Deliberate resets between independent scenarios.
  p.on('request',r=>{if(new URL(r.url()).origin!=='https://lab.yakar.test')unwanted.push(r.url())});
  await p.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.origin!=='https://lab.yakar.test')return route.abort();
   const relative=decodeURIComponent(url.pathname.slice(1))||'index.html';
   const file=path.resolve(root,relative);
   if(!file.startsWith(root+path.sep))return route.fulfill({status:404,body:'No disponible'});
   return route.fulfill({path:file,contentType:file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':undefined});
  });
  await p.goto('https://lab.yakar.test/');
  p.__unwanted=unwanted;
  return p;
 }
 async function enter(p,category='Necesito orientación',phone='999 123 456'){
  await p.locator('.cover-copy .btn').click();
  await p.locator('#family').selectOption({label:category});
  await p.locator('#need').fill('Necesito orientación para equipar una pequeña operación.');
  await p.locator('#contact').fill('Persona de prueba');
  if(phone)await p.locator('#phone').fill(phone);
 }
 try{
  const p=await page();
  const css=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'css/styles.css'))).digest('hex').slice(0,12);
  const js=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'js/main.js'))).digest('hex').slice(0,12);
  assert.equal(await p.locator('link[rel=stylesheet]').getAttribute('href'),'css/styles.css?v='+css);
  assert.equal(await p.locator('script[src^="js/main.js"]').getAttribute('src'),'js/main.js?v='+js);
  check('HTML/CSS/JS pertenecen a las mismas versiones de contenido');
  for(const width of [320,360,390,768,1280]){
   await p.setViewportSize({width,height:900});await p.reload();await p.locator('.cover-copy .btn').click();
   const layout=await p.evaluate(()=>{const f=document.querySelector('#request-form'),c=document.querySelector('.request-card');return {overflow:document.documentElement.scrollWidth>innerWidth,nestedScroll:c.scrollHeight>c.clientHeight+1,visibleFields:[...f.querySelectorAll('input,select,textarea')].filter(e=>e.checkVisibility()).length,formHeight:Math.round(f.getBoundingClientRect().height),cardHeight:Math.round(c.getBoundingClientRect().height),firstQuestionTop:Math.round(f.querySelector('select').getBoundingClientRect().top),focused:document.activeElement.id,smallFields:[...f.querySelectorAll('input,select,textarea')].filter(e=>e.checkVisibility()&&parseFloat(getComputedStyle(e).fontSize)<16).length}});
   assert.equal(layout.overflow,false);assert.equal(layout.nestedScroll,false);assert.equal(layout.visibleFields,5);assert.equal(layout.focused,'family');assert.ok(layout.firstQuestionTop>=100&&layout.firstQuestionTop<900);if(width<=900)assert.equal(layout.smallFields,0);
   report.layouts.push({width,...layout});
   if(out&&[390,1280].includes(width))await p.screenshot({path:path.join(out,`despues-${width}.png`)});
  }
  check('Cinco anchos: acceso directo, cinco campos visibles y desplazamiento único');
  await p.setViewportSize({width:390,height:900});await p.reload();await p.locator('.cover-copy .btn').click();await p.locator('.submit-button').click();
  assert.equal(await p.locator('.request-errors a').count(),4);assert.equal(await p.locator('.request-errors').evaluate(e=>e===document.activeElement),true);assert.equal(await p.locator('[aria-invalid=true]').count(),4);
  await p.locator('.request-errors a').first().click();assert.equal(await p.locator('#family').evaluate(e=>e===document.activeElement),true);check('Errores agrupados, asociados y navegables, con foco');
  await enter(p);await p.locator('.submit-button').click();
  assert.equal(await p.locator('.local-review').isVisible(),true);assert.equal(await p.locator('#email').inputValue(),'');assert.equal(await p.locator('#company').inputValue(),'');
  assert.match(await p.locator('.local-review').innerText(),/aún no enviado/);assert.equal(await p.locator('.local-review h3').evaluate(e=>e===document.activeElement),true);check('Consulta inicial sin correo ni empresa: teléfono suficiente y estado veraz');
  let value=await p.locator('#summary-local').inputValue();assert.doesNotMatch(value,/Por definir|No indicado|Tipo de organización|Punto de partida/);
  let whatsapp=new URL(await p.locator('[data-whatsapp]').getAttribute('href'));assert.equal(whatsapp.searchParams.get('text'),value);assert.equal(whatsapp.pathname,'/51973669004');
  let email=new URL(await p.locator('[data-email]').getAttribute('href'));assert.equal(email.pathname,'negocios.yakar@gmail.com');assert.equal(email.searchParams.get('body'),value);check('Destinatarios y resumen completos en ambos enlaces');
  await p.locator('#summary-local').fill(value+'\nDetalle añadido solo al resumen.');await p.locator('[data-back]').click();assert.match(await p.locator('#need').inputValue(),/pequeña operación/);await p.locator('.submit-button').click();assert.match(await p.locator('#summary-local').inputValue(),/Detalle añadido solo al resumen/);check('Volver sin cambios conserva formulario y edición manual del resumen');
  await p.locator('#summary-local').fill('');assert.equal(await p.locator('[data-copy]').isDisabled(),true);assert.equal(await p.locator('[data-whatsapp]').getAttribute('href'),null);assert.equal(await p.locator('[data-email]').getAttribute('href'),null);check('Resumen vacío deshabilita compartir');
  await p.locator('[data-back]').click();await p.locator('#need').fill('Nueva necesidad');await p.locator('.submit-button').click();assert.match(await p.locator('#summary-local').inputValue(),/Nueva necesidad/);check('Cambiar el formulario regenera un resumen coherente');
  await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async v=>{window.__copied=v}}}));await p.locator('[data-copy]').click();assert.equal(await p.evaluate(()=>window.__copied),await p.locator('#summary-local').inputValue());assert.match(await p.locator('[data-status]').innerText(),/Pégalo/);
  await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('Simulación de permiso denegado')}}}));await p.locator('[data-copy]').click();assert.equal(await p.locator('#summary-local').evaluate(e=>e.selectionEnd-e.selectionStart), (await p.locator('#summary-local').inputValue()).length);assert.match(await p.locator('[data-status]').innerText(),/seleccionado/);check('Copia correcta y alternativa manual ante permiso denegado');
  // Observe intent without opening an external app or sending messages.
  await p.locator('[data-email]').evaluate(el=>el.addEventListener('click',e=>e.preventDefault(),{once:true}));await p.locator('[data-email]').click();assert.match(await p.locator('[data-status]').innerText(),/pulsa Enviar/);assert.doesNotMatch(await p.locator('[data-status]').innerText(),/enviado correctamente/);check('Abrir canal no se presenta como recepción');
  for(const [label,selector,category]of [['producto','#productos','Productos y suministros'],['servicio','#servicios','Servicios'],['proyecto','#proyectos','Proyectos']]){
   await p.reload();await p.locator(selector+' [data-request-family]').click();assert.equal(await p.locator('#family').inputValue(),category);assert.notEqual(await p.locator('#need-hint').textContent(),'');check('Entrada contextual '+label);
  }
  await p.reload();await enter(p,'Servicios','');await p.locator('#email').fill('mantenimiento@example.test');await p.locator('.submit-button').click();assert.equal(await p.locator('.local-review').isVisible(),true);check('Servicio sin serie/modelo ni teléfono: correo suficiente');
  await p.locator('[data-back]').click();await p.locator('#email').fill('correo-invalido');await p.locator('#phone').fill('999123456');await p.locator('.submit-button').click();assert.equal(await p.locator('.local-review').isHidden(),true);assert.match(await p.locator('.request-errors').innerText(),/Revisa el correo/);check('Correo mal escrito no pasa inadvertido aunque haya teléfono');
  await p.locator('#email').fill('');await p.locator('#phone').fill('solo letras');await p.locator('.submit-button').click();assert.match(await p.locator('.request-errors').innerText(),/entre 7 y 15/);
  await p.locator('#need').fill('   ');await p.locator('#contact').fill('  ');await p.locator('#phone').fill('   ');await p.locator('.submit-button').click();assert.equal(await p.locator('.request-errors a').count(),3);check('Espacios y teléfono sin números reciben orientación');
  await p.reload();await enter(p,'Proyectos');await p.locator('.request-more summary').click();await p.locator('#company').fill('Empresa ficticia de laboratorio');await p.locator('#quantity').fill('Alcance por evaluar');await p.locator('#neededBy').fill('2026-11-20');await p.locator('#location').fill('Lima');await p.locator('.submit-button').click();value=await p.locator('#summary-local').inputValue();assert.match(value,/20\/11\/2026/);assert.match(value,/Empresa ficticia de laboratorio/);check('Proyecto conserva detalles opcionales y fecha solicitada');
  await p.locator('[data-back]').click();const malicious='<img src=x onerror="window.__injected=true"> & Ñ / + 🛠️';await p.locator('#need').fill(malicious+'\n'+'Necesidad extensa áéíóú & + '.repeat(110));await p.locator('.submit-button').click();assert.equal(await p.evaluate(()=>window.__injected),undefined);value=await p.locator('#summary-local').inputValue();whatsapp=new URL(await p.locator('[data-whatsapp]').getAttribute('href'));assert.equal(whatsapp.searchParams.get('text'),value);assert.match(value,/<img/);check('Texto largo, acentos, símbolos y HTML permanecen texto y viajan completos en el enlace');
  await p.locator('[data-back]').click();await p.setViewportSize({width:844,height:390});assert.match(await p.locator('#need').inputValue(),/Necesidad extensa/);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);check('Giro horizontal conserva datos y reflujo');
  assert.deepEqual(p.__unwanted,[]);assert.deepEqual(await p.evaluate(()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage)})),{local:[],session:[]});check('Escritura y preparación sin peticiones externas ni almacenamiento de datos');
  const keyboard=await page({viewport:{width:1280,height:900}});await keyboard.locator('.cover-copy .btn').focus();await keyboard.keyboard.press('Enter');assert.equal(await keyboard.locator('#family').evaluate(e=>e===document.activeElement),true);await keyboard.locator('#family').selectOption({label:'Necesito orientación'});await keyboard.keyboard.press('Tab');assert.equal(await keyboard.locator('#need').evaluate(e=>e===document.activeElement),true);check('Entrada mediante teclado y orden hacia la necesidad');await keyboard.close();
  const nojs=await page({javaScriptEnabled:false});assert.equal(await nojs.locator('#request-form').isHidden(),true);assert.match(await nojs.locator('noscript').innerText(),/correo o WhatsApp/);assert.equal(await nojs.locator('.contact-actions a[href^="https://wa.me/"]').count(),1);assert.equal(await nojs.locator('.contact-actions a[href^="mailto:"]').count(),1);check('Sin JavaScript quedan contacto directo e instrucción visible');await nojs.close();
  if(process.env.YAKAR_AXE_PATH){
   await p.setViewportSize({width:390,height:900});await p.reload();await p.addScriptTag({path:process.env.YAKAR_AXE_PATH});
   for(const state of ['form','errors','review']){
    if(state==='errors')await p.locator('.submit-button').click();
    if(state==='review'){await enter(p);await p.locator('.submit-button').click();}
    const result=await p.evaluate(async()=>{const r=await axe.run('.request-card',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),incomplete:r.incomplete.map(v=>v.id)}});
    report.accessibility.push({state,...result});assert.deepEqual(result.violations,[],`axe ${state}`);
   }
   check('axe en formulario, errores y revisión: sin infracciones automáticas detectadas en el componente');
  }
  await p.setViewportSize({width:390,height:900});await p.reload();
  await p.evaluate(()=>document.documentElement.style.fontSize='200%');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  check('Texto relativo al 200% sin desbordamiento horizontal a 390px');
  await p.reload();
  if(process.env.YAKAR_AXE_PATH){
   await p.addScriptTag({path:process.env.YAKAR_AXE_PATH});
   report.wholePageAccessibility=await p.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return {violations:r.violations.map(v=>v.id),manualReview:r.incomplete.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))}});
   assert.deepEqual(report.wholePageAccessibility.violations,[]);
   report.contrastReview=await p.evaluate(()=>{
    const rgb=s=>s.match(/[\d.]+/g).map(Number);
    const lum=c=>c.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((n,x,i)=>n+x*[.2126,.7152,.0722][i],0);
    const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
    const caption=getComputedStyle(document.querySelector('.fabric-photo figcaption'));
    const bg=rgb(caption.backgroundColor),alpha=bg[3]??1;
    const brightest=bg.slice(0,3).map(x=>x*alpha+255*(1-alpha));
    const captionRatios=[...document.querySelector('.fabric-photo figcaption').children].map(e=>({text:e.tagName,minimumRatio:ratio(rgb(getComputedStyle(e).color),brightest)}));
    const dots=[...document.querySelectorAll('.milestone-dot')].map(e=>({text:e.textContent,ratio:ratio(rgb(getComputedStyle(e).color),rgb(getComputedStyle(e).backgroundColor))}));
    return {captionAgainstWhiteWorstCase:captionRatios,dots};
   });
   for(const x of report.contrastReview.captionAgainstWhiteWorstCase)assert.ok(x.minimumRatio>=4.5);
   for(const x of report.contrastReview.dots)assert.ok(x.ratio>=4.5);
   check('Página completa: axe sin infracciones detectadas y contraste de rótulos revisado por cálculo adicional');
  }
  await p.close();
  if(out)fs.writeFileSync(path.join(out,'despues.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({checks:report.checks.length,layouts:report.layouts.length,axe:report.accessibility,result:'PASS'}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
