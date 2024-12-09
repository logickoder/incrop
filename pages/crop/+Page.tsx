import InverseCropperPage from './InverseCropperPage';
import usePageContext from '../../renderer/usePageContext';

export default function Page() {
  const pageContext = usePageContext();
  return <InverseCropperPage imageSrc={pageContext.args} onCrop={() => {
  }} />;
}
