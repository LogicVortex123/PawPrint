export const photos = {
  beach: require('../../assets/photos/dog-beach.webp'),
  portrait: require('../../assets/photos/dog-portrait.webp'),
  beagle: require('../../assets/photos/hero-beagle.webp'),
  aussie: require('../../assets/photos/dog-aussie.webp'),
  samoyed: require('../../assets/photos/dog-samoyed.webp'),
  running: require('../../assets/photos/dogs-running.webp'),
  corgi: require('../../assets/photos/corgi-puppy.webp'),
  frenchie: require('../../assets/photos/frenchie.webp'),
  pug: require('../../assets/photos/pug-sweater.webp'),
  catPeek: require('../../assets/photos/cat-peek.webp'),
  ginger: require('../../assets/photos/cat-ginger.webp'),
  tabby: require('../../assets/photos/cat-tabby-blue.webp'),
  kitten: require('../../assets/photos/kitten-paw.webp'),
  cuddle: require('../../assets/photos/cat-dog-cuddle.webp'),
  vet: require('../../assets/photos/vet-care.webp'),
  logo: require('../../assets/photos/logo.jpeg'),
} as const;

export const petFaces = [photos.portrait, photos.catPeek, photos.corgi, photos.kitten];

export function speciesPhoto(species: string) {
  if (species === 'cat') return photos.catPeek;
  if (species === 'dog') return photos.portrait;
  return photos.cuddle;
}
