# Rastreamento dos canais — página de links e lista de espera

**Status: proposta em branch de revisão; não publicado.** O formulário que salva leads continua funcionando sem alterações de produção.

## Página de links

\`links/utm-links.js\` acompanha o link de entrada (UTM) nos dois banners:
- 7 Hábitos → \`https://7habitos.robertabitencourt.com.br\`
- Desafio 21 Dias → \`/espera/\`

A origem é propagada no momento do clique, sem cookies nem armazenamento persistente.
Se a entrada não tiver UTM, usamos \`utm_source=roberta-links\`,
\`utm_medium=link_hub\` e \`utm_campaign=hub-roberta\`: não inventamos
que o visitante necessariamente veio do Instagram.

Para medir *bio orgânica* como Instagram, é preciso usar um link com UTMs no
perfil ou atualizar o redirecionamento Bitly quando for autorizado.

Exemplo de URL indicada para a bio:
\`https://links.robertabitencourt.com.br/?utm_source=instagram&utm_medium=organic&utm_campaign=bio-roberta\`

## Formulário de interesse

\`links/espera/utm-lead.js\` e \`espera/utm-lead.js\` adicionam um único
campo oculto \`rb_origem\`, composto de \`utm_source|utm_medium|utm_campaign|utm_content\`.
Somente valores de campanha válidos; nenhum nome, e-mail, WhatsApp ou
identificador pessoal de navegação é acrescentado.

A versão do **Apps Script publicada hoje** ainda IGNORA esse campo, portanto
a coluna de origem não mudará até atualização autorizada do backend.

O arquivo \`APPS-SCRIPT-CODIGO-PROPOSTO.gs\` foi adaptado **somente nesta branch**:
- mantém a validação de formulário, gravação e link de confirmação;
- verifica a origem na função \`doPost\`, rejeitando caracteres de fórmulas,
  links e conteúdo arbitrário;
- registra o código de campanha junto ao texto já usado na coluna E —
  **sem criar novas colunas, sem alterar o cabeçalho e sem substituir datas ou status**;
- para cadastros sem \`rb_origem\`, a descrição fica exatamente como hoje.

**Exemplo de anúncio da lista de espera:**
\`https://links.robertabitencourt.com.br/espera/?utm_source=instagram&utm_medium=paid_social&utm_campaign=rb21-lista&utm_content=video01\`

## Sequência segura de publicação (ainda não autorizada)

1. Conferir testes do PR de UTM da landing e deste repositório.
2. Após aprovação, incorporar este PR e publicar somente \`roberta-links\`.
   O serviço \`roberta-espera-21dias\` é separado e não precisa ser alterado
   para a página principal funcionar; avaliar publicação auxiliar apenas depois.
3. Confirmar os banners da bio e formulário; o backend antigo deve continuar
   aceitando os envios mesmo quando o campo novo existir.
4. Com cópia de segurança do \`Code.gs\`, aplicar somente o trecho novo
   de \`rb_origem\` ao script **da conta correta ANIMA NOVA**.
5. Atualizar **a implantação existente** do Apps Script, preservando
   o mesmo URL \`/exec\`. Não criar implantação nova.
6. Testar uma inscrição com UTM, conferir que a linha é gravada e que a coluna
   E inclui o canal, sem quebrar evento \`Lead\` no Pixel.
7. Testar uma inscrição sem UTM e com campo inválido; não alterar comportamento.
8. Validar que o evento \`Lead\` não é enviado pelo mero clique nem sem consentimento.
9. Não publicar campanhas ou modificar saldo pré-pago sem autorização.

## Limites
- O registro na coluna E é uma **origem declarada pelo link**, não comprova
  que uma venda ocorreu nem que um anúncio gerou a inscrição.
- Para identificar vendas, conferir UTMs/SCK no relatório Hotmart.
- O evento Purchase continua pendente de compra aprovada.
- Nunca enviar dados pessoais de leads como UTMs.
