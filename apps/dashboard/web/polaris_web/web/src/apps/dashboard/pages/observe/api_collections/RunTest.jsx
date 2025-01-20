import { Box, Button, DataTable, Divider, Modal, Text, TextField, Icon, Checkbox, Badge, Banner, InlineGrid, HorizontalStack, Link, VerticalStack, Tooltip, Popover, ActionMenu, OptionList, ActionList } from "@shopify/polaris";
import { TickMinor, CancelMajor, SearchMinor } from "@shopify/polaris-icons";
import { useEffect, useReducer, useRef, useState } from "react";
import api, { default as observeApi } from "../api";
import { default as testingApi } from "../../testing/api";
import SpinnerCentered from "../../../components/progress/SpinnerCentered"
import Dropdown from "../../../components/layouts/Dropdown";
import func from "@/util/func"
import { useNavigate } from "react-router-dom"
import PersistStore from "../../../../main/PersistStore";
import transform from "../../testing/transform";
import LocalStore from "../../../../main/LocalStorageStore";
import AdvancedSettingsComponent from "./component/AdvancedSettingsComponent";

import { produce } from "immer"
import RunTestSuites from "./RunTestSuites";
import RunTestConfiguration from "./RunTestConfiguration";
import RunTestIndividual from "./RunTestIndividual";


