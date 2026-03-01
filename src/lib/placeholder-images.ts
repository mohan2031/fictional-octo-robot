import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;


/**
 * Gets a placeholder image that best matches a given string of keywords.
 * @param keywords - A string like "General Physician", "Grocery", "television".
 * @returns An ImagePlaceholder object.
 */
export function getPlaceholderImage(keywords: string = ''): ImagePlaceholder {
  const searchTerms = keywords.toLowerCase().split(/[\s,]+/);

  let bestMatch: ImagePlaceholder | undefined;
  let maxScore = 0;

  for (const image of PlaceHolderImages) {
    let currentScore = 0;
    const hintTerms = image.imageHint.toLowerCase().split(' ');

    for (const searchTerm of searchTerms) {
      if (hintTerms.includes(searchTerm)) {
        currentScore++;
      }
    }

    if (currentScore > maxScore) {
      maxScore = currentScore;
      bestMatch = image;
    }
  }

  // If we found a match, return it
  if (bestMatch) {
    return bestMatch;
  }

  // If no match, return a random image as a fallback
  return PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
}
