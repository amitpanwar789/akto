import { BlockStack, Modal, TextField, Button, Text, InlineStack, Collapsible, Badge, Pagination, TextContainer, Icon, Scrollable, Checkbox, Box, Tooltip, Card } from "@shopify/polaris";
import { CheckIcon, XIcon, SearchIcon } from "@shopify/polaris-icons";
import { useState } from "react";
import data from "./dummyData.json"
import "./run_test_suites.css"
import RunTestConfiguration from "./RunTestConfiguration";
import AdvancedSettingsComponent from "./component/AdvancedSettingsComponent";



function RunTestSuites({ testSuiteModal, testSuiteModalToggle, testRun, setTestRun, runTypeOptions, hourlyTimes, testRunTimeOptions, testRolesArr, maxConcurrentRequestsOptions, slackIntegrated, generateLabelForSlackIntegration, dispatchConditions, conditions }) {

    const [byAkto, byAktoToggle] = useState(true);
    const [owaspTop10, owaspTop10Toggle] = useState(true);
    const [compliance, complianceToggle] = useState(true);
    const [custom, customToggle] = useState(true);
    const [openConfigurations, openConfigurationsToggle] = useState(false);
    const [testSuite, setTestSuite] = useState(true);


    return (
        <div className="runTestSuitesModal">
            <Modal
                open={testSuiteModal}
                onClose={() => testSuiteModalToggle(false)}
                title="Configure Test"
                primaryAction={{
                    content: 'Run test',
                }}
                secondaryActions={[
                    {
                        content: `500 tests selected`,
                        disabled: true,
                        plain: true,
                    },
                    {
                        content: 'Cancel',
                        onAction: () => testSuiteModalToggle(false),
                    },

                ]}
                size="large"
                footer={openConfigurations?<Button onClick={() => openConfigurationsToggle(false)} variant="Plain"><Text as="p" fontWeight="regular">Go back to test selection</Text></Button> :<Button onClick={() => openConfigurationsToggle(true)} variant="Plain"><Text as="p" fontWeight="regular">Change Configurations</Text></Button>}
            >
                {!openConfigurations &&
                    <Modal.Section>
                        <BlockStack gap={500}>
                            <InlineStack align="space-between" gap={200}>

                                <div style={{ minWidth: "82%" }}>
                                    <TextField
                                        prefix={<Icon source={SearchIcon} />}
                                        placeholder="Search"
                                    />
                                </div>
                                <InlineStack gap={400}>
                                    <Button
                                        variant="plain"
                                    ><div data-testid="remove_all_tests">Refresh</div></Button>

                                    <Button
                                        variant="plain"
                                        tone="critical"><div data-testid="remove_all_tests">Clear selection</div></Button>

                                </InlineStack>
                            </InlineStack>

                            <BlockStack>
                                <InlineStack align="start">
                                    <div className="testSuiteDisclosureButton" style={{ paddingBottom: "0.5rem" }}>
                                        <Button
                                            onClick={() => byAktoToggle(!byAkto)}
                                            ariaExpanded={open}
                                            ariaControls="basic-collapsible"
                                            variant="plain"
                                            disclosure
                                        >
                                            <Text fontWeight="medium" tone="base" as="h2">
                                                {data.byAkto.name} <span style={{ paddingLeft: "0.5rem" }}> </span>
                                                <Badge>{data.byAkto.plans.length}</Badge>{" "}
                                            </Text>
                                        </Button>
                                    </div>
                                </InlineStack>
                                <Collapsible
                                    open={byAkto}
                                    id="basic-collapsible"
                                    transition={{ duration: "500ms", timingFunction: "ease-in-out" }}
                                    expandOnPrint
                                ><Scrollable horizontal shadow scrollbarWidth="none" >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "flex-start",
                                                alignItems: "center",
                                            }}
                                        >

                                            {data.byAkto.plans.map((key) => (
                                                <AktoTestSuites key={key.name} data={key} />
                                            ))}

                                        </div>
                                    </Scrollable>
                                </Collapsible>
                            </BlockStack>
                            <BlockStack>
                                <InlineStack align="start">
                                    <div className="testSuiteDisclosureButton" style={{ paddingBottom: "0.5rem" }}>
                                        <Button
                                            onClick={() => owaspTop10Toggle(!owaspTop10)}
                                            ariaExpanded={open}
                                            ariaControls="basic-collapsible"
                                            variant="plain"
                                            disclosure
                                        >
                                            <Text fontWeight="medium" tone="base" as="h2">
                                                {data.owaspTop10.name} <span style={{ paddingLeft: "0.5rem" }}> </span>
                                                <Badge>{data.owaspTop10.plans.length}</Badge>{" "}
                                            </Text>
                                        </Button>
                                    </div>
                                </InlineStack>
                                <Collapsible
                                    open={owaspTop10}
                                    id="basic-collapsible"
                                    transition={{ duration: "500ms", timingFunction: "ease-in-out" }}
                                    expandOnPrint
                                ><Scrollable horizontal shadow scrollbarWidth="none" >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "flex-start",
                                                alignItems: "center",
                                            }}
                                        >

                                            {data.owaspTop10.plans.map((key) => (
                                                <AktoTestSuites key={key.name} data={key} />
                                            ))}

                                        </div>
                                    </Scrollable>
                                </Collapsible>
                            </BlockStack>
                            <BlockStack>
                                <InlineStack align="start">
                                    <div className="testSuiteDisclosureButton" style={{ paddingBottom: "0.5rem" }}>
                                        <Button
                                            onClick={() => complianceToggle(!compliance)}
                                            ariaExpanded={open}
                                            ariaControls="basic-collapsible"
                                            variant="plain"
                                            disclosure
                                        >
                                            <Text fontWeight="medium" tone="base" as="h2">
                                                {data.compliance.name} <span style={{ paddingLeft: "0.5rem" }}> </span>
                                                <Badge>{data.compliance.plans.length}</Badge>{" "}
                                            </Text>
                                        </Button>
                                    </div>
                                </InlineStack>
                                <Collapsible
                                    open={compliance}
                                    id="basic-collapsible"
                                    transition={{ duration: "500ms", timingFunction: "ease-in-out" }}
                                    expandOnPrint
                                ><Scrollable horizontal shadow scrollbarWidth="none" >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "flex-start",
                                                alignItems: "center",
                                            }}
                                        >

                                            {data.compliance.plans.map((key) => (
                                                <AktoTestSuites key={key.name} data={key} />
                                            ))}

                                        </div>
                                    </Scrollable>
                                </Collapsible>
                            </BlockStack>
                            <BlockStack>
                                <InlineStack align="start">
                                    <div className="testSuiteDisclosureButton" style={{ paddingBottom: "0.5rem" }}>
                                        <Button
                                            onClick={() => customToggle(!custom)}
                                            ariaExpanded={open}
                                            ariaControls="basic-collapsible"
                                            variant="plain"
                                            disclosure
                                        >
                                            <Text fontWeight="medium" tone="base" as="h2">
                                                {data.custom.name} <span style={{ paddingLeft: "0.5rem" }}> </span>
                                                <Badge>{data.custom.plans.length}</Badge>{" "}
                                            </Text>
                                        </Button>
                                    </div>
                                </InlineStack>
                                <Collapsible
                                    open={custom}
                                    id="basic-collapsible"
                                    transition={{ duration: "500ms", timingFunction: "ease-in-out" }}
                                    expandOnPrint
                                >

                                    <InlineStack gap={400}>

                                        {data.custom.plans.map((key) => (
                                            <CustomTestSuites key={key.name} data={key} />
                                        ))}

                                    </InlineStack>
                                </Collapsible>
                            </BlockStack>
                            <div className="createTestSuiteBox">
                                <Box minHeight="80px" paddingBlockStart={400} paddingBlockEnd={200} paddingInlineStart={400} paddingInlineEnd={400} shadow="200" borderRadius="200" borderEndStartRadius={200} borderEndEndRadius="200" borderInlineStartWidth="0165" borderInlineEndWidth="0165" borderBlockStartWidth="0165" borderColor="border" >
                                    <InlineStack align="space-between" blockAlign="center">
                                        <BlockStack gap={200}>
                                            <Text variant="headingMd" fontWeight="regular">Build Your Ultimate Test Suite</Text>
                                            <p>Create a custom suite of tests that fits your needs perfectly.</p>
                                        </BlockStack>
                                        <Button>
                                            Create Test Suite
                                        </Button>
                                    </InlineStack>
                                </Box>
                            </div>
                        </BlockStack>
                    </Modal.Section>
                }
                {openConfigurations && <Modal.Section>
                    <RunTestConfiguration
                        testRun={testRun}
                        setTestRun={setTestRun}
                        runTypeOptions={runTypeOptions}
                        hourlyTimes={hourlyTimes}
                        testRunTimeOptions={testRunTimeOptions}
                        testRolesArr={testRolesArr}
                        maxConcurrentRequestsOptions={maxConcurrentRequestsOptions}
                        slackIntegrated={slackIntegrated}
                        generateLabelForSlackIntegration={generateLabelForSlackIntegration}
                    />
                    <AdvancedSettingsComponent dispatchConditions={dispatchConditions} conditions={conditions} />
                </Modal.Section>}
            </Modal>
        </div>
    )
}


