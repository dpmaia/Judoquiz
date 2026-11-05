# Judô Quiz

O [arquivo de design](https://www.figma.com/design/uzoPfrdZhYBb3rIKqnMupJ) reúne os frames aprovados para celular e desktop.

## Identidade

A entrada funciona como uma placa de dojô, com fundo azul escuro, ação amarela e uma prévia de questão real. As telas de estudo usam papel claro e tipografia Familjen Grotesk. IBM Plex Mono aparece nos rótulos de dados, no progresso e nas letras das alternativas.

| Uso | Cor |
| --- | --- |
| Papel e texto | `#F5F6F0` e `#172633` |
| Placa, ações principais e destaque | `#1C3547` e `#F4D45D` |
| Foco e seleção | `#215A91` sobre `#E2EDF8` |
| Acerto | `#174B37` sobre `#E6F2E8` |
| Erro | `#792D2A` sobre `#F8E9E6` |

As cores de graduação acompanham o nome da faixa. A lista e o catálogo também exibem o Kyû. Seleção e feedback usam rótulos e ícones junto da cor.

## Estudo e revisão

- Questões de texto usam uma coluna de até 738 px. No desktop, enunciado e mídia dividem a página com as alternativas. No celular, as alternativas seguem abaixo da mídia.
- A escolha registra a resposta e leva o foco ao feedback. Avançar leva o foco ao novo enunciado.
- O resultado ordena as categorias por número de erros. A revisão preserva a numeração original e reúne a resposta escolhida, a correta, a explicação e a fonte.
- As transições de interação respeitam a preferência por movimento reduzido. A moldura do player mantém a proporção durante preparação e erro.
- As imagens de saudação vêm do banco local em `public/visual-refs/`. As duas fontes são servidas localmente, com as respectivas licenças em `public/fonts/`.
