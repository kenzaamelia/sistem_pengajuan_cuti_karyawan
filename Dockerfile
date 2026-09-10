# --- TAHAP 1: Ambil Node resmi untuk mengompilasi React (Multi-stage Build) ---
FROM node:22-alpine AS node-stage
WORKDIR /src
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- TAHAP 2: Bangun Container Utama PHP untuk Laravel ---
FROM php:8.2-fpm

# Set working directory
WORKDIR /var/www

# Install sistem dependensi yang dibutuhkan Laravel
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim \
    unzip \
    git \
    curl \
    libzip-dev \
    libonig-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install ekstensi PHP yang dibutuhkan Laravel
RUN docker-php-ext-install pdo_mysql mbstring zip exif pcntl
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install gd

# Install Composer resmi
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Trik Pintar: Salin Node.js dan NPM versi 22 langsung dari Image Resmi ke dalam PHP
COPY --from=node:22 /usr/local/bin /usr/local/bin
COPY --from=node:22 /usr/local/lib/node_modules /usr/local/lib/node_modules

# Salin seluruh kode proyek ke dalam container
COPY . /var/www

# Berikan izin akses folder storage & bootstrap/cache ke user www-data (bawaan PHP-FPM)
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Buka port untuk PHP-FPM dan Vite
EXPOSE 9000 5173

CMD ["php-fpm"]
