import { Fragment } from "react"
import {
    Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxCollection,
    ComboboxEmpty, ComboboxGroup, ComboboxGroupLabel, ComboboxInput, ComboboxItem,
    ComboboxList, ComboboxPopup, ComboboxSeparator, ComboboxValue
} from "@/components/UI/coss/combobox"
import { RiSearchLine } from "react-icons/ri";

// .............................................................
import useComboBox from "@/hooks/useComboBox";

// .............................................................
const ComboBoxDefault = (props) => {

    // .............................
    const {
        tags,
        order,
        multiple = true,
        placeholder = "Ej: Corte Láser",
        inputLabel = "Buscar Técnicas",
        selectedValue,
        value,
        defaultValue,
        ...comboboxProps
    } = props


    // .............................
    const { groupedTags } = useComboBox({ tags, order })

    // .............................
    const getTagLabel = (tag) => tag?.label ?? ""

    // .............................
    const getTagValue = (tag) => String(tag?.id ?? tag?.value ?? "")

    // .............................
    const normalizeTag = (tag) => ({
        ...tag,
        value: getTagValue(tag),
    })

    // .............................
    const normalizeValue = (value) => {
        if (Array.isArray(value)) {
            return value.map(normalizeTag)
        }

        return value ? normalizeTag(value) : value
    }

    // .............................
    const normalizedGroupedTags = groupedTags.map((group) => ({
        ...group,
        items: group.items.map(normalizeTag),
    }))

    // .............................
    const comboboxValue = value ?? selectedValue

    // .............................
    const renderSelectedValues = (value) => {
        const selectedItems = Array.isArray(value) ? value : []

        return (
            <>
                {selectedItems.map((item) => (
                    <ComboboxChip aria-label={getTagLabel(item)} key={getTagValue(item)}>
                        {getTagLabel(item)}
                    </ComboboxChip>
                ))}
                <ComboboxChipsInput
                    aria-label={inputLabel}
                    placeholder={selectedItems.length > 0 ? undefined : placeholder}
                    size="lg"
                />
            </>
        )
    }

    // .............................
    const renderItem = (tag) => {
        return (
            <ComboboxItem key={tag.id} value={tag}>
                <div className="
                    flex items-start gap-x-2
                ">
                    { tag.label }
                </div>
            </ComboboxItem>
        )
    }

    const renderList = (group) => {
        return (
            <Fragment key={group.value}>
                <ComboboxGroup items={group.items}>
                    <ComboboxGroupLabel>
                        {group.value}
                    </ComboboxGroupLabel>
                    <ComboboxCollection>
                        {
                            renderItem
                        }
                    </ComboboxCollection>
                </ComboboxGroup>
                {
                    group.value !== "Team" && <ComboboxSeparator />
                }
            </Fragment>
        )
    }

    // .............................
    return (
        <Combobox
            items={normalizedGroupedTags}
            multiple={multiple}
            defaultValue={normalizeValue(defaultValue)}
            {...(comboboxValue !== undefined ? { value: normalizeValue(comboboxValue) } : {})}
            itemToStringLabel={getTagLabel}
            itemToStringValue={getTagValue}
            isItemEqualToValue={(item, value) => item?.id === value?.id}
            {...comboboxProps}
        >
            <div className="
                flex flex-col items-start gap-2
                w-full
            ">
                {
                    multiple ? (
                        <ComboboxChips startAddon={<RiSearchLine />}>
                            <ComboboxValue>
                                {renderSelectedValues}
                            </ComboboxValue>
                        </ComboboxChips>
                    ) : (
                        <ComboboxInput
                            aria-label={inputLabel}
                            placeholder={placeholder}
                            startAddon={<RiSearchLine />}
                            size="lg"
                        />
                    )
                }
            </div>
            <ComboboxPopup>
                <ComboboxEmpty>
                    No tags found.
                </ComboboxEmpty>
                <ComboboxList>
                    {
                        renderList
                    }
                </ComboboxList>
            </ComboboxPopup>
        </Combobox>
    );
}

export default ComboBoxDefault
