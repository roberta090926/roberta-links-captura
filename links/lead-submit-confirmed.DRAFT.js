/* PREPARADO — NÃO CARREGAR ATÉ ADAPTAR E PUBLICAR O Apps Script.
 * Recebe resposta de sucesso do servidor via iframe isolado.
 * Não gera Lead em clique, submit, timeout ou simples navegação.
 */
(function () {
  "use strict";
  var form = document.querySelector('.panel form[action^="https://script.google.com/macros/s/"]');
  if (!form) return;

  var iframe = document.createElement("iframe");
  iframe.name = "rb-lead-ack-frame";
  iframe.title = "Retorno da inscrição";
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  var nonceInput = document.createElement("input");
  nonceInput.type = "hidden";
  nonceInput.name = "lead_nonce";
  form.appendChild(nonceInput);

  var status = document.createElement("p");
  status.id = "rb-lead-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  form.appendChild(status);

  var button = form.querySelector('[type="submit"]');
  var pendingNonce = "";
  var waiting = false;
  var watchdog = null;

  function nonceSeguro() {
    if (!window.crypto || !window.crypto.getRandomValues) return null;
    var bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, function (b) {return b.toString(16).padStart(2, "0");}).join("");
  }

  function concluir() {
    waiting = false;
    if (button) button.disabled = false;
    if (watchdog) clearTimeout(watchdog);
    watchdog = null;
  }

  form.addEventListener("submit", function (event) {
    if (waiting) {event.preventDefault();return;}
    var nonce = nonceSeguro();
    if (!nonce) return; // preserva navegação nativa se não houver geração segura
    event.preventDefault();
    pendingNonce = nonce;
    nonceInput.value = nonce;
    waiting = true;
    if (button) button.disabled = true;
    status.textContent = "Registrando sua inscrição...";
    form.target = iframe.name;
    watchdog = setTimeout(function () {
      if (!waiting) return;
      concluir();
      pendingNonce = "";
      status.textContent = "Não conseguimos confirmar automaticamente esta inscrição. Antes de tentar novamente, verifique se já recebeu a confirmação.";
    }, 30000);
    HTMLFormElement.prototype.submit.call(form);
  });

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!waiting || !data || data.type !== "ROBERTA_LEAD_ACK" ||
        data.nonce !== pendingNonce || !/^[a-f0-9]{32}$/.test(data.nonce)) return;
    // Como HtmlService possui sandbox e origem intermediária, a associação é
    // feita por nonce criptograficamente aleatório. Não inclui dados pessoais.
    if (event.origin !== "null" &&
        !/^https:\/\/(?:script\.google(?:usercontent)?\.com|script\.googleusercontent\.com)$/.test(event.origin)) return;
    concluir();
    pendingNonce = "";
    if (data.gravado === true &&
        typeof data.id === "string" &&
        /^[A-Za-z0-9_-]{8,100}$/.test(data.id)) {
      status.textContent = "Cadastro recebido! Você entrou na lista de interesse do Meu Cuidado com Roberta.";
      if (button) button.hidden = true;
      if (window.robertaRegistrarLeadConfirmado) {
        window.robertaRegistrarLeadConfirmado({ gravado: true, id: data.id });
      }
    } else {
      status.textContent = "Não foi possível confirmar o cadastro. Confira os campos e tente novamente.";
    }
  });
})();
