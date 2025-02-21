// imageHelper.js
export function getImageByKeyword(message) {
    // Define the keywords and associated image URLs
    const images = {
        bachelor: '/images/bachelor_defend.jpg',
        thesis: '/images/bachelor_defend.jpg',
        graduation: '/images/bachelor_defend.jpg',
        defend: '/images/bachelor_defend.jpg',
        presentation: '/images/bachelor_defend.jpg'
    };
  
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
  