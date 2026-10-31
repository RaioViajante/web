---
contentId: projects/mochifile
locale: pt-BR
originalLocale: en
path: /pt/projetos/mochifile/
title: Mochifile
description: Ferramentas de arquivo amigáveis que rodam no seu navegador, para que seus arquivos fiquem no seu dispositivo. O que existe hoje, o que permanece local e o que é apenas planejado.
tagline: Ferramentas de arquivo simples e privadas que rodam no seu navegador.
order: 1.2
group: projects
status: pré-lançamento
meta:
  - ferramentas web
  - agpl-3.0
source: https://github.com/mochifile/mochifile
summary: ferramentas de arquivo privadas que rodam no seu navegador
---

## Visão geral

O Mochifile é um conjunto de ferramentas de arquivo para quem não é técnico e só precisa resolver uma tarefa: um formulário diz que a foto deve ter menos de 50 KB, então você adiciona o arquivo, escolhe um tamanho e baixa o resultado. O processamento acontece no seu navegador, então o arquivo não é enviado.

Essa simplicidade é um objetivo de design, não um acaso. Cada ferramenta é uma página com um único propósito, um título em linguagem simples e as mesmas palavras em inglês e em português. A engenharia por baixo é o que sustenta a promessa: os arquivos são processados no dispositivo, em um worker em segundo plano, e a regra do projeto é que nenhuma requisição de rede acompanha a escolha de um arquivo.

:::important
Hoje o Mochifile tem uma ferramenta, Comprimir imagem, e está em pré-lançamento: o site está no ar, mas envia um cabeçalho `noindex` para que os buscadores o ignorem. Outras ferramentas citadas nos documentos do projeto não estão disponíveis.
:::

## Estado atual

Conferido no repositório público, no commit `4efdc8c`.

| Capacidade | Estado | Observações |
| --- | --- | --- |
| Comprimir uma imagem até um tamanho-alvo | implementado | JPEG, PNG e WebP na entrada; até 20 arquivos de 50 MB cada; seis páginas de tamanhos predefinidos |
| Motor de conversão de imagens (HEIC, AVIF, JPG, PNG, WebP) | só o motor | o código e os testes existem, mas nenhuma página de ferramenta o usa ainda |
| Outras ferramentas (PDF, foto para documento, vídeo) | planejado | citadas como exemplos nas notas de arquitetura; não existe código |
| Páginas em inglês e em português | implementado | cada página tem a própria URL em cada idioma |
| Contas, cobrança e API para desenvolvedores | indisponível | as páginas de login e de API dizem isso; nenhum servidor responde a elas |
| Processamento no servidor | não usado | nenhuma ferramenta do repositório público envia um arquivo a um servidor |
| Linha de comando e integrações com assistentes de IA | indisponível | os repositórios relacionados não têm commits |

As seis páginas predefinidas do compressor miram 20 KB, 50 KB, 100 KB, 200 KB, 500 KB e 1 MB. Os tamanhos usam unidades decimais, então um resultado de 50 KB tem no máximo 50.000 bytes e também passa em portais que contam 1.024 bytes por KB.

## O que fica no seu dispositivo

Nas ferramentas de navegador, o arquivo é lido, decodificado, redimensionado, codificado e devolvido como download sem sair da página. A arquitetura registra estas regras:

- O processamento roda em um Web Worker, nunca na thread da interface.
- Os codecs são arquivos WebAssembly servidos pela própria origem do Mochifile, e carregam quando você demonstra a intenção de usar uma ferramenta, não depois de escolher um arquivo.
- Os resultados são recodificados a partir dos pixels, então metadados da foto como EXIF, GPS e XMP não são levados adiante. Um arquivo que já é pequeno o bastante tem os metadados removidos sem recodificação.
- O conteúdo e os nomes dos arquivos não são registrados em log, e os erros são reduzidos a códigos.
- A análise de uso, quando existir, deve ser sem cookies e agregada.

Um repositório privado separado é reservado para contas, pagamentos e qualquer processamento que um navegador não consiga fazer. A arquitetura diz que um caminho desses no servidor exigiria uma decisão escrita própria, pediria consentimento explícito e apagaria os arquivos logo após o trabalho. Nenhuma das ferramentas públicas o usa, e esta página não descreve o repositório privado.

## Como uma ferramenta funciona, em resumo

Toda ferramenta é um pacote com um manifesto de dados, uma função de processamento pura e uma pequena interface. O site lê apenas os manifestos para montar as páginas, e carrega a interface e o worker de uma ferramenta só quando necessário. A [página de arquitetura](/pt/projetos/mochifile/architecture/) percorre o contrato, o fluxo em tempo de execução, o motor de imagens e o algoritmo de busca do tamanho.

## Navegadores e acessibilidade

A suíte ponta a ponta roda em Chromium, Firefox e WebKit, e 16 de suas especificações executam verificações automáticas de acessibilidade com axe, incluindo a do compressor. A decodificação de imagens se adapta ao navegador: decodificadores nativos são usados onde um teste mostra que funcionam, e decodificadores WebAssembly entram nos demais casos. O motor consegue ler fotos HEIC assim fora do Safari, mas nenhuma ferramenta expõe isso ainda. A memória é limitada rejeitando entradas acima de 100 megapixels e processando em no máximo 16 megapixels.

O Mochifile não publica uma lista de versões de navegador suportadas, então nenhuma é afirmada aqui.

## Limitações

- A velocidade depende do seu dispositivo. Uma foto grande pode levar alguns segundos em um celular.
- Um alvo pode ser inalcançável: quando a qualidade 40 no menor tamanho permitido ainda excede o alvo, a ferramenta informa isso em vez de devolver um arquivo maior.
- Imagens transparentes viram JPEG com fundo branco quando a saída precisa ser JPEG, e o resultado avisa.
- O projeto aceitou um risco de patentes em torno do decodificador HEVC usado para HEIC, e definiu a condição de obter orientação jurídica antes de qualquer monetização. Esse decodificador não é exposto por nenhuma ferramenta atual.

## Referências

- [Site do Mochifile](https://mochifile.com/compress-image/)
- [Repositório público](https://github.com/mochifile/mochifile) e suas [notas de arquitetura](https://github.com/mochifile/mochifile/blob/4efdc8c/docs/architecture.md)
- [Registros de decisões de arquitetura](https://github.com/mochifile/mochifile/tree/4efdc8c/docs/adr)
