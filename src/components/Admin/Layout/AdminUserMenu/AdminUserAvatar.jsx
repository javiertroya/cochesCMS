import { Avatar, AvatarFallback } from '@/components/UI/coss/avatar'
import { getInitials } from '@/utils/admin/getInitials'

const AdminUserAvatar = ({ name, className }) => (
    <Avatar className={`h-8 w-8 ring-2 ring-brand-primary/20 ${className ?? ''}`}>
        <AvatarFallback className="bg-brand-primary/15 text-[11px] font-bold text-brand-primary">
            {getInitials(name)}
        </AvatarFallback>
    </Avatar>
)

export default AdminUserAvatar
