# Vue 3 and Element Plus - Vue Video Player

## Require

- Node JS >=14
- NPM
- Vue 3
- GraphQL Express
- Express JS
- MongoDB
- FFmpeg

## Build project

1. Install dependencies for frontend

```bash
cd VueApp/vue-video-player
npm install
```

2. Install dependencies for backend

```bash
cd NodeJS/video-api-server
npm install
```

3. Config backend
   Open folder `NodeJS/video-api-server`, config database mongodb URI in `.env` file:

```ENV
MONGODB_URI="mongodb://localhost:27017/video-api-server
PORT=3000
ALLOW_ORIGIN_URL="http://localhost:3002"
```

4. Run frontend and backend

```bash
# run frontend
cd VueApp/vue-video-player
npm run dev

# run backend
cd NodeJS/video-api-server
npm run dev
```

## Configure JWT auth and GraphQL

- Open GraphQL playground: `http://localhost:3000/graphql`
- JWT expried and refresh token: check code refresh token from backend
- API Testing tool: Postman or Insomnia with GraphQL support.

## Task list:

- Save path video m3u8 and store pinia
- Save thumbnail and load thumbnail
- Create form title, description get video duration
- Choose thumnbnail and save to GraphQL.
- Manage video edit video title and description
- Filter video by categories