function RunTest({ endpoints, filtered, apiCollectionId, disabled, runTestFromOutside, closeRunTest, selectedResourcesForPrimaryAction, useLocalSubCategoryData, preActivator, testMode, testIdConfig, setTestMode }) {

    const initialState = {
        categories: [],
        tests: {},
        selectedCategory: "BOLA",
        recurringDaily: false,
        continuousTesting: false,
        overriddenTestAppUrl: "",
        hasOverriddenTestAppUrl: false,
        startTimestamp: func.timeNow(),
        hourlyLabel: "Now",
        testRunTime: -1,
        testRunTimeLabel: "30 minutes",
        runTypeLabel: "Now",
        maxConcurrentRequests: -1,
        testName: "",
        authMechanismPresent: false,
        testRoleLabel: "No test role selected",
        testRoleId: "",
        sendSlackAlert: false,
        cleanUpTestingResources: false
    }
    const navigate = useNavigate()

    const [testRun, setTestRun] = useState({
        ...initialState
    })
    const collectionsMap = PersistStore(state => state.collectionsMap)
    const [loading, setLoading] = useState(true)
    const [testRolesArr, setTestRolesArr] = useState([])
    const [active, setActive] = useState(runTestFromOutside || false);
    const [parentActivator, setParentActivator] = useState(false)

    const runTestRef = useRef(null);
    const [searchValue, setSearchValue] = useState('')
    const [showSearch, setShowSearch] = useState(false)
    const [showFiltersOption, setShowFiltersOption] = useState(false);
    const sectionsForFilters = [
        {
            title: 'Author',
            filterKey: 'author',
            options: [
                { value: 'akto', label: 'Akto default' },
                { value: 'custom', label: 'Custom tests' }
            ]
        }
    ]

    const initialArr = ['akto', 'custom']

    const [optionsSelected, setOptionsSelected] = useState(initialArr)
    const [slackIntegrated, setSlackIntegrated] = useState(false)

    const emptyCondition = { data: { key: '', value: '' }, operator: { 'type': 'ADD_HEADER' } }
    const [conditions, dispatchConditions] = useReducer(produce((draft, action) => func.conditionsReducer(draft, action)), [emptyCondition]);

    const localCategoryMap = LocalStore.getState().categoryMap
    const localSubCategoryMap = LocalStore.getState().subCategoryMap

    useEffect(() => {
        if (preActivator) {
            setParentActivator(true);
            if (testMode === "testSuite") {
                testSuiteToggle(true)
            }
            else if (testMode === "individualTest") {
                toggleRunTest()
            }
        }

    }, [testMode])

    function nameSuffixes(tests) {
        return Object.entries(tests)
            .filter(category => {
                let selectedCount = 0
                category[1].forEach(test => {
                    if (test.selected) selectedCount += 1
                })

                return selectedCount > 0
            })
            .map(category => category[0])
    }

    const convertToLowerCaseWithUnderscores = (inputString) => {
        if (!inputString)
            return ""
        return inputString?.toLowerCase()?.replace(/\s+/g, '_');
    }
    const apiCollectionName = collectionsMap[apiCollectionId]

    async function fetchData() {
        setLoading(true)

        observeApi.fetchSlackWebhooks().then((resp) => {
            const apiTokenList = resp.apiTokenList
            setSlackIntegrated(apiTokenList && apiTokenList.length > 0)
        })

        let metaDataObj = {
            categories: [],
            subCategories: [],
            testSourceConfigs: []
        }
        if (!useLocalSubCategoryData) {
            metaDataObj = await transform.getAllSubcategoriesData(true, "runTests")
        } else {
            metaDataObj = {
                categories: Object.values(localCategoryMap),
                subCategories: Object.values(localSubCategoryMap),
                testSourceConfigs: []
            }
        }
        let categories = metaDataObj.categories
        let businessLogicSubcategories = metaDataObj.subCategories
        const testRolesResponse = await testingApi.fetchTestRoles()
        var testRoles = testRolesResponse.testRoles.map(testRole => {
            return {
                "label": testRole.name,
                "value": testRole.hexId
            }
        })
        testRoles.unshift({ "label": "No test role selected", "value": "" })
        setTestRolesArr(testRoles)
        const { selectedCategory, mapCategoryToSubcategory } = populateMapCategoryToSubcategory(businessLogicSubcategories)
        // Store all tests
        const processMapCategoryToSubcategory = {}
        if (Object.keys(businessLogicSubcategories).length > 0) {
            Object.keys(mapCategoryToSubcategory).map(category => {
                processMapCategoryToSubcategory[category] = [...mapCategoryToSubcategory[category]["all"]]
            })
        }

        
        Object.keys(processMapCategoryToSubcategory).map(category => {
            const selectedTests = []

            mapCategoryToSubcategory[category]["selected"].map(test => selectedTests.push(test.value))
            processMapCategoryToSubcategory[category].forEach((test, index, arr) => {
                arr[index]["selected"] = false
            })
        })
        
        const testName = convertToLowerCaseWithUnderscores(apiCollectionName);
        //Auth Mechanism
        let authMechanismPresent = false
        const authMechanismDataResponse = await testingApi.fetchAuthMechanismData()
        if (authMechanismDataResponse.authMechanism)
            authMechanismPresent = true
        setTestRun(prev => ({
            ...prev,
            categories: categories,
            tests: processMapCategoryToSubcategory,
            selectedCategory: Object.keys(processMapCategoryToSubcategory).length > 0 ? Object.keys(processMapCategoryToSubcategory)[0] : "",
            testName: testName,
            authMechanismPresent: authMechanismPresent
        }))
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
        if (runTestFromOutside === true) {
            setActive(true)
        }
    }, [apiCollectionName, runTestFromOutside])

    const toggleRunTest = () => {
        setActive(prev => !prev)
        if (active) {
            if (closeRunTest !== undefined) closeRunTest()
            setTestMode("");
        }
    }

    function populateMapCategoryToSubcategory(businessLogicSubcategories) {
        let ret = {}
        businessLogicSubcategories.forEach(x => {
            if (!ret[x.superCategory.name]) {
                ret[x.superCategory.name] = { selected: [], all: [] }
            }

            let obj = {
                label: x.testName,
                value: x.name,
                author: x.author
            }
            ret[x.superCategory.name].all.push(obj)
            ret[x.superCategory.name].selected.push(obj)
        })
        //store this
        return {
            selectedCategory: Object.keys(ret)[0],
            mapCategoryToSubcategory: ret
        }
    }

    const [testPopover, setTestPopover] = useState(false);

    const [testSuite, testSuiteToggle] = useState(false);

    const activators = (
        <Popover
            active={testPopover}

            activator={
                <Button onClick={() => setTestPopover(!testPopover)} primary disclosure>Run Tests</Button>
            }
            onClose={() => setTestPopover(false)}
        >
            <ActionList
                items={[
                    {
                        content: "Test suites",
                        onAction: () => testSuiteToggle(true)
                    },
                    {
                        content: "Individual tests",
                        onAction: toggleRunTest,
                        active: disabled || testRun.selectedCategory.length === 0,
                    }
                ]}
            >

            </ActionList>
        </Popover>
    )

    const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

    const amTimes = hours.map(hour => {
        let hourStr = hour + (hour == 12 ? " noon" : " am")
        return { label: hourStr, value: hour.toString() }
    })
    const pmTimes = hours.map(hour => {
        let hourStr = hour + (hour == 12 ? " midnight" : " pm")
        return { label: hourStr, value: `${hour + 12}` }
    })

    const hourlyTimes = [{ label: "Now", value: "Now" }, ...amTimes, ...pmTimes]

    const runTimeMinutes = hours.reduce((abc, x) => {
        if (x < 6) {
            let label = x * 10 + " minutes"
            abc.push({ label, value: `${x * 10 * 60}` })
        }
        return abc
    }, [])

    const runTimeHours = hours.reduce((abc, x) => {
        if (x < 7) {
            let label = x + (x == 1 ? " hour" : " hours")
            abc.push({ label, value: `${x * 60 * 60}` })
        }
        return abc
    }, [])

    const testRunTimeOptions = [...runTimeMinutes, ...runTimeHours]

    const runTypeOptions = [{ label: "Daily", value: "Daily" }, { label: "Continuously", value: "Continuously" }, { label: "Now", value: "Now" }]

    const maxRequests = hours.reduce((abc, x) => {
        if (x < 11) {
            let label = x * 10
            abc.push({ label, value: `${x * 10}` })
        }
        return abc
    }, [])

    const maxConcurrentRequestsOptions = [{ label: "Default", value: "-1" }, ...maxRequests]


    async function handleRun(testRun) {
        const { startTimestamp, recurringDaily, testName, testRunTime, maxConcurrentRequests, overriddenTestAppUrl, testRoleId, continuousTesting, sendSlackAlert, cleanUpTestingResources } = testRun
        const collectionId = parseInt(apiCollectionId)

        const tests = testRun.tests

        const selectedTests = []
        Object.keys(tests).forEach(category => {
            tests[category].forEach(test => {
                if (test.selected) selectedTests.push(test.value)
            })
        })

        let apiInfoKeyList;
        if (!selectedResourcesForPrimaryAction || selectedResourcesForPrimaryAction.length === 0) {
            apiInfoKeyList = endpoints.map(endpoint => ({
                apiCollectionId: endpoint.apiCollectionId,
                method: endpoint.method,
                url: endpoint.endpoint
            }))
        } else {
            apiInfoKeyList = selectedResourcesForPrimaryAction.map(str => {
                const parts = str.split('###')

                const method = parts[0]
                const url = parts[1]
                const apiCollectionId = parseInt(parts[2], 10)

                return {
                    apiCollectionId: apiCollectionId,
                    method: method,
                    url: url
                }
            })
        }
        let finalAdvancedConditions = []

        if (conditions.length > 0 && conditions[0]?.data?.key?.length > 0) {
            finalAdvancedConditions = transform.prepareConditionsForTesting(conditions)
        }

        if (filtered || selectedResourcesForPrimaryAction?.length > 0) {
            await observeApi.scheduleTestForCustomEndpoints(apiInfoKeyList, startTimestamp, recurringDaily, selectedTests, testName, testRunTime, maxConcurrentRequests, overriddenTestAppUrl, "TESTING_UI", testRoleId, continuousTesting, sendSlackAlert, finalAdvancedConditions, cleanUpTestingResources,testIdConfig?.hexId)
        }  else {
            await observeApi.scheduleTestForCollection(collectionId, startTimestamp, recurringDaily, selectedTests, testName, testRunTime, maxConcurrentRequests, overriddenTestAppUrl, testRoleId, continuousTesting, sendSlackAlert, finalAdvancedConditions,cleanUpTestingResources,testIdConfig?.hexId)
        }

        setActive(false)
        const forwardLink = (
            <HorizontalStack gap={1}>
                <Text> Test run created successfully. Click </Text>
                <Link url="/dashboard/testing">here</Link>
                <Text> to view results.</Text>
            </HorizontalStack>
        )

        func.setToast(true, false, <div data-testid="test_run_created_message">{forwardLink}</div>)

    }

    function generateLabelForSlackIntegration() {
        return (
            <HorizontalStack gap={1}>
                <Link url='/dashboard/settings/integrations/slack' target="_blank" rel="noopener noreferrer" style={{ color: "#3385ff", textDecoration: 'none' }}>
                    Enable
                </Link>
                <Text>
                    Slack integration to send alerts post completion
                </Text>
            </HorizontalStack>
        );
    }

    return (
        <div>
            {!parentActivator ? activators : null}
            <RunTestSuites
                testSuiteModal={testSuite}
                testSuiteModalToggle={testSuiteToggle}
                parentTestRun={testRun}
                setParentTestRun={setTestRun}
                runTypeOptions={runTypeOptions}
                hourlyTimes={hourlyTimes}
                testRunTimeOptions={testRunTimeOptions}
                testRolesArr={testRolesArr}
                maxConcurrentRequestsOptions={maxConcurrentRequestsOptions}
                slackIntegrated={slackIntegrated}
                generateLabelForSlackIntegration={generateLabelForSlackIntegration}
                dispatchConditions={dispatchConditions} conditions={conditions}
                handleRun={handleRun}
                nameSuffixes={nameSuffixes}
                convertToLowerCaseWithUnderscores={convertToLowerCaseWithUnderscores}
                apiCollectionName={apiCollectionName}
                testIdConfig={testIdConfig}
                initialState={initialState}
                setTestMode={setTestMode}
                testMode={testMode} />
            <RunTestIndividual
                active={active}
                handleRun={handleRun}
                parentTestRun={testRun}
                setParentTestRun={setTestRun}
                sectionsForFilters={sectionsForFilters}
                optionsSelected={optionsSelected}
                initialArr={initialArr}
                setOptionsSelected={setOptionsSelected}
                runTypeOptions={runTypeOptions}
                hourlyTimes={hourlyTimes}
                testRunTimeOptions={testRunTimeOptions}
                testRolesArr={testRolesArr}
                maxConcurrentRequestsOptions={maxConcurrentRequestsOptions}
                slackIntegrated={slackIntegrated}
                generateLabelForSlackIntegration={generateLabelForSlackIntegration}
                dispatchConditions={dispatchConditions}
                conditions={conditions}
                loading={loading}
                testIdConfig={testIdConfig}
                collectionsMap={collectionsMap}
                apiCollectionId={apiCollectionId}
                closeRunTest={closeRunTest}
                setActive={setActive}
                setTestMode={setTestMode}
            />
        </div>
    );
}

export default RunTest