const AktoTestSuites = ({ data }) => {
    return (
        <div style={{ marginRight: "1rem" }}>
            <Box minWidth="280px" maxWidth="280px" minHeight="152px" borderRadius={200} borderStyle="solid" paddingBlockEnd={400} insetInlineEnd={100}>

                <BlockStack>
                    <div style={{ height: "80px", backgroundColor: "blue", borderTopLeftRadius: "0.5rem", borderTopRightRadius: "0.5rem" }}></div>
                    <Box paddingBlockStart={200} paddingBlockEnd={200} paddingInlineStart={400} paddingInlineEnd={400} shadow="200" borderEndStartRadius={200} borderEndEndRadius="200" borderInlineStartWidth="0165" borderInlineEndWidth="0165" borderColor="border">
                        <div className="testSuiteCard">
                            <Checkbox
                                label={

                                    <Tooltip content={data?.name}>
                                        <Text variant="headingMd" fontWeight="regular" truncate={true}>{data?.name}</Text>
                                    </Tooltip>

                                }
                                helpText={`${data?.testCount} tests`}
                            />
                        </div>
                    </Box>
                </BlockStack>

            </Box>
        </div>
    );
};

const CustomTestSuites = ({ data }) => {
    return (
        <Box minWidth="300px" paddingBlockStart={200} paddingBlockEnd={200} paddingInlineStart={400} paddingInlineEnd={400} shadow="200" borderRadius="200" borderEndStartRadius={200} borderEndEndRadius="200" borderInlineStartWidth="0165" borderInlineEndWidth="0165" borderBlockStartWidth="0165" borderColor="border">
            <div className="testSuiteCard">
                <Checkbox
                    label={

                        <Tooltip content={data?.name}>
                            <Text variant="headingMd" fontWeight="regular" truncate={true}>{data?.name}</Text>
                        </Tooltip>

                    }
                    helpText={`${data?.testCount} tests`}
                />
            </div>
        </Box>
    );
};


export default RunTestSuites