export function grabVoiceUrl(response: string): { uk?: string; us?: string } {
  const ukPath = response.match(/media\/english\/uk_pron\/[\S]*.mp3/)?.[0];
  const usPath = response.match(/media\/english\/us_pron\/[\S]*.mp3/)?.[0];

  const host = "https://dictionary.cambridge.org/";

  return {
    uk: ukPath ? host + ukPath : undefined,
    us: usPath ? host + usPath : undefined,
  };
}
