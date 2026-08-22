// Two families: Comfortaa for UI/body, Madimi One for titles/editorial voice.

export const fonts = {
  // Body / UI: Comfortaa. (Keys keep their old names so the style map below is
  // untouched; only the family each points to has changed.)
  poppinsRegular: 'Comfortaa_400Regular',
  poppinsMedium: 'Comfortaa_500Medium',
  poppinsSemiBold: 'Comfortaa_600SemiBold',
  poppinsBold: 'Comfortaa_700Bold',
  // Titles / editorial voice: Madimi One (single 400 weight).
  newsreaderItalicRegular: 'MadimiOne_400Regular',
  newsreaderItalicMedium: 'MadimiOne_400Regular',
  newsreaderItalicSemiBold: 'MadimiOne_400Regular',
} as const;

export const editorial = {
  welcomeTitle: { fontFamily: fonts.newsreaderItalicRegular, fontSize: 42, lineHeight: 42 * 1.04 },
  architectName: { fontFamily: fonts.newsreaderItalicRegular, fontSize: 30, lineHeight: 30 * 1.08 },
  storyTitle: { fontFamily: fonts.newsreaderItalicRegular, fontSize: 30, lineHeight: 30 * 1.08 },
  buildingName: { fontFamily: fonts.newsreaderItalicRegular, fontSize: 25 },
  screenHeader: { fontFamily: fonts.newsreaderItalicRegular, fontSize: 20 },
  cardTitleLg: { fontFamily: fonts.newsreaderItalicRegular, fontSize: 18 },
  cardTitle: { fontFamily: fonts.newsreaderItalicRegular, fontSize: 16 },
  storyCardTitle: { fontFamily: fonts.newsreaderItalicRegular, fontSize: 13 },
} as const;

export const ui = {
  body: { fontFamily: fonts.poppinsRegular, fontSize: 14, lineHeight: 14 * 1.65 },
  bodyLarge: { fontFamily: fonts.poppinsRegular, fontSize: 15, lineHeight: 15 * 1.6 },
  bodySmall: { fontFamily: fonts.poppinsRegular, fontSize: 13 },
  metadata: { fontFamily: fonts.poppinsRegular, fontSize: 12 },
  metadataSmall: { fontFamily: fonts.poppinsMedium, fontSize: 11 },
  label: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 10,
    letterSpacing: 0.09 * 10,
    textTransform: 'uppercase' as const,
  },
  buttonLabel: { fontFamily: fonts.poppinsSemiBold, fontSize: 11, textTransform: 'uppercase' as const },
} as const;
