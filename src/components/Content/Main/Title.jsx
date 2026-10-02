import { Fragment } from 'react'

const Title = (props) => {

    // ............................
    const { title, actions } = props

    // ............................
    return (
        <Fragment>
            <div className="mt-8 mb-4">
                <div className="
                    flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4
                ">
                    <h1 className="text-2xl font-bold text-left sm:text-3xl">
                        {title}
                    </h1>

                    {actions}
                </div>

                <hr className="border-gray-300 mt-2" />
            </div>
        </Fragment>
    )
}

export default Title
