import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { buttonVariants } from "@/components/UI/coss/button";
import { Calendar } from "@/components/UI/coss/calendar";
import {
    Popover,
    PopoverPopup,
    PopoverTrigger,
} from "@/components/UI/coss/popover";

// ............................................................
const DatePicker = ({value, onValueChange}) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (selectedDate) => {
        if (!selectedDate) return
        onValueChange?.(selectedDate)
        setOpen(false)
    };

    // .............................
    return (
        <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger
                className={buttonVariants({
                    className: "w-full justify-start",
                    variant: "outline",
                    size: "lg",
                })}
            >
                <CalendarIcon aria-hidden="true" />
                {value ? format(value, "PPP", { locale: es }) : "Seleccionar fecha"}
            </PopoverTrigger>
            <PopoverPopup align="start" className="w-auto p-0">
                <Calendar
                    defaultMonth={value}
                    mode="single"
                    onSelect={handleSelect}
                    selected={value}
                />
            </PopoverPopup>
        </Popover>
    );
}

export default DatePicker
