/* Isolated laboratory: Turnstile is a local double; every external navigation is intercepted. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.YAKAR_PLAYWRIGHT_PATH||'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.YAKAR_BOOK_REPORT_DIR;
const baseline=process.argv.includes('--baseline');
(async()=>{
 const b=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.YAKAR_CHROMIUM_EXECUTABLE?{executablePath:process.env.YAKAR_CHROMIUM_EXECUTABLE}:{})});
 let securityFail=false;
 const checks=[],posts=[],results={date:'2026-10-21',mode:baseline?'antes':'despues',checks,layouts:[],accessibility:[],externalRequestsSent:0};
 const context=await b.newContext({viewport:{width:390,height:900},locale:'es-PE',reducedMotion:'reduce'});
 if(out)fs.mkdirSync(out,{recursive:true});
 await context.route('**/*',async r=>{
  const u=new URL(r.request().url());
  if(u.hostname==='challenges.cloudflare.com')return r.fulfill({contentType:'application/javascript',body:securityFail?"window.yakarSecurityLoadFailed();":"window.turnstile={render:(s,o)=>{window.__security=o;return 'LOCAL-LAB';},reset:()=>{window.__securityResets=(window.__securityResets||0)+1;}};window.yakarTurnstileLoaded();"});
  if(u.hostname==='script.google.com'){
   assert.equal(r.request().method(),'POST');posts.push(new URLSearchParams(r.request().postData()));
   return r.fulfill({contentType:'text/html',body:'<!doctype html><html lang="es"><title>Respuesta simulada</title><h1>LABORATORIO AISLADO</h1><p>Respuesta simulada sin registro ni constancia.</p></html>'});
  }
  if(u.origin!=='https://book.lab.test')return r.abort();
  const name=u.pathname.slice(1)||'reclamaciones.html';
  let file=path.resolve(root,name);
  if(!file.startsWith(root+path.sep))return r.abort();
  if(baseline&&name==='reclamaciones.html')file=process.env.YAKAR_BOOK_BASE_FILE;
  return r.fulfill({path:file,contentType:name.endsWith('.html')?'text/html':name.endsWith('.css')?'text/css':name.endsWith('.js')?'application/javascript':undefined});
 });
 const p=await context.newPage();
 const solve=()=>p.evaluate(()=>window.__security.callback('LAB-ONLY-'+Date.now()));
 async function openBook(){await p.goto('https://book.lab.test/reclamaciones.html');if(!securityFail)await p.waitForFunction(()=>!!window.__security);}
 async function fill(){
  await p.locator('#consumer-name').fill('Persona ficticia de laboratorio');await p.locator('#document-type').selectOption('DNI');await p.locator('#document-number').fill('00000000');await p.locator('#consumer-address').fill('Dirección ficticia, Lima');await p.locator('#response-channel').selectOption('ADDRESS');await p.locator('#item-type').selectOption('PRODUCT');await p.locator('#item-description').fill('Producto ficticio de prueba');await p.locator('[name=caseType][value=RECLAMO]').check();await p.locator('#case-detail').fill('Descripción ficticia para probar el formulario sin registrar.');await p.locator('#requested-action').fill('Resultado simulado para laboratorio.');await p.locator('#confirmation').check();
 }
 try{
  await openBook();
  const originalAction=await p.locator('#complaint-form').getAttribute('action');
  assert.match(originalAction,/^https:\/\/script.google.com\/macros\/s\/.+\/exec$/);
  const id=await p.locator('#request-id').inputValue();assert.match(id,/^[a-f0-9-]{36}$/);assert.equal(await p.locator('#complaint-submit').isDisabled(),true);
  await p.locator('#consumer-name').fill('Borrador en memoria');await p.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  results.historyRestore={name:await p.locator('#consumer-name').inputValue(),sameAttempt:(await p.locator('#request-id').inputValue())===id};
  if(baseline){
   await p.locator('#consumer-name').focus();if(out)await p.screenshot({path:path.join(out,'antes-390.png')});
   results.required=await p.locator('#complaint-form [required]').evaluateAll(es=>es.map(e=>e.name));
  }else{
   assert.equal(results.historyRestore.name,'Borrador en memoria');assert.equal(results.historyRestore.sameAttempt,true);assert.equal(await p.locator('#security-token').inputValue(),'');checks.push('Restauración de historial conserva datos e intento; renueva seguridad');
   await openBook();await solve();await p.locator('#complaint-submit').click();assert.equal(posts.length,0);assert.ok(await p.locator('.book-errors a').count()>=10);assert.equal(await p.locator('.book-errors').evaluate(e=>e===document.activeElement),true);if(out)await p.screenshot({path:path.join(out,'errores-390.png')});await p.locator('.book-errors a').first().click();assert.equal(await p.locator('#consumer-name').evaluate(e=>e===document.activeElement),true);checks.push('Errores completos, enlaces y foco sin POST inválido');
   await fill();await p.locator('#consumer-name').fill('   ');await p.locator('#complaint-submit').click();assert.equal(posts.length,0);assert.match(await p.locator('.book-errors').innerText(),/nombres y apellidos/);checks.push('Nombre compuesto solo por espacios no inicia envío');
   await p.locator('#consumer-name').fill('Persona ficticia de laboratorio');await p.locator('#response-channel').selectOption('EMAIL');assert.equal(await p.locator('#consumer-email').getAttribute('required'),'');await p.locator('#complaint-submit').click();assert.equal(posts.length,0);assert.match(await p.locator('.book-errors').innerText(),/correo/);await p.locator('#consumer-email').fill('correo-no-valido');await p.locator('#complaint-submit').click();assert.equal(posts.length,0);checks.push('Correo obligatorio por canal y correo mal formado controlados');
   await p.locator('#response-channel').selectOption('ADDRESS');await p.locator('#consumer-email').fill('');assert.equal(await p.locator('#consumer-email').getAttribute('required'),null);
   await p.locator('#document-number').fill('1234567');await p.locator('#complaint-submit').click();assert.equal(posts.length,0);assert.match(await p.locator('#document-error').innerText(),/8 números/);await p.locator('#document-type').selectOption('PASSPORT');await p.locator('#document-number').fill('LAB123');assert.equal(await p.locator('#document-number').evaluate(e=>e.validity.valid),true);await p.locator('#document-type').selectOption('DNI');await p.locator('#document-number').fill('00000000');checks.push('DNI conserva ceros, rechaza longitud inválida y admite documento extranjero según reglas actuales');
   await p.locator('#is-minor').check();assert.equal(await p.locator('#guardian-fields').isVisible(),true);await p.locator('#complaint-submit').click();assert.equal(posts.length,0);assert.match(await p.locator('.book-errors').innerText(),/representante/);await p.locator('#is-minor').uncheck();assert.equal(await p.locator('#guardian-name').isDisabled(),true);checks.push('Representante condicional: campos activos, requeridos y excluidos al desmarcar');
   await p.locator('[data-expand=case-detail]').click();assert.equal(await p.locator('#case-detail').getAttribute('maxlength'),'6000');assert.ok(Number(await p.locator('#case-detail').getAttribute('rows'))>=8);await p.locator('#case-detail').fill('Texto largo de laboratorio. '.repeat(60));assert.match(await p.locator('#case-detail-counter').innerText(),/6000/);checks.push('Ampliación aumenta límite y espacio visible, conservando texto largo');
   await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async v=>{window.__copied=v}}}));await p.locator('#copy-book-draft').click();let copied=await p.evaluate(()=>window.__copied);assert.match(copied,/no es una constancia/);assert.match(copied,/Texto largo/);assert.doesNotMatch(copied,/LAB-ONLY|cf-turnstile-response|requestId/);checks.push('Copia voluntaria conserva el texto sin tokens ni identificadores técnicos');
   await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('Permiso simulado')}}}));await p.locator('#copy-book-draft').click();assert.equal(await p.locator('#book-draft').isVisible(),true);assert.equal(await p.locator('#book-draft').evaluate(e=>e.selectionEnd-e.selectionStart),(await p.locator('#book-draft').inputValue()).length);checks.push('Copia manual disponible si el portapapeles falla');
   const privacyPopup=await Promise.all([context.waitForEvent('page'),p.locator('fieldset a[href="privacidad.html"]').click()]);await privacyPopup[0].waitForLoadState();assert.match(await p.locator('#consumer-name').inputValue(),/Persona ficticia/);await privacyPopup[0].close();checks.push('Consultar privacidad en otra pestaña conserva el formulario');
   await p.evaluate(()=>window.__security['expired-callback']());assert.equal(await p.locator('#complaint-submit').isDisabled(),true);assert.match(await p.locator('#security-status').innerText(),/venció/);await p.evaluate(()=>window.yakarSecurityLoadFailed());assert.equal(await p.locator('#complaint-submit').isDisabled(),true);checks.push('Verificación vencida o fallida mantiene el envío bloqueado');
   await solve();const attempt=await p.locator('#request-id').inputValue();await p.locator('#claimed-amount').fill('-1');await p.locator('#complaint-submit').click();assert.equal(posts.length,0);assert.match(await p.locator('.book-errors').innerText(),/monto/);await p.locator('#claimed-amount').fill('');checks.push('Monto inválido recibe error y no sale del navegador');
   await p.locator('#complaint-submit').click();await p.waitForFunction(()=>document.querySelector('#complaint-submit').disabled);assert.equal(posts.length,1);assert.equal(posts[0].get('consumerName'),'Persona ficticia de laboratorio');assert.equal(posts[0].get('requestId'),attempt);assert.match(posts[0].get('caseDetail'),/Texto largo/);assert.equal(await p.locator('#complaint-form fieldset').first().evaluate(e=>e.inert),true);assert.match(await p.locator('#form-feedback').innerText(),/no puede confirmar el registro/);checks.push('POST interceptado contiene campos aun con interacción bloqueada; sin confirmación falsa');
   await p.waitForFunction(()=>document.querySelector('#complaint-submit').textContent.includes('Reintentar'));assert.equal(await p.locator('#complaint-submit').isDisabled(),true);await solve();await p.locator('#complaint-submit').click();assert.equal(posts.length,2);assert.equal(posts[1].get('requestId'),attempt);assert.equal(posts[1].get('caseDetail'),posts[0].get('caseDetail'));checks.push('Reintento conserva identificador y datos; exige nueva verificación');
   let dialogs=0;const cancel=async d=>{dialogs++;await d.dismiss()};p.on('dialog',cancel);await p.locator('#new-form').click();assert.equal(await p.locator('#request-id').inputValue(),attempt);assert.match(await p.locator('#consumer-name').inputValue(),/Persona ficticia/);assert.equal(dialogs,1);checks.push('Cancelar limpieza mantiene el intento y los datos');p.off('dialog',cancel);p.on('dialog',async d=>d.accept());
   await p.locator('#new-form').click();assert.notEqual(await p.locator('#request-id').inputValue(),attempt);assert.equal(await p.locator('#consumer-name').inputValue(),'');assert.equal(await p.locator('#case-detail').getAttribute('maxlength'),'1000');assert.equal(await p.locator('#case-detail').getAttribute('rows'),'5');assert.equal(await p.locator('#confirmation').isChecked(),false);checks.push('Limpieza confirmada crea nuevo intento y restablece campos, límites y confirmación');
   securityFail=true;await openBook();await p.locator('#renew-security').click();assert.match(await p.locator('#security-status').innerText(),/Copiar lo escrito/);checks.push('Falla de carga orienta a copiar antes de recargar');
   // Avoid unload prompts while switching read-only pages in this test.
   securityFail=false;await p.reload();
   for(const file of ['reclamaciones.html','privacidad.html','integridad.html','metodo.html'])for(const width of [320,390,768,1280]){
    await p.setViewportSize({width,height:900});await p.goto('https://book.lab.test/'+file);const state=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,smallControls:[...document.querySelectorAll('button,summary')].filter(e=>e.checkVisibility()&&e.getBoundingClientRect().height<43.9).length}));assert.equal(state.overflow,false,`${file} ${width}`);if(width<=900)assert.equal(state.smallControls,0);results.layouts.push({file,width,...state});
   }
   checks.push('Libro y tres documentos asociados: 16 combinaciones de página/ancho sin desbordamiento');
   if(process.env.YAKAR_AXE_PATH)for(const file of ['reclamaciones.html','privacidad.html','integridad.html','metodo.html']){
    await p.goto('https://book.lab.test/'+file);await p.addScriptTag({path:process.env.YAKAR_AXE_PATH});const a=await p.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return {violations:r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),manual:r.incomplete.map(v=>v.id)}});results.accessibility.push({file,...a});assert.deepEqual(a.violations,[],file);
   }
   await openBook();await p.setViewportSize({width:390,height:900});await p.locator('#consumer-name').focus();if(out)await p.screenshot({path:path.join(out,'despues-390.png')});
   assert.deepEqual(await p.evaluate(()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage)})),{local:[],session:[]});checks.push('Datos personales sin almacenamiento persistente agregado');
  }
  results.interceptedPosts=posts.length;if(out)fs.writeFileSync(path.join(out,baseline?'antes.json':'despues.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({mode:results.mode,checks:checks.length,layouts:results.layouts.length,postsIntercepted:posts.length,result:'PASS'}));
 }finally{await context.close();await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
