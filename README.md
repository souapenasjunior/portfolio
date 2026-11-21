# Portfólio · Junior

Site de apresentação com uma pegada de terminal: uma breve apresentação, a formação e as linguagens e tecnologias com que eu trabalho.

**🔗 Acesse: [souapenasjunior.vercel.app](https://souapenasjunior.vercel.app)**

## O que tem no site

- **Abertura em terminal:** linhas sendo digitadas, barra de carregamento e a marca "SJ" com efeito de glitch (aparece uma vez por sessão; um toque ou qualquer tecla pula)
- **Título que se decodifica:** símbolos aleatórios viram o texto, com cursor piscando
- **Código caindo atrás do título** e um brilho que segue o mouse
- **Ao rolar:** barra de leitura, palavras do "Sobre" acendendo, faixa de linguagens que reage à rolagem e linhas da Stack se desenhando
- Seção "Sobre" com a formação e lista com as linguagens e tecnologias (Stack)
- Contato por e-mail
- Layout adaptado para celular, tablet e computador
- Respeita o "reduzir movimento" do sistema: ficam os efeitos de texto e luz, e o que se move pela tela não roda
- Sem frameworks e sem etapa de build: HTML, CSS e JavaScript puros

Publicação automática na Vercel a cada envio para a branch `main`.

## Tecnologias

HTML · CSS · JavaScript (Canvas, IntersectionObserver, requestAnimationFrame) · Google Fonts (Archivo, Instrument Serif e JetBrains Mono) · Vercel

## Rodar no computador

Não precisa instalar nada. Basta abrir o `index.html` no navegador ou, para testar como um site:

```bash
python -m http.server 8000
```

E abrir `http://localhost:8000`.

## Estrutura

```
index.html   página
style.css    visual e animações
script.js    abertura em terminal, efeitos ao rolar, menu e relógio
img/         logo e ícones do site
```

---

Feito por **Junior** · [@souapenasjunior](https://github.com/souapenasjunior)
