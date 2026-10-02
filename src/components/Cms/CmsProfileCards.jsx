import { FaComputer, FaCircleQuestion } from 'react-icons/fa6'
import { FaGraduationCap, FaTools } from 'react-icons/fa'
import { MdMeetingRoom } from 'react-icons/md'
import { VscDebugStart } from 'react-icons/vsc'

import ProfileCard from '@/components/Content/Main/ProfileCard'

const iconMap = {
    card: <FaCircleQuestion size={48} />,
    computer: <FaComputer size={48} />,
    graduation: <FaGraduationCap size={48} />,
    room: <MdMeetingRoom size={48} />,
    start: <VscDebugStart size={48} />,
    tools: <FaTools size={48} />,
}

const CmsProfileCards = ({ items = [] }) => (
    <section className="flex flex-wrap justify-center gap-8 px-4 py-8">
        {items.map((item, index) => (
            <ProfileCard
                key={index}
                title={item.title}
                subtitle={item.subtitle}
                source={item.source}
                alt={item.alt}
                info={item.info}
                to={item.to}
                icon={iconMap[item.icon] ?? iconMap.card}
            />
        ))}
    </section>
)

export default CmsProfileCards
