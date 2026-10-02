import { FaBook, FaCalendarAlt, FaCertificate, FaDoorOpen, FaHome, FaStar, FaTools, FaUserGraduate, FaWrench } from 'react-icons/fa'
import { FaCarSide, FaCircleQuestion, FaComputer, FaKey, FaPlane, FaUsers } from 'react-icons/fa6'
import { RiGraduationCapFill } from 'react-icons/ri'
import { IoNewspaperSharp } from 'react-icons/io5'

// ............................................................................
// Mapa de nombre → componente React (para el Navigator)
export const NAV_ICON_MAP = {
    home: FaHome,
    info: FaCircleQuestion,
    users: FaUsers,
    tools: FaTools,
    calendar: FaCalendarAlt,
    graduation: RiGraduationCapFill,
    news: IoNewspaperSharp,
    door: FaDoorOpen,
    wrench: FaWrench,
    computer: FaComputer,
    graduate: FaUserGraduate,
    certificate: FaCertificate,
    star: FaStar,
    book: FaBook,
    car: FaCarSide,
    key: FaKey,
    plane: FaPlane,
}

// ............................................................................
// Opciones para el select del admin
export const NAV_ICON_OPTIONS = [
    { value: '', label: 'Sin icono' },
    { value: 'home', label: 'Inicio' },
    { value: 'info', label: 'Información' },
    { value: 'users', label: 'Personas / Equipo' },
    { value: 'tools', label: 'Herramientas' },
    { value: 'calendar', label: 'Calendario / Eventos' },
    { value: 'graduation', label: 'Formación' },
    { value: 'news', label: 'Noticias' },
    { value: 'door', label: 'Acceso / Sala' },
    { value: 'wrench', label: 'Técnico' },
    { value: 'computer', label: 'Informática' },
    { value: 'graduate', label: 'Estudiante' },
    { value: 'certificate', label: 'Certificado' },
    { value: 'star', label: 'Destacado' },
    { value: 'book', label: 'Documentación' },
    { value: 'car', label: 'Coche' },
    { value: 'key', label: 'Llave / Importación' },
    { value: 'plane', label: 'Avión / Importación' },
]

export default NAV_ICON_MAP
