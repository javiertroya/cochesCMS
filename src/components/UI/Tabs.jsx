import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/UI/coss/tabs"

const TabsDefault = (props) => {

    // .............................
    const { tabs } = props

    // .............................
    const renderTabList = (tab, index) => {
        const { value, label } = tab
        return (
            <TabsTab key={index} value={value}>
                {label}
            </TabsTab>
        )
    }

    const renderTabElement = (tab, index) => {
        const { value, Element } = tab
        return (
            <TabsPanel key={index} value={value}>
                <Element />
            </TabsPanel>
        )
    }

    // .............................
    return (
        <Tabs defaultValue="tab-1" className="
            gap-0
        ">
            <div className="
                flex justify-center
                border-b
            ">
                <TabsList variant="underline">
                    {
                        tabs.map(renderTabList)
                    }
                </TabsList>
            </div>
            {
                tabs.map(renderTabElement)
            }
        </Tabs>
    )
}

export default TabsDefault