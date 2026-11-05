# Rastreamento da lista de espera — Meta Pixel (preparação)

**Estado:** somente na branch `fix/meta-leads-consent-20261105`; não mesclado ou publicado.  
**Pixel existente:** `1780688656320725`.  
**Destino:** `https://links.robertabitencourt.com.br/espera/`.  
**Não alterar:** URL do Apps Script, nomes dos campos, fluxo POST ou planilha atual.

## Diagnóstico confirmado

- O formulário atual é HTML com `method="POST"`, `action="https://script.google.com/macros/s/.../exec"`.
- A submissão navega para o Apps Script; os arquivos do GitHub **não contêm** a lógica `doPost` nem sua resposta.
- Antes desta alteração, as páginas não tinham o Pixel nem disparavam `PageView` ou `Lead`.
- Para não contar cliques ou falhas como conversões, é incorreto rastrear `Lead` no `submit` ou no `onload` de um iframe oculto.

## Conteúdo desta branch

- `links/meta-tracking.js`: Pixel da Meta carregado apenas após consentimento específico, `PageView`, interface pequena de aceitar/recusar, revisão de escolha e função `robertaRegistrarLeadConfirmado(comprovante)` que **não é chamada automaticamente**.
- Script referenciado em `links/index.html` e `links/espera/index.html`. O arquivo histórico `espera/index.html` também foi preparado, referenciando a cópia de script em `links/`.
- Políticas `links/espera/privacidade.html` e `espera/privacidade.html` mencionam Pixel e opção de consentimento.
- O formulário original e a foto real da Roberta não sofreram alterações.

## Como fechar a mensuração do evento Lead

**Pendente: backend.** Antes de configurar Lead na Meta, inspecionar o **Apps Script existente**. Seu código não está neste repositório nem foi acessado nesta etapa.

Somente após `appendRow` (ou gravação equivalente) com sucesso:

1. Gerar um `id` não identificável para o cadastro (sem nome, e-mail, telefone ou qualquer dado pessoal).
2. Retornar um sinal **explícito e verificável** de sucesso ao site de origem (por exemplo, um retorno JSON validado pelo cliente se o endpoint suportar CORS, ou uma página de confirmação originada no servidor). Preservar o fluxo atual até o novo caminho ser testado.
3. **Apenas depois** do sinal efetivo e com consentimento Meta autorizado, chamar no site `window.robertaRegistrarLeadConfirmado({ gravado: true, id: "ID_ALEATORIO_DO_CADASTRO" })`.
4. A função envia `fbq("track", "Lead", {content_name:"Lista de interesse Desafio 21 Dias"}, {eventID:"rb-lead-" + id})` e impede a repetição local da mesma confirmação.
5. Caso se configure também **Conversions API** para o evento Lead, usar o mesmo `event_id` para deduplicação e respeitar restrições de dados de saúde/bem-estar.

**Aviso:** o objeto `{gravado:true}` é uma convenção de aplicação, não um comprovante criptográfico. O frontend só pode invocá-lo após resposta inequívoca do backend. Não deve ser derivado de clique, validação HTML ou envio não confirmado.

## Validação antes de merge/deploy

- [ ] Identificar no Render, na workspace autorizada, o diretório publicado (suspeita: `links`; não confirmado pelo conector).
- [ ] Ambiente isolado: página de espera segue visível, imagens reais e formulário POST preservados.
- [ ] Sem consentimento ou após recusa: **não** carregar `connect.facebook.net/en_US/fbevents.js`; inscrição deve continuar funcionando.
- [ ] Após aceitar medição: um `PageView` por visita; nenhuma informação pessoal inserida como parâmetro de evento.
- [ ] Rever consentimento e verificar revogação.
- [ ] Conferir registro de sucesso no Google Sheets e adequar Apps Script à confirmação inequívoca.
- [ ] Verificar um evento `Lead` por cadastro concluído com consentimento; zero `Lead` em erro/recusa.
- [ ] Confirmar eventos de produção por domínio em Visão geral e interpretar corretamente Eventos de teste (não inferir falha apenas por ausência de `test_event_code`).
- [ ] Abrir e analisar o alerta **Diagnóstico (1)** no Pixel, além de **Purchase** e deduplicação Web/API.
- [ ] **Obter aprovação explícita antes de merge, deploy ou ativar anúncios.**

## Limites atuais

Esta mudança prepara medição `PageView` mediante consentimento e o gancho técnico para `Lead`. **Não entrega ainda um `Lead` de produção**, pois é necessário modificar ou integrar a resposta confirmada do Apps Script, fora deste repositório. Nenhuma alteração foi feita ao Apps Script nem ao ambiente de produção.
