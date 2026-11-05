const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const hub=fs.readFileSync(path.join(__dirname,"../links/utm-links.js"),"utf8");
const waitlist=fs.readFileSync(path.join(__dirname,"../links/espera/utm-lead.js"),"utf8");
const appScript=fs.readFileSync(path.join(__dirname,"../APPS-SCRIPT-CODIGO-PROPOSTO.gs"),"utf8");

function hubTest(search, hrefs) {
  const a=hrefs.map(href=>({href,getAttribute:()=>href}));
  const window={location:{href:"https://links.robertabitencourt.com.br/"+search,origin:"https://links.robertabitencourt.com.br",search}};
  const document={readyState:"complete",querySelectorAll:()=>a};
  vm.runInNewContext(hub,{window,document,URL,URLSearchParams,Array});
  return a;
}
function waitlistTest(search) {
  const appended=[],form={appendChild(x){appended.push(x);}};
  const window={location:{search}};
  const document={readyState:"complete",querySelector:()=>form,createElement:()=>({})};
  vm.runInNewContext(waitlist,{window,document,URLSearchParams,Array});
  return {appended,tracker:window.RBWaitlistAttribution};
}

test("hub carries real source to both links",()=>{
  const a=hubTest("?utm_source=instagram&utm_medium=organic&utm_campaign=bio-roberta",
    ["https://7habitos.robertabitencourt.com.br","/espera/"]);
  a.forEach(x=>{
    const u=new URL(x.href);
    assert.equal(u.searchParams.get("utm_source"),"instagram");
    assert.equal(u.searchParams.get("utm_medium"),"organic");
    assert.equal(u.searchParams.get("utm_campaign"),"bio-roberta");
  });
});
test("untagged hub uses honest hub source, not fictitious instagram",()=>{
  const a=hubTest("",["https://7habitos.robertabitencourt.com.br","/espera/"]);
  a.forEach(x=>{
    const u=new URL(x.href);
    assert.equal(u.searchParams.get("utm_source"),"roberta-links");
    assert.equal(u.searchParams.get("utm_medium"),"link_hub");
  });
});
test("unrelated social links not touched and invalid tags dropped",()=>{
  const a=hubTest("?utm_source=name%40email.com&utm_content=%3Cscript%3E",
    ["https://www.instagram.com/arobertabitencourt/","/espera/"]);
  assert.equal(a[0].href,"https://www.instagram.com/arobertabitencourt/");
  assert.equal(new URL(a[1].href).searchParams.get("utm_source"),"roberta-links");
  assert.equal(new URL(a[1].href).searchParams.get("utm_content"),null);
});
test("waitlist form submits anonymous tags only",()=>{
  const r=waitlistTest("?utm_source=instagram&utm_medium=paid_social&utm_campaign=rb21-leads&utm_content=video01");
  assert.equal(r.appended.length,1);
  assert.equal(r.appended[0].type,"hidden");
  assert.equal(r.appended[0].name,"rb_origem");
  assert.equal(r.appended[0].value,"instagram|paid_social|rb21-leads|video01");
});
test("waitlist does not add field with no source",()=>{
  const r=waitlistTest("");
  assert.equal(r.appended.length,0);
});
test("Apps Script saves validated anonymous origin without changing sheet schema",()=>{
  const rows=[];
  const props={};
  const context={
    Utilities:{getUuid:()=>"01234567-89ab-4cde-8f01-23456789abcd",
      computeHmacSha256Signature:()=>[1,2,3],
      base64EncodeWebSafe:()=>"a".repeat(43)},
    SpreadsheetApp:{openById:()=>({getSheetByName:()=>({appendRow:(row)=>rows.push(row)})}),flush:()=>{}},
    LockService:{getScriptLock:()=>({waitLock:()=>{},hasLock:()=>true,releaseLock:()=>{}})},
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k],setProperty:(k,v)=>props[k]=v})},
    HtmlService:{createHtmlOutput:(html)=>html},console:{error:()=>{}},
    Date,encodeURIComponent,
  };
  vm.runInNewContext(appScript,context);
  const data={nome:"Teste Pessoa",email:"teste@example.com",consentimento:"sim"};
  const form=(origem)=>({parameter:{...data,...(origem?{rb_origem:origem}:{})}});
  context.doPost(form("instagram|paid_social|rb21-leads|video01"));
  assert.match(rows[0][4],/instagram\|paid_social\|rb21-leads\|video01/);
  context.doPost(form(null));
  assert.equal(rows[1][4],"Página de espera - Desafio 21 Dias");
  context.doPost(form("=HYPERLINK|paid_social|rb21-leads|video01"));
  assert.equal(rows[2][4],"Página de espera - Desafio 21 Dias");
  assert.equal(rows[0].length,10);
});
