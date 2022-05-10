export type Suggestion = {
  word: string;
  def?: string;
};

export type LookupResult = {
  keyword: string;
  ukPhonetic?: string;
  usPhonetic?: string;
  definition?: string;
  suggestions?: Suggestion[];
};

export type LookupStatus = "init" | "searching" | "success" | "error";

export type VoiceUrl = {
  uk?: string;
  us?: string;
};
