package com.akto.filter;

import com.akto.dao.context.Context;
import com.akto.dto.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicInteger;

public class LoggingFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(LoggingFilter.class);
    private static AtomicInteger apiCounter = new AtomicInteger();

    @Override
    public void init(FilterConfig filterConfig) { }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        int startTs = Context.now();
        apiCounter.incrementAndGet();
        chain.doFilter(request, response);

        try {
            HttpServletResponse httpServletResponse = (HttpServletResponse) response;
            HttpServletRequest httpServletRequest = (HttpServletRequest) request;

            int statusCode = httpServletResponse.getStatus();
            String uri = httpServletRequest.getRequestURI();
            if (uri.contains("fetchActiveLoaders") ||
                    uri.contains("fetchActiveTestRunsStatus") || uri.contains("metrics") || uri.contains("favicon")) {
                return;
            }
            String method = httpServletRequest.getMethod();

            HttpSession session = httpServletRequest.getSession(false);
            Object userObj = (session == null) ? null : session.getAttribute("user");
            User user = (User) userObj;
            String username = user == null ? "null" : user.getLogin();

            String ip = httpServletRequest.getHeader("X-Forwarded-For");
            if (ip != null) {
                String[] ipList = ip.split(",");
                ip = ipList[ipList.length - 1];
            } else {
                ip = httpServletRequest.getRemoteAddr();
            }

            int endTs = Context.now();
            String result = "url="+uri + ";method="+method + ";statusCode="+statusCode + ";username="+username + ";ip="+ ip + ";totalTime=" + (endTs - startTs) + ";apiCounterVal=" + apiCounter.get();
            logger.info(result);

        } catch (Exception e) {
            logger.error("Error: ", e);
        } finally {
            apiCounter.decrementAndGet();
        }

    }

    @Override
    public void destroy() { }
}
