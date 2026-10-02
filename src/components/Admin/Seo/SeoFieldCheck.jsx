import { CheckCircle2, XCircle } from 'lucide-react'

const SeoFieldCheck = ({ value }) => value
    ? <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
    : <XCircle className="mx-auto h-4 w-4 text-gray-200" />

export default SeoFieldCheck
