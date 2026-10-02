import { useEffect, useMemo, useState } from 'react'

import { getCmsNavPages } from '@/services/cms_service'
import { buildCmsOnlyMenu } from '@/utils/menu'

const useNavigationMenu = () => {
    const [cmsPages, setCmsPages] = useState([])

    useEffect(() => {
        let isMounted = true

        getCmsNavPages()
            .then((pages) => {
                if (isMounted) setCmsPages(pages)
            })
            .catch(() => {
                if (isMounted) setCmsPages([])
            })

        return () => {
            isMounted = false
        }
    }, [])

    return useMemo(() => buildCmsOnlyMenu(cmsPages), [cmsPages])
}

export default useNavigationMenu
