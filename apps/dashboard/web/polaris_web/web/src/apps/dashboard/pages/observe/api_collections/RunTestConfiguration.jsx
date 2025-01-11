import React from 'react';
import { BlockStack, InlineGrid, Checkbox, TextField, Text } from '@shopify/polaris';
import Dropdown from "../../../components/layouts/Dropdown";

const RunTestConfiguration = ({ testRun, setTestRun, runTypeOptions, hourlyTimes, testRunTimeOptions, testRolesArr, maxConcurrentRequestsOptions, slackIntegrated, generateLabelForSlackIntegration }) => {
    return (
        <BlockStack gap={"400"}>
            <InlineGrid gap={"400"} columns={"3"}>
                <Dropdown
                    label="Run Type"
                    menuItems={runTypeOptions}
                    initial={testRun.runTypeLabel}
                    selected={(runType) => {
                        let recurringDaily = false;
                        let continuousTesting = false;

                        if (runType === 'Continuously') {
                            continuousTesting = true;
                        } else if (runType === 'Daily') {
                            recurringDaily = true;
                        }
                        setTestRun(prev => ({
                            ...prev,
                            recurringDaily,
                            continuousTesting,
                            runTypeLabel: runType.label
                        }));
                    }} />
                <Dropdown
                    label="Select Time:"
                    disabled={testRun.continuousTesting === true}
                    menuItems={hourlyTimes}
                    initial={testRun.hourlyLabel}
                    selected={(hour) => {
                        let startTimestamp;

                        if (hour === "Now") startTimestamp = func.timeNow();
                        else {
                            const dayStart = +func.dayStart(+new Date());
                            startTimestamp = parseInt(dayStart / 1000) + parseInt(hour) * 60 * 60;
                        }

                        const hourlyTime = getLabel(hourlyTimes, hour);
                        setTestRun(prev => ({
                            ...prev,
                            startTimestamp,
                            hourlyLabel: hourlyTime ? hourlyTime.label : ""
                        }));
                    }} />
                <Dropdown
                    label="Test run time:"
                    menuItems={testRunTimeOptions}
                    initial={testRun.testRunTimeLabel}
                    selected={(timeInSeconds) => {
                        let testRunTime;
                        if (timeInSeconds === "Till complete") testRunTime = -1;
                        else testRunTime = timeInSeconds;

                        const testRunTimeOption = getLabel(testRunTimeOptions, timeInSeconds);

                        setTestRun(prev => ({
                            ...prev,
                            testRunTime: testRunTime,
                            testRunTimeLabel: testRunTimeOption.label
                        }));
                    }} />
            </InlineGrid>
            <InlineGrid gap={"400"} columns={"2"}>
                <div style={{ marginTop: '-10px' }}>
                    <Text>Select Test Role</Text>
                    <Dropdown
                        menuItems={testRolesArr}
                        initial={"No test role selected"}
                        selected={(requests) => {
                            let testRole;
                            if (!(requests === "No test role selected")) { testRole = requests; }
                            const testRoleOption = getLabel(testRolesArr, requests);

                            setTestRun(prev => ({
                                ...prev,
                                testRoleId: testRole,
                                testRoleLabel: testRoleOption.label
                            }));
                        }} />
                </div>
                <div style={{ marginTop: '-10px' }}>
                    <Text>Max Concurrent Requests</Text>
                    <Dropdown
                        menuItems={maxConcurrentRequestsOptions}
                        initial={"Default"}
                        selected={(requests) => {
                            let maxConcurrentRequests;
                            if (requests === "Default") maxConcurrentRequests = -1;
                            else maxConcurrentRequests = requests;

                            const maxConcurrentRequestsOption = getLabel(maxConcurrentRequestsOptions, requests);

                            setTestRun(prev => ({
                                ...prev,
                                maxConcurrentRequests: maxConcurrentRequests,
                                maxConcurrentRequestsLabel: maxConcurrentRequestsOption.label
                            }));
                        }} />
                </div>
            </InlineGrid>
            <Checkbox
                label={slackIntegrated ? "Send slack alert post test completion" : generateLabelForSlackIntegration()}
                checked={testRun.sendSlackAlert}
                onChange={() => setTestRun(prev => ({ ...prev, sendSlackAlert: !prev.sendSlackAlert }))}
                disabled={!slackIntegrated}
            />
            <InlineGrid columns={2}>
                <Checkbox
                    label="Use different target for testing"
                    checked={testRun.hasOverriddenTestAppUrl}
                    onChange={() => setTestRun(prev => ({ ...prev, hasOverriddenTestAppUrl: !prev.hasOverriddenTestAppUrl }))}
                />
                {testRun.hasOverriddenTestAppUrl &&
                    <div style={{ width: '400px' }}>
                        <TextField
                            placeholder="Override test app host"
                            value={testRun.overriddenTestAppUrl}
                            onChange={(overriddenTestAppUrl) => setTestRun(prev => ({ ...prev, overriddenTestAppUrl: overriddenTestAppUrl }))}
                        />
                    </div>
                }
            </InlineGrid>
        </BlockStack>
    );
};

export default RunTestConfiguration;