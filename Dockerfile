FROM registry.cn-shenzhen.aliyuncs.com/piupuer/node:13.14-alpine AS gin-web-vue

RUN echo "----------------- 前端Gin Web Vue构建(Production) -----------------"
# 构建参数
ARG USE_YARN
ARG WEBPACK_ALIOSS_OPEN
ARG WEBPACK_ALIOSS_PLUGIN_ACCESS_KEY_ID
ARG WEBPACK_ALIOSS_PLUGIN_ACCESS_KEY_SECRET
ARG WEBPACK_ALIOSS_PLUGIN_BUCKET
ARG WEBPACK_ALIOSS_PLUGIN_REGION
ARG WEBPACK_ALIOSS_PLUGIN_OSS_BASE_DIR
# 定义应用运行目录
ENV APP_HOME /app/gin-web-vue-prod

# alpine添加基础软件
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk update \
  && apk add bash \
  && apk add git \
  && apk add python make g++ \
  && rm -rf /var/cache/apk/* /tmp/* /var/tmp/* $HOME/.cache

RUN mkdir -p $APP_HOME

# 设置运行目录
WORKDIR $APP_HOME

# 拷贝宿主机全部文件到当前目录
COPY . .

# 记录当前版本号
RUN chmod +x version.sh && ./version.sh

RUN ls -l $APP_HOME

# 官方源https://registry.npmjs.org/
# 构建
RUN if [ "$USE_YARN" = "true" ] ; then yarn config set registry https://registry.npm.taobao.org/ && yarn && yarn build:prod; else npm config set registry https://registry.npm.taobao.org && npm install && npm run build:prod; fi

RUN ls -l $APP_HOME


FROM registry.cn-shenzhen.aliyuncs.com/piupuer/nginx:1.17.10-alpine
RUN echo "----------------- Nginx构建 -----------------"

# 定义应用运行目录
ENV APP_HOME /app/gin-web-vue-prod
ENV NGINX_HOME /usr/share/nginx/html

# 设置运行目录
WORKDIR $NGINX_HOME

# 移除nginx容器的default.conf/nginx配置文件
RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf

# 把主机的nginx.conf文件复制到nginx容器的/etc/nginx文件夹下
COPY docker-conf/nginx/nginx.conf /etc/nginx/nginx.conf
# 拷贝前端vue项目打包后生成的文件到nginx下运行
COPY --from=gin-web-vue $APP_HOME/dist $NGINX_HOME
COPY --from=gin-web-vue $APP_HOME/gitversion $NGINX_HOME

# alpine时区修改
# apk仓库使用国内源
# 设置时区为上海
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk update \
  && apk add tzdata \
  && apk add curl \
  && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && echo "Asia/Shanghai" > /etc/timezone
# 验证时区是否已修改
# RUN date -R

# 暴露端口
EXPOSE 8081

# 注: CMD不同于RUN, CMD用于指定在容器启动时所要执行的命令, 而RUN用于指定镜像构建时所要执行的命令.
#     RUN指令创建的中间镜像会被缓存, 并会在下次构建中使用.
#     如果不想使用这些缓存镜像, 可以在构建时指定--no-cache参数, 如：docker build --no-cache

# 使用daemon off的方式将nginx运行在前台保证镜像不至于退出
CMD ["nginx", "-g", "daemon off;"]

# 设置健康检查
HEALTHCHECK --interval=5s --timeout=3s \
  CMD curl -fs http://127.0.0.1:8081/ || exit 1
