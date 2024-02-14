# workers/Dockerfile
FROM golang:1.17 as builder

WORKDIR /app

COPY workers/go.mod workers/go.sum ./
RUN go mod download

COPY workers/. .

RUN CGO_ENABLED=0 GOOS=linux go build -o worker ./cmd/worker

FROM alpine:latest  
RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/worker .

CMD ["./worker"]
