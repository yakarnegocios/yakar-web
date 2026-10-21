const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const crypto=require('node:crypto');
const cssVersion=crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'..','css/styles.css'))).digest('hex').slice(0,12);
const {chromium}=require(process.env.YAKAR_PLAYWRIGHT_PATH||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.YAKAR_CHROMIUM_EXECUTABLE?{executablePath:process.env.YAKAR_CHROMIUM_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,locale:'es-PE'});
  const results=[];
  for(const file of ['index.html','metodo.html','integridad.html','privacidad.html','reclamaciones.html'])for(const width of [320,360,390,768,1280]){
   await page.setViewportSize({width,height:844});await page.goto(pathToFileURL(path.resolve(__dirname,'..',file)).href);
   assert.equal(await page.locator('link[rel=stylesheet]').first().getAttribute('href'),'css/styles.css?v='+cssVersion,'Ejecuta python tools/version-styles.py después de editar CSS');
   const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,smallInputs:[...document.querySelectorAll('input:not([type=checkbox]):not([type=radio]),select,textarea')].filter(e=>e.getClientRects().length&&parseFloat(getComputedStyle(e).fontSize)<16).length,smallControls:[...document.querySelectorAll('button,summary')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().height<43.9).length}));
   assert.equal(state.overflow,false,`${file} desborda a ${width}px`);
   if(width<=900){assert.equal(state.smallInputs,0,`${file} tiene campos pequeños`);assert.equal(state.smallControls,0,`${file} tiene botones/desplegables pequeños`);}
   results.push({file,width,...state});
  }
  await page.setViewportSize({width:390,height:844});await page.goto(pathToFileURL(path.resolve(__dirname,'..','index.html')).href);
  const menu=page.locator('.menu-button');await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');assert.equal(await menu.evaluate(e=>e===document.activeElement),true);
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('#perspectiva article').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  const highDensity=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});await highDensity.goto(pathToFileURL(path.resolve(__dirname,'..','index.html')).href);const hero=await highDensity.locator('.fabric-photo img').evaluate(i=>({source:i.currentSrc.split('/').pop(),complete:i.complete}));assert.equal(hero.complete,true);assert.equal(hero.source,'operacion-yakar-1152.webp');
  console.log('PASS móvil: 25 combinaciones de página/ancho, reflujo, campos de 16px, controles de 44px, menú/Escape/foco, movimiento reducido e imagen responsive DPR2.');
  if(process.env.YAKAR_MOBILE_REPORT_DIR){fs.mkdirSync(process.env.YAKAR_MOBILE_REPORT_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.YAKAR_MOBILE_REPORT_DIR,'web-results.json'),JSON.stringify({results,hero},null,2));}
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
