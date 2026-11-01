# painel-carteira

Painel de carteira cripto que a pessoa instala na própria IA (Claude, Gemini ou ChatGPT). Só leitura: usa endereço público, nunca seed, nunca assina nada.

Feito por [Luan Leal](https://luanlealx.com).

## Como funciona

O painel tem duas partes:

| Arquivo | Quem mexe | O que tem |
|---|---|---|
| `painel.js` | o autor, por commit | layout, CSS, botões, leitura on-chain, cards, rodapé |
| `casca.html` | a IA da pessoa | só o objeto `DATA` + a linha que carrega o `painel.js` |

A casca carrega o núcleo pelo jsDelivr, a partir do pacote npm `painel-carteira`. Tem que ser o caminho `/npm/`: os artifacts do Claude só liberam scripts de `cdn.jsdelivr.net/npm/`, e o caminho `/gh/` é bloqueado lá.

```html
<script>const DATA = { ... };</script>
<script src="https://cdn.jsdelivr.net/npm/painel-carteira@1/painel.js"></script>
```

`@1` resolve pra última versão `1.x.x` publicada no npm. Atualizar o painel de todo mundo = commit + nova versão 1.x.x no npm.

## Onde roda

| IA | Como mostra | "Atualizar agora" |
|---|---|---|
| Claude | artifact HTML | não lê a blockchain (o Claude bloqueia o fetch); usa "Atualizar com IA" |
| Gemini | Canvas | funciona |
| ChatGPT | link `luanlealx.com/painel#<DATA>` | funciona |

No ChatGPT o chat não renderiza HTML, então a IA entrega um link. Tudo depois do `#` fica no navegador, não vai pra servidor.

## Modos do `painel.js`

1. Com `DATA` definido na página (casca): usa o `DATA`.
2. Sem `DATA`: lê o hash da URL. Aceita `#<encodeURIComponent(JSON)>`, `#d=<...>` ou `#b64:<base64url do JSON>`.
3. Sem nada: mostra o exemplo.

O `DATA` passa por uma normalização antes de renderizar (números viram número, campos faltando ganham padrão, texto entra via `textContent`), então um link mal formado não quebra nem injeta nada na página.

## Formato do `DATA` (v1)

```json
{
  "exemplo": false,
  "titulo": "Minha carteira",
  "moeda": "BRL",
  "cambio": 5.45,
  "atualizado": "2026-11-01T21:00:00Z",
  "lugares": [
    { "nome": "Cold wallet", "tipo": "autocustodia", "endereco": "bc1...", "origem": "lido",
      "fonte": "mempool.space", "hora": "2026-11-01T21:00:00Z",
      "ativos": [ { "simbolo": "BTC", "grupo": "bitcoin", "valor": 4800 } ] }
  ],
  "dca": null
}
```

- `grupo`: `bitcoin` | `estavel` | `altcoins`
- `tipo`: `autocustodia` | `carteira` | `corretora` | `banco` | `defi`
- `origem`: `lido` (com `fonte` e `hora`) | `informado` (com `data`) | `pendente` (valor `null`)
- `dca`: `null` ou `{ ativo, por_compra, frequencia, teto_mes, proxima, compras_mes: [{ data, valor }] }`

Mudou o formato de um jeito que a casca antiga quebra? Vira `@2` (tag `v2.0.0`) e a casca nova passa a apontar pra `@2`. Quem tem a casca v1 continua funcionando.

## Publicar uma versão

```bash
npm version patch        # 1.0.0 -> 1.0.1, cria commit e tag v1.0.1
git push --follow-tags   # GitHub fica igual ao npm
npm publish              # jsDelivr passa a servir @1 = 1.0.1
```

O jsDelivr guarda `@1` em cache por até 7 dias. Pra valer na hora: `https://purge.jsdelivr.net/npm/painel-carteira@1/painel.js`

## Cópia de texto

Os botões "Copiar pedido" e "Atualizar com IA" tentam, nesta ordem: API de clipboard, `textarea` + `execCommand("copy")` e, se nada funcionar (Gemini Canvas bloqueia o clipboard), mostram o texto já selecionado num campo pra copiar na mão.
