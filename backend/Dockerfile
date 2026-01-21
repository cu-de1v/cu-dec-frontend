FROM node:18-slim

# Install system deps
RUN apt-get update \
 && apt-get install -y curl ffmpeg ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Install yt-dlp binary
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    -o /usr/local/bin/yt-dlp \
 && chmod a+rx /usr/local/bin/yt-dlp

# Verify yt-dlp exists
RUN yt-dlp --version

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 8080
CMD ["npm", "start"]
