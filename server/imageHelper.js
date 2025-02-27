export function getImageByKeyword(message) {
  if (!message) return null;
  
  const lowerMessage = message.toLowerCase();

  const images = {
    bachelor: '/images/bachelor_defend.jpg',
    thesis: '/images/bachelor_defend.jpg',
    graduation: '/images/bachelor_defend.jpg',
    defend: '/images/bachelor_defend.jpg',
    presentation: '/images/bachelor_defend.jpg',
    picture: '/images/bachelor_defend.jpg',
    bep: '/images/bep.jpg',
    university: '/images/bep.jpg',
    bachelor_thesis: '/images/bep.jpg',
    system_and_control: '/images/bep.jpg',
    horse: '/images/horse.jpg',
    horseriding: '/images/horse.jpg',
    animal: '/images/horse.jpg',
    nature: '/images/horse.jpg',
    holiday: '/images/prague.jpg',
    prague: '/images/prague.jpg',
    czech: '/images/prague.jpg',
    czech_republic: '/images/prague.jpg',
    travel: '/images/prague.jpg',
    vacation: '/images/prague.jpg',
    trip: '/images/prague.jpg'
  };

  if (lowerMessage.includes('random')) {
    // Use a Set to get unique image URLs from the mapping
    const allImages = Array.from(new Set(Object.values(images)));
    const randomIndex = Math.floor(Math.random() * allImages.length);
    return allImages[randomIndex];
  }

  // Loop through the mapping to find a matching keyword.
  for (const keyword in images) {
    if (lowerMessage.includes(keyword)) {
      return images[keyword];
    }
  }

  // If no match found, return null.
  return null;
}
