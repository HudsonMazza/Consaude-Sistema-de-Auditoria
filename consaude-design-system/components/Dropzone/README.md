# Dropzone

Um passo de upload de planilha com estados vazio, arrastando, lendo, carregado (com colunas reconhecidas) e erro.

**Você fornece**: `step`, `title`, `subtitle`, `state` (ou deixe o componente controlar o drag-over), `file` (`{ name, size, rows, columns }`), `error` (mensagem que diz como resolver), `onFile(file)`, `onRemove()`, `accept`, `hint`.

- Combine dois dropzones com `UploadProgress` ("1 de 2 arquivos"). No mobile não fala em "arrastar": "Toque para selecionar o arquivo".
- O input de arquivo real cobre a área inteira (teclado e leitor de tela funcionam).
