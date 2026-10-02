import { FaCarSide, FaPlane, FaEnvelope } from "react-icons/fa6"

const ACCESS = [
    {
        id: 1,
        icon: { element: true, source: FaCarSide },
        label: "Stock",
        link: "/stock",
    },
    {
        id: 2,
        icon: { element: true, source: FaPlane },
        label: "Importación",
        link: "/importacion",
    },
    {
        id: 3,
        icon: { element: true, source: FaEnvelope },
        label: "Contacto",
        link: "/contacto",
    },
]

export default ACCESS
