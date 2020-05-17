FROM node:13.14 AS gin-web-vue

RUN echo "----------------- 前端Gin Web Vue构建 -----------------"
# 环境变量
# 定义应用运行目录
ENV APP_HOME /app/gin-web-vue

RUN mkdir -p $APP_HOME

# 设置运行目录
WORKDIR $APP_HOME

# 这里的根目录以docker-compose.yml配置build.context的为准
# 拷贝宿主机全部文件到当前目录
COPY ./gin-web-vue .
# 设置npm/yarn镜像仓库国内源
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
#RUN yarn config set registry https://registry.npm.taobao.org/
RUN ls -l $APP_HOME
# 安装依赖
RUN cnpm install
# 构建
RUN npm run build:prod


FROM nginx:1.17.10
RUN echo "----------------- Nginx构建 -----------------"

# 移除nginx容器的default.conf/nginx配置文件
RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf

# 把主机的nginx.conf文件复制到nginx容器的/etc/nginx文件夹下
COPY ./gin-web-vue/nginx/nginx.conf /etc/nginx/
# 拷贝前端vue项目打包后生成的文件到nginx下运行
COPY --from=gin-web-vue /app/gin-web-vue/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 10001

# 注: CMD不同于RUN, CMD用于指定在容器启动时所要执行的命令, 而RUN用于指定镜像构建时所要执行的命令.
#     RUN指令创建的中间镜像会被缓存, 并会在下次构建中使用.
#     如果不想使用这些缓存镜像, 可以在构建时指定--no-cache参数, 如：docker build --no-cache

# 使用daemon off的方式将nginx运行在前台保证镜像不至于退出
CMD ["nginx", "-g", "daemon off;"]
