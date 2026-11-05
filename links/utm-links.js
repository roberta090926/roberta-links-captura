/* Propaga tags de campanha da página de links para 7 Hábitos ou espera.
 * Sem cookies, localStorage, coleta de PII, pixels ou chamadas de rede.
 * Quando não há UTM de entrada, a origem honesta é o próprio hub.
 */
(function (w,d) {
  "use strict";
  var keys = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"];
  function safe(s) {
    return typeof s === "string" && s.length >= 1 && s.length <= 80 &&
      /^[A-Za-z0-9._-]+$/.test(s) ? s : null;
  }
  function inbound(search) {
    var p = new URLSearchParams(search || "");
    var values = {};
    keys.forEach(function (k) { var v = safe(p.get(k)); if (v) values[k] = v; });
    if (!values.utm_source) {
      values.utm_source = "roberta-links";
      values.utm_medium = "link_hub";
      values.utm_campaign = "hub-roberta";
    }
    return values;
  }
  function forward(href,search) {
    var url;
    try { url = new URL(href, w.location.href); } catch (_) { return href; }
    var isGuia = url.origin === "https://7habitos.robertabitencourt.com.br" &&
                  (url.pathname === "/" || url.pathname === "");
    var isEspera = url.origin === w.location.origin && url.pathname === "/espera/";
    if (!isGuia && !isEspera) return href;
    var data = inbound(search);
    keys.forEach(function (k) {
      if (data[k] && !url.searchParams.has(k)) url.searchParams.set(k,data[k]);
    });
    return url.href;
  }
  function apply() {
    Array.prototype.forEach.call(d.querySelectorAll("a[href]"),function(a){
      var href=a.getAttribute("href");
      if (href) a.href=forward(href,w.location.search);
    });
  }
  w.RBHubAttribution={forward:forward,inbound:inbound};
  if (d.readyState==="loading") d.addEventListener("DOMContentLoaded",apply);
  else apply();
})(window,document);
