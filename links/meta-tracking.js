/* Meu Cuidado — Meta Pixel (sem cookies antes de consentimento).
 * Não registra Lead por clique ou visita. O backend deve confirmar
 * a gravação do cadastro antes de chamar robertaRegistrarLeadConfirmado().
 */
(function () {
  "use strict";
  var PIXEL_ID = "1780688656320725";
  var CONSENT_KEY = "roberta-meta-consent-v1";
  var initialized = false;
  var currentConsent = null;
  try { currentConsent = localStorage.getItem(CONSENT_KEY); } catch (_) {}

  function carregarPixel() {
    if (initialized || currentConsent !== "aceito") return;
    initialized = true;
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;
      n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];
      t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
    }(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
  }

  function definirConsentimento(choice) {
    currentConsent = choice;
    try { localStorage.setItem(CONSENT_KEY, choice); } catch (_) {}
    if (choice === "aceito") carregarPixel();
    else if (initialized && window.fbq) {
      // Evita novos disparos, mas scripts já carregados precisam de nova visita
      // para deixarem de ser executados.
      window.fbq("consent", "revoke");
    }
  }

  // Exclusivamente para integração futura com confirmação verificável do backend.
  // NÃO chamar no submit, no clique nem no onload do iframe.
  window.robertaRegistrarLeadConfirmado = function (comprovante) {
    if (currentConsent !== "aceito" || !comprovante ||
        comprovante.gravado !== true ||
        typeof comprovante.id !== "string" ||
        !/^[A-Za-z0-9_-]{8,100}$/.test(comprovante.id)) return false;
    var chave = "rb-meta-lead-confirmado-" + comprovante.id;
    try {
      if (sessionStorage.getItem(chave)) return false;
    } catch (_) {}
    carregarPixel();
    if (!window.fbq) return false;
    window.fbq("track", "Lead",
      {content_name:"Lista de interesse Desafio 21 Dias"},
      {eventID:"rb-lead-" + comprovante.id});
    try { sessionStorage.setItem(chave, "1"); } catch (_) {}
    return true;
  };

  function montarPainel() {
    var style = document.createElement("style");
    style.textContent =
      "#rb-cookie-bar{position:fixed;z-index:2147483646;left:12px;right:12px;bottom:12px;" +
      "max-width:720px;margin:auto;border:1px solid #e3cdd5;border-radius:12px;" +
      "box-shadow:0 6px 22px #37101b33;background:#fffaf9;padding:15px 18px;color:#49303a;" +
      "font:14px/1.5 system-ui,sans-serif}" +
      "#rb-cookie-bar p{margin:0 0 11px}" +
      "#rb-cookie-bar a{color:#752c45;text-decoration:underline}" +
      "#rb-cookie-bar .rb-actions{display:flex;gap:10px;flex-wrap:wrap}" +
      "#rb-cookie-bar button{width:auto!important;min-height:40px;padding:9px 16px;" +
      "border-radius:7px;border:1px solid #752c45;background:#752c45;color:white;" +
      "font:600 14px system-ui,sans-serif;cursor:pointer}" +
      "#rb-cookie-bar button.rb-recusar{background:white;color:#752c45}" +
      "#rb-cookie-config{position:fixed;z-index:2147483645;bottom:6px;left:8px;" +
      "border:0;background:transparent;color:#752c45;text-decoration:underline;" +
      "font:12px system-ui,sans-serif;cursor:pointer;width:auto!important;padding:3px!important}" +
      "@media(max-width:540px){#rb-cookie-bar{left:7px;right:7px;bottom:28px}}";
    document.head.appendChild(style);
    var bar = document.createElement("div");
    bar.id = "rb-cookie-bar";
    bar.setAttribute("role","dialog");
    bar.setAttribute("aria-label","Preferências de cookies de análise");
    bar.innerHTML =
      '<p><strong>Privacidade e métricas</strong></p>' +
      '<p>Com sua autorização, usamos o Pixel da Meta para medir visitas e cadastros. ' +
      'Recusar não impede o uso do site ou o envio do formulário. ' +
      '<a href="/espera/privacidade.html">Política de Privacidade</a>.</p>' +
      '<div class="rb-actions">' +
      '<button type="button" data-rb="aceito">Aceitar medição</button>' +
      '<button type="button" class="rb-recusar" data-rb="recusado">Recusar</button></div>';
    var config = document.createElement("button");
    config.id = "rb-cookie-config";
    config.type = "button";
    config.textContent = "Privacidade e cookies";
    config.addEventListener("click", function(){ bar.hidden = false; });
    bar.querySelector('[data-rb="aceito"]').addEventListener("click", function(){
      definirConsentimento("aceito");bar.hidden=true;
    });
    bar.querySelector('[data-rb="recusado"]').addEventListener("click", function(){
      definirConsentimento("recusado");bar.hidden=true;
    });
    bar.hidden = currentConsent === "aceito" || currentConsent === "recusado";
    document.body.appendChild(config);
    document.body.appendChild(bar);
    if (currentConsent === "aceito") carregarPixel();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montarPainel);
  else montarPainel();
})();
