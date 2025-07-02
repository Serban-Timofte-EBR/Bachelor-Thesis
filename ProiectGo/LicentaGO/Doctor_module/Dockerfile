# Development stage
FROM golang:1.23-alpine AS development

# Install Air
RUN go install github.com/air-verse/air@latest

# Set the working directory
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies
RUN go mod download

# Copy the source code
COPY . .

EXPOSE 8081

# Command to run Air for hot reloading
CMD ["air", "-c", ".air.toml"]

# Build stage
FROM golang:1.23-alpine AS builder

# Set the working directory
WORKDIR /app

COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main main.go

# Production stage
FROM alpine:latest AS production

# Set the working directory
WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/main .

# Copy the .env file
COPY .env .

EXPOSE 8081

# Command to run the executable
CMD ["./main"]