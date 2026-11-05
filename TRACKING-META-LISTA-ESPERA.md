# STATUS TÉCNICO — META PIXEL E LEAD (05/11/2026)

**Fase:** proposta técnica pronta para revisão, **sem merge, sem implantação no Apps Script, sem deploy no Render**.
**PR de rascunho:** https://github.com/roberta090926/roberta-links-captura/pull/1
**Pixel atual:** 1780688656320725. **Não criar outro Pixel**.

## Render — conferido via conector na workspace autorizada
- Workspace **Meu Espaço**, ID `tea-db973qqjnfac739k9qvg`.
- Site principal **roberta-links**, serviço `srv-dbjq74ks728c738gvmh0`, branch `main`, pasta publicada `links`, autoDeploy **off**.
- Site auxiliar **roberta-espera-21dias**, serviço `srv-dbjq75e7bikc7388d8a0`, branch `main`, pasta publicada `espera`, autoDeploy **off**.
- Último deploy do site principal: commit `7a999e186c9be5e8a558ea8bf7fce0a6a4843d62` (01/11/2026); auxiliar: `75f787d8c227906b98bb10c6fd273e8d9c59ff36` (01/11/2026).
- **As duas estruturas foram ajustadas na branch** para usar caminhos compatíveis com suas próprias raízes; os scripts foram copiados para as pastas respectivas. Nenhuma delas foi publicada.

## Arquivos propostos
- `links/meta-tracking.js`, `espera/meta-tracking.js`: Pixel com consentimento específico, PageView e função para Lead confirmado.
- `links/index.html`, `links/espera/index.html`, `espera/index.html`: referenciam Pixel na sua respectiva raiz.
- `links/espera/confirmado/index.html`, `espera/confirmado/index.html`: confirmação sem parâmetros pessoais ou assinatura expostos a tags de marketing.
- `links/espera/confirmado/confirmar.js`, `espera/confirmado/confirmar.js`: validam comprovante assinado junto ao Apps Script antes de informar Lead.
- `APPS-SCRIPT-CODIGO-PROPOSTO.gs`: versão integral do código enviada ao usuário; usuário confirmou que colou e **salvou**, mas **NÃO implantou** a nova versão.
- Arquivo legado `links/lead-submit-confirmed.DRAFT.js` é **obsoleto e não utilizado**, pois contém proposta anterior baseada em iframe; **não importar**. (Remoção do arquivo pode ser feita na revisão final da branch.)
- Políticas de privacidade atualizadas para explicar a coleta sujeita a consentimento.

## Testes já feitos, apenas simulados
- Sintaxe dos JavaScripts principais: OK.
- Link de formulário POST, campos e action existentes: preservados.
- Apps Script simulado com dados válidos, inválidos e erro de gravação: comportamento esperado.
- Verificador simulado com assinatura válida, falsa e expirada: respostas esperadas.
- Ausência de execução real no Render, Google Apps Script e Meta: **Lead em produção ainda NÃO validado**.

## Ordem segura para lançamento, somente após aprovação
1. Revisão final do PR e correção de resíduos de código experimental.
2. Merge na `main` só depois de aprovação expressa.
3. Deploy **manual** do site principal `roberta-links` primeiro; verificar página e scripts em HTTPS e `PageView` após consentimento.
4. Só depois editar a **implantação existente** do Apps Script para a nova versão (preservar URL `/exec`, identidade, permissões e a planilha).
5. Fazer cadastro real de teste e conferir nova linha no Google Sheets; confirmar clique em “Concluir e voltar ao site”, assinatura e evento `Lead` no Gerenciador de Eventos; validar recusa e Safari/iPhone.
6. Revisar a necessidade de atualizar site auxiliar `roberta-espera-21dias` e realizar deploy manual separado após autorização.
7. Manter plano de retorno se algum passo falhar.

## Demais pendências — preservar no STATUS MESTRE
- [ ] Inspecionar aviso **Diagnóstico (1)** no Gerenciador de Eventos.
- [ ] Resolver associação do Pixel à conta de anúncios existente 514011171960249, **sem criar conta ou gastar saldo**.
- [ ] Validar `Purchase` de ambos os produtos Hotmart.
- [ ] Deduplicação Web + API e origem dos eventos via servidor.
- [ ] Testar Safari/iPhone.
- [ ] Restrições de dados de saúde/bem-estar.
- [ ] UTMs e atribuição de origem até o checkout.
- [ ] Segurança 2FA e permissões portfólio, quando autorizado.
- [ ] Não alterar a campanha atual “Nem sempre o percurso vai ser...”.
