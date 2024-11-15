import { Button, Text, Tooltip, BlockStack } from '@shopify/polaris'
import React from 'react'
import SampleData from '../../../../components/shared/SampleData'
import { ClipboardMinor } from "@shopify/polaris-icons"

function JsonComponent({dataString, onClickFunc, title, toolTipContent, language, minHeight}) {

  let data = {message:dataString}

  return (
      <BlockStack gap="1">
          <div className='copyRequest'>
              <Text>{title}</Text>
              <Tooltip dismissOnMouseOut preferredPosition='above' content={toolTipContent}>
                  <Button icon={ClipboardMinor}  onClick={() => onClickFunc()} variant="plain" />
              </Tooltip>
          </div>
          <SampleData data={data} language={language} minHeight={minHeight}/>
      </BlockStack>
  );
}

export default JsonComponent