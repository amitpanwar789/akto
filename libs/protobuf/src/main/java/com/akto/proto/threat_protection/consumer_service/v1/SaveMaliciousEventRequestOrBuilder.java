// Generated by the protocol buffer compiler.  DO NOT EDIT!
// NO CHECKED-IN PROTOBUF GENCODE
// source: threat_protection/consumer_service/v1/consumer_service.proto
// Protobuf Java Version: 4.28.3

package com.akto.proto.threat_protection.consumer_service.v1;

public interface SaveMaliciousEventRequestOrBuilder extends
    // @@protoc_insertion_point(interface_extends:threat_protection.consumer_service.v1.SaveMaliciousEventRequest)
    com.google.protobuf.MessageOrBuilder {

  /**
   * <code>int32 account_id = 1 [json_name = "accountId"];</code>
   * @return The accountId.
   */
  int getAccountId();

  /**
   * <code>repeated .threat_protection.consumer_service.v1.MaliciousEvent events = 2 [json_name = "events"];</code>
   */
  java.util.List<com.akto.proto.threat_protection.consumer_service.v1.MaliciousEvent> 
      getEventsList();
  /**
   * <code>repeated .threat_protection.consumer_service.v1.MaliciousEvent events = 2 [json_name = "events"];</code>
   */
  com.akto.proto.threat_protection.consumer_service.v1.MaliciousEvent getEvents(int index);
  /**
   * <code>repeated .threat_protection.consumer_service.v1.MaliciousEvent events = 2 [json_name = "events"];</code>
   */
  int getEventsCount();
  /**
   * <code>repeated .threat_protection.consumer_service.v1.MaliciousEvent events = 2 [json_name = "events"];</code>
   */
  java.util.List<? extends com.akto.proto.threat_protection.consumer_service.v1.MaliciousEventOrBuilder> 
      getEventsOrBuilderList();
  /**
   * <code>repeated .threat_protection.consumer_service.v1.MaliciousEvent events = 2 [json_name = "events"];</code>
   */
  com.akto.proto.threat_protection.consumer_service.v1.MaliciousEventOrBuilder getEventsOrBuilder(
      int index);
}
