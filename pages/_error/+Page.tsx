import usePageContext from '../../renderer/usePageContext';
import InfoPage from '../_shared/InfoPage';

export default function Page() {
  const pageContext = usePageContext();
  let { abortReason } = pageContext;
  if (!abortReason) {
    abortReason = pageContext.is404 ? 'Page not found.' : 'Something went wrong.';
  }
  return (
    <InfoPage message={abortReason} />
  );
}