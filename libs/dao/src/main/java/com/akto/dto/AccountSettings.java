package com.akto.dto;

import java.util.List;

public class AccountSettings {
    private int id;
    public static final String PRIVATE_CIDR_LIST = "privateCidrList";
    private List<String> privateCidrList;
    public static final String REDACT_PAYLOAD = "redactPayload";
    private boolean redactPayload;
    public static final String SAMPLE_DATA_COLLECTION_DROPPED = "sampleDataCollectionDropped";
    private boolean sampleDataCollectionDropped;
    public static final String DASHBOARD_VERSION = "dashboardVersion";
    private String dashboardVersion;
    public static final String API_RUNTIME_VERSION = "apiRuntimeVersion";
    private String apiRuntimeVersion;

    public AccountSettings() {
    }

    public AccountSettings(int id, List<String> privateCidrList, Boolean redactPayload) {
        this.id = id;
        this.privateCidrList = privateCidrList;
        this.redactPayload = redactPayload;
    }


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public List<String> getPrivateCidrList() {
        return privateCidrList;
    }

    public void setPrivateCidrList(List<String> privateCidrList) {
        this.privateCidrList = privateCidrList;
    }

    public boolean isRedactPayload() {
        return redactPayload;
    }

    public boolean getRedactPayload() {
        return redactPayload;
    }

    public void setRedactPayload(boolean redactPayload) {
        this.redactPayload = redactPayload;
    }

    public boolean isSampleDataCollectionDropped() {
        return sampleDataCollectionDropped;
    }

    public void setSampleDataCollectionDropped(boolean sampleDataCollectionDropped) {
        this.sampleDataCollectionDropped = sampleDataCollectionDropped;
    }

    public String getDashboardVersion() {
        return dashboardVersion;
    }

    public void setDashboardVersion(String dashboardVersion) {
        this.dashboardVersion = dashboardVersion;
    }

    public String getApiRuntimeVersion() {
        return apiRuntimeVersion;
    }

    public void setApiRuntimeVersion(String apiRuntimeVersion) {
        this.apiRuntimeVersion = apiRuntimeVersion;
    }
}
