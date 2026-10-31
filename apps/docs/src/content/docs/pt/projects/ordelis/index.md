---
contentId: projects/ordelis
locale: pt-BR
originalLocale: en
path: /pt/projetos/ordelis/
title: Ordelis
description: Um workspace desktop local-first e de código aberto, em construção, para coordenar agentes de programação com IA. O que está implementado, o que é herdado e o que ainda é plano.
tagline: Seus agentes, em ordem. Em desenvolvimento inicial.
order: 1.4
group: projects
status: início do desenvolvimento
meta:
  - macos primeiro
  - tauri · python
source: https://github.com/RaioViajante/ordelis
summary: workspace desktop para coordenar agentes de programação com IA
---

## Visão geral

O Ordelis pretende manter em ordem o trabalho com agentes de programação: descrever uma tarefa, planejar o trabalho, coordenar os agentes, revisar as evidências e decidir por conta própria o que será integrado. Foi projetado para rodar na sua máquina. Não é um modelo, um chatbot nem um editor; os agentes que você já usa fazem a programação.

O projeto se chamava Synapse antes, e nasceu do runtime de linha de comando de código aberto MCO, versão 0.12.1, dos mantenedores do mco. O repositório ainda contém esse runtime herdado com os nomes originais, e alguns identificadores internos mantêm o nome Synapse enquanto a renomeação é concluída. A licença MIT preserva o aviso de direitos autorais original.

:::important
O fluxo completo não está implementado. O aplicativo desktop mostra dados de exemplo e não consegue executar agentes. O runtime de linha de comando consegue executar agentes, mas não está conectado ao desktop. Não há releases, instaladores nem downloads.
:::

## Estado atual

Conferido no repositório de código, no commit `a9cf7d5`. O repositório é público.

| Capacidade | Estado | Onde |
| --- | --- | --- |
| Casca desktop com seis páginas | protótipo | React e TypeScript em uma webview do Tauri 2; em sua maioria dados de exemplo |
| Lista fechada de comandos nativos | implementado | seis comandos revisados atrás de um manifesto de acesso explícito |
| Registro local de projetos | implementado no backend, só macOS | nenhuma página o chama ainda |
| Executar agentes pelo terminal | implementado, herdado | `mco run`, `mco review`, `mco session` no runtime Python |
| Adaptadores de provedores | implementado, herdado | Claude Code, Codex, OpenCode e outros; não conectados ao desktop |
| Adaptador do Kimi | inexistente | a decisão sobre como integrá-lo está pendente |
| Prévia de contexto e um plano que não despacha | implementado na linha de comando | `mco context preview` e `mco context plan` |
| Execution Safety Gate | implementado como biblioteca | sempre responde não; não conectado ao aplicativo |
| Executar agentes pelo desktop | planejado | não existe caminho de código |
| Planos de várias etapas revisáveis e aprovações | planejado | a prévia de tarefa do desktop não altera nada |
| Um worktree Git por agente | planejado | não existe código de worktree no runtime |
| Sandbox ou confinamento imposto | inexistente | dito com todas as letras nos documentos de segurança |
| Windows e Linux | não verificado | o desktop só foi compilado e executado no macOS |

## Arquitetura

São três camadas, e só as duas primeiras são conectadas pelo desktop.

```text
Interface (React, TypeScript, em uma webview)
  | uma lista fechada de seis comandos nativos tipados
Camada nativa (Rust, Tauri 2)
  | somente em builds de desenvolvimento, uma pergunta fixa
Runtime Python (MCO herdado e acréscimos)
  | somente quando você mesmo executa a linha de comando
CLIs de agentes instaladas na sua máquina
```

A interface nunca alcança o sistema operacional diretamente. Ela chama uma lista curta de comandos tipados que a camada nativa declara e testa. A camada nativa cuida da validação, da checagem de caminhos e, no desenho pretendido, da vida dos processos. O runtime coordena os agentes. Somente em builds de desenvolvimento, o desktop pode fazer ao runtime uma única pergunta fixa, a de se identificar. Um build de release não contém nenhum meio de iniciar o Python.

Orquestração e implementação dos agentes ficam separadas de propósito: o Ordelis decide o que roda e sob quais limites, e cada agente continua responsável por como trabalha. A [página de segurança](/pt/projetos/ordelis/security/) trata das fronteiras em detalhe.

## Integrações com agentes

