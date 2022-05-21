# Compadres

## Introduction

This is another TODO list collaborative editing toy app to test how the wonderful [Automerge](https://automerge.org/) library works.

Besides Automerge it uses [React](https://reactjs.org/), [create-react-app](https://create-react-app.dev/), [Styled Components](https://styled-components.com/) on the client/frontend and [ws](https://github.com/websockets/ws) library for websocket implementation on the server. To make things more beautiful (by default, and even supporting dark mode), [Pico.css](https://picocss.com/) CSS framework also has been added. Typescript everywhere.

## Installation

To make things work, please install [yarn](https://yarnpkg.com/). It could probably work with regular `npm` as well but that hasn't been tested. Also automatic building and deployment has been tested on MacOS only.

### Production

From the project's root folder, just run `yarn install && yarn build`, followed by `yarn deploy`. You will need to have environment variable `COMPADRES_PEM_FILE` set with full path to your .pem file which works with your deployment target (the server, that is).

You will need a web server (like nginx) able to serve static files and virtual host configured to serve them from `/home/ec-user/compadres/build/public` directory (yes, this is very Amazon EC2-specific), and also [pm2](https://pm2.keymetrics.io/) installed globally.

### Development

Run `yarn install` and then:

* in `packages/compadres-app` directory run `yarn start`
* in `packages/compadres-server` directory run `yarn start`
* navigate your browser to `http://localhost:3000`. `compadres-server` also opens a port to `3003` and `react-react-app`-based application proxies websocket trafic to it.

