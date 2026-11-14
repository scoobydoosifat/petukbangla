package com.petukbangla.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Small, bounded per-instance guardrail for Render instances. A shared Redis or
 * edge/WAF limiter should still be enabled for multi-instance production traffic.
 */
public class ApiRateLimitFilter extends OncePerRequestFilter {
    private static final long WINDOW_NANOS = Duration.ofMinutes(1).toNanos();
    private static final int MAX_BUCKETS = 10_000;
    private static final long MAX_BODY_BYTES = 1_250_000L;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final AtomicInteger requestsSinceCleanup = new AtomicInteger();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        if (!request.getRequestURI().startsWith("/api/")) {
            chain.doFilter(request, response);
            return;
        }
        if (request.getContentLengthLong() > MAX_BODY_BYTES) {
            writeError(response, HttpStatus.PAYLOAD_TOO_LARGE, "Request body is too large.");
            return;
        }

        String path = request.getRequestURI();
        String method = request.getMethod();
        String category = category(path, method);
        int limit = switch (category) {
            case "login" -> 8;
            case "register" -> 5;
            case "write" -> 40;
            default -> 180;
        };
        String key = clientKey(request) + ":" + category;
        long now = System.nanoTime();
        Bucket bucket = buckets.computeIfAbsent(key, ignored -> new Bucket(now));
        if (bucket.tryConsume(now, limit)) {
            response.setHeader("X-RateLimit-Limit", Integer.toString(limit));
            chain.doFilter(request, response);
        } else {
            long retryAfter = Math.max(1, (bucket.startedAt + WINDOW_NANOS - now) / 1_000_000_000L);
            response.setHeader("Retry-After", Long.toString(retryAfter));
            writeError(response, HttpStatus.TOO_MANY_REQUESTS, "Too many requests. Please try again shortly.");
        }
        if (requestsSinceCleanup.incrementAndGet() >= 5_000) cleanup(now);
    }

    private String category(String path, String method) {
        if ("POST".equals(method) && path.equals("/api/auth/login")) return "login";
        if ("POST".equals(method) && path.equals("/api/auth/register")) return "register";
        if (!"GET".equals(method) && !"OPTIONS".equals(method)) return "write";
        return "read";
    }

    private String clientKey(HttpServletRequest request) {
        // Do not trust arbitrary forwarded headers; Render's connection address
        // is the safe default. The edge/WAF should enforce the public IP limit.
        return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
    }

    private void cleanup(long now) {
        requestsSinceCleanup.set(0);
        buckets.entrySet().removeIf(entry -> now - entry.getValue().startedAt > WINDOW_NANOS);
        if (buckets.size() > MAX_BUCKETS) buckets.clear();
    }

    private void writeError(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"status\":" + status.value() + ",\"message\":\"" + message + "\"}");
    }

    private static final class Bucket {
        private long startedAt;
        private int count;

        private Bucket(long startedAt) { this.startedAt = startedAt; }

        private synchronized boolean tryConsume(long now, int limit) {
            if (now - startedAt >= WINDOW_NANOS) {
                startedAt = now;
                count = 0;
            }
            return ++count <= limit;
        }
    }
}
