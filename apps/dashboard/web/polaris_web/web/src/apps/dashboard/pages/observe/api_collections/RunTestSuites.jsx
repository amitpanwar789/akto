import { VerticalStack, Modal, TextField, Button, Text, HorizontalStack, Collapsible, Badge, Pagination, TextContainer, Icon, Scrollable, Checkbox, Box, Tooltip, Card, MediaCard } from "@shopify/polaris";
import { TickMinor, CancelMajor, SearchMinor } from "@shopify/polaris-icons";
import { useEffect, useRef, useState } from "react";
import "./run_test_suites.css"
import RunTestConfiguration from "./RunTestConfiguration";
import AdvancedSettingsComponent from "./component/AdvancedSettingsComponent";



function RunTestSuites({ testSuiteModal, testSuiteModalToggle, parentTestRun, setParentTestRun, runTypeOptions, hourlyTimes, testRunTimeOptions, testRolesArr, maxConcurrentRequestsOptions, slackIntegrated, generateLabelForSlackIntegration, dispatchConditions, conditions, handleRun, convertToLowerCaseWithUnderscores, apiCollectionName, testIdConfig,initialState,setTestMode, testMode }) {

    const [owaspTop10, owaspTop10Toggle] = useState(true);
    const [openConfigurations, openConfigurationsToggle] = useState(false);
    const [selectedTestSuites, setSelectedTestSuites] = useState([]);
    const [testRun, setTestRun] = useState({...initialState});
    const [testNames, setTestNames] = useState("");
    const [searchValue, setSearchValue] = useState("");

    const owaspTop10List = {
        "Broken Object Level Authorization": ["BOLA"],
        "Broken Authentication": ["NO_AUTH"],
        "Broken Object Property Level Authorization": ["EDE", "MA"],
        "Unrestricted Resource Consumption": ["RL"],
        "Broken Function Level Authorization": ["BFLA"],
        "Unrestricted Access to Sensitive Business Flows": ["INPUT"],
        "Server Side Request Forgery": ['SSRF'],
        "Security Misconfiguration": ["SM", "UHM", "VEM", "MHH", "SVD", "CORS", "ILM"],
        "Improper Inventory Management": ["IAM", "IIM"],
        "Unsafe Consumption of APIs": ["COMMAND_INJECTION", "INJ", "CRLF", "SSTI", "LFI", "XSS", "INJECT"]
    }


    useEffect(() => {

        if (testIdConfig?.testingRunConfig?.testSubCategoryList?.length > 0) {
            const testSubCategoryList = [...testIdConfig.testingRunConfig.testSubCategoryList];

            const updatedTests = { ...parentTestRun.tests };

            // Reset all test selections
            Object.keys(updatedTests).forEach(category => {
                updatedTests[category] = updatedTests[category].map(test => ({ ...test, selected: false }));
            });

            const testSubCategorySet = new Set(testSubCategoryList);

            Object.keys(updatedTests).forEach(category => {
                updatedTests[category] = updatedTests[category].map(test => ({
                    ...test,
                    selected: testSubCategorySet.has(test.value),
                }));
            });

            // Efficient deep equality check 
            function areObjectArraysEqual(obj1, obj2) {
                const keys1 = Object.keys(obj1);
                const keys2 = Object.keys(obj2);

                if (keys1.length !== keys2.length) return false;

                const setKeys1 = new Set(keys1);
                const setKeys2 = new Set(keys2);
                if (setKeys1.size !== setKeys2.size || [...setKeys1].some(key => !setKeys2.has(key))) {
                    return false;
                }

                for (let key of keys1) {
                    const arr1 = obj1[key].map(obj => JSON.stringify(obj)).sort(); 
                    const arr2 = obj2[key].map(obj => JSON.stringify(obj)).sort(); 

                    if (arr1.length !== arr2.length || arr1.some((item, index) => item !== arr2[index])) {
                        return false;
                    }
                }

                return true;
            }


            // Update state only if there is a change
            if (!areObjectArraysEqual(updatedTests, parentTestRun.tests)) {
                setTestRun(prev => ({
                    ...parentTestRun,
                    tests: updatedTests,
                    testName:testIdConfig.name
                }));
                setTestNames(testIdConfig.name)
            }
        }
        else {
            setTestRun(prev => {
                return {
                    ...parentTestRun
                }
            });
        }
        const updatedName = parentTestRun.testName;
        setSelectedTestSuites(prev=>{
            const updatedSelectedTestSuites = [];
            Object.keys(owaspTop10List).forEach(key => {
                if(updatedName.includes(key.replace(/\s+/g, '_'))){
                    updatedSelectedTestSuites.push(key.replace(/\s+/g, '_'));
                }
            })
            return updatedSelectedTestSuites;
        });
    }, [parentTestRun]);


    function handleTestSuiteRun(){
        setParentTestRun(prev => {
            const updatedState = { ...testRun };
            handleRun(updatedState); 
            return updatedState;
        });
    }


    function handleTestSuiteSelection(key, data) {
        let updatedSelectedTestSuites;
        if (!selectedTestSuites.includes(key.replace(/\s+/g, '_'))) {
            updatedSelectedTestSuites = [...selectedTestSuites, key.replace(/\s+/g, '_')];
        } else {
            updatedSelectedTestSuites = selectedTestSuites.filter(item => item !== key.replace(/\s+/g, '_'));
        }

        setSelectedTestSuites(updatedSelectedTestSuites);

        setTestRun(prev => {
            const updatedTests = { ...prev.tests };
            data.forEach(category => {
                if (updatedTests[category]) {
                    updatedTests[category] = updatedTests[category].map(test => ({
                        ...test,
                        selected: !test.selected
                    }));
                }
            });
            return {
                ...prev,
                tests: updatedTests,
                testName: convertToLowerCaseWithUnderscores(apiCollectionName) + "_" + updatedSelectedTestSuites.join("_")
            };
        });
    }

    function handleRemoveAll() {
        setTestRun(prev => {
            const tests = { ...testRun.tests }
            Object.keys(tests).forEach(category => {
                tests[category] = tests[category].map(test => ({ ...test, selected: false }))
            })

            return { ...prev, tests: tests}
        })
        func.setToast(true, false, "All tests unselected")
    }

    function countTestSuitesTests(data) {
        let count = 0;
        const test = { ...testRun.tests };
        data.forEach(category => {
            if (test[category]) {
                count += test[category].length;
            }
        });
        return count;
    }

    function countAllSelectedTests() {
        let count = 0;
        const test = { ...testRun.tests };
        Object.keys(test).forEach(category => {
            count += test[category].filter(test => test.selected).length;
        });
        return count;
    }


    function checkedSelected(data) {
        let hasNonEmptyCategory = false;

        for (const category of data) {
            if (testRun.tests[category] && testRun.tests[category].length > 0) {
                hasNonEmptyCategory = true;
                if (!testRun.tests[category].every(test => test.selected)) {
                    return false;
                }
            }
        }

        return hasNonEmptyCategory;
    }

    function checkDisableTestSuite(data) {
        for (const category of data) {
            if (testRun.tests[category] && testRun.tests[category].length > 0) {
                return false;
            }
        }
        return true;
    }

    function renderAktoTestSuites(data) {
        return (
            <div className="testSuiteCard" style={{ marginRight: "1rem", marginLeft: "0.1rem" }}>
                <Box minWidth="280px" maxWidth="280px" minHeight="152px" borderRadius={2} borderStyle="solid" paddingBlockEnd={4} insetInlineEnd={1}>
                    <VerticalStack>
                        <div style={{ height: "80px", backgroundColor: "#ECEBFF", borderTopLeftRadius: "0.5rem", borderTopRightRadius: "0.5rem" }}><svg width="280" height="80" viewBox="0 0 280 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="-24" y="20" width="40" height="40" rx="4" fill="#B6B0FE" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M-5.96267 32H-2.03733C-0.941333 32 -0.0786667 32 0.616 32.0573C1.32267 32.1147 1.91467 32.2347 2.452 32.508C3.3304 32.9555 4.04454 33.6696 4.492 34.548C4.76533 35.0853 4.88533 35.6773 4.94267 36.3853C5 37.0787 5 37.9427 5 39.0373V40.296C5 41.392 5 42.2547 4.94267 42.9493C4.88533 43.656 4.76533 44.248 4.492 44.7853C4.04454 45.6637 3.3304 46.3779 2.452 46.8253C1.91467 47.0987 1.32267 47.2187 0.614668 47.276C-0.0786657 47.3333 -0.942666 47.3333 -2.03733 47.3333H-5.96267C-7.05733 47.3333 -7.92 47.3333 -8.616 47.276C-9.32267 47.2187 -9.91467 47.0987 -10.452 46.824C-11.3302 46.3769 -12.0443 45.6632 -12.492 44.7853C-12.7653 44.248 -12.8853 43.656 -12.9427 42.948C-13 42.2547 -13 41.3907 -13 40.296V39.0373C-13 37.9427 -13 37.08 -12.9427 36.384C-12.8853 35.6773 -12.7653 35.0853 -12.492 34.548C-12.0445 33.6696 -11.3304 32.9555 -10.452 32.508C-9.91467 32.2347 -9.32267 32.1147 -8.61467 32.0573C-7.92133 32 -7.05733 32 -5.96267 32ZM-0.5 45.6587C-1.77969 44.3402 -3.49045 43.5254 -5.32058 43.3627C-7.15071 43.1999 -8.9784 43.7001 -10.4707 44.772C-10.2453 45 -9.984 45.192 -9.69467 45.34C-9.432 45.4733 -9.084 45.5667 -8.47867 45.616C-7.86267 45.6653 -7.06933 45.6667 -5.93333 45.6667H-2.06667C-1.45333 45.6667 -0.94 45.6667 -0.5 45.6587ZM-6 40.3333C-5.29276 40.3333 -4.61448 40.0524 -4.11438 39.5523C-3.61429 39.0522 -3.33333 38.3739 -3.33333 37.6667C-3.33333 36.9594 -3.61429 36.2811 -4.11438 35.781C-4.61448 35.281 -5.29276 35 -6 35C-6.70724 35 -7.38552 35.281 -7.88562 35.781C-8.38572 36.2811 -8.66667 36.9594 -8.66667 37.6667C-8.66667 38.3739 -8.38572 39.0522 -7.88562 39.5523C-7.38552 40.0524 -6.70724 40.3333 -6 40.3333ZM-1.66667 38C-1.66667 37.7348 -1.56131 37.4804 -1.37377 37.2929C-1.18624 37.1054 -0.931883 37 -0.666666 37H1C1.26522 37 1.51957 37.1054 1.70711 37.2929C1.89464 37.4804 2 37.7348 2 38C2 38.2652 1.89464 38.5196 1.70711 38.7071C1.51957 38.8946 1.26522 39 1 39H-0.666666C-0.931883 39 -1.18624 38.8946 -1.37377 38.7071C-1.56131 38.5196 -1.66667 38.2652 -1.66667 38ZM-1.66667 41C-1.66667 40.7348 -1.56131 40.4804 -1.37377 40.2929C-1.18624 40.1054 -0.931883 40 -0.666666 40H1C1.26522 40 1.51957 40.1054 1.70711 40.2929C1.89464 40.4804 2 40.7348 2 41C2 41.2652 1.89464 41.5196 1.70711 41.7071C1.51957 41.8946 1.26522 42 1 42H-0.666666C-0.931883 42 -1.18624 41.8946 -1.37377 41.7071C-1.56131 41.5196 -1.66667 41.2652 -1.66667 41Z" fill="white" />
                            <rect x="24" y="20" width="40" height="40" rx="4" fill="#B6B0FE" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M42.0373 32H45.9627C47.0587 32 47.9213 32 48.616 32.0573C49.3227 32.1147 49.9147 32.2347 50.452 32.508C51.3304 32.9555 52.0445 33.6696 52.492 34.548C52.7653 35.0853 52.8853 35.6773 52.9427 36.3853C53 37.0787 53 37.9427 53 39.0373V40.296C53 41.392 53 42.2547 52.9427 42.9493C52.8853 43.656 52.7653 44.248 52.492 44.7853C52.0445 45.6637 51.3304 46.3779 50.452 46.8253C49.9147 47.0987 49.3227 47.2187 48.6147 47.276C47.9213 47.3333 47.0573 47.3333 45.9627 47.3333H42.0373C40.9427 47.3333 40.08 47.3333 39.384 47.276C38.6773 47.2187 38.0853 47.0987 37.548 46.824C36.6698 46.3769 35.9557 45.6632 35.508 44.7853C35.2347 44.248 35.1147 43.656 35.0573 42.948C35 42.2547 35 41.3907 35 40.296V39.0373C35 37.9427 35 37.08 35.0573 36.384C35.1147 35.6773 35.2347 35.0853 35.508 34.548C35.9555 33.6696 36.6696 32.9555 37.548 32.508C38.0853 32.2347 38.6773 32.1147 39.3853 32.0573C40.0787 32 40.9427 32 42.0373 32ZM47.5 45.6587C46.2203 44.3402 44.5095 43.5254 42.6794 43.3627C40.8493 43.1999 39.0216 43.7001 37.5293 44.772C37.7547 45 38.016 45.192 38.3053 45.34C38.568 45.4733 38.916 45.5667 39.5213 45.616C40.1373 45.6653 40.9307 45.6667 42.0667 45.6667H45.9333C46.5467 45.6667 47.06 45.6667 47.5 45.6587ZM42 40.3333C42.7072 40.3333 43.3855 40.0524 43.8856 39.5523C44.3857 39.0522 44.6667 38.3739 44.6667 37.6667C44.6667 36.9594 44.3857 36.2811 43.8856 35.781C43.3855 35.281 42.7072 35 42 35C41.2928 35 40.6145 35.281 40.1144 35.781C39.6143 36.2811 39.3333 36.9594 39.3333 37.6667C39.3333 38.3739 39.6143 39.0522 40.1144 39.5523C40.6145 40.0524 41.2928 40.3333 42 40.3333ZM46.3333 38C46.3333 37.7348 46.4387 37.4804 46.6262 37.2929C46.8138 37.1054 47.0681 37 47.3333 37H49C49.2652 37 49.5196 37.1054 49.7071 37.2929C49.8946 37.4804 50 37.7348 50 38C50 38.2652 49.8946 38.5196 49.7071 38.7071C49.5196 38.8946 49.2652 39 49 39H47.3333C47.0681 39 46.8138 38.8946 46.6262 38.7071C46.4387 38.5196 46.3333 38.2652 46.3333 38ZM46.3333 41C46.3333 40.7348 46.4387 40.4804 46.6262 40.2929C46.8138 40.1054 47.0681 40 47.3333 40H49C49.2652 40 49.5196 40.1054 49.7071 40.2929C49.8946 40.4804 50 40.7348 50 41C50 41.2652 49.8946 41.5196 49.7071 41.7071C49.5196 41.8946 49.2652 42 49 42H47.3333C47.0681 42 46.8138 41.8946 46.6262 41.7071C46.4387 41.5196 46.3333 41.2652 46.3333 41Z" fill="white" />
                            <rect x="72" y="20" width="40" height="40" rx="4" fill="#B6B0FE" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M90.0373 32H93.9627C95.0587 32 95.9213 32 96.616 32.0573C97.3227 32.1147 97.9147 32.2347 98.452 32.508C99.3304 32.9555 100.045 33.6696 100.492 34.548C100.765 35.0853 100.885 35.6773 100.943 36.3853C101 37.0787 101 37.9427 101 39.0373V40.296C101 41.392 101 42.2547 100.943 42.9493C100.885 43.656 100.765 44.248 100.492 44.7853C100.045 45.6637 99.3304 46.3779 98.452 46.8253C97.9147 47.0987 97.3227 47.2187 96.6147 47.276C95.9213 47.3333 95.0573 47.3333 93.9627 47.3333H90.0373C88.9427 47.3333 88.08 47.3333 87.384 47.276C86.6773 47.2187 86.0853 47.0987 85.548 46.824C84.6698 46.3769 83.9557 45.6632 83.508 44.7853C83.2347 44.248 83.1147 43.656 83.0573 42.948C83 42.2547 83 41.3907 83 40.296V39.0373C83 37.9427 83 37.08 83.0573 36.384C83.1147 35.6773 83.2347 35.0853 83.508 34.548C83.9555 33.6696 84.6696 32.9555 85.548 32.508C86.0853 32.2347 86.6773 32.1147 87.3853 32.0573C88.0787 32 88.9427 32 90.0373 32ZM95.5 45.6587C94.2203 44.3402 92.5095 43.5254 90.6794 43.3627C88.8493 43.1999 87.0216 43.7001 85.5293 44.772C85.7547 45 86.016 45.192 86.3053 45.34C86.568 45.4733 86.916 45.5667 87.5213 45.616C88.1373 45.6653 88.9307 45.6667 90.0667 45.6667H93.9333C94.5467 45.6667 95.06 45.6667 95.5 45.6587ZM90 40.3333C90.7072 40.3333 91.3855 40.0524 91.8856 39.5523C92.3857 39.0522 92.6667 38.3739 92.6667 37.6667C92.6667 36.9594 92.3857 36.2811 91.8856 35.781C91.3855 35.281 90.7072 35 90 35C89.2928 35 88.6145 35.281 88.1144 35.781C87.6143 36.2811 87.3333 36.9594 87.3333 37.6667C87.3333 38.3739 87.6143 39.0522 88.1144 39.5523C88.6145 40.0524 89.2928 40.3333 90 40.3333ZM94.3333 38C94.3333 37.7348 94.4387 37.4804 94.6262 37.2929C94.8138 37.1054 95.0681 37 95.3333 37H97C97.2652 37 97.5196 37.1054 97.7071 37.2929C97.8946 37.4804 98 37.7348 98 38C98 38.2652 97.8946 38.5196 97.7071 38.7071C97.5196 38.8946 97.2652 39 97 39H95.3333C95.0681 39 94.8138 38.8946 94.6262 38.7071C94.4387 38.5196 94.3333 38.2652 94.3333 38ZM94.3333 41C94.3333 40.7348 94.4387 40.4804 94.6262 40.2929C94.8138 40.1054 95.0681 40 95.3333 40H97C97.2652 40 97.5196 40.1054 97.7071 40.2929C97.8946 40.4804 98 40.7348 98 41C98 41.2652 97.8946 41.5196 97.7071 41.7071C97.5196 41.8946 97.2652 42 97 42H95.3333C95.0681 42 94.8138 41.8946 94.6262 41.7071C94.4387 41.5196 94.3333 41.2652 94.3333 41Z" fill="white" />
                            <rect x="120" y="20" width="40" height="40" rx="4" fill="#B6B0FE" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M138.037 32H141.963C143.059 32 143.921 32 144.616 32.0573C145.323 32.1147 145.915 32.2347 146.452 32.508C147.33 32.9555 148.045 33.6696 148.492 34.548C148.765 35.0853 148.885 35.6773 148.943 36.3853C149 37.0787 149 37.9427 149 39.0373V40.296C149 41.392 149 42.2547 148.943 42.9493C148.885 43.656 148.765 44.248 148.492 44.7853C148.045 45.6637 147.33 46.3779 146.452 46.8253C145.915 47.0987 145.323 47.2187 144.615 47.276C143.921 47.3333 143.057 47.3333 141.963 47.3333H138.037C136.943 47.3333 136.08 47.3333 135.384 47.276C134.677 47.2187 134.085 47.0987 133.548 46.824C132.67 46.3769 131.956 45.6632 131.508 44.7853C131.235 44.248 131.115 43.656 131.057 42.948C131 42.2547 131 41.3907 131 40.296V39.0373C131 37.9427 131 37.08 131.057 36.384C131.115 35.6773 131.235 35.0853 131.508 34.548C131.955 33.6696 132.67 32.9555 133.548 32.508C134.085 32.2347 134.677 32.1147 135.385 32.0573C136.079 32 136.943 32 138.037 32ZM143.5 45.6587C142.22 44.3402 140.51 43.5254 138.679 43.3627C136.849 43.1999 135.022 43.7001 133.529 44.772C133.755 45 134.016 45.192 134.305 45.34C134.568 45.4733 134.916 45.5667 135.521 45.616C136.137 45.6653 136.931 45.6667 138.067 45.6667H141.933C142.547 45.6667 143.06 45.6667 143.5 45.6587ZM138 40.3333C138.707 40.3333 139.386 40.0524 139.886 39.5523C140.386 39.0522 140.667 38.3739 140.667 37.6667C140.667 36.9594 140.386 36.2811 139.886 35.781C139.386 35.281 138.707 35 138 35C137.293 35 136.614 35.281 136.114 35.781C135.614 36.2811 135.333 36.9594 135.333 37.6667C135.333 38.3739 135.614 39.0522 136.114 39.5523C136.614 40.0524 137.293 40.3333 138 40.3333ZM142.333 38C142.333 37.7348 142.439 37.4804 142.626 37.2929C142.814 37.1054 143.068 37 143.333 37H145C145.265 37 145.52 37.1054 145.707 37.2929C145.895 37.4804 146 37.7348 146 38C146 38.2652 145.895 38.5196 145.707 38.7071C145.52 38.8946 145.265 39 145 39H143.333C143.068 39 142.814 38.8946 142.626 38.7071C142.439 38.5196 142.333 38.2652 142.333 38ZM142.333 41C142.333 40.7348 142.439 40.4804 142.626 40.2929C142.814 40.1054 143.068 40 143.333 40H145C145.265 40 145.52 40.1054 145.707 40.2929C145.895 40.4804 146 40.7348 146 41C146 41.2652 145.895 41.5196 145.707 41.7071C145.52 41.8946 145.265 42 145 42H143.333C143.068 42 142.814 41.8946 142.626 41.7071C142.439 41.5196 142.333 41.2652 142.333 41Z" fill="white" />
                            <rect x="168" y="20" width="40" height="40" rx="4" fill="#B6B0FE" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M186.037 32H189.963C191.059 32 191.921 32 192.616 32.0573C193.323 32.1147 193.915 32.2347 194.452 32.508C195.33 32.9555 196.045 33.6696 196.492 34.548C196.765 35.0853 196.885 35.6773 196.943 36.3853C197 37.0787 197 37.9427 197 39.0373V40.296C197 41.392 197 42.2547 196.943 42.9493C196.885 43.656 196.765 44.248 196.492 44.7853C196.045 45.6637 195.33 46.3779 194.452 46.8253C193.915 47.0987 193.323 47.2187 192.615 47.276C191.921 47.3333 191.057 47.3333 189.963 47.3333H186.037C184.943 47.3333 184.08 47.3333 183.384 47.276C182.677 47.2187 182.085 47.0987 181.548 46.824C180.67 46.3769 179.956 45.6632 179.508 44.7853C179.235 44.248 179.115 43.656 179.057 42.948C179 42.2547 179 41.3907 179 40.296V39.0373C179 37.9427 179 37.08 179.057 36.384C179.115 35.6773 179.235 35.0853 179.508 34.548C179.955 33.6696 180.67 32.9555 181.548 32.508C182.085 32.2347 182.677 32.1147 183.385 32.0573C184.079 32 184.943 32 186.037 32ZM191.5 45.6587C190.22 44.3402 188.51 43.5254 186.679 43.3627C184.849 43.1999 183.022 43.7001 181.529 44.772C181.755 45 182.016 45.192 182.305 45.34C182.568 45.4733 182.916 45.5667 183.521 45.616C184.137 45.6653 184.931 45.6667 186.067 45.6667H189.933C190.547 45.6667 191.06 45.6667 191.5 45.6587ZM186 40.3333C186.707 40.3333 187.386 40.0524 187.886 39.5523C188.386 39.0522 188.667 38.3739 188.667 37.6667C188.667 36.9594 188.386 36.2811 187.886 35.781C187.386 35.281 186.707 35 186 35C185.293 35 184.614 35.281 184.114 35.781C183.614 36.2811 183.333 36.9594 183.333 37.6667C183.333 38.3739 183.614 39.0522 184.114 39.5523C184.614 40.0524 185.293 40.3333 186 40.3333ZM190.333 38C190.333 37.7348 190.439 37.4804 190.626 37.2929C190.814 37.1054 191.068 37 191.333 37H193C193.265 37 193.52 37.1054 193.707 37.2929C193.895 37.4804 194 37.7348 194 38C194 38.2652 193.895 38.5196 193.707 38.7071C193.52 38.8946 193.265 39 193 39H191.333C191.068 39 190.814 38.8946 190.626 38.7071C190.439 38.5196 190.333 38.2652 190.333 38ZM190.333 41C190.333 40.7348 190.439 40.4804 190.626 40.2929C190.814 40.1054 191.068 40 191.333 40H193C193.265 40 193.52 40.1054 193.707 40.2929C193.895 40.4804 194 40.7348 194 41C194 41.2652 193.895 41.5196 193.707 41.7071C193.52 41.8946 193.265 42 193 42H191.333C191.068 42 190.814 41.8946 190.626 41.7071C190.439 41.5196 190.333 41.2652 190.333 41Z" fill="white" />
                            <rect x="216" y="20" width="40" height="40" rx="4" fill="#B6B0FE" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M234.037 32H237.963C239.059 32 239.921 32 240.616 32.0573C241.323 32.1147 241.915 32.2347 242.452 32.508C243.33 32.9555 244.045 33.6696 244.492 34.548C244.765 35.0853 244.885 35.6773 244.943 36.3853C245 37.0787 245 37.9427 245 39.0373V40.296C245 41.392 245 42.2547 244.943 42.9493C244.885 43.656 244.765 44.248 244.492 44.7853C244.045 45.6637 243.33 46.3779 242.452 46.8253C241.915 47.0987 241.323 47.2187 240.615 47.276C239.921 47.3333 239.057 47.3333 237.963 47.3333H234.037C232.943 47.3333 232.08 47.3333 231.384 47.276C230.677 47.2187 230.085 47.0987 229.548 46.824C228.67 46.3769 227.956 45.6632 227.508 44.7853C227.235 44.248 227.115 43.656 227.057 42.948C227 42.2547 227 41.3907 227 40.296V39.0373C227 37.9427 227 37.08 227.057 36.384C227.115 35.6773 227.235 35.0853 227.508 34.548C227.955 33.6696 228.67 32.9555 229.548 32.508C230.085 32.2347 230.677 32.1147 231.385 32.0573C232.079 32 232.943 32 234.037 32ZM239.5 45.6587C238.22 44.3402 236.51 43.5254 234.679 43.3627C232.849 43.1999 231.022 43.7001 229.529 44.772C229.755 45 230.016 45.192 230.305 45.34C230.568 45.4733 230.916 45.5667 231.521 45.616C232.137 45.6653 232.931 45.6667 234.067 45.6667H237.933C238.547 45.6667 239.06 45.6667 239.5 45.6587ZM234 40.3333C234.707 40.3333 235.386 40.0524 235.886 39.5523C236.386 39.0522 236.667 38.3739 236.667 37.6667C236.667 36.9594 236.386 36.2811 235.886 35.781C235.386 35.281 234.707 35 234 35C233.293 35 232.614 35.281 232.114 35.781C231.614 36.2811 231.333 36.9594 231.333 37.6667C231.333 38.3739 231.614 39.0522 232.114 39.5523C232.614 40.0524 233.293 40.3333 234 40.3333ZM238.333 38C238.333 37.7348 238.439 37.4804 238.626 37.2929C238.814 37.1054 239.068 37 239.333 37H241C241.265 37 241.52 37.1054 241.707 37.2929C241.895 37.4804 242 37.7348 242 38C242 38.2652 241.895 38.5196 241.707 38.7071C241.52 38.8946 241.265 39 241 39H239.333C239.068 39 238.814 38.8946 238.626 38.7071C238.439 38.5196 238.333 38.2652 238.333 38ZM238.333 41C238.333 40.7348 238.439 40.4804 238.626 40.2929C238.814 40.1054 239.068 40 239.333 40H241C241.265 40 241.52 40.1054 241.707 40.2929C241.895 40.4804 242 40.7348 242 41C242 41.2652 241.895 41.5196 241.707 41.7071C241.52 41.8946 241.265 42 241 42H239.333C239.068 42 238.814 41.8946 238.626 41.7071C238.439 41.5196 238.333 41.2652 238.333 41Z" fill="white" />
                            <rect x="264" y="20" width="40" height="40" rx="4" fill="#B6B0FE" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M282.037 32H285.963C287.059 32 287.921 32 288.616 32.0573C289.323 32.1147 289.915 32.2347 290.452 32.508C291.33 32.9555 292.045 33.6696 292.492 34.548C292.765 35.0853 292.885 35.6773 292.943 36.3853C293 37.0787 293 37.9427 293 39.0373V40.296C293 41.392 293 42.2547 292.943 42.9493C292.885 43.656 292.765 44.248 292.492 44.7853C292.045 45.6637 291.33 46.3779 290.452 46.8253C289.915 47.0987 289.323 47.2187 288.615 47.276C287.921 47.3333 287.057 47.3333 285.963 47.3333H282.037C280.943 47.3333 280.08 47.3333 279.384 47.276C278.677 47.2187 278.085 47.0987 277.548 46.824C276.67 46.3769 275.956 45.6632 275.508 44.7853C275.235 44.248 275.115 43.656 275.057 42.948C275 42.2547 275 41.3907 275 40.296V39.0373C275 37.9427 275 37.08 275.057 36.384C275.115 35.6773 275.235 35.0853 275.508 34.548C275.955 33.6696 276.67 32.9555 277.548 32.508C278.085 32.2347 278.677 32.1147 279.385 32.0573C280.079 32 280.943 32 282.037 32ZM287.5 45.6587C286.22 44.3402 284.51 43.5254 282.679 43.3627C280.849 43.1999 279.022 43.7001 277.529 44.772C277.755 45 278.016 45.192 278.305 45.34C278.568 45.4733 278.916 45.5667 279.521 45.616C280.137 45.6653 280.931 45.6667 282.067 45.6667H285.933C286.547 45.6667 287.06 45.6667 287.5 45.6587ZM282 40.3333C282.707 40.3333 283.386 40.0524 283.886 39.5523C284.386 39.0522 284.667 38.3739 284.667 37.6667C284.667 36.9594 284.386 36.2811 283.886 35.781C283.386 35.281 282.707 35 282 35C281.293 35 280.614 35.281 280.114 35.781C279.614 36.2811 279.333 36.9594 279.333 37.6667C279.333 38.3739 279.614 39.0522 280.114 39.5523C280.614 40.0524 281.293 40.3333 282 40.3333ZM286.333 38C286.333 37.7348 286.439 37.4804 286.626 37.2929C286.814 37.1054 287.068 37 287.333 37H289C289.265 37 289.52 37.1054 289.707 37.2929C289.895 37.4804 290 37.7348 290 38C290 38.2652 289.895 38.5196 289.707 38.7071C289.52 38.8946 289.265 39 289 39H287.333C287.068 39 286.814 38.8946 286.626 38.7071C286.439 38.5196 286.333 38.2652 286.333 38ZM286.333 41C286.333 40.7348 286.439 40.4804 286.626 40.2929C286.814 40.1054 287.068 40 287.333 40H289C289.265 40 289.52 40.1054 289.707 40.2929C289.895 40.4804 290 40.7348 290 41C290 41.2652 289.895 41.5196 289.707 41.7071C289.52 41.8946 289.265 42 289 42H287.333C287.068 42 286.814 41.8946 286.626 41.7071C286.439 41.5196 286.333 41.2652 286.333 41Z" fill="white" />
                        </svg>
                        </div>
                        <div >
                            <Box paddingBlockStart={2} paddingBlockEnd={2} paddingInlineStart={4} paddingInlineEnd={4} borderRadiusEndStart={2} borderRadiusEndEnd="2" borderColor="border">

                                <Checkbox
                                    label={
                                        <Tooltip content={data?.key}>
                                            <Text variant="headingMd" fontWeight="regular" truncate={true}>{data?.key}</Text>
                                        </Tooltip>
                                    }
                                    helpText={`${countTestSuitesTests(data?.value)} tests`}
                                    onChange={() => { handleTestSuiteSelection(data?.key, data?.value) }}
                                    checked={checkedSelected(data?.value)}
                                    disabled={checkDisableTestSuite(data?.value)}
                                />

                            </Box>
                        </div>
                    </VerticalStack>
                </Box>
            </div>
        );
    }

    return (
        <div className="runTestSuitesModal">
            <Modal
                open={testSuiteModal}
                onClose={() => {
                    if(setTestMode)setTestMode("");
                    testSuiteModalToggle(false);
                }}
                title="Configure Test"
                primaryAction={{
                    content: testMode?'Save & Re-run':'Run test',
                    onAction: () => handleTestSuiteRun(),
                    disabled: countAllSelectedTests() === 0,
                }}
                secondaryActions={[
                    countAllSelectedTests()?{
                        content: `${countAllSelectedTests()} tests selected`,
                        disabled: true,
                        plain: true,
                    }:null,
                    {
                        content: 'Cancel',
                        onAction: () => testSuiteModalToggle(false),
                    },

                ].filter(Boolean)}
                large
                footer={openConfigurations ? <Button onClick={() => openConfigurationsToggle(false)} plain><Text as="p" fontWeight="regular">Go back to test selection</Text></Button> : <Button onClick={() => openConfigurationsToggle(true)} plain><Text as="p" fontWeight="regular">Change Configurations</Text></Button>}
            >
                {!openConfigurations &&
                    <Modal.Section>
                        <VerticalStack gap={5}>
                            <HorizontalStack align="space-between" gap={2}>

                                <div style={{ minWidth: "82%" }}>
                                    <TextField
                                        prefix={<Icon source={SearchMinor} />}
                                        placeholder="Search"
                                        value={searchValue}
                                        onChange={(value) => setSearchValue(value)}
                                    />
                                </div>
                                <HorizontalStack gap={4}>
                                    <Button disabled={countAllSelectedTests() === 0}
                                        onClick={() => { handleRemoveAll() }}
                                        plain
                                        destructive><div data-testid="remove_all_tests">Clear selection</div></Button>

                                </HorizontalStack>
                            </HorizontalStack>
                            <VerticalStack>
                                <HorizontalStack align="start">
                                    <div className="testSuiteDisclosureButton" style={{ paddingBottom: "0.5rem" }}>
                                        <Button
                                            onClick={() => owaspTop10Toggle(!owaspTop10)}
                                            ariaExpanded={open}
                                            ariaControls="basic-collapsible"
                                            plain
                                            disclosure
                                        >
                                            <span style={{ fontWeight: "550", color: " #202223" }}>
                                                {data.owaspTop10.name} <span style={{ paddingLeft: "0.2rem" }}> </span>
                                            </span>
                                            <Badge>{data.owaspTop10.plans.length}</Badge>
                                        </Button>
                                    </div>
                                </HorizontalStack>
                                <Collapsible
                                    open={owaspTop10}
                                    id="basic-collapsible"
                                    transition={{ duration: "500ms", timingFunction: "ease-in-out" }}
                                    expandOnPrint
                                >
                                    <div className="testSuiteHorizontalScroll" style={{ display: "flex" }}>
                                        <Scrollable horizontal >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "flex-start",
                                                    alignItems: "center",
                                                    boxShadow: "0px 1px 2px 0px #00000026"
                                                }}
                                            >

                                                {Object.entries(owaspTop10List).map(([key, value]) => (
                                                    renderAktoTestSuites({ key, value })
                                                ))}

                                            </div>

                                        </Scrollable>
                                        <div style={{
                                            position: "absolute", right: "20px",
                                            height: "156px", width: "36px", background: "linear-gradient(270deg, #FFFFFF 0%, rgba(255, 255, 255, 0.04) 100%)"
                                        }}></div>
                                    </div>
                                </Collapsible>
                            </VerticalStack>
                        </VerticalStack>
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

export default RunTestSuites