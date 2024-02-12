# server/Dockerfile
FROM golang:1.17 as builder

WORKDIR /app

# Copy the Go Modules manifests and download the dependencies
COPY server/go.mod server/go.sum ./
RUN go mod download

# Copy the source code into the container
COPY server/. .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

# Use a small image to run the application
FROM alpine:latest  
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the built application from the builder stage
COPY --from=builder /app/server .

# Command to run the application
CMD ["./server"]
