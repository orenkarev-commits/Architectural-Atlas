/**
 * "In their words" — sourced architect quotes shown at the top of the bio, each with
 * its context and date in small print below. Evidentiary status varies and is stated:
 * Levy, Karmi, Cohn and Rechter have identifiable historical contexts; Minor's and
 * Friedman's are reported statements, to confirm against a primary source. Cohn's
 * "flat roofs" date is not securely established. (See the vault architect notes.)
 */
export interface ArchitectQuote {
  text: string;
  date?: string;
  context?: string;
}

export const architectQuotes: Record<string, ArchitectQuote[]> = {
  'Alexander Levy': [
    {
      text: 'The city is too much inherent in us, the village too little.',
      date: '1919',
      context:
        'To the architect Richard Kauffmann, on the future form of Jewish settlement — part of his idea that Palestine should become "a garden," a green city between the European city and the village.',
    },
  ],
  'Dov Karmi': [
    {
      text: 'We have always known how far we were from a proper climatic solution.',
      date: '1953',
      context:
        'On adapting Brazilian-style sun-breakers to Israeli buildings — a candid admission that modernism had not solved the climate from the start.',
    },
  ],
  'Lotte Cohn': [
    {
      text: 'Flat roofs – they are the sign of modernity.',
      date: 'date uncertain — a later recollection',
      context:
        'She at once complicated it: flat roofs already served the Orient, for drying seeds and sleeping out in summer. Modernism arrived with a vocabulary but met local practices that already answered the climate.',
    },
  ],
  "Ze'ev Rechter": [
    {
      text: "For a while Tel Aviv looked like a suburb of the Russian 'Empire' city. Then the Empire melted into a kind of Polish, German, French-Cubist porridge.",
      date: '1957',
      context:
        "From a retrospective speech on the young city's succession of imported styles — Tel Aviv as an architectural laboratory before a local modernism emerged.",
    },
  ],
  'Joseph Minor': [
    {
      text: 'We have still not developed a unique local style, as we keep adapting international trends in architecture — architects must take into account the local climate, the available building materials, the social and cultural aspects, and the unique character of the city itself.',
      date: '1966',
      context:
        'From his memoir "An Architect from Little Tel Aviv," judging the search for a local style still unfinished (via Harpaz).',
    },
  ],
  'Eliyahu & Emanuel Friedman': [
    {
      text: 'If a synagogue is built, a mosque and a church will also have to be built.',
      date: 'Knesset planning; date uncertain',
      context:
        'Emanuel Friedman, reportedly answering a proposal to place a synagogue in the Knesset — a design choice becoming a question of representation and pluralism. A reported statement, to confirm against the primary source.',
    },
  ],
};

export function quotesFor(name: string): ArchitectQuote[] {
  return architectQuotes[name] ?? [];
}
