# Dockerfile for Laravel Backend
ARG PHP_VERSION=8.3
FROM php:${PHP_VERSION}-fpm

# Set working directory
WORKDIR /var/www/html

USER root

# Install system dependencies (for Laravel and its required PHP extensions)
RUN apt-get update && apt-get install -y \
    git \
    nano \
    vim \
    curl \
    zip \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && docker-php-ext-install \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        xml \
        sockets \
        zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Clear cache and set correct permissions
RUN apt-get clean && rm -rf /var/lib/apt/lists/*
