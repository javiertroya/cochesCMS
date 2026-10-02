import { UserIcon } from 'lucide-react'

const UserCell = (props) => {

    const { user } = props

    return (
        <td className="px-5 py-3.5 align-middle">
            <div className="flex items-center gap-3">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${user.is_active ? 'bg-gray-100 text-gray-500' : 'bg-gray-200 text-gray-400'}`}>
                    <UserIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                    <p className="
                        font-semibold text-gray-900
                        leading-tight truncate
                    ">
                        {user.name}
                    </p>
                    <p className="
                        text-xs text-gray-400
                        truncate
                        mt-0.5
                    ">
                        {user.email}
                    </p>
                </div>
            </div>
        </td>
    )
}

export default UserCell
