import { ReactNode } from "react";

export /**
 * https://gist.github.com/evenfrost/1ba123656ded32fb7a0cd4651efd4db0


 * @date 27/06/2023 - 10:53:04
 *
 * @param {string} inputText
 * @param {[number, number][]} [regions=[]]
 * @returns {*}
 */
const highlightMatches = (
  inputText: string,
  regions: [number, number][] = []
): ReactNode[] => {
  const children: React.ReactNode[] = [];
  let nextUnhighlightedRegionStartingIndex = 0;

  // We only care about the longest match for now.
  console.log(regions)

  // get longest region match
  const region = regions.sort(
    (a, b) =>  (b[1] - b[0]) - (a[1] - a[0])
    )[0]
  console.log(region)
  
  const lastRegionNextIndex = region[1] + 1;

  let startText = inputText
        .substring(nextUnhighlightedRegionStartingIndex, region[0])
        .replace(' ', '\u00A0')

  let endText = inputText
      .substring(region[1])
      .replace(' ', '\u00A0');

  // truncate start
  if (startText.split(' ').length > 4) {
    startText = `... ${startText.split(' ').slice(-4).join(' ')}`
  }

  // truncate end
  if(endText.split(' ').length > 6) {
    endText = `${endText.split(' ').slice(0, 6).join(' ')} ...`
  }

  children.push(
    ...[
      startText,
      <span key={region + ' ' + region[0]} className="font-semibold">
        {inputText
          .substring(region[0], region[1])
          .replace(' ', '\u00A0')}
      </span>,
      endText
    ]
  );

  return children 
};


// export const highlightMatches = (inputText: string, regions: [number, number][] = []) => {
//   const children: React.ReactNode[] = [];
//   let nextUnhighlightedRegionStartingIndex = 0;

//   regions.forEach((region, i) => {
//     const lastRegionNextIndex = region[1] + 1;

//     children.push(
//       ...[
//         inputText.substring(nextUnhighlightedRegionStartingIndex, region[0]).replace(' ', '\u00A0'),
//         <span key={region + ' ' + i} className='fuse-highlight'>
//           {inputText.substring(region[0], lastRegionNextIndex).replace(' ', '\u00A0')}
//         </span>,
//       ]
//     );

//     nextUnhighlightedRegionStartingIndex = lastRegionNextIndex;
//   });

//   children.push(inputText.substring(nextUnhighlightedRegionStartingIndex).replace(' ', '\u00A0'));

//   return <>{children}</>;
// };