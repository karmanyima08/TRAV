export interface DestinationItem {
  id: string;
  name: string;
  state: string;
  tagline: string;
  category: 'all' | 'heritage' | 'beach' | 'mountain' | 'spiritual' | 'urban';
  categoryLabel: string;
  image: string;
  bestSeason: string;
  avgCost: string;
  highlights: string[];
}

export const DESTINATIONS_DATA: DestinationItem[] = [
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    tagline: 'Palaces, hilltop forts & vibrant pink bazaars',
    category: 'heritage',
    categoryLabel: 'Royal Heritage',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
    bestSeason: 'Oct – Mar',
    avgCost: '₹2,000 / day',
    highlights: ['Amber Fort', 'Hawa Mahal', 'City Palace', 'Bapu Bazaar'],
  },
  {
    id: 'goa',
    name: 'Goa Coast',
    state: 'Goa',
    tagline: 'Sun-kissed beaches, coastal cafes & Portuguese churches',
    category: 'beach',
    categoryLabel: 'Beaches & Coast',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    bestSeason: 'Nov – Feb',
    avgCost: '₹2,500 / day',
    highlights: ['Baga & Anjuna Beach', 'Fort Aguada', 'Latin Quarter', 'Water Sports'],
  },
  {
    id: 'kerala',
    name: 'Kerala (Kochi & Munnar)',
    state: 'Kerala',
    tagline: 'Rolling Munnar tea hills, emerald backwaters & spice trails',
    category: 'mountain',
    categoryLabel: 'Nature & Hills',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80',
    bestSeason: 'Sep – Mar',
    avgCost: '₹2,400 / day',
    highlights: ['Munnar Tea Gardens', 'Alleppey Backwaters', 'Chinese Fishing Nets', 'Kathakali'],
  },
  {
    id: 'manali',
    name: 'Manali',
    state: 'Himachal Pradesh',
    tagline: 'Snow-capped Himalayan peaks, Solang adventures & pine forests',
    category: 'mountain',
    categoryLabel: 'Himalayas & Snow',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
    bestSeason: 'Oct – Jun',
    avgCost: '₹2,100 / day',
    highlights: ['Solang Valley', 'Hadimba Temple', 'Jogini Waterfalls', 'Atal Tunnel'],
  },
  {
    id: 'udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    tagline: 'Romantic marble palaces floating on serene Lake Pichola',
    category: 'heritage',
    categoryLabel: 'Lakes & Palaces',
    image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800&auto=format&fit=crop&q=80',
    bestSeason: 'Sep – Mar',
    avgCost: '₹2,200 / day',
    highlights: ['Lake Pichola', 'City Palace Udaipur', 'Saheliyon-ki-Bari', 'Jagdish Temple'],
  },
  {
    id: 'varanasi',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    tagline: 'Ancient spiritual Ganga ghats, sacred aarti & winding alleys',
    category: 'spiritual',
    categoryLabel: 'Spiritual & Sacred',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80',
    bestSeason: 'Nov – Feb',
    avgCost: '₹1,500 / day',
    highlights: ['Dashashwamedh Ghat Aarti', 'Kashi Vishwanath', 'Assi Ghat', 'Sarnath'],
  },
  {
    id: 'amritsar',
    name: 'Amritsar',
    state: 'Punjab',
    tagline: 'Radiant Golden Temple, patriotic Wagah border & rich culinary heritage',
    category: 'spiritual',
    categoryLabel: 'Spiritual & Cultural',
    image: 'https://images.unsplash.com/photo-1588096344356-9b626780c85c?w=800&auto=format&fit=crop&q=80',
    bestSeason: 'Oct – Mar',
    avgCost: '₹1,600 / day',
    highlights: ['Golden Temple', 'Wagah Border Ceremony', 'Jallianwala Bagh', 'Partition Museum'],
  },
  {
    id: 'rishikesh',
    name: 'Rishikesh',
    state: 'Uttarakhand',
    tagline: 'Yoga capital of the world, emerald river rafting & Himalayan ashrams',
    category: 'mountain',
    categoryLabel: 'Yoga & Adventure',
    image: 'https://images.unsplash.com/photo-1600100397608-f010f443b798?w=800&auto=format&fit=crop&q=80',
    bestSeason: 'Sep – May',
    avgCost: '₹1,700 / day',
    highlights: ['Triveni Ghat Aarti', 'Ganga River Rafting', 'Beatles Ashram', 'Ram & Laxman Jhula'],
  },
  {
    id: 'delhi',
    name: 'Delhi NCR',
    state: 'Capital Region',
    tagline: 'Mughal citadels, colonial monuments, world cuisine & modern metro',
    category: 'urban',
    categoryLabel: 'Heritage & Metro',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80',
    bestSeason: 'Oct – Mar',
    avgCost: '₹2,200 / day',
    highlights: ['Qutub Minar', 'Humayun’s Tomb', 'Red Fort', 'India Gate'],
  },
  {
    id: 'agra',
    name: 'Agra',
    state: 'Uttar Pradesh',
    tagline: 'Home to the iconic Taj Mahal, grand red fort & Mughal gardens',
    category: 'heritage',
    categoryLabel: 'World Wonder',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80',
    bestSeason: 'Oct – Mar',
    avgCost: '₹1,800 / day',
    highlights: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh'],
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    tagline: 'Marine Drive sunsets, Gateway of India, Bollywood & coastal energy',
    category: 'urban',
    categoryLabel: 'Coastal Metropolis',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80',
    bestSeason: 'Nov – Feb',
    avgCost: '₹2,800 / day',
    highlights: ['Gateway of India', 'Marine Drive', 'Elephanta Caves', 'Colaba Causeway'],
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    tagline: 'City of Joy, grand Victoria Memorial, historic trams & literary cafes',
    category: 'urban',
    categoryLabel: 'Colonial & Art',
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop&q=80',
    bestSeason: 'Oct – Mar',
    avgCost: '₹1,800 / day',
    highlights: ['Victoria Memorial', 'Howrah Bridge', 'Dakshineswar Temple', 'Indian Museum'],
  },
];

export const getDestinationById = (id: string): DestinationItem => {
  const norm = (id || '').toLowerCase().trim();
  const match = DESTINATIONS_DATA.find((d) => d.id === norm);
  return (
    match || {
      id: norm || 'jaipur',
      name: (norm || 'Jaipur').charAt(0).toUpperCase() + (norm || 'Jaipur').slice(1),
      state: 'India',
      tagline: 'Discover incredible sights and curated itineraries',
      category: 'heritage',
      categoryLabel: 'Curated Spot',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
      bestSeason: 'Year Round',
      avgCost: '₹2,000 / day',
      highlights: ['Local Sights', 'Cultural Heritage', 'Dining'],
    }
  );
};
