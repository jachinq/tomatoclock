# ------------------------------------------------------------------------------
# Final Stage
# ------------------------------------------------------------------------------
  FROM alpine:latest
  WORKDIR /home/myapp/
  RUN mkdir data
  RUN mkdir config
  RUN mkdir web
  COPY ./web ./web
  COPY app .
  CMD ["./app"]