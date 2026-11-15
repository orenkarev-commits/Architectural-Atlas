/**
 * "Ask the Architect" — a question shown on the Architects index (one button per
 * architect), with the architect's answer revealed on tap, then its context + date in
 * small print. Only the five architects listed here get the button. Attributions are
 * author/user-curated; underlying primary sources to be confirmed (see vault notes).
 */
export interface AskArchitect {
  question: string;
  answer: string;
  date?: string;
  context?: string;
}

export const askArchitect: Record<string, AskArchitect> = {
  'Alexander Levy': {
    question: 'What should the new Jewish city be?',
    answer: 'Palestine: a garden.',
    date: '1919',
    context:
      'His garden-city vision for the new Jewish city — a green third condition between the European city and the village (from his exchange with Richard Kauffmann).',
  },
  'Joseph Minor': {
    question: 'What makes a building feel architecturally complete?',
    answer: 'Without it the house would be like a face without a nose.',
    date: 'c. 1925–26',
    context:
      "Defending the balcony of Beit Bialik, which the poet had objected to — the element as part of the façade's identity, not a functional appendage. Reported; primary source to confirm.",
  },
  'Dov Karmi': {
    question: 'How should the building physically perform in this climate?',
    answer: 'Four free sides … maximum ventilation from all sides.',
    date: '1936',
    context:
      'On apartment orientation — living room to the western wind, bedrooms east — the plan conceived as an environmental device, not only a formal object.',
  },
  "Ze'ev Rechter": {
    question: 'What should architecture say about the society being created?',
    answer:
      'We need modern buildings … that tell future generations about the creative spirit of the Jews of our generation.',
    date: 'date not securely established',
    context:
      'On architecture as a statement about the new society. Attribution provided; primary source and date to confirm.',
  },
  'Lotte Cohn': {
    question: 'What happens when architects arrive somewhere where architectural tradition is not yet fixed?',
    answer: 'Eretz Yisrael is a country not bound by the strong bonds of tradition.',
    date: '1935',
    context:
      'Written as women entered the technical professions in Palestine — on site, at the drawing table, before the building authorities — a place where European conventions had not yet fixed.',
  },
};

export function askFor(name: string): AskArchitect | null {
  return askArchitect[name] ?? null;
}
