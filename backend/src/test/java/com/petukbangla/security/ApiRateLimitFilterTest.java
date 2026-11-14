package com.petukbangla.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class ApiRateLimitFilterTest {
    @Test
    void limitsLoginAttemptsPerClient() throws Exception {
        ApiRateLimitFilter filter = new ApiRateLimitFilter();
        FilterChain chain = mock(FilterChain.class);
        for (int i = 0; i < 8; i++) {
            MockHttpServletRequest request = request("/api/auth/login", "POST");
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(request, response, chain);
            assertEquals(200, response.getStatus());
        }
        MockHttpServletResponse blocked = new MockHttpServletResponse();
        filter.doFilter(request("/api/auth/login", "POST"), blocked, chain);
        assertEquals(429, blocked.getStatus());
        verify(chain, org.mockito.Mockito.times(8)).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void rejectsOversizedBodiesBeforeControllers() throws Exception {
        ApiRateLimitFilter filter = new ApiRateLimitFilter();
        FilterChain chain = mock(FilterChain.class);
        MockHttpServletRequest request = request("/api/auth/login", "POST");
        request.setContent(new byte[1_250_001]);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, chain);
        assertEquals(413, response.getStatus());
        org.mockito.Mockito.verifyNoInteractions(chain);
    }

    private MockHttpServletRequest request(String uri, String method) {
        MockHttpServletRequest request = new MockHttpServletRequest(method, uri);
        request.setRemoteAddr("198.51.100.10");
        return request;
    }
}
