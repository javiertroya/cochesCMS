import { Globe } from 'lucide-react'

import { Badge } from '@/components/UI/coss/badge'
import { ROLE_CONFIG } from '@/mocks/UserConfig'

const RoleCell = (props) => {

    const { role } = props

    const config = ROLE_CONFIG[role] ?? { label: role, variant: 'secondary', icon: Globe }
    const Icon   = config.icon

    return (
        <td className="px-5 py-3.5 align-middle">
            <Badge variant={config.variant}>
                <Icon className="h-3.5 w-3.5" />
                {config.label}
            </Badge>
        </td>
    )
}

export default RoleCell
