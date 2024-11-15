import React from 'react'
import { Box, Button, Card, Text, BlockStack, VideoThumbnail } from "@shopify/polaris"
import { useNavigate } from 'react-router-dom';

function BannerLayout({title, text, buttonText, buttonUrl, bodyComponent, videoThumbnail, videoLink, videoLength, linkButton, containerComp, newTab, onClick}) {
    const properties = linkButton ? {plain: true} : {primary: true}
    const navigate = useNavigate();
    const handleRedirect = () =>{ newTab ? window.open(buttonUrl, "_blank") :navigate(buttonUrl)}
    return (
        <Card padding={"10"}>
            <BlockStack gap={8}>
                <div style={{display: "flex", justifyContent: 'space-between'}}>
                    <Box width="400px">
                        <BlockStack gap={4}>
                            <Text variant="headingLg">{title}</Text>
                            <Text color="subdued" variant="bodyMd">{text}</Text>
                            {bodyComponent}
                            {buttonText ? <Box paddingBlockStart={2}>
                                <Button {...properties} onClick={() => {handleRedirect(); onClick()}}>{buttonText}</Button>
                            </Box> : null}
                        </BlockStack>
                    </Box>
                    {videoLink ? <Box width='340px'>
                        <VideoThumbnail
                            videoLength={videoLength}
                            thumbnailUrl={videoThumbnail}
                            onClick={() => window.open(videoLink, "_blank")}
                        />
                    </Box> : null}
                </div>
                {containerComp}
            </BlockStack>
        </Card>
    );
}

export default BannerLayout