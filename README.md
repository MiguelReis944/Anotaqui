# Anotaqui

Anotaqui é um programa para fazer anotações no computador. Você escreve uma nota e ela fica salva como um arquivo de texto (Markdown). Dá para organizar as notas por tags, buscar por palavras e exportar para PDF ou HTML.

## Como usar

Você precisa ter Python instalado.

1. Baixe o código:

   git clone https://github.com/MiguelReis944/Anotaqui.git
   cd Anotaqui

2. Instale as dependências:

   pip install -r requirements.txt

3. Inicie o servidor para abrir no navegador:

   python anotaqui.py serve --port 8080

   Depois acesse http://localhost:8080

Também dá para usar direto pelo terminal:

   python anotaqui.py add "Minha primeira nota" --tags estudo
   python anotaqui.py list --tag estudo
   python anotaqui.py export 1 --format pdf

## Onde as notas ficam

As notas são salvas na pasta `~/notas` por padrão. Cada nota é um arquivo `.md` com metadados no topo (título, data, tags). Você pode editar os arquivos com qualquer editor de texto.

## Configuração

Se quiser mudar a pasta ou outras opções, crie um arquivo `~/.anotaqui/config.yaml`:

   storage: ~/Documentos/notas
   editor: code
   theme: light

## Contribuindo

Se quiser ajudar, pode abrir uma issue ou enviar um pull request.

## Licença

MIT
