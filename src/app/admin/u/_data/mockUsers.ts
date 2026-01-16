// Mock user data for demonstration purposes
// This file contains 100 randomized users with varied dates

interface MockUser {
  id: string;
  email: string;
  name: string;
  lastLogIn: Date | null;
  lastOrder: Date | null;
}

// Helper function to generate random ID (similar to cuid format)
function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'cm';
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// Helper function to get a random date within the past year
function getRandomDate(): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 365); // 0-365 days ago
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);

  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);

  return date;
}
// First name pool
const firstNames = [
  'Cheyenne', 'Paityn', 'James', 'Maria', 'Ruben', 'Carter', 'Terry', 'Craig', 'Corey',
  'Aspen', 'Zaire', 'Carla', 'Kadin', 'Zain', 'Alfredo', 'Talan', 'Adison', 'Emerson',
  'Dakota', 'Phoenix', 'Morgan', 'Riley', 'Jordan', 'Avery', 'Skyler', 'Cameron', 'Quinn',
  'Blake', 'Sage', 'Rowan', 'Harper', 'Finley', 'Reese', 'Drew', 'Casey', 'Peyton',
  'Kendall', 'Logan', 'Taylor', 'Skylar', 'Addison', 'Hayden', 'Parker', 'River', 'Emery',
  'Lennon', 'Oakley', 'Gustavo', 'Erin', 'Justin', 'Marilyn', 'Marcus', 'Desirae',
  'Kianna', 'Roger', 'Lincoln', 'Hanna', 'Lindsey', 'Ahmad', 'Kyla', 'Rylee', 'Jazmin',
  'Malachi', 'Nolan', 'Eden', 'Raelynn', 'Xavier', 'Ivy', 'Miles', 'Luna', 'Jaxon',
  'Stella', 'Kai', 'Hazel', 'Leo', 'Violet', 'Ezra', 'Aurora', 'Asher', 'Savannah',
  'Oliver', 'Brooklyn', 'Elijah', 'Bella', 'Liam', 'Sophia', 'Noah', 'Emma', 'Lucas',
  'Olivia', 'Mason', 'Ava', 'Ethan', 'Isabella', 'Aiden', 'Mia', 'Jackson', 'Charlotte',
];

// Last name pool
const lastNames = [
  'Culhane', 'Schleifer', 'Calzoni', 'Passaquindici Arcand', 'Franci', 'Geidt', 'Siphron',
  'Press', 'Philips', 'Vaccaro', 'Stanton', 'Septimus', 'Aminoff', 'Herwitz', 'Vetrovs',
  'Ekstrom Bothman', 'Lipshutz', 'Mango', 'Lubin', 'Rosser', 'Dokidis', 'Gouse', 'Martinez',
  'Anderson', 'Thompson', 'Garcia', 'Rodriguez', 'Wilson', 'Lopez', 'Gonzalez', 'Hernandez',
  'Johnson', 'Smith', 'Brown', 'Davis', 'Miller', 'Moore', 'Taylor', 'Thomas', 'White',
  'Harris', 'Martin', 'Jackson', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King',
  'Wright', 'Scott', 'Green', 'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell', 'Roberts',
  'Campbell', 'Phillips', 'Evans', 'Turner', 'Torres', 'Parker', 'Collins', 'Edwards',
  'Stewart', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey',
  'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Peterson', 'Gray', 'James', 'Watson',
  'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson',
];

// Email domain pool
const emailDomains = [
  '@gmail.com',
  '@yahoo.com',
  '@outlook.com',
  '@hotmail.com',
  '@icloud.com',
  '@protonmail.com',
  '@mail.com',
  '@aol.com',
];

// Helper function to generate email from name
function generateEmail(name: string): string {
  const nameParts = name.toLowerCase().split(' ');
  const domain = emailDomains[Math.floor(Math.random() * emailDomains.length)];

  const patterns = [
    `${nameParts[0]}.${nameParts[nameParts.length - 1]}${domain}`,
    `${nameParts[0]}${nameParts[nameParts.length - 1]}${domain}`,
    `${nameParts[0][0]}${nameParts[nameParts.length - 1]}${domain}`,
    `${nameParts[0]}.${nameParts[nameParts.length - 1][0]}${domain}`,
    `${nameParts[0]}${Math.floor(Math.random() * 100)}${domain}`,
  ];

  return patterns[Math.floor(Math.random() * patterns.length)];
}

// Generate 100 mock users
const generateMockUsers = (): MockUser[] => {
  const users: MockUser[] = [];

  for (let i = 0; i < 100; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const lastOrder = getRandomDate();

    // Last login should be after or equal to last order
    const lastLogIn = new Date(lastOrder);
    lastLogIn.setDate(lastLogIn.getDate() + Math.floor(Math.random() * 30)); // 0-30 days after last order

    users.push({
      id: generateId(),
      email: generateEmail(name),
      name,
      lastLogIn,
      lastOrder,
    });
  }

  // Sort by lastLogIn (most recent first)
  return users.sort((a, b) => {
    const aTime = a.lastLogIn ? a.lastLogIn.getTime() : 0;
    const bTime = b.lastLogIn ? b.lastLogIn.getTime() : 0;
    return bTime - aTime;
  });
};

export const dummyUsers = generateMockUsers();
