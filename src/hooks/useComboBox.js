import { useMemo } from "react"

// .............................................................
const useComboBox = (props) => {

    // .............................
    const { tags, order } = props
    
    // .............................
    const groupTags = (tags) => {
        const groups = {}
        for (const tag of tags) {
            if (!groups[tag.group]) {
                groups[tag.group] = []
            }
            groups[tag.group]?.push(tag)
        }

        return order.map((value) => ({ items: groups[value] ?? [], value }))
    }

    // .............................
    const groupedTags = useMemo(() => groupTags(tags), [tags, order])

    // .............................
    return { groupedTags }
}

export default useComboBox