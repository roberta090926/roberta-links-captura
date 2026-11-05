/**
 * Meu Cuidado com Roberta — Google Apps Script
 * Proposta para revisão; NÃO implantado.
 * Mantém o POST e a planilha existentes. O evento Meta Lead só é medido
 * na página de confirmação após verificar um comprovante assinado.
 * Nenhum dado pessoal é colocado no URL de confirmação.
 */
const PLANILHA_ID = '1CEZQvP40FfXC1Jl9GK7W1RjffALtqOw7h0hVWYH02HA';
const RB_CHAVE_PROP = 'ROBERTA_LEAD_SIGNING_SECRET_V1';
const RB_URL_CONFIRMACAO = 'https://links.robertabitencourt.com.br/espera/confirmado/';
const RB_VALIDADE_MS = 7 * 24 * 60 * 60 * 1000;

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return resposta('Solicitação recebida.');

  const nome = String(p.nome || '').trim();
  const email = String(p.email || '').trim().toLowerCase();
  const whatsapp = String(p.whatsapp || '').trim();
  const consentimento = p.consentimento === 'sim';

  if (
    nome.length < 2 || nome.length > 120 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    whatsapp.length > 30 ||
    !consentimento
  ) {
    return resposta('Não foi possível concluir o cadastro. Confira os dados e a autorização.');
  }

  // Proteção contra fórmulas: preservada do código original.
  const seguro = valor => {
    const texto = String(valor || '');
    return /^[=+\-@\t\r]/.test(texto) ? "'" + texto : texto;
  };

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    const aba = SpreadsheetApp.openById(PLANILHA_ID).getSheetByName('Leads');
    if (!aba) throw new Error('Aba Leads não encontrada');

    // Prepara o comprovante ANTES da gravação. Se falhar, não registra
    // uma linha à qual não poderíamos entregar confirmação.
    const ref = Utilities.getUuid().replace(/-/g, '');
    const exp = Date.now() + RB_VALIDADE_MS;
    const sig = rbAssinar_(ref, exp, rbChave_());
    const link = RB_URL_CONFIRMACAO + '?ref=' + encodeURIComponent(ref) +
      '&exp=' + encodeURIComponent(String(exp)) + '&sig=' + encodeURIComponent(sig);

    const agora = new Date();
    aba.appendRow([
      agora,
      seguro(nome),
      seguro(email),
      seguro(whatsapp),
      'Página de espera - Desafio 21 Dias',
      'Sim',
      whatsapp ? 'Sim' : 'Não',
      agora,
      'Interessada',
      ''
    ]);
    SpreadsheetApp.flush();
    return resposta(
      'Cadastro recebido! Você entrou na lista de interesse do Meu Cuidado com Roberta.',
      link
    );
  } catch (erro) {
    console.error(erro);
    return resposta('Não foi possível registrar o cadastro. Tente novamente mais tarde.');
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

/**
 * Verifica uma confirmação assinada por meio de JSONP de LEITURA,
 * sem fornecer informações pessoais nem alterar dados. Callback fixo.
 */
function doGet(e) {
  const p = (e && e.parameter) || {};
  const ref = String(p.ref || '');
  const expText = String(p.exp || '');
  const sig = String(p.sig || '');
  let valido = false;

  if (/^[a-f0-9]{32}$/.test(ref) && /^\d{13}$/.test(expText) &&
      /^[A-Za-z0-9_-]{40,50}$/.test(sig)) {
    const exp = Number(expText);
    const agora = Date.now();
    if (exp > agora && exp <= agora + RB_VALIDADE_MS) {
      const segredo = PropertiesService.getScriptProperties().getProperty(RB_CHAVE_PROP);
      if (segredo) {
        const esperado = rbAssinar_(ref, exp, segredo);
        valido = rbComparar_(sig, esperado);
      }
    }
  }
  const payload = { valido: valido, id: valido ? ref : '' };
  const js = 'window.robertaResultadoVerificacao(' + JSON.stringify(payload) + ');';
  return ContentService.createTextOutput(js)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function rbChave_() {
  const props = PropertiesService.getScriptProperties();
  let chave = props.getProperty(RB_CHAVE_PROP);
  if (!chave) {
    chave = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty(RB_CHAVE_PROP, chave);
  }
  return chave;
}

function rbAssinar_(ref, exp, chave) {
  const bytes = Utilities.computeHmacSha256Signature(ref + '.' + exp, chave);
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, '');
}

function rbComparar_(a, b) {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}

function resposta(mensagem, linkConfirmacao) {
  const seguro = String(mensagem).replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
  const link = linkConfirmacao
    ? '<p style="margin-top:22px"><a target="_top" rel="noopener noreferrer" ' +
      'style="background:#742a45;color:white;padding:13px 20px;border-radius:7px;' +
      'text-decoration:none;display:inline-block" href="' + linkConfirmacao +
      '">Concluir e voltar ao site</a></p>'
    : '';
  return HtmlService.createHtmlOutput(
    '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
    '<body style="font-family:Arial;text-align:center;padding:55px 20px;color:#742a45">' +
    '<h2>Meu Cuidado com Roberta</h2><p>' + seguro + '</p>' + link +
    '</body></html>'
  );
}
