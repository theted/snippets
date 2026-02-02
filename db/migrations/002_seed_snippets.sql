INSERT INTO snippets (id, title, content, language)
VALUES (
  1,
  'Functional programming goodies',
  $$const filter = (list, predicate) => list.filter (predicate)

const filterLessThan = (list, value) => filter (list, (elem) => elem < value)

const filterGreaterOrEqual = (list, value) => filter (list, (elem) => elem >= value)

const quicksort = ([head, ...tail]) =>  {
  if (head === undefined) return []

  let elemsLess = filterLessThan (tail, head),
      elemsGreater = filterGreaterOrEqual (tail, head)

  return [...quicksort (elemsLess), head, ...quicksort (elemsGreater)]
}$$,
  'javascript'
)
ON CONFLICT (id) DO NOTHING;
