import { Button, HorizontalStack, Icon, IndexFiltersMode, TextField } from "@shopify/polaris"
import PageWithMultipleCards from "../../../components/layouts/PageWithMultipleCards"
import TitleWithInfo from "../../../components/shared/TitleWithInfo"
import GithubSimpleTable from "../../../components/tables/GithubSimpleTable"
import { useEffect, useState } from "react"
import FlyLayoutSuite from "./FlyLayoutSuite"
import LocalStore from "../../../../main/LocalStorageStore";
import useTable from "../../../components/tables/TableContext"
import func from "../../../../../util/func"
import ShowListInBadge from "../../../components/shared/ShowListInBadge"
import api from "../api"



const sortOptions = [
    { label: 'Template Name', value: 'template asc', directionLabel: 'A-Z', sortKey: 'name', columnIndex: 1 },
    { label: 'Template Name', value: 'template desc', directionLabel: 'Z-A', sortKey: 'name', columnIndex: 1 },
];

function TestSuite() {
    const [show, setShow] = useState(false)
    const [data, setData] = useState({ 'all': [], 'custom': [] })
    const [selectedTab, setSelectedTab] = useState('all')
    const customTestSuiteData = [...LocalStore.getState().customTestSuites];
    const [selectedTestSuite, setSelectedTestSuite] = useState({})

    const { tabsInfo } = useTable()
    const definedTableTabs = ['All', 'Custom'];
    const tableCountObj = func.getTabsCount(definedTableTabs, data)
    const tableTabs = func.getTableTabsContent(definedTableTabs, tableCountObj, setSelectedTab, selectedTab, tabsInfo)
    const [fetchAgain, setFetchAgain] = useState(true)



    const headings = [
        {
            title: "Template name",
            text: "template_name",
            value: "name",
            textValue: "name",
            sortActive: true,
        },
        {
            title: "Total tests",
            text: "testCount",
            value: "testCount",
            textValue: "testCount",
        },
        {
            title: "Categories covered",
            text: "categoriesCovered",
            value: "categoriesCovered",
        },
    ]

    let headers = JSON.parse(JSON.stringify(headings))

    const resourceName = {
        singular: 'testSuite',
        plural: 'testSuites',
    };

    const handleRowClick = (data) => {
        setShow(true)
        setSelectedTestSuite(data);
    };

    const fetchData = async () => {
        const data = await api.fetchAllTestSuites();

        console.log("fetched data", data);
        const updatedData = data.map(x => {
            const categoriesCoveredSet = new Set();
            
            const subCategoryMap = LocalStore.getState().subCategoryMap;
            const testSuiteTestSelectedList = new Set(x?.subCategoryList);

            Object.entries(subCategoryMap).forEach(([key, tests]) => {
                if(testSuiteTestSelectedList.has(tests.name)) {
                    categoriesCoveredSet.add(tests.superCategory.name);
                }
            });

            const categoriesCoveredArr = [...categoriesCoveredSet];

            return {
                name: x.name,
                id: x.id,
                createdByName: x.createdByName,
                testCount: x.subCategoryList.length,
                tests: x.subCategoryList,
                categoriesCovered: (
                    <ShowListInBadge
                        itemsArr={categoriesCoveredArr}
                        maxItems={4}
                        maxWidth={"250px"}
                        status={"new"}
                        itemWidth={"200px"}
                    />
                )
            };
        });
        const newData = {
            all: [...updatedData],
            custom: [...updatedData]
        }
        console.log("newData", newData);
        if (JSON.stringify(data) !== JSON.stringify(newData)) {
            setData(prevData => ({
                ...prevData,
                all: [...updatedData], 
                custom: [...updatedData]
            }));
        }
        if (selectedTab !== "all") { 
            setSelectedTab("all"); 
        }

    };

    useEffect(() => {
        fetchData();
    }, [])


    const [selected, setSelected] = useState(0)
    const [tableLoading, setTableLoading] = useState(false)
    const handleSelectedTab = (selectedIndex) => {
        setTableLoading(true)
        setSelected(selectedIndex)
        setTimeout(() => {
            setTableLoading(false)
        }, 200)
    }

    const promotedBulkActions = (val) => {
        let actions = [
            {
                content: 'Export as CSV',
                onAction: () => console.log("agsa")
            }
        ];
        return actions;
    }


    const components = [
        <GithubSimpleTable
            sortOptions={sortOptions}
            tableTabs={tableTabs}
            loading={tableLoading}
            selected={selected}
            mode={IndexFiltersMode.Default}
            onSelect={handleSelectedTab}
            onRowClick={handleRowClick}
            resourceName={resourceName}
            useNewRow={true}
            headers={headers}
            headings={headings}
            data={data[selectedTab]}
            promotedBulkActions={promotedBulkActions}
            selectable={true}
        />,
        <FlyLayoutSuite
            selectedTestSuite={selectedTestSuite}
            setSelectedTestSuite={setSelectedTestSuite}
            customTestSuiteData={customTestSuiteData}
            show={show}
            setShow={setShow}
            onChange={fetchData}
        />
    ]

    return (
        <PageWithMultipleCards
            title={
                <TitleWithInfo
                    tooltipContent={"Akto automatically groups similar APIs into meaningful collections based on their subdomain names. "}
                    titleText={"Test Suites"}
                    docsUrl={"https://docs.akto.io/api-inventory/concepts"}
                />
            }
            primaryAction={<Button primary onClick={() => { setSelectedTestSuite(null); setShow(true) }}><div data-testid="new_test_role_button">Create new</div></Button>}
            components={components}
        >

        </PageWithMultipleCards>
    )

}

export default TestSuite