package com.blooddonation.demo.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Public URLs that don't need authentication
    private static final List<String> PUBLIC_URLS = List.of(
            "/api/auth/register",
            "/api/auth/login"
    );

    public JwtAuthFilter(JwtUtil jwtUtil, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String requestPath = request.getServletPath();

        // Skip filter entirely for public endpoints
        if (PUBLIC_URLS.contains(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Get Authorization header
        String authHeader = request.getHeader("Authorization");

        // No token → let Spring Security handle it with our entry point
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract the token (remove "Bearer " prefix)
        String token = authHeader.substring(7);

        try {
            // Validate token
            if (!jwtUtil.isTokenValid(token)) {
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED,
                        "Invalid or expired token. Please login again.");
                return;
            }

            // Get email from token
            String email = jwtUtil.extractEmail(token);

            // Only set auth if not already authenticated
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Load user from database
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                // Set authentication in context
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }

        } catch (ExpiredJwtException e) {
            // Token has expired
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Token has expired. Please login again.");
            return;
        } catch (JwtException e) {
            // Malformed or invalid token
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid token. Please login again.");
            return;
        } catch (Exception e) {
            // Any other error - don't expose internal details
            logger.error("JWT Authentication error", e);
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Authentication failed. Please login.");
            return;
        }

        // Continue with the filter chain
        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response, int status, String message)
            throws IOException {
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(status);

        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        body.put("status", status);

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}