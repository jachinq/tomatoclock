# Build Stage
FROM rust:latest AS builder
WORKDIR /usr/src/
RUN apt-get update && apt-get install musl-tools -y
RUN rustup target add x86_64-unknown-linux-musl

RUN USER=root cargo new tinyhttp
WORKDIR /usr/src/tinyhttp
COPY Cargo.toml ./
RUN cargo build --release

COPY src ./src
# COPY templates ./templates
# RUN cargo install cross
RUN cargo install --target x86_64-unknown-linux-musl --path .


# Bundle Stage
FROM alpine:latest
# RUN addgroup -g 1000 admin
# RUN adduser -D -s /bin/sh -u 1000 -G admin admin
# WORKDIR /home/admin/
# WORKDIR /app/
COPY --from=builder /usr/local/cargo/bin/tinyhttp .
# RUN chown admin:admin tinyhttp
# USER admin
RUN pwd
RUN ls -l
CMD ["./tinyhttp"]