import { Avatar, Button, Card, Text, BlockStack, InlineStack, Badge, Box } from '@shopify/polaris';

function RowCard(props) {

    const {cardObj, onButtonClick, buttonText} = props ;
    const goToDocs = () => {
        window.open(cardObj.docsUrl)
    }

    const handleAction = () => {
        onButtonClick(cardObj)
    }

    return (
        <Card>
            <BlockStack gap="500">
                <div style={{display: 'flex' , justifyContent: 'space-between'}}>
                    <Box padding={"200"} borderWidth='1' borderColor='border-subdued' borderRadius='2'>
                    <Avatar customer size="xs" name={cardObj.label} source={cardObj.icon} shape='square'/>
                    </Box>
                    <Box paddingBlockStart="100">
                        {cardObj.badge ? <Badge size='small' tone='info'>{cardObj.badge}</Badge> : null}
                    </Box>
                </div>
                <BlockStack gap="100">
                    <Text variant="headingMd" as="h5">{cardObj.label}</Text>
                    <Box minHeight="80px">
                        <Text variant="bodyMd" color='subdued'>{cardObj.text}</Text>
                    </Box>
                </BlockStack>
                <InlineStack gap={"400"} align='start'>
                    <Button onClick={handleAction}>{buttonText}</Button>
                    <Button  onClick={goToDocs} size='medium' variant="plain">See Docs</Button>
                </InlineStack>
            </BlockStack>
        </Card>
    );
}

export default RowCard