# Dia a Dia

Dashboard pessoal de hábitos em React + TypeScript (Vite).

**App:** publicado na Netlify (link a definir)

```bash
npm install
npm run dev    # abre em http://localhost:5173
npm test       # testes da lógica de datas e do backup
npm run build  # gera a pasta dist/, pronta para publicar
```

O app é um PWA: depois de publicado, pode ser instalado na tela inicial do celular
e funciona sem internet. Os dados ficam só no aparelho; use o backup para trocar de celular.

- **Android (Chrome):** menu ⋮ → "Instalar app"
- **iPhone (Safari):** botão Compartilhar → "Adicionar à Tela de Início"

## Roteiro

- [x] Passo 1 — cadastrar hábitos, marcar o dia, sequência (streak), salvar no localStorage
- [x] Passo 2 — mapa de calor dos últimos meses (estilo GitHub)
- [x] Passo 3 — marcar/desmarcar dias passados clicando no mapa
- [x] Passo 4 — backup (exportar/importar JSON) e estatísticas: maior sequência, % de conclusão no mês
- [x] Passo 5 — PWA: instalável e funcionando offline
- [x] Passo 6a — CI: testes e build automáticos a cada push
- [ ] Passo 6b — publicar na Netlify (repositório privado)
- [ ] Passo 6c — usar no celular por 7 dias seguidos
- [ ] Passo 7 — trocar localStorage por banco (Drizzle) e sincronizar entre aparelhos
