import React from 'react'
import transform from '../transform'
import { Box, Card, Divider, InlineStack, ProgressBar, Scrollable, Text, BlockStack } from '@shopify/polaris'

function CoverageCard({coverageObj, collections, collectionsMap}) {

    const sortedCollectionElements = transform.formatCoverageData(coverageObj,collections)
    return (
        <Card>
            <BlockStack gap={500}>
                <Text variant="bodyLg" fontWeight="semibold">Test coverage</Text>
                <Scrollable style={{maxHeight: '400px'}} shadow> 
                    <Box>
                    {sortedCollectionElements.map((collectionObj,index)=> (
                        <Box padding={200} key={collectionObj.id}>
                            <BlockStack gap={200}>
                                <Text variant="bodyMd" breakWord truncate>
                                    {collectionsMap[collectionObj.id]}
                                </Text>
                                <InlineStack gap={200}>
                                    <Box width='85%'>
                                        <ProgressBar size="small" tone={collectionObj.status} progress={collectionObj.coverage} />
                                    </Box>
                                    <Text breakWord color="subdued" variant="bodyMd">{collectionObj.coverage}%</Text>
                                </InlineStack>
                                {index < (collections.length - 1) ? <Divider/> : null }
                            </BlockStack>
                        </Box>
                    ))}
                    </Box>
                </Scrollable>
            </BlockStack>
        </Card>
    );
}

export default CoverageCard