FROM oven/bun:1

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
# Install dependencies using bun
RUN bun install

# Copy the rest of the application
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run Vite with --host to allow external access
CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
