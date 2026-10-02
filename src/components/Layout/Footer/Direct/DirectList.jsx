import { Link } from "react-router-dom"

const DirectList = (props) => {

    // .............................
    const { items } = props

    const renderItem = (item) => {
        return (
            <li key={item.id}>
                <Link
                    to={item.route}
                    className="hover:text-white hover:underline"
                >
                    { item.name }
                </Link>
                {
                    item.children && (
                        <div className="pl-6">
                            <DirectList items={item.children} />
                        </div>
                    )
                }
            </li>
        )
    }

    // .............................
    return (
        <ul className="
            list-disc list-inside
        ">
            {
                items.map(renderItem)
            }
        </ul>
    )
}

export default DirectList