Os provedores não expõem as mesmas capacidades, e o Ordelis não presume que expõem. O runtime herdado tem um módulo de adaptador por provedor em `runtime/adapters`, entre eles Claude Code, Codex, OpenCode, Gemini, Qwen, Copilot, Cursor, Grok, Hermes, Ollama, Pi e `agy`, além de um meio de configurar um agente de linha de comando personalizado. O `mco doctor` verifica a instalação e a prontidão da autenticação, e o `mco agent` lista, verifica e inspeciona modelos.

O Kimi faz parte da visão do produto, mas não existe adaptador do Kimi no runtime. O projeto registra dois caminhos possíveis, pelo OpenCode ou pela própria linha de comando, e exige uma comparação local da fronteira somente leitura, da escolha de modelo, do cancelamento e do relato de uso antes de escolher.

## Execução

O que roda hoje é o runtime herdado. O `mco run` envia um prompt a vários agentes em paralelo ou em cadeia, com um prazo por invocação, um timeout de estagnação, um prazo para a execução inteira, cancelamento, e status e artefatos por invocação. Três modos de execução são traduzidos para os controles de cada provedor, quando ele os tem (o Hermes, por exemplo, não tem nenhum para `read_only` nem `write`):

| Modo | Intenção |
| --- | --- |
| `read_only` | o agente pode ler, mas não deve alterar arquivos |
| `write` | o agente pode editar arquivos |
| `yolo` | o agente ignora as próprias verificações de permissão |

Esses são controles do provedor, não confinamento do Ordelis. O runtime não tem portões de aprovação, e `--allow-paths` valida o escopo pedido sem criar um sandbox do sistema operacional. O daemon de sessões aplica uma `RetryPolicy` com espera exponencial, cujo padrão é de duas retentativas.

O desenho de execução pretendido é diferente e não está construído: uma etapa começaria apenas a partir de um plano aprovado, sob uma política por etapa que diria o que o agente pode ler, o que pode escrever, se pode usar a rede e por quanto tempo pode rodar, com portões de autorização humana que nenhum timeout pode aprovar. Esse desenho é uma proposta.

## Revisão

O `mco review` executa uma revisão somente leitura entre os agentes escolhidos e devolve cada resposta bruta com seu status; `--debate` e `--synthesize` acrescentam etapas somente leitura. O runtime deliberadamente não transforma as respostas em achados nem em consenso. Funções de revisores independentes, severidades, relatórios de evidências e uma trilha de auditoria das decisões são planejados.

## Testes

O runtime Python tem 59 módulos de teste, executados com `python3 -m unittest`. O desktop tem lint, verificação de tipos e testes unitários com pnpm, além de testes em Rust que exercitam o manifesto real de controle de acesso com o runtime simulado do Tauri. O build do desktop é verificado no macOS na integração contínua. Essas suítes foram lidas para esta página e não executadas. Os testes em Rust não conduzem uma webview real.

## Limitações

- O desktop não consegue iniciar, parar nem observar um agente.
- A linha de comando não é governada pelo modelo de segurança planejado, e guarda as sessões dentro do repositório por padrão.
- Nenhum processo é confinado. Os documentos de segurança dizem que verificar não é impor.
- Código hostil rodando como o mesmo usuário está fora do escopo do desenho atual.
- Só o macOS foi compilado e executado.

## Roteiro

O roteiro ordena o trabalho sem datas nem números de versão. Ele abrange concluir a renomeação, um redesenho do desktop, descoberta real de provedores, planejamento de tarefas e aprovações, execução segura de agentes atrás de um coordenador revisado à parte, orquestração de worktrees Git, revisão independente e integração, continuidade de sessões e verificação multiplataforma. Um primeiro release também depende de trabalho de endurecimento e de uma revisão de segurança, que o projeto acompanha em suas issues.

## Referências

- [Repositório do Ordelis](https://github.com/RaioViajante/ordelis)
- [Funcionalidades e seu estado atual](https://github.com/RaioViajante/ordelis/blob/a9cf7d5/docs/product/features.md)
- [Roteiro](https://github.com/RaioViajante/ordelis/blob/a9cf7d5/docs/product/roadmap.md)
- [Visão geral da arquitetura](https://github.com/RaioViajante/ordelis/blob/a9cf7d5/docs/architecture/overview.md)
- [MCO, o runtime herdado](https://github.com/mco-org/mco)
