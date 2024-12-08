import { AnchorHTMLAttributes } from 'react';
import usePageContext from '../../renderer/usePageContext';

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>

export default function Link(props: LinkProps) {
  const pageContext = usePageContext();
  const { urlPathname } = pageContext;
  const { href } = props;
  const isActive = href ? (href === '/' ? urlPathname === href : urlPathname.startsWith(href)) : false;
  const className = [props.className, isActive && 'is-active'].filter(Boolean).join(' ');
  return <a {...props} className={className} />;
}
