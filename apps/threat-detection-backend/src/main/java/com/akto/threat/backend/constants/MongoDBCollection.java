package com.akto.threat.backend.constants;

public class MongoDBCollection {
  public static class ThreatDetection {
    public static final String MALICIOUS_EVENTS = "malicious_events";
    public static final String AGGREGATE_SAMPLE_MALICIOUS_REQUESTS =
        "aggregate_sample_malicious_requests";
    public static final String SPLUNK_INTEGRATION_CONFIG =
        "splunk_integration_config";
  }
}
