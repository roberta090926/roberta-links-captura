/* Página de confirmação do Desafio — valida comprovante assinado no Apps Script.
 * NÃO envia Lead por visita, URL arbitrária ou clique em botão.
 */
(function () {
  "use strict";
  const WEBAPP = "https://script.google.com/macros/s/AKfycbxwq2-2fzMrBNnv72ja_iAUkCJ7NYFHe0Bh1FAXFBQg5s15VkLRr2uMLLLHvqBj4qYJZA/exec";
  const comprovante = window.robertaComprovantePendente || {};
  const output = document.getElementById("situacao-cadastro");
  let verificado = false;
  let confirmacaoId = "";
  let tempoLimite;

  function status(msg) { if (output) output.textContent = msg; }
  function tentarRegistrar() {
    if (!verificado || !confirmacaoId) return;
    if (typeof window.robertaRegistrarLeadConfirmado === "function") {
      window.robertaRegistrarLeadConfirmado({ gravado: true, id: confirmacaoId });
    }
  }

  window.addEventListener("roberta:meta-consent-change", tentarRegistrar);

  window.robertaResultadoVerificacao = function (dados) {
    clearTimeout(tempoLimite);
    if (!dados || dados.valido !== true || dados.id !== comprovante.ref) {
      status("Este link de confirmação é inválido ou expirou. Se você acabou de se cadastrar, seus dados podem estar registrados; entre em contato conosco para conferir.");
      return;
    }
    verificado = true;
    confirmacaoId = dados.id;
    status("Inscrição confirmada! Você entrou na lista de interesse do Desafio 21 Dias.");
    tentarRegistrar();
  };

  if (!/^[a-f0-9]{32}$/.test(comprovante.ref || "") ||
      !/^\d{13}$/.test(comprovante.exp || "") ||
      !/^[A-Za-z0-9_-]{40,50}$/.test(comprovante.sig || "")) {
    status("Para confirmar um cadastro, use o link recebido após enviar o formulário.");
    return;
  }

  const script = document.createElement("script");
  script.referrerPolicy = "no-referrer";
  script.src = WEBAPP + "?ref=" + encodeURIComponent(comprovante.ref) +
    "&exp=" + encodeURIComponent(comprovante.exp) +
    "&sig=" + encodeURIComponent(comprovante.sig);
  script.async = true;
  script.onerror = function () {
    clearTimeout(tempoLimite);
    status("Não conseguimos verificar automaticamente agora. Seu cadastro pode estar salvo; tente abrir novamente o link de confirmação.");
  };
  tempoLimite = setTimeout(function () {
    status("A verificação está demorando. Seu cadastro pode estar salvo; tente abrir novamente o link de confirmação.");
  }, 16000);
  document.head.appendChild(script);
})();
