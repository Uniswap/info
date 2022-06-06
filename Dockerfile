FROM nginx:alpine

COPY ./build /var/www/classic

COPY ./etc/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
