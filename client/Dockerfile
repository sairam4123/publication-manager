FROM node:18-alpine AS build

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
COPY package.json package-lock.json ./
RUN npm install
COPY . ./
RUN npm run build


FROM nginx:1.21.5-alpine AS release
COPY --from=build /app/dist /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]