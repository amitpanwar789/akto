package com.akto.dto;


import com.akto.dao.context.Context;

import java.util.*;

public class HttpResponseParams {

    public enum Source {
        HAR, PCAP, MIRRORING, SDK, OTHER, POSTMAN, OPEN_API, BURP
    }

    public String accountId;
    public String type; // HTTP/1.1
    public int statusCode; // 200
    public String status; // OK
    public Map<String, List<String>> headers = new HashMap<>();
    private String payload;
    private int time;
    public HttpRequestParams requestParams;
    boolean isPending;
    Source source = Source.OTHER;
    String orig;
    String sourceIP;
    String destIP;
    String direction;

    public HttpResponseParams() {}

    public HttpResponseParams(String type, int statusCode, String status, Map<String, List<String>> headers, String payload,
                              HttpRequestParams requestParams, int time, String accountId, boolean isPending, Source source, 
                              String orig, String sourceIP) {
        this(type, statusCode, status, headers, payload, requestParams, time, accountId, isPending, source, orig,
                sourceIP, "", "");
    }

    public HttpResponseParams(String type, int statusCode, String status, Map<String, List<String>> headers, String payload,
                              HttpRequestParams requestParams, int time, String accountId, boolean isPending, Source source,
                              String orig, String sourceIP, String destIP, String direction) {
        this.type = type;
        this.statusCode = statusCode;
        this.status = status;
        this.headers = headers;
        this.payload = payload;
        this.requestParams = requestParams;
        this.time = time;
        this.accountId = accountId;
        this.isPending = isPending;
        this.source = source;
        this.orig = orig;
        this.sourceIP = sourceIP;
        this.destIP = destIP;
        this.direction = direction;
    }

    public static boolean validHttpResponseCode(int statusCode)  {
        return statusCode >= 200 && (statusCode < 300 || statusCode == 302);
    }

    public HttpResponseParams copy() {
        return new HttpResponseParams(
                this.type,
                this.statusCode,
                this.status,
                new HashMap<>(this.headers),
                this.payload,
                this.requestParams.copy(),
                this.time,
                this.accountId,
                this.isPending,
                this.source,
                this.orig,
                this.sourceIP
        );
    }

    private static final Set<String> allowedPath = new HashSet<>();

    static {
        allowedPath.add("graphql");
        allowedPath.add("graph");
    }
    public static final String QUERY = "query";


    public static boolean isGraphql(HttpResponseParams responseParams) {
        boolean isAllowedForParse = false;
        String path = responseParams.getRequestParams().getURL();
        String requestPayload = responseParams.getRequestParams().getPayload();

        for (String graphqlPath : allowedPath) {
            if (path != null && path.contains(graphqlPath)) {
                isAllowedForParse = true;
                break;
            }
        }
        return isAllowedForParse && requestPayload.contains(QUERY);
    }

    public static boolean isGraphQLEndpoint(String url) {
        for (String keyword : allowedPath) {
            if (url.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    public int getTimeOrNow() {
        return getTime() == 0 ? Context.now() : getTime();
    }


    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public HttpRequestParams getRequestParams() {
        return this.requestParams;
    }

    public int getStatusCode() {
        return this.statusCode;
    }

    public Map<String, List<String>> getHeaders() {
        return this.headers;
    }

    public int getTime() {
        return time;
    }

    public String getAccountId() {
        return accountId;
    }

    public boolean getIsPending() {
        return this.isPending;
    }

    public void setIsPending(boolean isPending) {
        this.isPending = isPending;
    }

    public Source getSource() {
        return this.source;
    }

    public void setSource(Source source) {
        this.source = source;
    }

    public String getOrig() {
        return this.orig;
    }

    public void setOrig(String orig) {
        this.orig = orig;
    }

    public String getSourceIP() {
        return this.sourceIP;
    }

    public void setSourceIP(String sourceIP) {
        this.sourceIP = sourceIP;
    }

    public String getDestIP() {
        return destIP;
    }

    public void setDestIP(String destIP) {
        this.destIP = destIP;
    }

    public String getDirection() {
        return direction;
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }

    public void setRequestParams(HttpRequestParams requestParams) {
        this.requestParams = requestParams;
    }
}
