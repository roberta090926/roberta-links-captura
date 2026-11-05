/* Identifica origem não pessoal do formulário para o Apps Script.
 * A versão atual do backend ignora rb_origem; precisa da alteração separada
 * no Código.gs para registrar a origem na planilha.
 */
(function (w,d) {
  "use strict";
  var keys=["utm_source","utm_medium","utm_campaign","utm_content"];
  function safe(value) {
    return typeof value==="string" && value.length<=60 && value.length>0 &&
      /^[A-Za-z0-9._-]+$/.test(value) ? value : "";
  }
  function getOrigin(search) {
    var p=new URLSearchParams(search || "");
    var parts=keys.map(function(key){return safe(p.get(key));});
    if(!parts[0]) return "";
    return parts.join("|");
  }
  function apply() {
    var form=d.querySelector('form[action^="https://script.google.com/macros/s/"]');
    if(!form) return;
    var value=getOrigin(w.location.search);
    if(!value) return;
    var input=d.createElement("input");
    input.type="hidden";
    input.name="rb_origem";
    input.value=value;
    form.appendChild(input);
  }
  w.RBWaitlistAttribution={getOrigin:getOrigin};
  if(d.readyState==="loading") d.addEventListener("DOMContentLoaded",apply);
  else apply();
})(window,document);
