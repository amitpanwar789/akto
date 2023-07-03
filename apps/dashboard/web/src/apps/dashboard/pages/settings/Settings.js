import { Button, Modal, TextContainer } from "@shopify/polaris"
import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom"
import './style_overrides.css'

const Settings = () => {
    const [active, setActive] = useState(true);

    const handleChange = useCallback(() => setActive(!active), [active]);

    const activator = <Button onClick={handleChange}>Open</Button>;


    return (
        <div className="container">
            <Modal
                fullScreen
                activator={activator}
                open={active}
                onClose={handleChange}
                title="Reach more shoppers with Instagram product tags"
                primaryAction={{
                    content: 'Add Instagram',
                    onAction: handleChange,
                }}
                secondaryActions={[
                    {
                        content: 'Learn more',
                        onAction: handleChange,
                    },
                ]}
            >
                <Modal.Section>
                    <TextContainer>
                        <p>
                            Use Instagram posts to share your products with millions of
                            people. Let shoppers buy from your store without leaving
                            Instagram.
                        </p>
                    </TextContainer>
                </Modal.Section>
            </Modal>
        </div>
    )
}

export default Settings