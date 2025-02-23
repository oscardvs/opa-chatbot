// imageHelper.js
export function getImageByKeyword(message) {
    // Define the keywords and associated image URLs
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
        holiday: '/images/prague.jgp',
        prague: '/images/prague.jpg',
        czech: '/images/prague.jpg',
        czech_republic: '/images/prague.jpg',
        travel: '/images/prague.jpg',
        vacation: '/images/prague.jpg',
        trip: '/images/prague.jpg'
    };

    if (lowerMessage.includes('random')) {
      // pick from allImages randomly
      const randomIndex = Math.floor(Math.random() * allImages.length);
      return allImages[randomIndex];
    }
  
    const lowerMessage = message.toLowerCase();
    // Loop through the keys and check if the message mentions any of them.
    for (const keyword in images) {
      if (lowerMessage.includes(keyword)) {
        return images[keyword];
      }
    }
    // If no matching keyword, return null
    return null;
  }
  