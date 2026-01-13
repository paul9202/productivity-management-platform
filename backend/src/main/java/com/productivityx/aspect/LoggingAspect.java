package com.productivityx.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *)")
    public void controllerMethods() {}

    @Around("controllerMethods()")
    public Object logMethodExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        Object[] args = joinPoint.getArgs();

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        String requestUrl = "UNKNOWN";
        String method = "UNKNOWN";
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            requestUrl = request.getRequestURI();
            method = request.getMethod();
        }

        log.info("API Request: [{}] {} | Class: {} | Method: {} | Args: {}", 
                 method, requestUrl, className, methodName, Arrays.toString(args));

        Object result;
        try {
            result = joinPoint.proceed();
        } catch (Throwable e) {
            log.error("API Exception: {} in {}() - Request: [{}] {} - Error: {}", 
                      className, methodName, method, requestUrl, e.getMessage());
            throw e;
        }

        long executionTime = System.currentTimeMillis() - start;
        log.info("API Response: [{}] {} | Status: Success | Time: {}ms | Return: {}", 
                 method, requestUrl, executionTime, result);
        
        return result;
    }
}
