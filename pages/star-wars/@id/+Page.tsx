import { useData } from '../../../renderer/useData';
import type { Data } from './+data';

export default function Page() {
  const { movie } = useData<Data>()
  return (
    <>
      <h1>{movie.title}</h1>
      Release Date: {movie.release_date}
      <br />
      Director: {movie.director}
      <br />
      Producer: {movie.producer}
    </>
  )
}
