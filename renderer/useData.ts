// https://vike.dev/useData
import usePageContext from './usePageContext';

export { useData }

/** https://vike.dev/useData */
function useData<Data>() {
  const { data } = usePageContext()
  return data as Data
}
