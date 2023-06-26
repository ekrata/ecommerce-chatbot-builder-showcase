export const highlightMatches = (
  inputText: string,
  regions: [number, number][] = []
) => {
  const children: React.ReactNode[] = [];
  let nextUnhighlightedRegionStartingIndex = 0;

  regions.forEach((region, i) => {
    const lastRegionNextIndex = region[1] + 1;

    children.push(
      ...[
        inputText
          .substring(nextUnhighlightedRegionStartingIndex, region[0])
          .replace(' ', '\u00A0'),
        <span key={region + ' ' + i} className="font-semibold">
          {inputText
            .substring(region[0], lastRegionNextIndex)
            .replace(' ', '\u00A0')}
        </span>,
      ]
    );

    nextUnhighlightedRegionStartingIndex = lastRegionNextIndex;
  });

  children.push(
    inputText
      .substring(nextUnhighlightedRegionStartingIndex)
      .replace(' ', '\u00A0')
  );

  return <>{children}</>;
};
