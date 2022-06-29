#FROM node:13.14-alpine AS gin-web-vue
FROM registry.cn-shenzhen.aliyuncs.com/piupuer/node:13.14-alpine AS gin-web-vue

RUN echo "----------------- Gin Web Vue building -----------------"
ARG USE_YARN
ARG WEBPACK_ALIOSS_OPEN
ARG WEBPACK_ALIOSS_PLUGIN_ACCESS_KEY_ID
ARG WEBPACK_ALIOSS_PLUGIN_ACCESS_KEY_SECRET
ARG WEBPACK_ALIOSS_PLUGIN_BUCKET
ARG WEBPACK_ALIOSS_PLUGIN_REGION
ARG WEBPACK_ALIOSS_PLUGIN_OSS_BASE_DIR
ENV APP_HOME /app/gin-web-vue

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk update \
  && apk add bash \
  && apk add git \
  && apk add python make g++ \
  && rm -rf /var/cache/apk/* /tmp/* /var/tmp/* $HOME/.cache

RUN mkdir -p $APP_HOME

WORKDIR $APP_HOME

COPY . .

RUN chmod +x version.sh && ./version.sh

RUN ls -l $APP_HOME

RUN if [ "$USE_YARN" = "true" ] ; then yarn config set registry https://registry.npm.taobao.org/ && yarn && yarn build:prod; else npm config set registry https://registry.npm.taobao.org && npm install && npm run build:prod; fi

RUN ls -l $APP_HOME


#FROM nginx:1.17.10-alpine
FROM registry.cn-shenzhen.aliyuncs.com/piupuer/nginx:1.17.10-alpine
RUN echo "----------------- Nginx building -----------------"

ENV APP_HOME /app/gin-web-vue
ENV NGINX_HOME /usr/share/nginx/html

WORKDIR $NGINX_HOME

RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf

COPY docker-conf/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=gin-web-vue $APP_HOME/dist $NGINX_HOME
COPY --from=gin-web-vue $APP_HOME/gitversion $NGINX_HOME

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk update \
  && apk add tzdata \
  && apk add curl \
  && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && echo "Asia/Shanghai" > /etc/timezone
# RUN date -R

CMD ["nginx", "-g", "daemon off;"]
