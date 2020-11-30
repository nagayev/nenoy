<!-- FIXME: add normal docs! -->

# Документация для Неной

## Общее

Сайт сделан на NextJS (как клиент, так и сервер). Используется vercel.com для хостинга + github  
База данных хранится в Облаке на [cloud.mongodb.com](https://cloud.mongodb.com)
Версия: 0.9.1

## Стек технологий

JavaScript, React, NextJS

- react-modal - для Модалок :)
- react-yandex-maps - Яндекс карты
- react-markdown - для постов и комментариев
- date-diff-js
- mongodb - база данных
- nodemailer - отправка письма после регистрации

## Комментарий

Стабилизация апи уже прошла, но документация пока устаревшая.
В будущем документация будет активно улучшаться.

## Описание страниц

Сайт одностраничный. Есть страница index.tsx (/) и \_app.tsx  
Есть также "страницы" для api, в папке api.  
На них отправляет запросы пользователь, они отправляют в БД (middleware).
api:

- getplacemarks.js
- getPosts.js
- getUserInfo.js
- sendInformation.js
- signin.js
- signup.js

## Коды ошибок

См. файл errors.ts

| Name          | Code | Комментарий                   |
| ------------- | ---- | ----------------------------- |
| BUSY_LOGIN    | 0    | Логин уже занят (регистрация) |
| INVALID_LOGIN | 1    | Неправильный логин(вход)      |

## Описание методов

### Утилиты

Расположены в файле src/ui/utils.ts  
wrap, getDefaultTheme, detectMobile,MD5,isValidEmail, formatError, formatOk  
TODO: add description

### Работа с БД

src/usersdb.js  
appendUser,sigIn (в прошлом getToken),isLoginExists  
async appendUser(login:string,password:string)
Insert new user to DB  
NOTE: не проверяет существование пользователя!  
async sigIn(login:string,password:string):Promise<signInType>
isLoginExists:Promise<boolean>
