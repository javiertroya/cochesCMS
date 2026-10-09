import { upload } from './api'

// ..............................
export const uploadImage = async (target, file, categoryId = null) => {
    const formData = new FormData()
    formData.append('file', file)
    if (categoryId != null) {
        formData.append('category_id', String(categoryId))
    }
    return await upload(`/uploads/${target}`, formData)
}
