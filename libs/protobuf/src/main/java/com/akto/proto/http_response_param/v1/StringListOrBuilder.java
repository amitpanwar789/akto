// Generated by the protocol buffer compiler.  DO NOT EDIT!
// NO CHECKED-IN PROTOBUF GENCODE
// source: threat_detection/message/http_response_param/v1/http_response_param.proto
// Protobuf Java Version: 4.29.2

package com.akto.proto.http_response_param.v1;

public interface StringListOrBuilder
    extends
    // @@protoc_insertion_point(interface_extends:threat_detection.message.http_response_param.v1.StringList)
    com.google.protobuf.MessageOrBuilder {

  /**
   * <code>repeated string values = 1 [json_name = "values"];</code>
   *
   * @return A list containing the values.
   */
  java.util.List<java.lang.String> getValuesList();

  /**
   * <code>repeated string values = 1 [json_name = "values"];</code>
   *
   * @return The count of values.
   */
  int getValuesCount();

  /**
   * <code>repeated string values = 1 [json_name = "values"];</code>
   *
   * @param index The index of the element to return.
   * @return The values at the given index.
   */
  java.lang.String getValues(int index);

  /**
   * <code>repeated string values = 1 [json_name = "values"];</code>
   *
   * @param index The index of the value to return.
   * @return The bytes of the values at the given index.
   */
  com.google.protobuf.ByteString getValuesBytes(int index);
}
