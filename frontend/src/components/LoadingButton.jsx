import { LoaderCircle } from 'lucide-react';

export default function LoadingButton({ loading, children, className = '', ...props }) {
  return <button className={className} disabled={loading || props.disabled} {...props}>{loading && <LoaderCircle className="spin" size={18} />}{children}</button>;
}
