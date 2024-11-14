import { Card, VerticalStack, Button, Box, Avatar, Text } from '@shopify/polaris'
import React from 'react'

function AddOnComponenet() {
  return (
      <div className='card-items'>
           <Card background="bg-subdued">
            <VerticalStack gap='3' align="start">
                <Avatar source="/public/PaymentsMajor.svg" size="sm" shape='square'/>
                <VerticalStack gap='2'>
                    <Text variant='headingMd'>This is an add-on connector</Text>
                    <Text variant='bodyMd'>
                        In order to use this connector, please contact us.
                    </Text>
                </VerticalStack>
                <Box paddingBlockStart={3}>
                    <Button

                        onClick={
                            () => {
                            window.open("https://calendly.com/ankita-akto/akto-demo", "_blank");
                        }
                    }
                        variant="primary">
                    Contact Us
                </Button>
                </Box>
            </VerticalStack>
           </Card>
        </div>
  );
}

export default AddOnComponenet
