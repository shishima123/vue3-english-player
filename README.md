# Vue3 English Player

<h1 align="center">
  <img alt="logo" src="https://i.imgur.com/iHflppC.png" width="200"/>
  <br>
</h1>

## Project Setup

```sh
yarn install
```

## Nodejs version v18.18.0

```sh
nvm install 18

nvm use 18
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Compile and Minify for Production

```sh
yarn build
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```

## 💁🏻 Build

Open the terminal/command line and run the following commands in turn:

```sh
make build
```

## 💁🏻 Deploy to github pages

Open the terminal/command line and run the following commands in turn:

```sh
make deploy
```

## 💁🏻 CI/CD

Using GitHub action


## Auto subtitle

### Install

    https://github.com/m1guelpf/auto-subtitle

### Usage
Edit file `generate_subtitles.sh` then run command

```shell
sh generate_subtitles.sh
```

#### Manual run

```shell
auto_subtitle "Unit 8 Acupuncture.mp3" -o lyric/ --srt_only true --model medium.en
```

## Create playlist

### Install

```shell
cd script

npm i
```

### Usage

Edit file `create_playlist.js` then run command

```shell
node create_playlist.js
```
