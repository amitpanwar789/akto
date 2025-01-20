import { Modal, Text, Button, Banner, Checkbox, Divider, Popover, OptionList, TextField, Tooltip, DataTable, VerticalStack, HorizontalStack,Icon,Box,Badge } from '@shopify/polaris';
import { useState } from 'react';
import RunTestConfiguration from './RunTestConfiguration';
import { CancelMajor, SearchMinor, TickMinor } from "@shopify/polaris-icons";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import func from "@/util/func"
import AdvancedSettingsComponent from './component/AdvancedSettingsComponent';
import SpinnerCentered from "../../../components/progress/SpinnerCentered"

const RunTestIndividual = ({
    active,
    setActive,
    handleRun,
    parentTestRun,
    setParentTestRun,
    sectionsForFilters,
    optionsSelected,
    initialArr,
    setOptionsSelected,
    runTypeOptions,
    hourlyTimes,
    testRunTimeOptions,
    testRolesArr,
    maxConcurrentRequestsOptions,
    slackIntegrated,
    generateLabelForSlackIntegration,
    dispatchConditions,
    conditions,
    loading,
    testIdConfig,
    collectionsMap,
    apiCollectionId,
    closeRunTest,
    setTestMode,
}) => {
    const navigate = useNavigate();
    const [showFiltersOption, setShowFiltersOption] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchValue, setSearchValue] = useState('')
    const [testRun, setTestRun] = useState(parentTestRun)

    useEffect(() => {
        if (testIdConfig?.testingRunConfig?.testSubCategoryList?.length > 0) {
            const testSubCategoryList = [...testIdConfig?.testingRunConfig?.testSubCategoryList]
            const testSubCategorySet = new Set(testSubCategoryList);
            const updatedTests = { ...parentTestRun.tests };

            // Reset all test selections
            Object.keys(updatedTests).forEach(category => {
                updatedTests[category] = updatedTests[category].map(test => ({ ...test, selected: false }));
            });

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
                    const arr1 = obj1[key].map(obj => JSON.stringify(obj)).sort(); // O(m log m)
                    const arr2 = obj2[key].map(obj => JSON.stringify(obj)).sort(); // O(m log m)

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
            }
        }
        else {
            setTestRun(prev => {
                return {
                    ...parentTestRun
                }
            });
        }
    }, [parentTestRun])


    const resetSearchFunc = () => {
        setShowSearch(false);
        setSearchValue('');
    }

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

    const toggleRunTest = () => {
        setActive(prev => !prev)
        if (active) {
            if (closeRunTest !== undefined) closeRunTest()
            setTestMode("");
        }
    }

    let categoryRows = [], testRows = []

    const handleTestsSelected = (test) => {
        let localCopy = JSON.parse(JSON.stringify(testRun.tests))
        localCopy[testRun.selectedCategory] = localCopy[testRun.selectedCategory].map(curTest =>
            curTest.label === test.label ?
                {
                    ...curTest,
                    selected: !curTest.selected
                } : curTest
        )
        const testName = convertToLowerCaseWithUnderscores(apiCollectionName) + "_" + nameSuffixes(localCopy).join("_")
        setTestRun(prev => ({
            ...prev,
            tests: {
                ...prev.tests,
                [testRun.selectedCategory]: prev.tests[testRun.selectedCategory].map(curTest =>
                    curTest.label === test.label ?
                        {
                            ...curTest,
                            selected: !curTest.selected
                        } : curTest)
            },
            testName: testName
        }))
    }

    const filterFunc = (test, selectedVal = []) => {
        const useFilterArr = selectedVal.length > 0 ? selectedVal : optionsSelected
        let ans = false;
        sectionsForFilters.forEach((filter) => {
            const filterKey = filter.filterKey;
            if (filterKey === 'author') {
                if (useFilterArr.includes('custom')) {
                    ans = useFilterArr.includes(test[filterKey].toLowerCase()) || test[filterKey].toLowerCase() !== 'akto'
                } else {
                    ans = useFilterArr.length > 0 && useFilterArr.includes(test[filterKey].toLowerCase())
                }
            }
            else if (useFilterArr.includes(test[filterKey].toLowerCase())) {
                ans = true
            }
        })
        return ans;
    }

    const selectOnlyFilteredTests = (selected) => {
        const filteredTests = testRun.selectedCategory.length > 0 ? testRun.tests[testRun.selectedCategory].filter(x => filterFunc(x, selected)).map(item => item.value) : []
        setTestRun(prev => ({
            ...prev,
            tests: {
                ...prev.tests,
                [testRun.selectedCategory]: prev.tests[testRun.selectedCategory].map((curTest) => {
                    return {
                        ...curTest,
                        selected: filteredTests.length > 0 && filteredTests.includes(curTest.value)
                    }
                })
            }
        }))
    }

    if (!loading) {
        categoryRows = testRun.categories.map(category => {
            const tests = testRun.tests[category.name]
            if (tests) {
                let selected = 0
                const total = tests.length

                tests.forEach(test => {
                    if (test.selected)
                        selected += 1
                })

                return [(
                    <div
                        style={{ display: "grid", gridTemplateColumns: "auto max-content", alignItems: "center" }}
                        onClick={() => { setTestRun(prev => ({ ...prev, selectedCategory: category.name })); resetSearchFunc(); setOptionsSelected(initialArr) }}>
                        <div>
                            <Text variant="headingMd" fontWeight="bold" color={category.name === testRun.selectedCategory ? "success" : ""}>{category.displayName}</Text>
                            <Text>{selected} out of {total} selected</Text>
                        </div>
                        {selected > 0 && <Icon source={TickMinor} color="base" />}
                    </div>
                )];
            } else {
                return []
            }

        })

        const filteredTests = testRun.selectedCategory.length > 0 ? testRun.tests[testRun.selectedCategory]?.filter(x => (x.label.toLowerCase().includes(searchValue.toLowerCase()) && filterFunc(x))) : []
        console.log("filteredTests ",filteredTests)
        testRows = filteredTests?.map(test => {
            const isCustom = test?.author !== "AKTO"
            const label = (
                <span style={{ display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                    <Text variant="bodyMd">{test.label}</Text>
                    {isCustom ? <Box paddingBlockStart={"050"}><Badge status="warning" size="small">Custom</Badge></Box> : null}
                </span>
            )
            return ([(
                <Checkbox
                    label={label}
                    checked={test.selected}
                    ariaDescribedBy={test.label}
                    onChange={() => handleTestsSelected(test)}
                />
            )])
        })
    }

    function handleIndividualTestRun(){
        setParentTestRun(prev => {
            const updatedState = { ...testRun };
            handleRun(updatedState); 
            return updatedState;
        });
    }

    

    function handleRemoveAll() {
        setTestRun(prev => {
            const tests = { ...testRun.tests }
            Object.keys(tests).forEach(category => {
                tests[category] = tests[category].map(test => ({ ...test, selected: false }))
            })

            return { ...prev, tests: tests, testName: convertToLowerCaseWithUnderscores(apiCollectionName) }
        })
        func.setToast(true, false, "All tests unselected")
    }

    function checkRemoveAll() {
        const tests = { ...testRun.tests }
        let totalTests = 0
        Object.keys(tests).forEach(category => {
            tests[category].map((test) => {
                if (test.selected) {
                    totalTests++
                }
            })
        })
        return totalTests === 0;
    }

    function getCurrentStatus() {
        if (!testRun || testRun?.tests === undefined || testRun?.selectedCategory === undefined || testRun.tests[testRun.selectedCategory] === undefined)
            return false;

        let res = true;
        const tests = testRun.tests[testRun.selectedCategory];
        for (let i = 0; i < tests.length; i++) {
            if (tests[i].selected === false) {
                res = false;
                break;
            }
        }
        return res;
    }

    function toggleTestsSelection(val) {
        let copyTestRun = testRun
        copyTestRun.tests[testRun.selectedCategory].forEach((test) => {
            test.selected = val
        })
        setTestRun(prev => {
            return { ...prev, tests: copyTestRun.tests, testName: convertToLowerCaseWithUnderscores(apiCollectionName) + "_" + nameSuffixes(copyTestRun.tests).join("_") }
        })
    }

    const handleInputValue = (val) => {
        setSearchValue(val);
    }
    return (
        <Modal
            open={active}
            onClose={toggleRunTest}
            title="Configure test"
            primaryAction={{
                content: "Schedule",
                onAction: handleIndividualTestRun,
                disabled: !testRun.authMechanismPresent
            }}
            large
        >
            {loading ? <SpinnerCentered /> : (
                <Modal.Section>
                    <VerticalStack gap={"3"}>
                        {!testRun.authMechanismPresent && (
                            <Banner
                                title="Authentication mechanism not configured"
                                action={{
                                    content: 'Configure authentication mechanism',
                                    onAction: () => navigate("/dashboard/testing/user-config")
                                }}
                                status="critical"
                            >
                                <Text variant="bodyMd">
                                    Running specialized tests like Broken Object Level Authorization,
                                    Broken User Authentication etc, require an additional attacker
                                    authorization token. Hence before triggering Akto tests on your apis,
                                    you may need to specify an authorization token which can be treated as
                                    an attacker token during test run.
                                </Text>
                            </Banner>
                        )}

                        <div style={{ display: "grid", gridTemplateColumns: "max-content auto max-content", alignItems: "center", gap: "10px" }}>
                            <Text variant="headingMd">Name:</Text>
                            <div style={{ maxWidth: "75%" }}>
                                <TextField
                                    placeholder="Enter test name"
                                    value={testRun.testName}
                                    onChange={(testName) => setTestRun(prev => ({ ...prev, testName }))}
                                />
                            </div>
                            <Button
                                icon={CancelMajor}
                                destructive
                                onClick={handleRemoveAll}
                                disabled={checkRemoveAll()}
                            >
                                <div data-testid="remove_all_tests">Remove All</div>
                            </Button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "50% 50%", border: "1px solid #C9CCCF" }}>
                            <div style={{ borderRight: "1px solid #C9CCCF" }}>
                                <div style={{ padding: "15px", alignItems: "center" }}>
                                    <Text variant="headingMd">Test Categories</Text>
                                </div>
                                <Divider />
                                <div style={{ maxHeight: "35vh", overflowY: "auto" }}>
                                    <DataTable columnContentTypes={['text']} headings={[]} rows={categoryRows} increasedTableDensity />
                                </div>
                            </div>
                            <div>
                                <div style={{ padding: !showSearch ? "13px" : "9px", display: 'flex', justifyContent: 'space-between' }}>
                                    <HorizontalStack gap={"2"}>
                                        <Checkbox checked={getCurrentStatus()} onChange={toggleTestsSelection} />
                                        <Text variant="headingMd">Tests</Text>
                                    </HorizontalStack>
                                    <HorizontalStack gap={"2"}>
                                        <Popover
                                            activator={<Button size="slim" onClick={() => setShowFiltersOption(!showFiltersOption)} plain>More filters</Button>}
                                            onClose={() => setShowFiltersOption(false)}
                                            active={showFiltersOption}
                                        >
                                            <Popover.Pane fixed>
                                                <OptionList
                                                    onChange={(x) => { setOptionsSelected(x); selectOnlyFilteredTests(x); }}
                                                    allowMultiple
                                                    sections={sectionsForFilters}
                                                    selected={optionsSelected}
                                                />
                                            </Popover.Pane>
                                        </Popover>
                                        {showSearch && <TextField onChange={handleInputValue} value={searchValue} autoFocus />}
                                        <Tooltip content={"Click to search"} dismissOnMouseOut>
                                            <Button size="slim" icon={SearchMinor} onClick={() => setShowSearch(!showSearch)} />
                                        </Tooltip>
                                    </HorizontalStack>
                                </div>
                                <Divider />
                                <div style={{ maxHeight: "35vh", overflowY: "auto", paddingTop: "5px" }}>
                                {testRows?<DataTable columnContentTypes={['text']} headings={[]} rows={testRows}  increasedTableDensity />:<></>}
                                </div>
                            </div>
                        </div>

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
                    </VerticalStack>
                    <AdvancedSettingsComponent dispatchConditions={dispatchConditions} conditions={conditions} />
                </Modal.Section>
            )}
        </Modal>
    );
};

export default RunTestIndividual;
