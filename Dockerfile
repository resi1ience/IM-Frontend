FROM node:18

WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN npm install -D unplugin-vue-components unplugin-auto-import

RUN npm install @element-plus/icons-vue

RUN npm install --save @vue/shared

RUN npm install --save @vue/reactivity

RUN npm install crypto-js

RUN npm run build

FROM nginx:latest

COPY --from=0 /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80
